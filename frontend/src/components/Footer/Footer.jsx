import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className='footer-content'>
        <div className="footer-content-left">
            <img src={assets.logo} alt="" className="logo"/>
            <p> </p>
            <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.whatsapp_icon} alt="" />
                <img src={assets.instagram_icon} alt="" />
            </div>
        </div>
      
      <div className="footer-content-center">
        <h2>COMPANY</h2>
        <ul>
          <li>Home</li>
          <li>About us</li>
          <li>Delivery</li>
          <li>Privacy policy</li>
        </ul>
      </div>
      <div className="footer-content-right">
        <h2>GET IN TOUCH</h2>
        <ul>
          <li>+20-10-326-10423</li>
          <li>contect@gmail.com</li>
        </ul>

      </div>
    </div>
    <hr />
    <p className="footer-copyright">Copyright 2026 © M_Nova.com - All Right Reseved.</p>
    </div>
  )
}

export default Footer
