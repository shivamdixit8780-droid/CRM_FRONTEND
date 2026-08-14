import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { useAuth } from "../context/AuthContext";
import "../styles/Products.css";

// Import all product images
import immunityImg from "../assets/images/HerbalImmunityBooster.png";
import hairOilImg from "../assets/images/HerbalHairOil.png";
import faceWashImg from "../assets/images/HerbalFaceWash.png";
import greenTeaImg from "../assets/images/HerbalGreenTea.png";

function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canManage = user?.role === "admin" || user?.role === "manager";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // For view modal

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Herbal",
    description: "",
    usage: "",
    benefits: "",
    stock: "",
    size: "",
    image: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      setError("Products load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate min price 1200
      if (formData.price < 1200) {
        alert("Price must be at least ₹1200");
        return;
      }
      await createProduct(formData);
      setFormData({
        name: "",
        price: "",
        category: "Herbal",
        description: "",
        usage: "",
        benefits: "",
        stock: "",
        size: "",
        image: "",
      });
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError("Product create nahi ho paaya");
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      name: product.name,
      price: product.price,
      category: product.category || "Herbal",
      description: product.description || "",
      usage: product.usage || "",
      benefits: product.benefits || "",
      stock: product.stock ?? "",
      size: product.size || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      if (editData.price < 1200) {
        alert("Price must be at least ₹1200");
        return;
      }
      await updateProduct(id, editData);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError("Product update nahi ho paaya");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError("Product delete nahi ho paaya");
    }
  };

  // Get correct image by name
  const getProductImage = (name) => {
    switch (name) {
      case "Herbal Immunity Booster": return immunityImg;
      case "Herbal Hair Oil": return hairOilImg;
      case "Herbal Face Wash": return faceWashImg;
      case "Herbal Green Tea": return greenTeaImg;
      default: return immunityImg;
    }
  };

  if (loading) return <p className="products-loading">Loading products...</p>;

  return (
    <div className="products-page">

      {/* Header */}
      <div className="products-header">
        <h2 className="products-title">Products</h2>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        )}
      </div>

      {error && <p className="products-error">{error}</p>}

      {/* Add Product Form */}
      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="product-form">
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required className="form-input" />
          <input type="number" name="price" placeholder="Price (min ₹1200)" value={formData.price} onChange={handleChange} min="1200" required className="form-input" />
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="form-input" />
          <input type="text" name="size" placeholder="Size (e.g. 100 ml)" value={formData.size} onChange={handleChange} className="form-input" />
          <textarea name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} rows={3} required className="form-input" />
          <textarea name="usage" placeholder="How to Use (step by step)" value={formData.usage} onChange={handleChange} rows={4} required className="form-input" />
          <input type="text" name="benefits" placeholder="Benefits (comma separated)" value={formData.benefits} onChange={handleChange} className="form-input" />
          {isAdmin && (
            <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} className="form-input" />
          )}
          <button type="submit" className="btn btn-primary">Save Product</button>
        </form>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {products.length === 0 && <p className="products-empty">Koi product nahi mila.</p>}

        {products.map((product) => (
          <div key={product._id} className="product-card">

            {editingId === product._id ? (
              <div className="edit-form">
                <input type="text" name="name" value={editData.name} onChange={handleEditChange} className="form-input" placeholder="Name" />
                <input type="number" name="price" value={editData.price} onChange={handleEditChange} min="1200" className="form-input" placeholder="Price" />
                <input type="text" name="size" value={editData.size} onChange={handleEditChange} className="form-input" placeholder="Size" />
                <textarea name="description" value={editData.description} onChange={handleEditChange} rows={2} className="form-input" placeholder="Description" />
                <textarea name="usage" value={editData.usage} onChange={handleEditChange} rows={3} className="form-input" placeholder="How to Use" />
                <input type="text" name="benefits" value={editData.benefits} onChange={handleEditChange} className="form-input" placeholder="Benefits" />
                {isAdmin && (
                  <input type="number" name="stock" value={editData.stock} onChange={handleEditChange} className="form-input" placeholder="Stock" />
                )}
                <div className="card-actions">
                  <button onClick={() => saveEdit(product._id)} className="btn btn-primary">Save</button>
                  <button onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="product-image-wrapper">
                  <img src={getProductImage(product.name)} alt={product.name} className="product-image" />
                  {product.size && <span className="product-size-badge">{product.size}</span>}
                </div>

                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">₹{product.price?.toLocaleString()}</p>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">{product.description}</p>

                  {product.benefits && (
                    <div className="product-benefits">
                      <strong>✨ Benefits:</strong>
                      <p>{product.benefits}</p>
                    </div>
                  )}

                  {product.stock !== undefined && (
                    <p className="product-stock">📦 Stock: {product.stock}</p>
                  )}

                  {/* View Details Button */}
                  <button onClick={() => setSelectedProduct(product)} className="btn btn-info">
                    📖 How to Use
                  </button>

                  {canManage && (
                    <div className="card-actions">
                      <button onClick={() => startEdit(product)} className="btn btn-edit">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-delete">Delete</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal — How to Use */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
            <img src={getProductImage(selectedProduct.name)} alt={selectedProduct.name} className="modal-image" />
            <h3>{selectedProduct.name}</h3>
            <p className="modal-price">₹{selectedProduct.price?.toLocaleString()}</p>
            <div className="modal-section">
              <h4>📝 Description</h4>
              <p>{selectedProduct.description}</p>
            </div>
            <div className="modal-section">
              <h4>🔹 How to Use</h4>
              <pre className="usage-steps">{selectedProduct.usage}</pre>
            </div>
            {selectedProduct.benefits && (
              <div className="modal-section">
                <h4>✨ Benefits</h4>
                <p>{selectedProduct.benefits}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Products;