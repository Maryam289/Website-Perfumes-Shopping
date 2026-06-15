import React, { useContext } from 'react'
import './PerfumeItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const PerfumeItem = ({id, name, price, description, image}) => {

  const{cartItems, addToCart, removeFromCart} = useContext(StoreContext);

  return (
    <div className='perfume-item'>
        <div className="perfume-item-img-container">
            <img className='perfume-item-image' src={image} alt="" />
            {!cartItems[id]
            ?<img className='add' onClick={()=>addToCart(id)} src={assets.add_icon_white} alt=""/>
            :<div className='perfume-item-counter'>
              <img onClick={()=>removeFromCart(id)} src={assets.minus_icon} alt="" />
              <p>{cartItems[id]}</p>
              <img onClick={()=>addToCart(id)} src={assets.add_icon} alt="" />
            </div>
  
            }
        </div>
        <div className="perfume-item-info">
            <div className="perfume-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_starts} alt="" />
            </div>
            <p className="perfume-item-desc">{description}</p>
            <p className="perfume-item-price">{price} EGP</p>
        </div>
      
    </div>
  )
}

export default PerfumeItem
