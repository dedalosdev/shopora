import React, { useMemo, useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, Image, Pressable, StyleSheet, Alert, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "./src/styles/constants";
import { styles } from "./src/styles/styles";

import { getProducts } from "@/services/productService";
import { adaptProduct } from "@/services/productAdapter";
import type { ShoporaProduct } from "@/services/productAdapter";

type Category = "All" | "Electronics" | "Home" | "Fashion" | "Accessories";
type Product = {
    id: string;
    name: string;
    category: Exclude<Category,"All">;
    price: number;
    rating: string;
    image: string;
    description: string;
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


export default function App(){
    const [products, setProducts] = useState<ShoporaProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [tab,setTab]=useState<Tab>("Start");
    const [category,setCategory]=useState<Category>("All");
    const [query,setQuery]=useState("");
    const [cart,setCart]=useState<Record<string,number>>({});
    const [favorite,setFavorite]=useState<string[]>([]);
    const [selected,setSelected]=useState<Product|null>(null);
    const [checkout,setCheckout]=useState(false);
    const count=Object.values(cart).reduce((a,b)=>a+b,0);
    const items=products.filter(p=>(cart[p.id]||0)>0);
    const total=items.reduce((a,p)=>a+p.price*(cart[p.id]||0),0);    
    const filtered = useMemo(
    () =>
        products.filter(
        (p) =>
            (category === "All" || p.category === category) &&
            p.name.toLowerCase().includes(query.toLowerCase())
        ),
    [products, category, query]
    );
    const add=(p:Product)=>{
        setCart(
            v=>(
                {...v,[p.id]:(v[p.id]||0)+1}));
                Alert.alert("Added",`${p.name} has been added to Cart.`)
        };
    const qty=(id:string,d:number)=>setCart(
        v=>{
            const n={...v,[id]:(v[id]||0)+d};
            if(n[id]<=0)delete n[id];
            return n
        }
    );
    const Header=({title,subtitle}:{title:string;subtitle?:string})=><View style={styles.header}><View><Text style={styles.brand}>{title}</Text>{subtitle&&<Text style={styles.muted}>{subtitle}</Text>}</View><Pressable style={styles.iconButton} onPress={()=>{setTab("Cart");setSelected(null);}}><Ionicons name="bag-outline" size={22} color={C.ink}/>{count>0&&<View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>}</Pressable></View>;
    const Search=()=> <View style={styles.search}><Ionicons name="search-outline" size={18} color={C.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search products..." placeholderTextColor="#9AA2A5" style={styles.searchInput}/>{!!query&&<Pressable onPress={()=>setQuery("")}><Ionicons name="close-circle" size={18} color={C.muted}/></Pressable>}</View>;
    const Chips=()=> <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{cats.map(c=><Pressable key={c.label} onPress={()=>setCategory(c.label)} style={[styles.chip,category===c.label&&styles.chipActive]}><Ionicons name={c.icon} size={15} color={category===c.label?C.white:C.ink}/><Text style={[styles.chipText,category===c.label&&{color:C.white}]}>{c.label}</Text></Pressable>)}</ScrollView>;
    const Card=({p}:{p:Product})=><Pressable style={styles.card} onPress={()=>setSelected(p)}><View style={styles.imageWrap}><Image source={{uri:p.image}} style={styles.productImage}/><Pressable style={styles.heart} onPress={()=>setFavorite(v=>v.includes(p.id)?v.filter(x=>x!==p.id):[...v,p.id])}><Ionicons name={favorite.includes(p.id)?"heart":"heart-outline"} size={18} color={favorite.includes(p.id)?"#C45D5D":C.ink}/></Pressable></View><Text style={styles.productName}>{p.name}</Text><View style={styles.rating}><Ionicons name="star" size={12} color="#D59A36"/><Text style={styles.smallMuted}>{p.rating} · rating</Text></View><Text style={styles.price}>{money(p.price)}</Text><Pressable style={styles.addButton} onPress={()=>add(p)}><Ionicons name="add" size={16} color={C.white}/><Text style={styles.addText}>Add</Text></Pressable></Pressable>;
    const renderHome=()=> <ScrollView contentContainerStyle={styles.page}><Header title="Shopora" subtitle="Smart choices to your day."/><Search/><Chips/><View style={styles.hero}><View style={styles.heroCopy}><Text style={styles.eyebrow}>CURATION SHOPORA</Text><Text style={styles.heroTitle}>Less excess.{"\n"}More meaning.</Text><Text style={styles.heroSub}>Products that combine quality, utility, and design.</Text><Pressable style={styles.heroButton} onPress={()=>{setCategory("All");setQuery("");}}><Text style={styles.heroButtonText}>Explore collection</Text><Ionicons name="arrow-forward" size={14} color={C.white}/></Pressable></View><Image source={{uri:"https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800"}} style={styles.heroImage}/></View><View style={styles.sectionHead}><Text style={styles.sectionTitle}>{category==="All"?"Featured":category}</Text><Text style={styles.smallMuted}>{filtered.length} products</Text></View><View style={styles.grid}>{filtered.map(p=><Card key={p.id} p={p}/>)}</View>{!filtered.length&&<Text style={styles.emptyText}>No product found.</Text>}</ScrollView>;
    const renderCategories=()=> <ScrollView contentContainerStyle={styles.page}><Header title="Categories" subtitle="Find what you’re looking for."/>{cats.filter(c=>c.label!=="All").map(c=>{const p=products.find(x=>x.category===c.label)!;return <Pressable key={c.label} style={styles.categoryRow} onPress={()=>{setCategory(c.label);setTab("Start");}}><Image source={{uri:p.image}} style={styles.categoryImage}/><View style={{flex:1}}><Text style={styles.categoryTitle}>{c.label}</Text><Text style={styles.smallMuted}>Explore our selection</Text></View><Ionicons name="chevron-forward" size={19} color={C.muted}/></Pressable>})}</ScrollView>;
    const renderCart=()=> <ScrollView contentContainerStyle={styles.page}><Header title="Your Cart" subtitle={`${count} item(s) selected`}/>{!items.length?<View style={styles.empty}><Ionicons name="bag-outline" size={35} color={C.muted}/><Text style={styles.emptyTitle}>Your cart is empty</Text><Text style={styles.emptyText}>Explore the Shopora and find something special.</Text><Pressable style={styles.primary} onPress={()=>setTab("Start")}><Text style={styles.primaryText}>Explore products</Text></Pressable></View>:<>{items.map(p=><View key={p.id} style={styles.cartRow}><Image source={{uri:p.image}} style={styles.cartImage}/><View style={{flex:1}}><Text style={styles.productName}>{p.name}</Text><Text style={styles.price}>{money(p.price)}</Text><View style={styles.qtyRow}><Pressable style={styles.qtyBtn} onPress={()=>qty(p.id,-1)}><Ionicons name="remove" size={15} color={C.ink}/></Pressable><Text style={styles.productName}>{cart[p.id]}</Text><Pressable style={styles.qtyBtn} onPress={()=>qty(p.id,1)}><Ionicons name="add" size={15} color={C.ink}/></Pressable></View></View><Pressable onPress={()=>qty(p.id,-(cart[p.id]||0))}><Ionicons name="trash-outline" size={19} color={C.muted}/></Pressable></View>)}<View style={styles.summary}><View style={styles.summaryRow}><Text style={styles.smallMuted}>Subtotal</Text><Text style={styles.productName}>{money(total)}</Text></View><View style={styles.summaryRow}><Text style={styles.smallMuted}>Delivery</Text><Text style={styles.smallMuted}>Calculated at checkout</Text></View><View style={[styles.summaryRow,{borderTopWidth:1,borderTopColor:C.line,paddingTop:13}]}><Text style={styles.sectionTitle}>Partial total</Text><Text style={styles.price}>{money(total)}</Text></View><Pressable style={styles.primary} onPress={()=>setCheckout(true)}><Text style={styles.primaryText}>Proceed to checkout</Text><Ionicons name="arrow-forward" size={16} color={C.white}/></Pressable></View></>}</ScrollView>;
    const renderProfile=()=> <ScrollView contentContainerStyle={styles.page}><Header title="My account" subtitle="Your Shopora experience."/><View style={styles.profileCard}><View style={styles.avatar}><Ionicons name="person-outline" size={29} color={C.ink}/></View><View><Text style={styles.categoryTitle}>Hi, client!</Text><Text style={styles.smallMuted}>Log in to track your orders.</Text></View></View>{[{i:"receipt-outline" as const,t:"My orders"},{i:"heart-outline" as const,t:"Favorites"},{i:"location-outline" as const,t:"Addresses"},{i:"card-outline" as const,t:"Payments"},{i:"settings-outline" as const,t:"Settings"}].map(r=><Pressable key={r.t} style={styles.profileLink} onPress={()=>r.t==="Favorites"?Alert.alert("Favorites",favorite.length?products.filter(p=>favorite.includes(p.id)).map(p=>p.name).join(", "):"You haven't saved any products yet."):Alert.alert(r.t,"Esta área será conectada à API Django do Shopora.")}><Ionicons name={r.i} size={20} color={C.ink}/><Text style={{flex:1,color:C.ink,fontSize:13}}>{r.t}</Text><Ionicons name="chevron-forward" size={18} color={C.muted}/></Pressable>)}</ScrollView>;
    const renderDetail=()=>selected&&<ScrollView contentContainerStyle={styles.page}><View style={styles.backHeader}><Pressable onPress={()=>setSelected(null)}><Ionicons name="arrow-back" size={22} color={C.ink}/></Pressable><Text style={styles.sectionTitle}>Product details</Text><Pressable onPress={()=>setFavorite(v=>v.includes(selected.id)?v.filter(x=>x!==selected.id):[...v,selected.id])}><Ionicons name={favorite.includes(selected.id)?"heart":"heart-outline"} size={22} color={C.ink}/></Pressable></View><Image source={{uri:selected.image}} style={styles.detailImage}/><Text style={styles.eyebrow}>{selected.category.toUpperCase()}</Text><Text style={styles.detailTitle}>{selected.name}</Text><View style={styles.rating}><Ionicons name="star" size={14} color="#D59A36"/><Text style={styles.smallMuted}>{selected.rating} · ratings</Text></View><Text style={styles.detailPrice}>{money(selected.price)}</Text><Text style={styles.detailDescription}>{selected.description}</Text><Pressable style={styles.primary} onPress={()=>add(selected)}><Ionicons name="bag-add-outline" size={18} color={C.white}/><Text style={styles.primaryText}>Add to Cart</Text></Pressable></ScrollView>;
    const renderCheckout=()=> <ScrollView contentContainerStyle={styles.page}><View style={styles.backHeader}><Pressable onPress={()=>setCheckout(false)}><Ionicons name="arrow-back" size={22} color={C.ink}/></Pressable><Text style={styles.sectionTitle}>Complete purchase</Text></View><Text style={styles.sectionTitle}>Delivery address</Text>{["Full name","CEP","Address and number","City / State"].map(t=><TextInput key={t} placeholder={t} placeholderTextColor={C.muted} style={styles.input}/>)}<Text style={[s.sectionTitle,{marginTop:22}]}>Payment</Text><View style={styles.payment}><Ionicons name="card-outline" size={20} color={C.ink}/><Text style={styles.productName}>Credit card</Text></View><View style={styles.payment}><Ionicons name="qr-code-outline" size={20} color={C.ink}/><Text style={styles.productName}>Pix</Text></View><View style={styles.summary}><View style={styles.summaryRow}><Text style={styles.smallMuted}>Subtotal</Text><Text style={styles.price}>{money(total)}</Text></View><Text style={styles.smallMuted}>Delivery calculated after address validation.</Text><Pressable style={styles.primary} onPress={()=>Alert.alert("Integração necessária","Conecte este fluxo à API Django para validar estoque, endereço e pagamento antes de confirmar o pedido.")}><Text style={styles.primaryText}>Confirm order</Text></Pressable></View></ScrollView>;
    let content=checkout?renderCheckout():selected?renderDetail():tab==="Start"?renderHome():tab==="Categories"?renderCategories():tab==="Cart"?renderCart():renderProfile();

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
            <View style={styles.app}>{content}</View>
            {
                !selected&&!checkout&&<View style={styles.tabs}>{
                    (
                        [
                            {t:"Start",i:"home-outline"},
                            {t:"Categories",i:"grid-outline"},
                            {t:"Cart",i:"bag-outline"},
                            {t:"Profile",i:"person-outline"}
                        ] as const
                    ).map(
                        x=><Pressable key={x.t} style={styles.tab} onPress={()=>setTab(x.t)}>
                        <View style={[styles.tabIcon,tab===x.t&&styles.tabIconActive]}><Ionicons name={x.i} size={19} color={tab===x.t?C.white:C.muted}/></View>
                        <Text style={[styles.tabLabel,tab===x.t&&{color:C.ink,fontWeight:"800"}]}>{x.t}</Text>
                        </Pressable>
                    )
                }
            </View>
            }
        </SafeAreaView>
    );
}
