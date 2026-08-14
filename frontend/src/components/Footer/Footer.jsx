import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'


const Footer = () => {

  const facebookUrl = "https://www.facebook.com/share/1BZMGcwMaz/?mibextid=wwXIfr"
  const whatsappUrl = "https://wa.me/201032610423"
  const instagramUrl = "https://www.instagram.com/m_nova_1?igsh=MWtoazhvaG96YTQwbA%3D%3D&utm_source=qr"

  return (
    <div className='footer' id='footer'>
      <div className='footer-content'>
        <div className="footer-content-left">
            <img src={assets.logo} alt="M Nova Perfumes" className="logo"/>
            <p>Discover your signature scent with M Nova.
            Elegant fragrances crafted to complement your
            style, mood, and every unforgettable moment.</p>
            <div className="footer-social-icons">
                <a href={facebookUrl} target='_blank' rel='noopener noreferrer' aria-label='Facebook'>
                <img src={assets.facebook_icon} alt="Facebook" />
                </a>
                <a href={whatsappUrl} target='_blank' rel='noopener noreferrer' aria-label='WhatsApp'>
                <img src={assets.whatsapp_icon} alt="WhatsApp" />
                </a>
                <a href={instagramUrl} target='_blank' rel='noopener noreferrer' aria-label='Instgram'>
                <img src={assets.instagram_icon} alt="Instagram" />
                </a>
            </div>
        </div>
      
      <div className="footer-content-center">
        <h2>COMPANY</h2>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About us</Link></li>
          <li><Link to="/delivery">Delivery</Link></li>
          <li><Link to="/privacy-policy">Privacy policy</Link></li>
        </ul>
      </div>
      <div className="footer-content-right">
        <h2>GET IN TOUCH</h2>
        <ul>
          <li><a href={whatsappUrl}>+20 10 3261 0423</a></li>
          <li><a href="mailto:contact@mnova.com">contect@gmail.com</a></li>
        </ul>

      </div>
    </div>
    <hr />
    <p className="footer-copyright">Copyright 2026 © M_Nova.com - All Right Reseved.</p>
    </div>
  )
}

export default Footer
