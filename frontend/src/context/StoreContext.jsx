import { createContext, useEffect, useState } from "react";
// import { perfume_list } from "../assets/assets";
import axios from "axios"

export const StoreContext = createContext(null)


const StoreContextProvider = (props) => {

    const[cartItems, setCartItems] = useState({});
    // const url = "https://website-perfumes-shopping-backend.onrender.com"
    const url = "http://localhost:4000"
    const [token, setToken] = useState("");
    const [perfume_list, setPerfumeList] = useState([])
    
    // Helper to get data from mongoDB from backend
    const getCartKey = (itemId, size = null) => {
        return size ? `${itemId}_${size}` : itemId;
    };

     // Get product ID and selected size from cart key
     const parseCartKey = (cartKey) => {
        const availableSize = ["30ml", "50ml"];
        for (const size of availableSize) {
            const suffix = `_${size}`;
            if (cartKey.endsWith(suffix)) {
                return {itemId: cartKey.slice(0, -suffix.length), size};
            }
        }
        return{itemId: cartKey, size: null};
     };


    const addToCart = async (itemId, size = null) => {
        const cartKey = getCartKey(itemId, size);

        setCartItems((prev) => ({
            ...prev, [cartKey]: (prev[cartKey] || 0) + 1
        }));

        if(token) {
            try {
                const response = await axios.post(url + "/api/cart/add",
                    {itemId, size}, {headers: {token}}
                );
                if (!response.data.success) {
                    console.log(response.data.message);
                    await loadCartData(token);
                }

            } catch (error) {
                console.log("ADD TO CART ERROR:", error);
                await loadCartData(token);
            }
        }

        // if (!cartItems[itemId]) {
        //     setCartItems((prev)=>({...prev, [itemId]:1}))
        // }
        // else{
        //     setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        // }
        // if (token) {
        //     await axios.post(url+"/api/cart/add", {itemId}, {headers:{token}})
        // }
    }

    const removeFromCart = async (itemId, size = null) => {

        const cartKey = getCartKey(itemId, size);
        setCartItems((prev) => {
            const updatedCart = {...prev};
            if (!updatedCart[cartKey]) {
                return prev;
            }
            
            if (updatedCart[cartKey] > 1) {
                updatedCart[cartKey] -= 1;
            } else {
                delete updatedCart[cartKey];
            }
            return updatedCart;
        });

        if (token) {
            try {
                const response = await axios.post(url+"/api/cart/remove", {itemId, size}, {headers:{token}});
                if (!response.data.success) {
                    console.log(response.data.message);
                    await loadCartData(token);
                }
            } catch (error) {
                console.log("REMOVE FROM CART ERROR: ", error);
                await loadCartData(token);
            }
        }
    }

    // price is never sent from frontend (calculates data price from backend)
    const getProductPrice = (product, selectedSize = null) => {
        if (!product) {
            return 0;
        }

        // collection has 1 total price
        if (product.productType === "collection") {
            return Number(product.price) || 0;
        }

        // normal perfume needs a selected size
        if (product.productType === "perfume" && selectedSize && Array.isArray(product.sizes)) {
            const sizeData = product.sizes.find((sizeItem) => sizeItem.size === selectedSize);
            return Number(sizeData?.price) || 0;
        }
        return 0;
    };


    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const cartKey in cartItems){
            const quantity = cartItems[cartKey];
            if (quantity <= 0) {
                continue;
            }
            const {itemId, size} = parseCartKey(cartKey);

            const itemInfo = perfume_list.find((product) => product._id === itemId);
            if (!itemInfo) {
                continue;
            }
            const productPrice = getProductPrice(itemInfo, size);
            totalAmount += productPrice * quantity;
            }
        return totalAmount;
    };

    const fetchPerfumeList = async () => {
        try {
            const response = await axios.get(url+"/api/perfume/list");
            if (!response.data.success) {
                return;
            }
            const products = response.data.data || [];
            setPerfumeList(products);
            
            // Remove cart items that no longer exist
            setCartItems((prevCart) => {
                const cleanedCart = {};

                for (const cartKey in prevCart) {
                    const {itemId, size} = parseCartKey(cartKey);
                    const product = products.find((item) => item._id === itemId);
                    if (!product) {
                        continue;
                    }

                    if (product.productType === "collection" && !size) {
                        cleanedCart[cartKey] = prevCart;
                    }

                    if (product.productType === "perfume" && size && product.size?.some((sizeItem) => 
                        sizeItem.size === size)) {
                        cleanedCart[cartKey] = prevCart[cartKey];
                    }
                }
                return cleanedCart;
            });
        } catch (error) {
            console.log("FETCH PERFUME LIST ERROR: ", error);
        }  
    };

    //save chossed when refresh page
    const loadCartData = async (userToken) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, {headers:{token: userToken}});
            if (response.data.success) {
                setCartItems(response.data.cartData || {});
            }
        } catch (error) {
            console.log("LOAD CART ERROR: ", error);
        }
    };

    // Initial load
    useEffect(() => {
        async function loadData() {
            await fetchPerfumeList();
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await loadCartData(savedToken);
            }
        }
        loadData();
    }, []);

    const contextValue = {
        perfume_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getCartKey,
        parseCartKey,
        getProductPrice,
        getTotalCartAmount,
        url,
        token,
        setToken
    };
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children} 
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
