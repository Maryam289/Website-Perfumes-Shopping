import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { Router, useNavigate } from 'react-router-dom';
const Cart = () => {

  const { cartItems, perfume_list, removeFromCart, getTotalCartAmount, getCartKey, url } = useContext(StoreContext);

  const navigate = useNavigate();
  // Build the cart rows from cartItems.
  const cartRows = [];
  for (const cartKey in cartItems) {
    const quantity = cartItems[cartKey];
    if (quantity <= 0){
      continue;
    } 
    
    // Find the product ID from the cart key
    let productId = cartKey;
    let selectedSize = null;

    /*
    In database(mongoDB) saved 
    Normal perfume:
      65abc_30ml
      65abc_50ml
    Collection:
      65abc
        */
    const sizeMatch = cartKey.match(/^(.+)_(30ml|50ml)$/);
    if (sizeMatch) {
      productId = sizeMatch[1];
      selectedSize = sizeMatch[2];
    }
    //find the original prodact from backend
    const item = perfume_list.find((product) => product._id === productId);

    if(!item){
      continue;
    }

    // Get the real price from data
    let itemPrice = 0;
    if (item.productType === "collection") {
      itemPrice = Number(item.price) || 0;
    } else {
      const selectedSizeData = item.sizes?.find(
        (sizeItem) => sizeItem.size === selectedSize
      );

      if (selectedSizeData) {
        itemPrice = Number(selectedSizeData.price) || 0;
      }
    }

    cartRows.push({
      cartKey,
      item,
      selectedSize,
      quantity,
      itemPrice
    });
  }
  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Size</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {cartRows.map((row) => (
          <div key={row.cartKey}>
            <div className='cart-items-title cart-items-item'>
              <img src={row.item.image.url} alt={row.item.name} />
              <p>{row.item.name}</p>
              <p>{row.itemPrice} EGP</p>
              <p>{row.selectedSize || "-"}</p>
              <p>{row.quantity}</p>
              <p>{row.itemPrice * row.quantity} EGP</p>
              <p onClick={()=>removeFromCart(row.item._id, row.selectedSize)} className='cross'>x</p>
            </div>
            <hr />
          </div>
          ))}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{getTotalCartAmount()} EGP</p>
            </div>
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
