import React, { useContext, useState } from 'react'
import './PerfumeItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const PerfumeItem = ({ productType, sizes = [], collectionItems = [], id, name, price, description, image}) => {

  const{cartItems, addToCart, removeFromCart, url, getCartKey} = useContext(StoreContext);
  const navigate = useNavigate();
  // select size from only normal perfume
  const [selectedSize, setSelectedSize] = useState(sizes.length > 0 ? sizes[0].size : null);
  const selectedCartKey  = productType === "perfume" ? getCartKey(id, selectedSize) : getCartKey(id, null);
  const quantity = cartItems[selectedCartKey ] || 0;

  // add product safely
  const handleAddToCart = () => {
    // perfume must have a selected size
    if (productType === "perfume") {
      if (!selectedSize) {
        return;
      }
      addToCart(id, selectedSize);
      return;
    }

    // collection without size
    addToCart(id, null);
  };

  // remove product
   const handleRemoveFromCart = () => {
    if (productType === "perfume") {
      removeFromCart(id, selectedSize);
      return;
    }
    removeFromCart(id, null);
   };

   // Collection click
   const handleCollectionClick = () => {
    if (productType === "collection") {
      navigate(`/collection/${id}`)
    }
   }

  return (
    <div className='perfume-item'>
        <div className="perfume-item-img-container">
            <img className='perfume-item-image' src={url + "/images/" + image} alt={name} onClick={handleCollectionClick} style={{cursor: productType === "collection" ? "pointer" : "default"}} />
            {/* cart button */}
            {quantity === 0 ? (
              <img className='add' onClick={handleAddToCart} src={assets.add_icon_white} alt="Add to cart"/>) : (
                <div className='perfume-item-counter'>
                  <img onClick={handleRemoveFromCart} src={assets.minus_icon} alt="Remove"/>
                  <p>{quantity}</p>
                  <img onClick={handleAddToCart} src={assets.add_icon} alt="Add" />
                </div>
              )}
        </div>
        <div className="perfume-item-info" onClick={handleCollectionClick} style={{cursor: productType === "collection" ? "pointer" : "default"}}>
            <div className="perfume-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_starts} alt="" />
            </div>
            <p className="perfume-item-desc">{description}</p>
            {productType === "collection" && (
              <div className="collection-preview">
                <p className="perfume-item-price">{price} EGP</p>
                {collectionItems.length > 0 && (
                  <div className = "collection-item-preview">
                    <p className = "collection-items-title"> This collection includes: </p>
                    {collectionItems.map((item, index) => (
                      <p key={`${item.name}-${index}`} className="collection-item-name">{index + 1 }.{item.name}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {productType === "perfume" && (
              <div className="perfume-size-options">
                <p className="perfume-size-label">Choose size</p>
                <div className="perfume-size-buttons">
                  {sizes?.map((sizeItem) => (
                    <button key={sizeItem.size} type="button" className={
                      selectedSize === sizeItem.size ? "perfume-size-button active" 
                      : "perfume-size-button"} onClick={() => setSelectedSize(sizeItem.size)}>
                        <span>{sizeItem.size}</span>
                        <span>{sizeItem.price} EGP</span></button>
                ))}
                </div>
              </div>
            )}
        </div>
      
    </div>
  )
}

export default PerfumeItem
