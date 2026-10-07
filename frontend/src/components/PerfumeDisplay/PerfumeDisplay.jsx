import React, { useContext, useState, useEffect } from 'react'
import './PerfumeDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import PerfumeItem from '../PerfumeItem/PerfumeItem'
import { assets } from '../../assets/assets'

const PerfumeDisplay = ({category, search, title}) => {

    const {perfume_list}  = useContext(StoreContext)
    const searchText = search.toLowerCase().trim()
    const [selectedSize, setSelectedSize] = useState("All")
    useEffect(() => {
      setSelectedSize("All")
    }, [category])
    const filteredPerfumes = perfume_list.filter((item) => {
      let matchesCategory = true;
      if (category === "Men") {
        title="Men's Perfumes"
        matchesCategory = item.gender === "Men" || item.gender === "Both"
      }
      if (category === "Women") {
        title="Women's Perfumes"
        matchesCategory = item.gender === "Women" || item.gender === "Both"
      }
      if (category === "Summer") {
        title="Summer Perfumes"
        matchesCategory = item.season === "Summer"
      }
      if (category === "Winter") {
        title="Winter Perfumes"
        matchesCategory = item.season === "Winter"
      }
      const matchesSize = selectedSize === "All" || (
        item.productType === "perfume" && item.sizes.some((sizeItem) => sizeItem.size === selectedSize)
      );
      const matchesSearch = item.name?.toLowerCase().includes(searchText) || item.description?.toLowerCase().includes(searchText);

      return (matchesCategory && matchesSize && matchesSearch);
    });

    const formatDescription = (text) => {
      return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          return part;
      });
    };

  return (
    <div className='perfume-display' id='perfume-display'>
        <h2>{title}</h2>
        {category && (
          <div className="perfume-size-section">
            <p className="perfume-size-title">— SELECT YOUR BOTTLE SIZE —</p>
            <div className="perfume-sizes">
              <button className={selectedSize === "30ml" ? "active" : ""} onClick={() => setSelectedSize("30ml")}>
                <div className="size-image">
                  <img src={assets.bottle_30ml} alt="30ml" />
                </div>
                <span>30ml</span>
              </button>

              <button className={selectedSize === "50ml" ? "active" : ""} onClick={() => setSelectedSize("50ml")}>
                <div className="size-image">
                  <img src={assets.bottle_50ml} alt="50ml" />
                </div> 
                <span>50ml</span>
              </button>
            </div>
          </div>
        )}
        <div className="perfume-display-list">
          {filteredPerfumes.length > 0 ? (filteredPerfumes.map((item, index)=> (
              <PerfumeItem 
                key={item._id || index}
                id={item._id}
                name={item.name}
                productType={item.productType}
                sizes={item.sizes}
                collectionItems={item.collectionItems}
                price={item.price}
                description={formatDescription(item.description)}
                image={item.image}
                gender={item.gender}
                season={item.season}
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
