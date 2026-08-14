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
    
    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev)=>({...prev, [itemId]:1}))
        }
        else{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        }
        if (token) {
            await axios.post(url+"/api/cart/add", {itemId}, {headers:{token}})
        }
    }

    const removeFromCart = async (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));

        if (token) {
            await axios.post(url+"/api/cart/remove", {itemId}, {headers:{token}})
        }
    }

    const getTotalCartAmount = () =>{
        let totalAmount = 0;
        for(const item in cartItems){
            if (cartItems[item] > 0) {
                const itemInfo = perfume_list.find((product) => product._id === item);
                if (!itemInfo) {
                    continue;
                }
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const fetchPerfumeList = async () => {
        const response = await axios.get(url+"/api/perfume/list");
        const products = response.data.data
        setPerfumeList(response.data.data);

        setCartItems((prevCart) => {
            const cleanedCart = {}
                for (const itemId in prevCart) {    
                    const productExists = products.some(
                        (product) => product._id === itemId);
                    if (productExists) {
                        cleanedCart[itemId] = prevCart[itemId];
                    }
                }
                return cleanedCart;
        });
    };

    //save chossed when refresh page
    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, {headers:{token}});
        setCartItems(response.data.cartData);
    }

    useEffect(() => {
        async function loadData() {
            await fetchPerfumeList();
        if (localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"));
            await loadCartData(localStorage.getItem("token"));
        }
    }
    loadData();
    }, [])

    const contextValue = {
        perfume_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    }
    return (
        <StoreContext.Provider value={contextValue}>
        {props.children}
            
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
