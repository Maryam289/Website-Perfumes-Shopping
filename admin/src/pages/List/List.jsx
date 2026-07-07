import React, {useState, useEffect} from 'react'
import './List.css'
import axios from "axios"
import {toast} from "react-toastify"

const List = ({url}) => {

  // const url = "http://localhost:4000"
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/perfume/list`);
    // console.log(response.data);
    if (response.data.success) {
      setList(response.data.data);      
    }
    else
    {
      toast.error("Error")
    }
  }

  const removePerfume = async(perfumeId) => {
    // console.log(perfumeId);
    const response = await axios.post(`${url}/api/perfume/remove`, {id:perfumeId});
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message)
    }
    else{
      toast.error("Error");
    }
    
  }

  useEffect(()=>{
    fetchList();
  },[])
  return (
    <div className = 'list add flex-col'>
      <p>All perfumes List</p>
      <div className = "list-table">
        <div className = "list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Size</b>
          <b>Price</b>
          <b>Action</b>
          </div>
          {list.map((item, index)=>{
            return(
              <div key={index} className='list-table-format'>
                <img src={`${url}/images/` + item.image} alt="" />
                <p>{item.name}</p>
                <p>{item.size}</p>
                <p>{item.price} EGP</p>
                <p onClick={()=>removePerfume(item._id)} className='cursor'>X</p>
              </div>
            )
          })}
      </div>
      
      
    </div>
  )
}

export default List
