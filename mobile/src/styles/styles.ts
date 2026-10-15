import { StyleSheet } from "react-native";
import { C } from "./constants";

export const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.bg
    },
    app: {
        flex: 1
    },
    page: {
        paddingHorizontal: 19, paddingTop: 12, paddingBottom: 28
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18
    },
    brand: {
        fontSize: 29,
        fontWeight: "800",
        letterSpacing: -1,
        color: C.ink
    },
    muted: {
        fontSize: 11,
        color: C.muted,
        marginTop: 4
    },
    iconButton: {
        width: 43,
        height: 43,
        borderRadius: 22,
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.line,
        alignItems: "center",
        justifyContent: "center"
    },
    badge: {
        position: "absolute",
        right: -2,
        top: -2,
        backgroundColor: C.ink,
        borderRadius: 9,
        minWidth: 17,
        height: 17,
        alignItems: "center",
        justifyContent: "center"
    },
    badgeText: {
        color: C.white,
        fontSize: 10,
        fontWeight: "700"
    },
    search: {
        height: 47,
        borderRadius: 14,
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.line,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 13,
        gap: 9,
        marginBottom: 15
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: C.ink,
        paddingVertical: 0
    },
    chips: {
        gap: 8,
        paddingBottom: 18
    },
    chip: {
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: C.white,
        borderWidth: 1,
        borderColor: C.line,
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    chipActive: {
        backgroundColor: C.ink,
        borderColor: C.ink
    },
    chipText: {
        fontSize: 10,
        fontWeight: "600",
        color: C.ink
    },
    hero: {
        minHeight: 200,
        borderRadius: 19,
        overflow: "hidden",
        backgroundColor: "#E8E6DF",
        flexDirection: "row",
        marginBottom: 24
    },
    heroCopy: {
        flex: 1.1,
        padding: 15,
        justifyContent: "center"
    },
    eyebrow: {
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 1.1,
        color: "#69716D",
        marginBottom: 8
    },
    heroTitle: {
        fontSize: 23,
        lineHeight: 27,
        fontWeight: "800",
        letterSpacing: -.7,
        color: C.ink
    },
    heroSub: {
        fontSize: 10,
        lineHeight: 15,
        color: "#58615D",
        marginTop: 9,
        marginBottom: 12
    },
    heroButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: C.ink,
        borderRadius: 9,
        paddingHorizontal: 11,
        paddingVertical: 10
    },
    heroButtonText: {
        color: C.white,
        fontSize: 10,
        fontWeight: "700"
    },
    heroImage: {
        flex: .8,
        minHeight: 200
    },
    sectionHead: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -.4,
        color: C.ink
    },
    smallMuted: {
        fontSize: 10,
        color: C.muted
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 13
    },
    card: {
        width: "48.5%",
        backgroundColor: C.white,
        borderRadius: 15,
        padding: 8,
        borderWidth: 1,
        borderColor: C.line
    },
    imageWrap: {
        height: 140,
        borderRadius: 11,
        overflow: "hidden",
        backgroundColor: C.soft,
        marginBottom: 9
    },
    productImage: {
        width: "100%",
        height: "100%"
    },
    heart: {
        position: "absolute",
        right: 7,
        top: 7,
        width: 30,
        height: 30,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,.94)",
        alignItems: "center",
        justifyContent: "center"
    },
    productName: {
        fontSize: 12,
        fontWeight: "700",
        color: C.ink
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 6
    },
    price: {
        fontSize: 15,
        fontWeight: "800",
        color: C.ink,
        marginTop: 7
    },
    addButton: {
        backgroundColor: C.ink,
        borderRadius: 9,
        marginTop: 10,
        paddingVertical: 9,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 4
    },
    addText:{
        color:C.white,
        fontSize:10,
        fontWeight:"700"
    },
    categoryRow:{
        flexDirection:"row",
        alignItems:"center",
        gap:13,
        padding:11,
        backgroundColor:C.white,
        borderRadius:15,
        borderWidth:1,
        borderColor:C.line,
        marginBottom:10
    },
    categoryImage:{
        width:68,
        height:68,
        borderRadius:11,
        backgroundColor:C.soft
    },
    categoryTitle:{
        fontSize:14,
        fontWeight:"700",
        color:C.ink
    },
    empty: { 
        alignItems: "center", 
        paddingVertical: 60, 
        paddingHorizontal: 15 
    }, 
    emptyTitle: { 
        fontSize: 17, 
        fontWeight: "800", 
        color: C.ink, 
        marginTop: 13 
    }, 
    emptyText: { 
        fontSize: 12, 
        color: C.muted, 
        textAlign: "center", 
        lineHeight: 18, 
        marginTop: 8 
    }, 
    primary: { 
        minHeight: 48, 
        borderRadius: 12, 
        backgroundColor: C.ink, 
        alignItems: "center", 
        justifyContent: "center", 
        flexDirection: "row", 
        gap: 9, 
        paddingHorizontal: 15, 
        marginTop: 17 
    }, 
    primaryText: { 
        color: C.white, 
        fontSize: 12, 
        fontWeight: "700" 
    },
    cartRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 12, 
        padding: 11, 
        backgroundColor: C.white, 
        borderWidth: 1, 
        borderColor: C.line, 
        borderRadius: 15, 
        marginBottom: 10 
    }, 
    cartImage: { 
        width: 78, 
        height: 80, 
        borderRadius: 11, 
        backgroundColor: C.soft 
    }, 
    qtyRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 13, 
        marginTop: 9 
    }, 
    qtyBtn: { 
        width: 27, 
        height: 27, 
        borderRadius: 8, 
        backgroundColor: C.soft, 
        alignItems: "center", 
        justifyContent: "center" 
    }, 
    summary: { 
        backgroundColor: C.white, 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: C.line, 
        padding: 16, 
        marginTop: 15 
    }, 
    summaryRow: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 12, 
        gap: 10 
    },
    profileCard: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 13,
        padding: 16,
        backgroundColor: C.white, 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: C.line, 
        marginBottom: 16 
    }, 
    avatar: { 
        width: 55, 
        height: 55, 
        borderRadius: 28, 
        backgroundColor: C.soft, 
        alignItems: "center", 
        justifyContent: "center" 
    }, 
    profileLink: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 13, 
        paddingHorizontal: 13, 
        paddingVertical: 17, 
        backgroundColor: C.white, 
        borderBottomWidth: 1, 
        borderBottomColor: C.line 
    },
    backHeader: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        gap: 14, 
        marginBottom: 20 
    }, 
    detailImage: { 
        width: "100%", 
        height: 320, 
        borderRadius: 20, 
        backgroundColor: C.soft, 
        marginBottom: 22 
    }, 
    detailTitle: { 
        fontSize: 27, 
        fontWeight: "800", 
        color: C.ink, 
        letterSpacing: -.7 
    }, 
    detailPrice: { 
        fontSize: 24, 
        fontWeight: "800", 
        color: C.ink, 
        marginTop: 16 
    }, 
    detailDescription: { 
        fontSize: 13, 
        lineHeight: 21, 
        color: C.muted, 
        marginTop: 13 
    }, 
    input: { 
        borderWidth: 1, 
        borderColor: C.line, 
        backgroundColor: C.white, 
        borderRadius: 12, 
        paddingHorizontal: 13, 
        paddingVertical: 14, 
        fontSize: 12, 
        color: C.ink, 
        marginTop: 10 
    }, 
    payment: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 12, 
        padding: 15, 
        borderRadius: 12, 
        backgroundColor: C.white, 
        borderWidth: 1, 
        borderColor: C.line, 
        marginTop: 9 
    },
    tabs: { 
        flexDirection: "row", 
        justifyContent: "space-around", 
        alignItems: "center", 
        backgroundColor: C.white, 
        borderTopWidth: 1, 
        borderTopColor: C.line, 
        paddingTop: 7, 
        paddingBottom: 7 
    }, 
    tab: { 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center" 
    }, 
    tabIcon: { 
        width: 38, 
        height: 29, 
        borderRadius: 11, 
        alignItems: "center", 
        justifyContent: "center" 
    }, 
    tabIconActive: { 
        backgroundColor: C.ink 
    }, 
    tabLabel: { 
        fontSize: 9, 
        color: C.muted, 
        marginTop: 3, 
        fontWeight: "600" 
    }
}
);