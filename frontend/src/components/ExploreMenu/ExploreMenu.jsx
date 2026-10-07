import React from 'react'
import './ExploreMenu.css'
import { categories } from '../../assets/assets'

const ExploreMenu = ({category, setCategory}) => {

  return (
    <div className='explore-category' id='explore-category'>
      <h1>Choose your interest</h1>
      <p className='explore-category-text'>Choose the perfect perfume for your lifestyle</p>
      <div className="explore-category-list">
        {categories.map((item, index)=>{
          return (
            <div onClick={()=>setCategory(prev=>prev===item.id?"All":item.id)} key={index} className='explore-category-list-item'>
              <img className={category===item.id?"active":""} src={item.image} alt="" />
              <p>{item.id}</p>
             </div>
          )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu
