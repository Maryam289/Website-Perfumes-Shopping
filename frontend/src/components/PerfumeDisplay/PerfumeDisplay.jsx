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

  return (
    <div className='perfume-display' id='perfume-display'>
        <h2>{title}</h2>
        {category && (
          <div className="perfume-size-section">
            <p className="perfume-size-title">— SELECT YOUR BOTTLE SIZE —</p>
            <div className="perfume-sizes">

              {/* <button className={selectedSize === "All" ? "active" : ""} onClick={() => setSelectedSize("All")}>
                <div className="size-image">
                  <img alt="All size" />
                </div>
                <span>All</span>
              </button> */}

              {/* <button className={selectedSize === "Tester" ? "active" : ""} onClick={() => setSelectedSize("Tester")}>
                <div className="size-image">
                  <img src={assets.tester_img} alt="Tester" />
                </div>
                <span>Tester</span>
              </button> */}

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
                description={item.description}
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
