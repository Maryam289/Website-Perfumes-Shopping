import React, {useState} from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import PerfumeDisplay from '../../components/PerfumeDisplay/PerfumeDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'


const Home = ({search}) => {

  const[category, setCategory] = useState(null);

  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <PerfumeDisplay category={category} search={search}/>
      {/* <PerfumeDisplay title="Men's Perfumes" gender="Men" search={search}/>
      <PerfumeDisplay title="Women's Perfumes" gender="Women" search={search}/>
      <PerfumeDisplay title="Summer Perfumes" season="Summer" search={search}/>
      <PerfumeDisplay title="Winter Perfumes" season="Winter" search={search}/> */}
      <AppDownload/>
    </div>
  )
}

export default Home
