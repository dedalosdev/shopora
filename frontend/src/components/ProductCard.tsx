import { ArrowUpRight, Heart, Plus } from "lucide-react";
import type { Product } from "../types";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export default function ProductCard({ product, onAdd }: Props) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="icon-button favorite-button" aria-label={`Add ${product.name} to favorites`} type="button">
          <Heart size={17} strokeWidth={1.7} />
        </button>
        <button className="quick-add" onClick={() => onAdd(product)} type="button" aria-label={`Add ${product.name} to cart`}>
          <Plus size={18} />
          <span>Quick add</span>
        </button>
      </div>
      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <div className="product-price">
          <span>${product.price.toFixed(2)}</span>
          {product.compareAtPrice && <del>${product.compareAtPrice.toFixed(2)}</del>}
          <ArrowUpRight className="product-arrow" size={16} />
        </div>
      </div>
    </article>
  );
}