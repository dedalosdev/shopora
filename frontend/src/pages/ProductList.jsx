import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";



function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    useEffect(() => {
        fetch(`${BASEURL}/api/products/`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            return response.json();
        })
        .then((data) => {
            setProducts(data);
            setLoading(false);
        })
        .catch((error) => {
            setError(error.message);
            setLoading(false);
        });
    }, []);
    
    if (loading) {
        return (
            <>
                <section id="shop" class="text-gray-600 body-font">
                    <div class="container px-5 py-24 mx-auto">
                        <div className="bg-gray-100">
                            <h1 className="text-3xl font-bold text-center py-6 bg-white">Product List</h1>
                            <div>Loading...</div>
                        </div>
                    </div>
                </section>
            </>
        );        
    }

    if (error) {
        return (
            <>
                <section id="shop" class="text-gray-600 body-font">
                    <div class="container px-5 py-24 mx-auto">
                        <div className="bg-gray-100">
                            <h1 className="text-3xl font-bold text-center py-6 bg-white">Product List</h1>
                            <div>Error: {error}</div>
                        </div>
                    </div>
                </section>
            </>
        );        
    }

    return  (
        <>
            <section id="shop" class="text-gray-600 body-font">
                <div class="container px-5 py-24 mx-auto">
                    <div className="bg-white">
                        <h1 className="text-3xl font-bold text-center py-6 bg-white">Product List</h1>
                        <div className="grid grid-cols-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500">No products available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ProductList;