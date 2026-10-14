import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { CartItem, Product } from "../types";

type Props = {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onChangeQuantity: (product: Product, quantity: number) => void;
  onRemove: (product: Product) => void;
};

export default function CartDrawer({ open, items, onClose, onChangeQuantity, onRemove }: Props) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      <button className={`drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-label="Close cart" tabIndex={open ? 0 : -1} />
      <aside className={`cart-drawer ${open ? "is-open" : ""}`} aria-hidden={!open} aria-label="Shopping cart">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2>Your bag <span>({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close cart"><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart-icon"><ShoppingBag size={26} /></span>
            <h3>Your bag is taking a break.</h3>
            <p>Find something thoughtful for your everyday.</p>
            <button className="button button-dark" onClick={onClose}>Explore products</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <div className="cart-item" key={product.id}>
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="cart-item-details">
                    <h3>{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                    <div className="quantity-control">
                      <button onClick={() => onChangeQuantity(product, quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                      <span>{quantity}</span>
                      <button onClick={() => onChangeQuantity(product, quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button>
                    </div>
                  </div>
                  <button className="remove-item" onClick={() => onRemove(product)} aria-label={`Remove ${product.name}`}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <div className="drawer-footer">
              <div className="subtotal-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
              <p className="shipping-note">Shipping and taxes calculated at checkout.</p>
              <button className="button button-dark checkout-button" onClick={() => alert("Connect this button to the Shopora checkout API.")}>Continue to checkout <span>→</span></button>
              <button className="continue-shopping" onClick={onClose}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}