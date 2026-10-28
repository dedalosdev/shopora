import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ProductDetails from "./pages/ProductDetails";
import Navbar from './components/Navbar';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRouter from './components/PrivateRouter';
import Footer from './components/Footer';
import Home from './components/Home';


function App() {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/product/:id" element={<ProductDetails/>}/>
                <Route path="/cart" element={<CartPage/>}/>
                <Route element={<PrivateRouter/>}>
                    <Route path="/checkout" element={<CheckoutPage/>}/>
                </Route>
                <Route path="/login" element={<Login/>} />
                <Route path="/signup" element={<Signup/>} />
            </Routes>
            <Footer/>
        </Router>
    );
}

export default App;