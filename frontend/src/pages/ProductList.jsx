import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";


function ProductList() {
    const [products, setProducts] = useState([null]);
    const [loading, setLoading] = useState([null]);
    const [error, setError] = useState([null]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/products/')
    }, []);
    
}