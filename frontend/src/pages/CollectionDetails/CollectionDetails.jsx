import React, { useContext } from 'react'
import './CollectionDetails.css'
import { useNavigate, useParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const CollectionDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const {perfume_list, url, cartItems, addToCart, removeFromCart, getCartKey} = useContext(StoreContext)

    // Find the selected collection using its ID
    const collection = perfume_list.find(
        (item) => item._id === id && item.productType === "collection")
        const cartKey = getCartKey(id);
        const quantity = cartItems[cartKey] || 0;
        const handleAddToCart = () => {
            addToCart(id, null)
        }
        const handleRemoveFromCart = () => {
            removeFromCart(id, null)
        }

    // Data is still loading
    if (perfume_list.length === 0) {
        return (
            <div className="collection-details">
                <p className="collection-loading"> Loading collection... </p>
            </div>
        )
    }

    // Collection does not exist
    if (!collection) {
        return (
            <div className="collection-details">
                <div className="collection-not-found">
                    <h2>Collection not found</h2>
                    <p> This collection may have been removed or does not exist. </p>

                    <button onClick={() => navigate('/')} className="back-to-shop-button">
                        BACK TO SHOP
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="collection-details">
            <button onClick={() => navigate(-1)} className="collection-back-button"> 
                ↩ BACK 
            </button>

            {/* Collection main information */}
            <div className="collection-main">
                <div className="collection-main-image-container">
                    <img src={url + "/images/" + collection.image} alt={collection.name} className="collection-main-image"/>
                </div>

                <div className="collection-main-info">
                    <h1>{collection.name}</h1>

                    <p className="collection-description">{collection.description}</p>

                    <div className="collection-price-box">
                        <span>Total Collection Price</span>
                        <strong>{collection.price} EGP</strong>
                    </div>

                    <div className="collection-cart-section">
                        {quantity === 0 ? (
                            <button type='button' className="add-collection-button" onClick={handleAddToCart}>
                                ADD COLLECTION TO CART
                            </button>
                        ) : (
                            <div className='collection-cart-counter'>
                                <button type="button" onClick={handleRemoveFromCart}> - </button>
                                <span>{quantity}</span>
                                <button type="button" onClick={handleAddToCart}> + </button>
                            </div>
                        )}
                    </div>

                    <div className="collection-info-data">
                        {collection.gender && (
                            <p>
                                <span>For:</span> {collection.gender}
                            </p>
                        )}

                        {collection.season &&
                            collection.season !== "-" && (
                                <p>
                                    <span>Season:</span> {collection.season}
                                </p>
                            )
                        }

                    </div>
                </div>
            </div>

            {/* Included products */}
            <div className="collection-includes-section">
                <div className="collection-section-heading">
                    <h2>What's included in this collection?</h2>
                    <p> This collection contains the following perfumes.</p>
                </div>

                <div className="collection-products-list">
                    {collection.collectionItems?.map((item, index) => (
                        <div className="collection-product-card" key={index}>
                            <div className="collection-product-image-container">
                                <img src={url + "/images/" + item.image}alt={item.name} className="collection-product-image"/>
                            </div>

                            <div className="collection-product-info">
                                <h3>{item.name}</h3>
                                <p className="collection-product-description">
                                    {item.description}
                                </p>

                                <div className="collection-product-details">
                                    <p><span>For:</span> {item.gender}</p>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CollectionDetails