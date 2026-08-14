import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrder from './pages/MyOrders/MyOrder'
import About from './pages/About/About'
import Delivery from './pages/Delivery/Delivery'
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy'
import ScrollToTop from './context/ScrollToTop.jsx'


const App = () => {

  const[showLogin, setShowLogin] = useState(false)
  const[search, setSearch] = useState("")

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} setSearch={setSearch} />
        <Routes>

          <Route path='/' element={<Home search={search} />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrder />} />
          <Route path='/about' element={<About />} />
          <Route path='/delivery' element={<Delivery />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />

        </Routes>
      </div>
      <Footer />
      <ScrollToTop />

    </>

  )
}

export default App
