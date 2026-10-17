import React, { useMemo, useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Image, Pressable, Alert, StatusBar, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/styles/constants";
import { styles } from "@/styles/styles";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getProducts } from "@/services/productService";
import { adaptProduct } from "@/services/productAdapter";
import { createAddress,} from "@/services/addressService";
import { createOrderFromCart,} from "@/services/orderService";
import { addItemToBackendCart } from "./src/services/cartService";
import type { ShoporaProduct } from "@/services/productAdapter";
import { createPayment } from "@/services/paymentService";


type Category = "All" | "Electronics" | "Home" | "Fashion" | "Accessories";
type PaymentMethod = "card" | "pix";
type Product = {
    id: string;
    name: string;
    category: Exclude<Category,"All">;
    price: number;
    rating: string;
    image: string;
    description: string;
    variants: ShoporaProduct["variants"];
};
type CartItem = {
    product: Product;
    variantId: number;
    quantity: number;
};

type Tab = "Start" | "Categories" | "Cart" | "Profile";

const cats:{label:Category;icon:keyof typeof Ionicons.glyphMap}[]=[
        {label:"All",icon:"grid-outline"},
        {label:"Electronics",icon:"headset-outline"},
        {label:"Home",icon:"home-outline"},
        {label:"Fashion",icon:"shirt-outline"},
        {label:"Accessories",icon:"watch-outline"}
    ];
const money=(n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const CART_STORAGE_KEY = "@shopora/cart";

function ShoporaApp(){
    const { isAuthenticated, loading:authLoading, login, logout, } = useAuth();
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [products, setProducts] = useState<ShoporaProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [tab,setTab]=useState<Tab>("Start");
    const [category,setCategory]=useState<Category>("All");
    const [query,setQuery]=useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartLoaded, setCartLoaded] = useState(false);
    const [favorite,setFavorite]=useState<string[]>([]);
    const [selected,setSelected]=useState<Product|null>(null);
    const [checkout,setCheckout]=useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [fullName, setFullName] = useState("");
    const [cep, setCep] = useState("");
    const [street, setStreet] = useState("");
    const [number, setNumber] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const handleLogin = async () => {
        if (!loginEmail.trim() || !loginPassword) {
            setLoginError("Enter your email and password.");
            return;
        }
        try {
            setLoginLoading(true);
            setLoginError("");

            await login({
            email: loginEmail.trim(),
            password: loginPassword,
            });

            setLoginPassword("");
            setLoginEmail("");

            Alert.alert(
            "Login successful",
            "You have signed in to your Shopora account."
            );
        } catch (error) {
            console.error("SHOPORA LOGIN ERROR:", error);
            setLoginError(
            error instanceof Error
                ? "Unable to sign in. Please check your credentials and try again."
                : "An unexpected error occurred."
            );
        } finally {
            setLoginLoading(false);
        }
    };
    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert(
            "Logged out successfully",
            "You have signed out of your Shopora account."
            );
        } catch (error) {
            console.error("SHOPORA LOGOUT ERROR:", error);

            Alert.alert(
            "Error",
            "Unable to sign out of the account."
            );
        }
    };
    const getVariant = (
    product: Product,
    variantId: number
    ) =>
        product.variants.find(
        (variant) => variant.id === variantId
    );
    const getVariantLabel = (
    variant: Product["variants"][number]
    ) => {
        if (variant.name) {
            return variant.name;
        }

        return Object.entries(
            variant.attributes || {}
        )
        .map(
        ([key, value]) =>
            `${key}: ${value}`
        )
        .join(" · ");
    };
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const items = cart.filter((item) => item.quantity > 0);
    const total = cart.reduce((sum, item) => {
        const variant = getVariant(
            item.product,
            item.variantId
        );

        const price = Number(
            variant?.price ?? item.product.price
        );

        return sum + price * item.quantity;
    }, 0);
    const filtered = useMemo(() =>
        products.filter(
            (p) =>
            (category === "All" || p.category === category) &&
            p.name.toLowerCase().includes(query.toLowerCase())
        ),
    [products, category, query]
    );    
    const add = (
    p: Product,
    variantId?: number
    ) => {
        const selectedVariantId =
            variantId ?? p.variants[0]?.id;

        if (!selectedVariantId) {
            Alert.alert(
            "Variant unavailable",
            "This product does not have an available variant."
            );
            return;
        }

        setCart((current) => {
            const existing = current.find(
            (item) =>
                item.product.id === p.id &&
                item.variantId === selectedVariantId
            );

            if (existing) {
                return current.map((item) =>
                    item.product.id === p.id &&
                    item.variantId === selectedVariantId
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        }
                    : item
                );
            }

            return [
                ...current,
                {
                    product: p,
                    variantId: selectedVariantId,
                    quantity: 1,
                },
            ];
        });
        Alert.alert(
            "Added",
            `${p.name} has been added to Cart.`
        );
    };
    const confirmRemove = (
    productId: string,
    variantId: number
    ) => {
        Alert.alert(
            "Remove item",
            "Do you want to remove this item from your cart?",
            [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Remove",
                style: "destructive",
                onPress: () =>
                removeFromCart(
                    productId,
                    variantId
                ),
            },
            ]
        );
    };
    const removeFromCart = (
    productId: string,
    variantId: number
    ) => {
        setCart((current) =>
            current.filter(
            (item) =>
                !(
                item.product.id === productId &&
                item.variantId === variantId
                )
            )
        );
    };
    const qty = (
    productId: string,
    variantId: number,
    delta: number
    ) => {
        setCart((current) =>
            current
            .map((item) => {
                if (
                item.product.id !== productId ||
                item.variantId !== variantId
                ) {
                return item;
                }

                return {
                ...item,
                quantity: Math.max(
                    0,
                    item.quantity + delta
                ),
                };
            })
            .filter((item) => item.quantity > 0)
        );
    };
    const validateCheckout = () => {
        if (!fullName.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your full name."
            );
            return false;
        }

        if (!cep.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your CEP."
            );
            return false;
        }

        if (!street.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your street."
            );
            return false;
        }

        if (!number.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your address number."
            );
            return false;
        }

        if (!city.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your city."
            );
            return false;
        }

        if (!state.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your state."
            );
            return false;
        }

        if (!paymentMethod) {
            Alert.alert(
            "Payment method",
            "Please select a payment method."
            );
            return false;
        }

        if (!cart.length) {
            Alert.alert(
            "Empty cart",
            "Your cart is empty."
            );
            return false;
        }

        return true;
    };
    const confirmOrder = async () => {
        if (!validateCheckout()) {
            return;
        }

        try {
            setCheckoutLoading(true);

            // 1. Sincronizar carrinho mobile com o carrinho do backend
            for (const item of cart) {
            await addItemToBackendCart(
                item.variantId,
                item.quantity
            );
            }

            // 2. Criar endereço
            const createdAddress = await createAddress({
            label: "Principal",
            recipient_name: fullName.trim(),
            postal_code: cep.trim(),
            street: street.trim(),
            number: number.trim(),
            complement: "",
            district: "",
            city: city.trim(),
            state: state.trim().toUpperCase(),
            country: "BR",
            is_default: true,
            });

            console.log(
            "ADDRESS CREATED:",
            createdAddress
            );

            // 3. Criar pedido
            const order = await createOrderFromCart({
            address_id: createdAddress.id,
            });

            console.log(
            "ORDER CREATED:",
            order
            );

            // 4. Criar Checkout Asaas
            const payment = await createPayment({
            order_id: order.id,
            provider: "asaas",
            method:
                paymentMethod === "pix"
                ? "pix"
                : "credit_card",
            });

            console.log(
            "PAYMENT CREATED:",
            payment
            );

            // 5. Verificar se recebemos a URL
            const checkoutUrl =
            payment.payment.checkout_url;

            if (!checkoutUrl) {
            throw new Error(
                "O Asaas não retornou a URL do checkout."
            );
            }

            console.log(
            "ASAAS CHECKOUT URL:",
            checkoutUrl
            );

        } catch (error) {
            console.error(
            "CHECKOUT ERROR:",
            error
            );

            Alert.alert(
            "Erro no checkout",
            error instanceof Error
                ? error.message
                : "Não foi possível finalizar o pedido."
            );
        } finally {
            setCheckoutLoading(false);
        }
    };
    const Header=(
        {title,subtitle}:{title:string;subtitle?:string})=>
        <View style={styles.header}><View>
        <Text style={styles.brand}>{title}</Text>
        {subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View>
            <Pressable style={styles.iconButton} onPress={() => { setTab("Cart"); setSelected(null); }}>
                <Ionicons name="bag-outline" size={22} color={C.ink} />
                {count > 0 && 
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{count}</Text>
                    </View>
                }
            </Pressable></View>;
    const Search = () => 
        <View style={styles.search}>
            <Ionicons name="search-outline" size={18} color={C.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search products..." placeholderTextColor="#9AA2A5" style={styles.searchInput} />
            {!!query && 
            <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color={C.muted} />
            </Pressable>
            }
        </View>;
    const Chips = () => 
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {
            cats.map(c => 
                <Pressable key={c.label} onPress={() => setCategory(c.label)} style={[styles.chip, category === c.label && styles.chipActive]}>
                    <Ionicons name={c.icon} size={15} color={category === c.label ? C.white : C.ink} />
                    <Text style={[styles.chipText, category === c.label && { color: C.white }]}>
                        {c.label}
                    </Text>
                </Pressable>
                )
            }
        </ScrollView>;
    const Card = (
        { p }: { p: Product }) => 
            <Pressable style={styles.card} onPress={() => {setSelected(p); setSelectedVariantId(p.variants[0]?.id ?? null);}}>
                <View style={styles.imageWrap}>
                    <Image source={{ uri: p.image }} style={styles.productImage} />
                    <Pressable style={styles.heart} onPress={() => setFavorite(v => v.includes(p.id) ? v.filter(x => x !== p.id) : [...v, p.id])}>
                        <Ionicons name={favorite.includes(p.id) ? "heart" : "heart-outline"} size={18} color={favorite.includes(p.id) ? "#C45D5D" : C.ink} />
                        </Pressable>
                </View>
                <Text style={styles.productName}>
                    {p.name}
                </Text>
                <View style={styles.rating}>
                    <Ionicons name="star" size={12} color="#D59A36" />
                    <Text style={styles.smallMuted}>
                        {p.rating} · rating
                    </Text>
                </View>
                <Text style={styles.price}>
                    {money(p.price)}
                </Text>
                <Pressable style={styles.addButton} onPress={() => add(p)}>
                    <Ionicons name="add" size={16} color={C.white} />
                    <Text style={styles.addText}>
                        Add
                    </Text>
                </Pressable>
            </Pressable>;
    const renderHome = () => 
        <ScrollView contentContainerStyle={styles.page}>
            <Header title="Shopora" subtitle="Smart choices to your day." />
            <Search />
            <Chips />
            <View style={styles.hero}>
                <View style={styles.heroCopy}>
                    <Text style={styles.eyebrow}>
                        CURATION SHOPORA
                    </Text>
                    <Text style={styles.heroTitle}>
                        Less excess.{"\n"}More meaning.
                    </Text>
                    <Text style={styles.heroSub}>
                        Products that combine quality, utility, and design.
                    </Text>
                    <Pressable style={styles.heroButton} onPress={() => { setCategory("All"); setQuery(""); }}>
                        <Text style={styles.heroButtonText}>
                            Explore collection
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={C.white} />
                    </Pressable>
                </View>
                <Image source={require("./assets/hero.jpeg")} style={styles.heroImage} resizeMode="contain" />
            </View>
            <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>
                    {
                        category === "All" ? "Featured" : category
                    }
                </Text>
                <Text style={styles.smallMuted}>
                    {filtered.length} products
                </Text>
            </View>
            <View style={styles.grid}>
                {
                    filtered.map(p => <Card key={p.id} p={p} />)
                }
            </View>
            {
                !filtered.length && <Text style={styles.emptyText}>No product found.</Text>
            }
        </ScrollView>;
    const renderCategories = () => 
        <ScrollView contentContainerStyle={styles.page}>
            <Header title="Categories" subtitle="Find what you’re looking for." />
            {
                cats.filter(c => c.label !== "All").map(c => { 
                    const p = products.find(x => x.category === c.label)!; 
                    return <Pressable key={c.label} style={styles.categoryRow} onPress={() => { setCategory(c.label); setTab("Start"); }}>
                        <Image source={{ uri: p.image }} style={styles.categoryImage} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.categoryTitle}>
                                {c.label}
                            </Text>
                            <Text style={styles.smallMuted}>
                                Explore our selection
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={19} color={C.muted} />
                    </Pressable>
                    }
                )
            }
        </ScrollView>;
    const renderCart = () => (
        <ScrollView contentContainerStyle={styles.page}>
            <Header
            title="Your Cart"
            subtitle={`${count} item(s) selected`}
            />
            {!items.length ? (
            <View style={styles.empty}>
                <Ionicons
                name="bag-outline"
                size={35}
                color={C.muted}
                />
                <Text style={styles.emptyTitle}>
                    Your cart is empty
                </Text>
                <Text style={styles.emptyText}>
                    Explore the Shopora and find something special.
                </Text>
                <Pressable
                style={styles.primary}
                onPress={() => setTab("Start")}
                >
                <Text style={styles.primaryText}>
                    Explore products
                </Text>
                </Pressable>
            </View>
            ) : (
            <>
                {items.map((item) => {
                    const variant = getVariant(
                    item.product,
                    item.variantId
                    );

                    const price = Number(
                    variant?.price ?? item.product.price
                    );

                    const itemTotal = price * item.quantity;
                    return (
                        <View
                        key={`${item.product.id}-${item.variantId}`}
                        style={styles.cartRow}
                        >
                        <Image
                            source={{
                            uri: item.product.image,
                            }}
                            style={styles.cartImage}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.productName}>
                            {item.product.name}
                            </Text>
                            {variant && (
                            <Text
                                style={[
                                styles.smallMuted,
                                { marginTop: 3 },
                                ]}
                            >
                                {getVariantLabel(variant)}
                            </Text>
                            )}
                            <Text
                            style={[
                                styles.price,
                                { marginTop: 5 },
                            ]}
                            >
                            {money(itemTotal)}
                            </Text>
                            <View style={styles.qtyRow}>
                                <Pressable
                                    style={styles.qtyBtn}
                                    onPress={() =>
                                    qty(
                                        item.product.id,
                                        item.variantId,
                                        -1
                                    )
                                    }
                                >
                                <Ionicons
                                name="remove"
                                size={15}
                                color={C.ink}
                                />
                                </Pressable>
                                <Text style={styles.productName}>
                                    {item.quantity}
                                </Text>
                                <Pressable
                                    style={styles.qtyBtn}
                                    onPress={() =>
                                    qty(
                                        item.product.id,
                                        item.variantId,
                                        1
                                    )
                                    }
                                >
                                    <Ionicons
                                    name="add"
                                    size={15}
                                    color={C.ink}
                                    />
                                </Pressable>
                            </View>
                        </View>
                        <Pressable
                            onPress={() =>
                                confirmRemove(
                                item.product.id,
                                item.variantId
                                )
                            }
                            >
                            <Ionicons
                                name="trash-outline"
                                size={19}
                                color={C.muted}
                            />
                        </Pressable>
                        </View>
                    );
                })}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.smallMuted}>
                        Subtotal
                        </Text>

                        <Text style={styles.productName}>
                        {money(total)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.smallMuted}>
                            Delivery
                        </Text>
                        <Text style={styles.smallMuted}>
                            Calculated at checkout
                        </Text>
                    </View>
                    <View
                        style={[
                        styles.summaryRow,
                        {
                            borderTopWidth: 1,
                            borderTopColor: C.line,
                            paddingTop: 13,
                        },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>
                            Partial total
                        </Text>
                        <Text style={styles.price}>
                            {money(total)}
                        </Text>
                    </View>

                    <Pressable
                        style={styles.primary}
                        onPress={() => setCheckout(true)}
                    >
                        <Text style={styles.primaryText}>
                        Proceed to checkout
                        </Text>

                        <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={C.white}
                        />
                    </Pressable>
                </View>
            </>
            )}
        </ScrollView>
    );
    const renderProfile = () => {
        if (authLoading) {
            return (
            <View style={styles.page}>
                <View style={styles.empty}>
                <ActivityIndicator
                    size="large"
                    color={C.ink}
                />

                <Text style={styles.emptyText}>
                    Carregando sua conta...
                </Text>
                </View>
            </View>
            );
        }

        if (isAuthenticated) {
            return (
            <ScrollView
                style={styles.page}
                contentContainerStyle={{
                paddingBottom: 32,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.sectionTitle}>
                My Account
                </Text>

                <View
                style={{
                    alignItems: "center",
                    paddingVertical: 32,
                }}
                >
                <View
                    style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    backgroundColor: C.card,
                    borderWidth: 1,
                    borderColor: C.border,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    }}
                >
                    <Ionicons
                    name="person-outline"
                    size={38}
                    color={C.ink}
                    />
                </View>

                <Text style={styles.emptyTitle}>
                    Welcome to Shopora
                </Text>

                <Text
                    style={[
                    styles.emptyText,
                    {
                        textAlign: "center",
                        marginTop: 8,
                    },
                    ]}
                >
                    You are signed in to your account.
                </Text>
                </View>

                <View
                style={{
                    backgroundColor: C.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: C.border,
                    padding: 18,
                    marginBottom: 24,
                }}
                >
                <View
                    style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    }}
                >
                    <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color={C.ink}
                    />

                    <Text
                    style={{
                        color: C.ink,
                        fontSize: 15,
                        fontWeight: "600",
                        marginLeft: 12,
                    }}
                    >
                    Account status
                    </Text>
                </View>

                <Text style={styles.emptyText}>
                    You are authenticated.
                </Text>
                </View>

                <Pressable
                style={styles.primary}
                onPress={handleLogout}
                >
                <Text style={styles.primaryText}>
                    Sign out
                </Text>

                <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={C.white}
                />
                </Pressable>
            </ScrollView>
            );
        }

        return (
            <ScrollView
            style={styles.page}
            contentContainerStyle={{
                paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.sectionTitle}>
                My Account
            </Text>

            <View
                style={{
                alignItems: "center",
                paddingTop: 24,
                paddingBottom: 28,
                }}
            >
                <Ionicons
                name="person-circle-outline"
                size={72}
                color={C.ink}
                />

                <Text
                style={[
                    styles.emptyTitle,
                    { marginTop: 12 },
                ]}
                >
                Welcome to Shopora
                </Text>

                <Text
                style={[
                    styles.emptyText,
                    {
                    textAlign: "center",
                    marginTop: 8,
                    },
                ]}
                >
                Sign in to access your account and continue
                shopping.
                </Text>
            </View>

            <View
                style={{
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 16,
                padding: 18,
                }}
            >
                <Text
                style={{
                    color: C.ink,
                    fontSize: 15,
                    fontWeight: "600",
                    marginBottom: 18,
                }}
                >
                Sign in
                </Text>

                <Text style={styles.inputLabel}>
                Email
                </Text>

                <TextInput
                style={styles.input}
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="you@example.com"
                placeholderTextColor={C.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                />

                <Text
                style={[
                    styles.inputLabel,
                    { marginTop: 16 },
                ]}
                >
                Password
                </Text>

                <TextInput
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="Enter your password"
                placeholderTextColor={C.muted}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                onSubmitEditing={handleLogin}
                returnKeyType="go"
                />

                {!!loginError && (
                <Text
                    style={{
                    color: "#B42318",
                    fontSize: 13,
                    marginTop: 12,
                    lineHeight: 19,
                    }}
                >
                    {loginError}
                </Text>
                )}

                <Pressable
                style={[
                    styles.primary,
                    {
                    marginTop: 24,
                    opacity: loginLoading ? 0.6 : 1,
                    },
                ]}
                onPress={handleLogin}
                disabled={loginLoading}
                >
                {loginLoading ? (
                    <ActivityIndicator color={C.white} />
                ) : (
                    <>
                    <Text style={styles.primaryText}>
                        Sign in
                    </Text>

                    <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={C.white}
                    />
                    </>
                )}
                </Pressable>
            </View>

            <Text
                style={{
                color: C.muted,
                fontSize: 12,
                textAlign: "center",
                marginTop: 18,
                lineHeight: 18,
                }}
            >
                Your account is authenticated securely through
                the Shopora API.
            </Text>
            </ScrollView>
        );
    };
    const renderDetail = () => {
        if (!selected) {
            return null;
        }

        const selectedVariant =
            selected.variants.find(
            (variant) => variant.id === selectedVariantId
            ) ?? selected.variants[0];

        const detailPrice = Number(selectedVariant?.price ?? selected.price);
        return (
            <ScrollView contentContainerStyle={styles.page}>
                <View style={styles.backHeader}>
                    <Pressable
                    onPress={() => {
                        setSelected(null);
                        setSelectedVariantId(null);
                    }}
                    >
                    <Ionicons name="arrow-back" size={22} color={C.ink} />
                    </Pressable>
                    <Text style={styles.sectionTitle}>
                        Product details
                    </Text>
                    <Pressable onPress={() =>
                        setFavorite((v) =>
                        v.includes(selected.id)
                            ? v.filter((x) => x !== selected.id)
                            : [...v, selected.id]
                        )
                    }
                    >
                        <Ionicons
                            name={
                            favorite.includes(selected.id)
                                ? "heart"
                                : "heart-outline"
                            }
                            size={22}
                            color={C.ink}
                        />
                    </Pressable>
                </View>
                <Image
                    source={{ uri: selected.image }}
                    style={styles.detailImage}
                />
                <Text style={styles.eyebrow}>
                    {selected.category.toUpperCase()}
                </Text>
                <Text style={styles.detailTitle}>
                    {selected.name}
                </Text>
                <View style={styles.rating}>
                    <Ionicons
                    name="star"
                    size={14}
                    color="#D59A36"
                    />
                    <Text style={styles.smallMuted}>
                        {selected.rating} · ratings
                    </Text>
                </View>
                <Text style={styles.detailPrice}>
                    {money(detailPrice)}
                </Text>
                <Text style={styles.detailDescription}>
                    {selected.description}
                </Text>
                {selected.variants.length > 1 && (
                    <View style={{ marginTop: 24 }}>
                        <Text style={styles.sectionTitle}>
                            Select an option
                        </Text>
                        <View style={{ marginTop: 12, gap: 10 }}>
                            {selected.variants.map((variant) => {
                                const active = variant.id === selectedVariant?.id;
                                return (
                                    <Pressable
                                    key={variant.id}
                                    onPress={() =>
                                        setSelectedVariantId(variant.id)
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: active
                                        ? C.ink
                                        : C.line,
                                        borderRadius: 12,
                                        padding: 14,
                                        backgroundColor: active
                                        ? C.ink
                                        : C.white,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                    >
                                    <View>
                                        <Text
                                        style={{
                                            color: active
                                            ? C.white
                                            : C.ink,
                                            fontWeight: "700",
                                            fontSize: 14,
                                        }}
                                        >
                                        {variant.name ||
                                            `Option ${variant.id}`}
                                        </Text>

                                        <Text
                                        style={{
                                            marginTop: 4,
                                            color: active
                                            ? "#D9DEE0"
                                            : C.muted,
                                            fontSize: 12,
                                        }}
                                        >
                                        {money(Number(variant.price))}
                                        </Text>
                                    </View>

                                    {active && (
                                        <Ionicons
                                        name="checkmark-circle"
                                        size={21}
                                        color={C.white}
                                        />
                                    )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                )}
                <Pressable
                    style={[styles.primary, { marginTop: 24 }]}
                    onPress={() => {
                        if (!selectedVariant) {
                            Alert.alert(
                            "Select an option",
                            "Please select a product option before adding it to the cart."
                            );
                            return;
                        }
                        add(selected, selectedVariant?.id);
                    }}
                >
                    <Ionicons
                    name="bag-add-outline"
                    size={18}
                    color={C.white}
                    />
                    <Text style={styles.primaryText}>
                        Add to Cart
                    </Text>
                </Pressable>
            </ScrollView>
        );
    };
    const renderCheckout = () => 
        <ScrollView contentContainerStyle={styles.page}>
            <View style={styles.backHeader}>
                <Pressable onPress={() => setCheckout(false)}>
                    <Ionicons name="arrow-back" size={22} color={C.ink} />
                </Pressable>
                <Text style={styles.sectionTitle}>
                    Complete purchase
                </Text>
            </View>
            <Text style={styles.sectionTitle}>
                Delivery address
            </Text>
            <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
            placeholderTextColor={C.muted}
            style={styles.input}
            />

            <TextInput
            value={cep}
            onChangeText={setCep}
            placeholder="CEP"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
            style={styles.input}
            />

            <TextInput
            value={street}
            onChangeText={setStreet}
            placeholder="Street"
            placeholderTextColor={C.muted}
            style={styles.input}
            />

            <TextInput
            value={number}
            onChangeText={setNumber}
            placeholder="Number"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
            style={styles.input}
            />

            <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor={C.muted}
            style={styles.input}
            />

            <TextInput
            value={state}
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor={C.muted}
            autoCapitalize="characters"
            maxLength={2}
            style={styles.input}
            />
            <Text
            style={[
                styles.sectionTitle,
                { marginTop: 22 },
            ]}
            >
              Payment
            </Text>
            <Pressable
            style={[
                styles.payment,
                paymentMethod === "card" && {
                borderColor: C.ink,
                borderWidth: 1,
                },
            ]}
            onPress={() => setPaymentMethod("card")}
            >
                <Ionicons
                    name="card-outline"
                    size={20}
                    color={C.ink}
                />
                <Text style={styles.productName}>
                    Credit card
                </Text>
                <Ionicons
                    name={
                    paymentMethod === "card"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={C.ink}
                />
            </Pressable>

            <Pressable
            style={[
                styles.payment,
                paymentMethod === "pix" && {
                borderColor: C.ink,
                borderWidth: 1,
                },
            ]}
            onPress={() => setPaymentMethod("pix")}
            >
                <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={C.ink}
                />

                <Text style={styles.productName}>
                    Pix
                </Text>

                <Ionicons
                    name={
                    paymentMethod === "pix"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={C.ink}
                />
            </Pressable>
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.smallMuted}>
                        Subtotal
                    </Text>
                    <Text style={styles.price}>
                        {money(total)}
                    </Text>
                </View>
                <Text style={styles.smallMuted}>
                    Delivery calculated after address validation.
                </Text>
                <Pressable
                    style={[
                        styles.primary,
                        {
                        opacity: checkoutLoading ? 0.6 : 1,
                        },
                    ]}
                    onPress={confirmOrder}
                    disabled={checkoutLoading}
                >
                    {checkoutLoading ? (
                        <ActivityIndicator color={C.white} />
                    ) : (
                        <Text style={styles.primaryText}>
                        Confirm order
                        </Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>;
    const renderOrderSuccess = () => (
        <View
            style={[
            styles.page,
            {
                flex: 1,
                justifyContent: "center",
            },
            ]}
        >
            <View style={styles.empty}>
                <Ionicons
                    name="checkmark-circle-outline"
                    size={64}
                    color={C.ink}
                />

                <Text
                    style={[
                    styles.emptyTitle,
                    { marginTop: 18 },
                    ]}
                >
                    Order confirmed
                </Text>

                <Text
                    style={[
                    styles.emptyText,
                    { textAlign: "center" },
                    ]}
                >
                    Thank you for shopping with Shopora.
                </Text>

                <Pressable
                    style={[
                    styles.primary,
                    { marginTop: 20 },
                    ]}
                    onPress={() => {
                    setOrderConfirmed(false);
                    setTab("Start");
                    }}
                >
                    <Text style={styles.primaryText}>
                        Continue shopping
                    </Text>

                    <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={C.white}
                    />
                </Pressable>
            </View>
        </View>
    );

    let content = orderConfirmed
        ? renderOrderSuccess()
        : checkout
        ? renderCheckout()
        : selected
        ? renderDetail()
        : tab === "Start"
        ? renderHome()
        : tab === "Categories"
        ? renderCategories()
        : tab === "Cart"
        ? renderCart()
        : renderProfile();

    useEffect(() => {
        let active = true;

        async function loadProducts() {
            try {
                const data = await getProducts();

                if (active) {
                    setProducts(data.map(adaptProduct));
                }
            } catch (error) {
                if (active) {
                    Alert.alert(
                        "Error to load products",
                        error instanceof Error
                        ? error.message
                        : "Unable to connect to the Shopora API."
                    );
                }
            } finally {
                if (active) {
                setLoadingProducts(false);
                }
            }
            }

            loadProducts();

            return () => {
                active = false;
            };
    }, []);

    useEffect(() => {
        async function loadCart() {
            try {
                const storedCart =
                    await AsyncStorage.getItem(
                    CART_STORAGE_KEY
                    );

                if (storedCart) {
                    const parsedCart = JSON.parse(
                    storedCart
                    ) as CartItem[];

                    if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                    }
                }
            } catch (error) {
                console.error(
                    "SHOPORA CART LOAD ERROR:",
                    error
                );
            } finally {
                setCartLoaded(true);
            }
        }
        loadCart();
    }, []);

    useEffect(() => {
        if (!cartLoaded) {
            return;
        }
        async function saveCart() {
            try {
                    await AsyncStorage.setItem(
                        CART_STORAGE_KEY,
                        JSON.stringify(cart)
                    );
                } catch (error) {
                    console.error(
                        "SHOPORA CART SAVE ERROR:",
                        error
                    );
                }
        }
        saveCart();
    }, [cart, cartLoaded]);

    if (loadingProducts) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#F7F7F5",
                }}
            >
                <ActivityIndicator size="large" color="#172126" />
                <Text style={{ marginTop: 12 }}>
                    Loading products...
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={C.bg}/>
            <View style={styles.app}>
                {content}
            </View>
            {
                !selected &&
                !checkout &&
                !orderConfirmed && (
                    <View style={styles.tabs}>
                        {
                            (
                                [
                                    {t:"Start",i:"home-outline"},
                                    {t:"Categories",i:"grid-outline"},
                                    {t:"Cart",i:"bag-outline"},
                                    {t:"Profile",i:"person-outline"}
                                ] as const
                            ).map(
                                x=>
                                <Pressable key={x.t} style={styles.tab} onPress={()=>setTab(x.t)}>
                                    <View style={[styles.tabIcon,tab===x.t&&styles.tabIconActive]}>
                                        <Ionicons name={x.i} size={19} color={tab===x.t?C.white:C.muted}/>
                                    </View>
                                    <Text style={[styles.tabLabel,tab===x.t&&{color:C.ink,fontWeight:"800"}]}>
                                        {x.t}
                                    </Text>
                                </Pressable>
                            )
                        }
                    </View>
                )
            }
        </SafeAreaView>
    );
}

export default function App() {
  return (
    <AuthProvider>
      <ShoporaApp />
    </AuthProvider>
  );
}