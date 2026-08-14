import React, { useContext } from 'react'
import './PerfumeDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import PerfumeItem from '../PerfumeItem/PerfumeItem'

const PerfumeDisplay = ({category, search}) => {

    const {perfume_list}  = useContext(StoreContext)
    const searchText = search.toLowerCase().trim()
    const filteredPerfumes = perfume_list.filter((item) => {
      const matchesCategory = category === "All" || category === item.size;
      const matchesSearch = item.name?.toLowerCase().includes(searchText) || item.description?.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });

  return (
    <div className='perfume-display' id='perfume-display'>
        <h2>Top Perfumes near you</h2>
        <div className="perfume-display-list">
          {filteredPerfumes.length > 0 ? (filteredPerfumes.map((item, index)=> (
              <PerfumeItem 
                key={item._id || index}
                id={item._id}
                name={item.name}
                price={item.price}
                description={item.description}
                image={item.image}
              />
            ))
          ) : (
            <p className="no-search-results">No perfumes found</p>
          )}
        </div>
    </div>
  )
}

export default PerfumeDisplay
