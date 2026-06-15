import React from 'react'
import './ExploreMenu.css'
import { bottle_list } from '../../assets/assets'

const ExploreMenu = ({category, setCategory}) => {

  return (
    <div className='explore-size' id='explore-size'>
      <h1>Explore our bottle size</h1>
      <p className='explore-size-text'>Choose the perfect bottle size for your lifestyle</p>
      <div className="explore-size-list">
        {bottle_list.map((item, index)=>{
          return (
            <div onClick={()=>setCategory(prev=>prev===item.bottle_size?"All":item.bottle_size)} key={index} className='explore-size-list-item'>
              <img className={category===item.bottle_size?"active":""} src={item.bottle_image} alt="" />
              <p>{item.bottle_size}</p>
             </div>
          )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu
