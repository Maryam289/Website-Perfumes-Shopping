import userModel from "../models/userModel.js"
import perfumeModel from "../models/perfumeModel.js";


const getCartKey = (itemId, size) => {

    if (!size) {
        return itemId;
    }

    // perfume is identified by product + selected size
    return size ? `${itemId}_${size}` : itemId;
};

const validateCartItem = async (itemId, size) => {
    const product = await perfumeModel.findById(itemId);

    if (!product) {
        return {success: false, message: "Product not found"};
    }

    // if collection
    if (product.productType === "collection") {
        // not have a selected size
        if (size) {
            return {success: false, message: "Collection does not have sizes"};
        }
        return{success: true, product};
    }

    // normal perfume
    if (product.productType === "perfume") {
        if (!size) {
            return {success: false, message: "Please select a perfume size"};
        }

        const selectedSize = product.sizes.find((sizeItem) => sizeItem.size === size);

        if (!selectedSize) {
            return {success: false, message: "Invalid perfume size"}
        }
        return{success: true, product};
    }
    return{success: false, message: "Invalid product type"};
};

// add items to user cart
const addToCart = async (req, res) => {
    try {
        const {
            userId,
            itemId,
            size
        } = req.body;

        // Validate product and size from MongoDB
        const validation = await validateCartItem(itemId, size);
        if (!validation.success) {
            return res.json({success: false, message: validation.message});
        }

        const cartKey = getCartKey(itemId, size)
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({success: false, message: "User not found"});
        }

        const cartData = userData.cartData || {};
        if (!cartData[cartKey]) {
            cartData[cartKey] = 1
        } else {
            cartData[cartKey] += 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData});
        res.json({success:true, message:"Added to cart"});
    } catch (error) {
        console.log("ADD TO CART ERROR:", error);
        res.json({success:false, message:"Error while adding to cart"});
        
    }
}



// remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        const {
            userId,
            itemId,
            size
        } = req.body;

        // validate product and size from MongoDB
        const validation = await validateCartItem(itemId, size);
        if (!validation.success) {
            return res.json({success: false, message: validation.message});
        }

        const cartKey = getCartKey(itemId, size);
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({success: false, message: "User not found"});
        }

        const cartData = userData.cartData || {};
        if (!cartData[cartKey]) {
            return res.json({success: false, message: "Item not found in cart"});
        }

        if(cartData[cartKey] > 1){
            cartData[cartKey] -= 1;
        } else{
            delete cartData[cartKey];
        }
        await userModel.findByIdAndUpdate(userId, {cartData});
        res.json({success:true, message:"Removed from cart"});
    } catch (error) {
        console.log("REMOVE FROM CART ERROR: ",error);
        return res.json({success:false, message:"Error while removing from cart"});
    }
}

// fetch user cart data
const getCart = async (req, res) => {
    try {
        const userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.json({success: false, message: "User not found"});
        }
        return res.json({success:true, cartData: userData.cartData || {}})
    } catch (error) {
        console.log("GET CART ERROR: ", error);
        return res.json({success:false, message:"Error while fetching cart"})
    }
}

export {addToCart, removeFromCart, getCart}