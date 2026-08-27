import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrder = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);

    const fetchOrders = async () => {
        const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
        setData(response.data.data);
        // console.log(response.data.data);

    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className='my-orders-order'>
                            <img src={assets.box_order} alt="" />

                            <div className="order-item-products">
                                {order.items.map((item, index) => (
                                    <div key={`${item.productId}-${item.size || "collection"}-${index}`} className="order-product">
                                        <p className="order-product-name">
                                            {item.name}
                                        </p>
                                        <div className="order-product-details">
                                            <span>
                                                {item.productType === "perfume"
                                                    ? `Size: ${item.size}`
                                                    : "Collection"}
                                            </span>
                                            <span>Price: {item.price} EGP</span>
                                            <span>Quantity: {item.quantity}</span>
                                            <span>Total: {item.total} EGP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p>Total: {order.amount}.00 EGP</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf; </span><b>{order.status}</b></p>
                            <button onClick={fetchOrders}>Track Order</button>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

export default MyOrder
