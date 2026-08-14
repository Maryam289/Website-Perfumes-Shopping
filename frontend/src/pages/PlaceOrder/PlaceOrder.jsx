import React, { useContext, useState, useEffect } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import DeliveryMap from '../../components/DeliveryMap/DeliveryMap';
import { STORE_LOCATION } from '../../config/delivery';


const PlaceOrder = () => {

  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showOrderPlaced, setShowOrderPlaced] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [isSelectingFromMap, setIsSelectingFromMap] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [deliveryDistance, setDeliveryDistance] = useState(0)
  const [locationSource, setLocationSource] = useState(null);

  const {getTotalCartAmount, token, perfume_list, cartItems, setCartItems, url} = useContext(StoreContext)

  const[data, setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"Egypt",
    phone:""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({...data, [name]:value}))

  }

  useEffect(() => {
    
    if (!deliveryLocation) {
      setDeliveryDistance(0);
      setDeliveryFee(0);
      return;
    }

    const distance = calculateDistance(
    STORE_LOCATION.lat,
    STORE_LOCATION.lng,
    deliveryLocation.lat,
    deliveryLocation.lng
    );

    setDeliveryDistance(distance);
    const fee = calculateDeliveryFee(distance);
    setDeliveryFee(fee);

  },[deliveryLocation]);

  useEffect(() =>{
    // التغيير ده جاي من الخريطة، مش من المستخدم، إذن مش هعمل Search تاني
    if (isSelectingFromMap) {
      return;
    }
    const searchAddress = async () => {
      if (!data.street.trim() && !data.city.trim()) {
        return;
      }

      const query = [data.street, data.city, data.state, data.country || "Egypt"].filter(Boolean).join(", ");
      try {
        setIsSearchingAddress(true);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&countrycodes=eg&q=${encodeURIComponent(query)}`,
          {headers: {
            "Accept-Language": "ar"
            }
          });

        if (!response.ok) {
          throw new Error("Address search failed");
        }

        const result = await response.json();
        if (result.length > 0) {
          const newLocation = {
            lat: Number(result[0].lat),
            lng: Number(result[0].lon)
          };
          setLocationSource("search")
          setDeliveryLocation(newLocation);
        }
      } catch (error) {
        console.log("Address search error:", error);
      } finally {
        setIsSearchingAddress(false);
      }
    };
    const timeoutId = setTimeout(() => {
      searchAddress();
    }, 700);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    data.street,
    data.city,
    data.state,
    data.country,
    isSelectingFromMap
    ]);

  const placeOrder = async (event) => {
    event.preventDefault();
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    let orderItems = [];
    perfume_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        // بنغيرش الـ object الأصلي الموجود في perfume_list علشان كدا عملناها ب النقط دى
        let itemInfo = {
          ...item,
          quantity: cartItems[item._id]
        };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      deliveryLocation: deliveryLocation,
      deliveryFee: deliveryFee,
      items: orderItems,
      amount: getTotalCartAmount() + deliveryFee
    };

    try {
      let response = await axios.post(
        url + "/api/order/place",
        orderData,
        {
          headers: {
            token
          }
        }
      );

      if (response.data.success) {
        setCartItems({});
        setIsPlacingOrder(true);
        // العربية تظهر لمدة 2.5 ثانية
        setTimeout(() => {
          setIsPlacingOrder(false);
          setShowOrderPlaced(true);
            
          setTimeout(() => {
            setOrderPlaced(true)
          }, 1200);
        }, 1700);

      } else {
        setIsPlacingOrder(false);
        alert(response.data.message || "Unable to place order");
      }

    } catch (error) {
      console.log(error);
      setIsPlacingOrder(false);
      alert("Something went wrong while placing your order");
    } 
  }

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate('/cart')
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [token])

  // to place order using pay cash
  if (orderPlaced) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-circle">
          <span>✓</span>
        </div>
        <h1>Your order has been successfully placed 🥳</h1>
        <p>Thanks for your request from M Nova 🤗<br />
          Your order has been received and we will contact you soon to confim the details🤝
        </p>

        <button onClick={() => navigate('/myorders')}>
          Show my orders 📦
        </button>
      </div>
    )
  }

  // when clint select the location on map write in input automaticly
  const handleMapLocation = async (location) => {
    setLocationSource("map");
    setIsSelectingFromMap(true)
    // حفظ إحداثيات العميل
    setDeliveryLocation(location);

    const distance = calculateDistance(
    STORE_LOCATION.lat,
    STORE_LOCATION.lng,
    location.lat,
    location.lng
    );

    setDeliveryDistance(distance);
    const fee = calculateDeliveryFee(distance);
    setDeliveryFee(fee);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1`,
        { headers: {
          "Accept-Language": "ar"
          }
        }
      );
      
      if (!response.ok) {
          throw new Error("Reverse geocoding failed");
      }

      const result = await response.json();
      if (result.address) {
        const address = result.address;
        setData((prev) => ({
          ...prev,
          street: 
          address.road ||
          address.neighbourhood ||
          address.suburb ||
          "",

          city:
          address.city ||
          address.town ||
          address.village ||
          "",

          state:
          address.state ||
          "",

          country:
          address.country ||
          "",

          zipcode:
          address.postcode ||
          ""
        }));
      }
    } catch (error) {
      console.log("Reverse geocoding error:", error);
    } finally {
      setTimeout(() => {
        setIsSelectingFromMap(false);
      }, 1000);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

    return R * c;
  };

  const calculateDeliveryFee = (distance) => {

    if (distance <= 5) {
        return 30;
    }

    if (distance <= 10) {
        return 45;
    }

    if (distance <= 15) {
        return 60;
    }

    if (distance <= 20) {
        return 80;
    }

    return 100;
  };

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange = {onChangeHandler} value = {data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange = {onChangeHandler} value = {data.lastName} type="text" placeholder='Last name'/>
        </div>
        <input required name='email' onChange = {onChangeHandler} value = {data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange = {onChangeHandler} value = {data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange = {onChangeHandler} value = {data.city} type="text" placeholder='City' />
          <input name='state' onChange = {onChangeHandler} value = {data.state} type="text" placeholder='State'/>
        </div>
        <div className="multi-fields">
          <input name='zipcode' onChange = {onChangeHandler} value = {data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange = {onChangeHandler} value = {data.country} type="text" placeholder='Country'/>
        </div>
        <input required name='phone' onChange = {onChangeHandler} value = {data.phone} type="text" placeholder='Phone' />
      </div>

      <div className="place-order-right">
      <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
          <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{getTotalCartAmount()} EGP</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>{getTotalCartAmount() === 0 ? 0 : deliveryFee} EGP</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryFee} EGP</b>
            </div>
          </div>

          <div className="delivery-location">
              <p className="title">Select Delivery Location</p>
              <p className="delivery-map-description">Click on the map to select your delivery location.</p>
             <DeliveryMap location={deliveryLocation} setLocation={handleMapLocation} locationSource={locationSource}/>
              {deliveryLocation && (
              <div className="selected-location">
                <p><b>Selected location:</b></p>
                {/* <p>Latitude: {deliveryLocation.lat.toFixed(6)}</p>
                <p>Longitude: {deliveryLocation.lng.toFixed(6)}</p>
                <p>Distance: {deliveryDistance.toFixed(1)} km</p> */}
                <p>Delivery fee: {deliveryFee} EGP</p>
              </div>
              )}
            </div>
            
          <button type="submit" className={`place-order-button ${isPlacingOrder ? "moving" : ""} 
          ${showOrderPlaced ? "order-success" : ""}`} disabled={isPlacingOrder || showOrderPlaced}>
              {isPlacingOrder ? ( 
                  <span className="delivery-animation">
                      <span className="car">🚚</span> 
                  </span>
              ) : showOrderPlaced ? ("✓ Order placed 🎉") : ("Place the order")}
          </button>
        </div>
      </div>
      
    </form>
  )
}

export default PlaceOrder
