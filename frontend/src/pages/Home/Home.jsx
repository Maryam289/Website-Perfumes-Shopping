import React, {useState} from 'react'
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
      <AppDownload/>
    </div>
  )
}

export default Home
