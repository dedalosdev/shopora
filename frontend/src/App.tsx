import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronDown, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import Brand from "./components/Brand";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import { getProducts } from "./services/products";
import type { CartItem, Product } from "./types";

const categories = ["All pieces", "Home", "Living", "Accessories", "Lifestyle"];

function formatCount(count: number) {
  return count > 9 ? "9+" : String(count);
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All pieces");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All pieces" || product.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: Product) {
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { product, quantity: 1 }];
    });
    setToast(`${product.name} added to your bag`);
  }

  function changeQuantity(product: Product, quantity: number) {
    if (quantity < 1) {
      setCartItems((current) => current.filter((item) => item.product.id !== product.id));
      return;
    }
    setCartItems((current) => current.map((item) => item.product.id === product.id ? { ...item, quantity } : item));
  }

  function removeFromCart(product: Product) {
    setCartItems((current) => current.filter((item) => item.product.id !== product.id));
  }

  return (
    <div className="site-shell">
      <div className="announcement-bar">
        <span>Considered essentials. Better everyday living.</span>
        <span className="announcement-right">Complimentary shipping on orders over $75 <ArrowRight size={13} /></span>
      </div>

      <header className="site-header">
        <button className="icon-button mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Brand />
        <nav className={`main-nav ${mobileMenuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
          <a href="#shop" onClick={() => setMobileMenuOpen(false)}>Shop all</a>
          <a href="#shop" onClick={() => { setActiveCategory("Home"); setMobileMenuOpen(false); }}>Home & living</a>
          <a href="#shop" onClick={() => { setActiveCategory("Accessories"); setMobileMenuOpen(false); }}>Accessories</a>
          <a href="#story" onClick={() => setMobileMenuOpen(false)}>Our approach</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" aria-label="Search products" onClick={() => { setSearchOpen(!searchOpen); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>
            <Search size={20} strokeWidth={1.7} />
          </button>
          <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${cartCount} items`}>
            <ShoppingBag size={19} strokeWidth={1.7} />
            <span className="cart-label">Bag</span>
            <span className="cart-count">{formatCount(cartCount)}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> THE EVERYDAY EDIT</span>
            <h1>Make room for<br /><em>the good things.</em></h1>
            <p>Thoughtful pieces for slower mornings, everyday rituals, and the spaces that feel like you.</p>
            <div className="hero-actions">
              <a href="#shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></a>
              <a href="#story" className="text-link">Our philosophy <ArrowDown size={14} /></a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars"><span>J</span><span>M</span><span>A</span></div>
              <div><strong>Made for real life</strong><p>Chosen with care, kept for longer.</p></div>
            </div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1500&q=90" alt="Warm, minimalist living room with thoughtfully chosen home pieces" />
            <div className="hero-image-caption"><span className="caption-dot" /><span>Quiet spaces, considered details</span><span className="caption-number">01 / 04</span></div>
            <div className="floating-note"><Sparkles size={15} /><span>Less, but better.</span></div>
          </div>
          <div className="hero-index">S / 001</div>
        </section>

        <section className="value-strip" aria-label="Shopora values">
          <div><span className="value-icon">01</span><div><strong>Thoughtfully chosen</strong><p>Useful, beautiful, considered.</p></div></div>
          <div><span className="value-icon">02</span><div><strong>Made to stay</strong><p>Quality beyond the moment.</p></div></div>
          <div><span className="value-icon">03</span><div><strong>Easy by design</strong><p>Simple shopping, always.</p></div></div>
        </section>

        <section className="shop-section section-wrap" id="shop">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A LITTLE OF WHAT YOU LOVE</span>
              <h2>Everyday <em>favorites.</em></h2>
              <p>Useful things. Beautiful details. Nothing extra.</p>
            </div>
            <a className="text-link desktop-view-all" href="#shop" onClick={() => { setActiveCategory("All pieces"); setSearchTerm(""); }}>View all pieces <ArrowRight size={15} /></a>
          </div>

          <div className="shop-toolbar">
            <div className="category-tabs" role="group" aria-label="Filter by category">
              {categories.map((category) => (
                <button key={category} className={activeCategory === category ? "category-tab active" : "category-tab"} onClick={() => setActiveCategory(category)}>
                  {category}
                </button>
              ))}
            </div>
            <div className={`search-box ${searchOpen ? "search-visible" : ""}`}>
              <Search size={16} />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Find your thing..." aria-label="Search products" />
              {searchTerm && <button className="search-clear" onClick={() => setSearchTerm("")} aria-label="Clear search"><X size={14} /></button>}
              <ChevronDown size={14} className="search-chevron" />
            </div>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, index) => <div className="product-skeleton" key={index}><div /><span /><span /></div>)}
            </div>
          ) : filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
            </div>
          ) : (
            <div className="no-results"><Search size={25} /><h3>No pieces found</h3><p>Try another search or category.</p><button className="button button-outline" onClick={() => { setSearchTerm(""); setActiveCategory("All pieces"); }}>Clear filters</button></div>
          )}
          <div className="mobile-view-all"><button className="button button-outline" onClick={() => { setActiveCategory("All pieces"); setSearchTerm(""); }}>View all pieces <ArrowRight size={15} /></button></div>
        </section>

        <section className="story-section" id="story">
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85" alt="Calm, sunlit living space with natural textures" loading="lazy" />
            <div className="story-image-label">THE SHOPORA POINT OF VIEW</div>
          </div>
          <div className="story-copy">
            <span className="eyebrow">A MORE CONSIDERED EVERYDAY</span>
            <h2>Good design<br />should feel <em>like home.</em></h2>
            <p>We believe the things you live with should earn their place. That means useful objects, honest materials, and details that make ordinary moments feel a little more special.</p>
            <a className="button button-outline" href="#shop">Discover our edit <ArrowRight size={16} /></a>
            <div className="story-signoff"><span className="signoff-line" /> A little less, a little better.</div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="newsletter-icon"><Check size={18} /></div>
          <span className="eyebrow">GOOD THINGS, OCCASIONALLY</span>
          <h2>A thoughtful note<br /><em>from us to you.</em></h2>
          <p>New finds, useful ideas, and 10% off your first order.</p>
          <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setToast("Thanks for joining the Shopora list!"); }}>
            <input type="email" required placeholder="Your email address" aria-label="Your email address" />
            <button type="submit" aria-label="Subscribe to newsletter"><ArrowRight size={19} /></button>
          </form>
          <small>By subscribing, you agree to receive occasional updates. Unsubscribe anytime.</small>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-column"><Brand /><p>Everyday essentials, chosen with intention.</p><div className="social-links"><a href="#instagram">Instagram</a><a href="#pinterest">Pinterest</a></div></div>
          <div className="footer-column"><h3>Explore</h3><a href="#shop">Shop all</a><a href="#shop">Home & living</a><a href="#shop">Accessories</a><a href="#story">Our approach</a></div>
          <div className="footer-column"><h3>Help</h3><a href="#shipping">Shipping & returns</a><a href="#faq">FAQs</a><a href="#contact">Contact us</a><a href="#orders">Track an order</a></div>
          <div className="footer-note"><span className="eyebrow">A NOTE TO SELF</span><p>Buy less.<br /><em>Choose well.</em><br />Enjoy more.</p></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Shopora Studio. All rights reserved.</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div><span className="footer-location">Made for everyday living <span>✳</span></span></div>
      </footer>

      <CartDrawer open={cartOpen} items={cartItems} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeFromCart} />
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  );
}