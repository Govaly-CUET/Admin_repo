import { useEffect, useState } from 'react';

import { adminProductService } from '../../services/adminProductService';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await adminProductService.list();
        setProducts(response.data || []);
      } catch (requestError) {
        setError(requestError.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="product-list-page">
      <div className="product-list-header">
        <div>
          <h1>Products</h1>
          <p>All products and their sellers</p>
        </div>
        <span className="product-list-count">{products.length} items</span>
      </div>

      {loading && <p className="product-list-message">Loading products...</p>}
      {error && <p className="product-list-message is-error">{error}</p>}

      {!loading && !error && (
        <div className="product-list-table-wrap">
          <table className="product-list-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="8" className="product-list-empty">No products found.</td></tr>
              ) : products.map((product) => (
                <tr key={product._id}>
                  <td><img className="product-list-thumb" src={product.image} alt="" /></td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || 'Unknown'}</td>
                  <td>{product.seller?.shopName || 'Unknown'}</td>
                  <td>৳ {product.sale_price}</td>
                  <td>{product.stock}</td>
                  <td><span className={`product-list-status ${product.status}`}>{product.status.replace('_', ' ')}</span></td>
                  <td>{product.sold_items || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ProductList;