import React, { useMemo, useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Image, Pressable, Alert, StatusBar, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { C } from "./src/styles/constants";
import { styles } from "./src/styles/styles";

import { getProducts } from "@/services/productService";
import { adaptProduct } from "@/services/productAdapter";
import type { ShoporaProduct } from "@/services/productAdapter";

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

const cats:{
    label:Category;icon:keyof typeof Ionicons.glyphMap}[]=[
    {label:"All",icon:"grid-outline"},
    {label:"Electronics",icon:"headset-outline"},
    {label:"Home",icon:"home-outline"},
    {label:"Fashion",icon:"shirt-outline"},
    {label:"Accessories",icon:"watch-outline"}
];
const money=(n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const CART_STORAGE_KEY = "@shopora/cart";

export default function App(){
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
    const [address, setAddress] = useState("");
    const [cityState, setCityState] = useState("");
    const [orderConfirmed, setOrderConfirmed] = useState(false);
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

        if (!address.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your address."
            );
            return false;
        }

        if (!cityState.trim()) {
            Alert.alert(
            "Missing information",
            "Please enter your city and state."
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
    const confirmOrder = () => {
        if (!validateCheckout()) {
            return;
        }
        setCart([]);

        setFullName("");
        setCep("");
        setAddress("");
        setCityState("");
        setPaymentMethod(null);

        setCheckout(false);
        setOrderConfirmed(true);
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
        <ScrollView contentContainerStyle={styles.page}>
            <Header title="My account" subtitle="Your Shopora experience." />
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Ionicons name="person-outline" size={29} color={C.ink} />
                </View>
                <View>
                    <Text style={styles.categoryTitle}>
                        Hi, client!
                    </Text>
                    <Text style={styles.smallMuted}>
                        Log in to track your orders.
                    </Text>
                </View>
            </View>
                {
                    [
                        { i: "receipt-outline" as const, t: "My orders" }, 
                        { i: "heart-outline" as const, t: "Favorites" },
                        { i: "location-outline" as const, t: "Addresses" }, 
                        { i: "card-outline" as const, t: "Payments" }, 
                        { i: "settings-outline" as const, t: "Settings" }
                    ].map(r => 
                        <Pressable key={r.t} style={styles.profileLink} onPress={() => 
                            r.t === "Favorites" ? Alert.alert("Favorites", favorite.length ? products.filter(p => 
                                favorite.includes(p.id)).map(p => p.name).join(", ") : 
                                "You haven't saved any products yet.") : 
                                Alert.alert(r.t, "Esta área será conectada à API Django do Shopora.")}>
                                <Ionicons name={r.i} size={20} color={C.ink} />
                                <Text style={{ flex: 1, color: C.ink, fontSize: 13 }}>
                                    {r.t}
                                </Text>
                                <Ionicons name="chevron-forward" size={18} color={C.muted} />
                        </Pressable>
                    )
                }
        </ScrollView>;
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
                value={address}
                onChangeText={setAddress}
                placeholder="Address and number"
                placeholderTextColor={C.muted}
                style={styles.input}
            />
            <TextInput
                value={cityState}
                onChangeText={setCityState}
                placeholder="City / State"
                placeholderTextColor={C.muted}
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
                <Pressable style={styles.primary} onPress={confirmOrder}>
                    <Text style={styles.primaryText}>
                        Confirm order
                    </Text>
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
