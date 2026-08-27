import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import perfumeModel from "../models/perfumeModel.js";
import mongoose from "mongoose";
// import Stripe from "stripe"


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// placing user order from frontend using Stripe Session (pay online)
// const placeOrder = async (req, res) => {

//     // const frontend_url = "https://m-nova-frontend.onrender.com";
//     const frontend_url = "http://localhost:5173/";

//     try {
//         const newOrder = new orderModel({
//             userId: req.body.userId,
//             items: req.body.items,
//             amount: req.body.amount,
//             address: req.body.address
//         })

//         await newOrder.save();
//         await userModel.findByIdAndUpdate(req.body.userId, {cartData:{}});

//         const line_items = req.body.items.map((item) => ({
//             price_data:{
//                 currency:"EGP",
//                 product_data:{
//                     name:item.name
//                 },
//                 unit_amount: item.price * 100
//             },
//             quantity: item.quantity
//         }))

//         line_items.push({
//             price_data:{
//                 currency:"EGP",
//                 product_data:{
//                     name:"Delivery charges"
//                 },
//                 unit_amount : 50 * 100
//             },
//             quantity: 1
//         })

//         const session = await stripe.checkout.sessions.create({
//             line_items: line_items,
//             mode: 'payment',
//             success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
//         })

//         res.json({success:true, session_url: session.url})

//     } catch (error) {
//         console.log(error);
//         res.json({success:false, message:"Error"})
        
//     }
// }

const placeOrder = async (req, res) => {

    try {
        const userId = req.body.userId;
        const {address} = req.body;
        // Get the user's cart from the database
        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.json({success: false, message: "User not found"})
        }

        const cartData = userData.cartData || {};
        // Cart is empty
        if (Object.keys(cartData).length === 0) {
            return res.json({success: false, message: "Cart is empty"});
        }

        const verifiedItems = [];
        let totalAmount = 0;
        // Loop through the cart stored in MongoDB
        for (const cartKey in cartData) {
            const quantity = Number(cartData[cartKey]);
            if (!quantity || quantity <= 0) {
                continue;
            }
            let productId = cartKey;
            let selectedSize = null;

            const sizeMatch = cartKey.match(/^(.+)_(30ml|50ml)$/);
            if (sizeMatch) {
                productId = sizeMatch[1];
                selectedSize = sizeMatch[2];
            }

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.json({success: false, message: "Invalid product found in cart"});
            }

            // Get the real product from MongoDB
            const product = await perfumeModel.findById(productId);
            if (!product) {
                return res.json({success: false, message: "One of the products in your cart no longer exists"});
            }

            let realPrice = 0;
            // Collection
            if (product.productType === "collection") {
                realPrice = Number(product.price);
            }

            // perfume
            else if (product.productType === "perfume") {
                if (!selectedSize) {
                    return res.json({success: false, message: `Please select a size for ${product.name}`});
                }
                const sizeData = product.sizes.find(
                    (item) => item.size === selectedSize
                );

                if (!sizeData) {
                    return res.json({success: false, message: `Selected size is no longer available for ${product.name}`});
                }
                realPrice = Number(sizeData.price);
            } 

            if (!Number.isFinite(realPrice) || realPrice < 0) {
                return res.json({success: false, message: `Invalid price for ${product.name}`});
            }
            const itemTotal = realPrice * quantity;

            // Save verified data only
            verifiedItems.push({
                productId: product._id.toString(),
                name: product.name,
                image: product.image,
                productType: product.productType,
                size: selectedSize,
                price: realPrice,
                quantity,
                total: itemTotal
            });

            totalAmount += itemTotal;
        }

        // Make sure there are valid products
        if (verifiedItems.length === 0) {
            return res.json({success: false, message: "Cart is empty"});
        }

        const newOrder = new orderModel({
            userId,
            items: verifiedItems,
            amount: totalAmount,
            address,
            payment: false
        })

        await newOrder.save();

        await userModel.findByIdAndUpdate(
            userId,
            {cartData: {}}
        );

        res.json({success: true, orderId: newOrder._id, amount: totalAmount});

    } catch (error) {

        console.log("PLACE ORDER ERROR:", error);

        res.json({success: false, message: "Error"})
    }
}

const verifyOrder = async(req, res) => {
    const {orderId, success} = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            res.json({success:true, message:"Paid"})
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false, message:"Not paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"})
    }
}

//user orders for frontend

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true, data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"})
        
    }
}

//listing orders for admin panal
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success:true, data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"})
        
        
    }
}

// api for updating order status 
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {status:req.body.status});
        res.json({success:true, message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"})
        
    }
}

export{placeOrder, verifyOrder, userOrders, listOrders, updateStatus}
