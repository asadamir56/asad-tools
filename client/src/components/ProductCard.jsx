import { durationLabel, whatsappOrderLink, WHATSAPP_LINK } from "../data/products.js";
import { recordOrder } from "../lib/tracking.js";

export default function ProductCard({ product, user }) {
  return (
    <article className="product">
      <img className="logo" src={product.logo} alt={`${product.name} logo`} loading="lazy"
        onError={(e) => { e.currentTarget.style.display = "none"; }} />
      <h3 style={{ margin: "4px 0 0" }}>{product.name}</h3>
      {product.byMeta && <span className="badge-meta">by Meta</span>}
      {product.detail && <div className="meta">{product.detail}</div>}
      {product.duration && <div className="meta">{durationLabel(product.duration)}</div>}
      <div className="price">
        {product.price ? `Rs ${product.price.toLocaleString("en-PK")}` : "WhatsApp par poochhain"}
      </div>
      <a href={whatsappOrderLink(product)} target="_blank" rel="noreferrer"
        onClick={() => recordOrder(user, product)}>
        <button className="btn btn-green" style={{ width: "100%" }}>Order on WhatsApp</button>
      </a>
    </article>
  );
}
