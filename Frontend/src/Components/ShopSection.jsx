import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import Card from './Card'; // Import the Card component

const ShopSection = () => {
  const city = useSelector((state) => state.user.city);
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const serverUrl = import.meta.env.VITE_SERVER_URL ;

  useEffect(() => {
    if (city) {
      setLoading(true);
      setError(null);
      axios.get(`${serverUrl}/api/shop/city/${city}`)
        .then(res => {
          setShops(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setError("Failed to load shops. Please try again.");
          setLoading(false);
        });
    }
  }, [city]);

  const selectShop = (shop) => {
    setSelectedShop(shop);
    setLoading(true);
    setError(null);
    axios.get(`${serverUrl}/api/item/shop/${shop._id}`)
      .then(res => {
        setItems(res.data.items || res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Failed to load items. Please try again.");
        setLoading(false);
      });
  };

  const handleAddToCart = (item) => {
    // item object ab Card component se selected quantity aur price ke saath aayega
    dispatch(addToCart({
      item,
      shopId: selectedShop._id, // selectedShop._id ko seedhe pass karein
      shopName: selectedShop.name // selectedShop.name ko seedhe pass karein
    }));
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed';
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `✅ ${item.name} added to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };


  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Choose Your Shop</h2>
      {!selectedShop ? (
        <div>
          {loading && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading shops...</p>
            </div>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="row">
              {shops.length === 0 ? (
                <div className="col-12 text-center">
                  <div className="alert alert-info">
                    <h5>No shops available in your city.</h5>
                    <p>Please check back later or try a different location.</p>
                  </div>
                </div>
              ) : (
                shops.map(shop => (
                  <div className="col-md-4 mb-3" key={shop._id}>
                    <div className="card h-100 shadow-sm" onClick={() => selectShop(shop)} style={{ cursor: 'pointer' }} >
                      <img
                        src={shop.image || 'https://via.placeholder.com/400x200.png?text=No+Image'}
                        className="card-img-top"
                        alt={shop.name}
                        style={{
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{shop.name}</h5>
                        <p className="card-text text-muted">{shop.address}</p>
                        {shop.items && (
                          <small className="text-info">{shop.items.length} items available</small>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <button className="btn btn-success mb-3" onClick={() => setSelectedShop(null)}>← Back to Shops</button>
          <h3>{selectedShop.name} Menu</h3>
          
          {loading && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading menu items...</p>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="row">
              {items.length === 0 ? (
                <div className="col-12 text-center">
                  <div className="alert alert-info">
                    <h5>No items available for this shop.</h5>
                    <p>Please check back later or try another shop.</p>
                  </div>
                </div>
              ) : (
              items.map(item => (
                <div className="col-md-4 mb-3" key={item._id}>
                  {/* Card component ka istemal karein */}
                  <Card
                    item={item} // Poora item object pass karein
                    onAddToCart={handleAddToCart} // handleAddToCart function pass karein
                    shopId={selectedShop._id} // Shop ID pass karein
                    shopName={selectedShop.name} // Shop Name pass karein
                  />
                </div>
              ))
            )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopSection;
