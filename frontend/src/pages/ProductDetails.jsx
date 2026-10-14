import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {useCart} from "../context/CartContext";


function ProductDetails() {
    const {id} = useParams();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {addToCart} = useCart();

    useEffect(() => {
        fetch(`${BASEURL}/api/product/${id}/`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch products");               
            }
            return response.json(); 
        })
        .then((data) => {
            setProduct(data);
            setLoading(false);
        })
        .catch((error) => {
            setError(error.message);
            setLoading(false);
        });
    }, [id, BASEURL]);

    if (loading) {
        return <div>Loading...</div>;        
    }

    if (error) {
        return <div>Error: {error}</div>;        
    }

    if (!product) {
        return <div>No product found</div>;        
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">
                <div className="flex flex-col md:flex-row gap-8">
                    <img src={`${product.image}`} alt={product.name} className="w-full h-56 object-cover rounded-lg mb-4"/>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {product.name}
                        </h1>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>
                        <p className="text-xl text-green-600 font-semibold mb-4">
                            ${product.price}
                        </p>
                        <button onClick={() => addToCart(product.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            Add to Cart
                        </button>
                        {/* Home Button */}
                        <div className="mt-4">
                            <a href="/" className="text-blue-600 hover:underline">
                                &larr; Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails;