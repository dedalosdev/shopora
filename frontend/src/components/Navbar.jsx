import {Link, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext.jsx';
import { clearTokens, getAccessToken } from '../utils/auth.js';
import { ShoppingBag, Menu, LogIn, LogOut, UserPlus } from 'lucide-react';

function Navbar() {
    const {cartItems} = useCart();
    const navigate = useNavigate();
    
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    const isLoggedIn = !!getAccessToken();

    const handleLogout = () => {
        clearTokens();
        navigate('/login');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/signup');
    };
    return (
        <header class="text-gray-600 body-font">
            <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
                <a href="/" class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
                    <Menu size={21} />
                    <span class="ml-3 text-xl">Shopora</span>
                </a>
                {/* Login/SignUp or Logout */}                
                {!isLoggedIn ? (
                    <>
                <button onClick={handleLogin} class="md:ml-auto inline-flex items-center text-white font-bold bg-black border-0 py-1 px-3 focus:outline-none 
                hover:bg-[#69716D] rounded text-base mt-4 md:mt-0 mr-5">Sign in
                    <LogIn size={14} />                     
                </button>
                <button onClick={handleSignup} class="inline-flex items-center text-white font-bold bg-black border-0 py-1 px-3 focus:outline-none 
                hover:bg-[#69716D] rounded text-base mt-4 md:mt-0">Sign up
                    <UserPlus size={14} />                     
                </button>
                </>            
                ) : (
                    <button onClick={handleLogout} className='inline-flex items-center text-white font-bold bg-black border-0 py-1 px-3 focus:outline-none 
                  hover:bg-[#69716D] rounded text-base mt-4 md:mt-0'>
                        <LogOut size={14}/> Logout
                    </button>
                )}                
                <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
                    <a href='/cart' class='hover:text-gray-900'>
                        <ShoppingBag size={19} strokeWidth={1.8} />
                        {cartCount > 0 && (
                            <span className='absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2'>
                                {cartCount}
                            </span>
                        )}
                    </a>
                </nav>
            </div>
        </header>
    )
}

export default Navbar;