import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import immunityImg from "../assets/images/HerbalimmunityBooster.png";
import hairOilImg from "../assets/images/HerbalHairoil.png";
import faceWashImg from "../assets/images/Herbalfacewash.png";
import greenTeaImg from "../assets/images/Herbalgreentea.png";
function Products() {
  const { user } = useAuth(); // role check karne ke liye
  const isAdmin = user?.role === "admin";
  const canManage = user?.role === "admin" || user?.role === "manager";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    image: "",
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
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
      setProducts(res.data);
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
      await createProduct(formData);
      setFormData({
  image: "",
  name: "",
  price: "",
  category: "",
  description: "",
  stock: "",
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
      category: product.category || "",
      description: product.description || "",
      stock: product.stock ?? "",
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
      await updateProduct(id, editData);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError("Product update nahi ho paaya");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError("Product delete nahi ho paaya");
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Products</h2>

        {/* sirf admin/manager ko "Add Product" dikhega */}
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showForm && canManage && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "16px" }}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <br /><br />
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
          <br /><br />
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
          <br /><br />
          <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
          <br /><br />

          {/* stock field sirf admin ko dikhega form mein bhi */}
          {isAdmin && (
            <>
              <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} />
              <br /><br />
            </>
          )}

          <button type="submit">Save Product</button>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {products.length === 0 && <p>Koi product nahi mila.</p>}

        {products.map((product) => (
          <div
            key={product._id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "18px",
              boxShadow: "0 2px 10px rgba(0,0,0,.05)",
              transition: "0.3s"
            }}
          >

            {editingId === product._id ? (
              <>
                <input type="text" name="name" value={editData.name} onChange={handleEditChange} style={{ width: "100%", marginBottom: "6px" }} />
                <input type="number" name="price" value={editData.price} onChange={handleEditChange} style={{ width: "100%", marginBottom: "6px" }} />
                <input type="text" name="category" value={editData.category} onChange={handleEditChange} style={{ width: "100%", marginBottom: "6px" }} />
                <input type="text" name="description" value={editData.description} onChange={handleEditChange} style={{ width: "100%", marginBottom: "6px" }} />

                {isAdmin && (
                  <input type="number" name="stock" value={editData.stock} onChange={handleEditChange} style={{ width: "100%", marginBottom: "6px" }} />
                )}

                <button onClick={() => saveEdit(product._id)} style={{ marginRight: "6px" }}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <img
  src={
    product.name === "Herbal Immunity Booster"
      ? immunityImg
      : product.name === "Herbal Hair Oil"
      ? hairOilImg
      : product.name === "Herbal Face Wash"
      ? faceWashImg
      : product.name === "Herbal Green Tea"
      ? greenTeaImg
      : immunityImg
  }
  alt={product.name}
  style={{
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "15px"
  }}
/>

                <h4 style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#111827"
                }}>{product.name}

                </h4>
                <p style={{
                  color: "#4f46e5",
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "8px"
                }}>₹{product.price}</p>
                <p style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  marginBottom: "8px"
                }}>{product.category}</p>
                <p style={{
                  color: "#6b7280",
                  lineHeight: "22px",
                  marginBottom: "10px"
                }}>{product.description}</p>

                {/* stock field sirf tab dikhega jab backend ne bheja ho (matlab admin hi hai) */}
                {product.stock !== undefined && (
                  <p style={{
                    color: "#16a34a",
                    fontWeight: "700",
                    marginBottom: "15px"
                  }}>
                    Stock: {product.stock}
                  </p>
                )}

                {canManage && (
                  <div style={{ marginTop: "8px" }}>
                    <button onClick={() => startEdit(product)} style={{
                      background: "#eef2ff",
                      color: "#4f46e5",
                      border: "1px solid #4f46e5",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      marginRight: "10px",
                      fontWeight: "600"
                    }}>Edit</button>
                    <button onClick={() => handleDelete(product._id)} style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #dc2626",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}>Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;