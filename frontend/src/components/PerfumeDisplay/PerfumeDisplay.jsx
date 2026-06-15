import React, { useContext } from 'react'
import './PerfumeDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import PerfumeItem from '../PerfumeItem/PerfumeItem'

const PerfumeDisplay = ({category}) => {

    const {perfume_list}  = useContext(StoreContext)

  return (
    <div className='perfume-display' id='perfume-display'>
        <h2>Top Perfumes near you</h2>
        <div className="perfume-display-list">
            {perfume_list.map((item, index)=>{
              {console.log(category, item.category);}
              if (category==="All" || category===item.category) {
                return <PerfumeItem key={index} id={item._id} name={item.name} price={item.price} description={item.description} image={item.image} />
              }
            })}
        </div>
      
    </div>
  )
}

export default PerfumeDisplay
