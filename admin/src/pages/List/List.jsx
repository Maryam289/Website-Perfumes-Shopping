import React, { useState, useEffect } from 'react'
import './List.css'
import axios from "axios"
import { toast } from "react-toastify"
import {assets} from '../../assets/assets'
import EditProductForm from '../../components/EditProductForm/EditProductForm'

const List = ({ url }) => {

  // const url = "http://localhost:4000"
  const [list, setList] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/perfume/list`);
    // console.log(response.data);
    if (response.data.success) {
      setList(response.data.data);
    }
    else {
      toast.error("Error")
    }
  }

  const removePerfume = async (perfumeId) => {
    // console.log(perfumeId);
    const response = await axios.post(`${url}/api/perfume/remove`, { id: perfumeId });
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message)
    }
    else {
      toast.error("Error");
    }

  }

  const removePerfumeSize = async (perfumeId, size) => {
    const response = await axios.post(
      `${url}/api/perfume/remove-size`,
      { id: perfumeId, size: size }
    );

    if (response.data.success) {
      toast.success(response.data.message);
      await fetchList();
    } else {
      toast.error(response.data.message || "Error");
    }
  };

  useEffect(() => {
    fetchList();
  }, [])
  return (
    <div className='list add flex-col'>
      <p>All perfumes List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Type</b>
          <b>Sizes / Items</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item) => {
          const isCollection = item.productType === "collection";

          return (
            <div key={item._id} className='list-table-format'>
              <img src={`${item.image.url}`} alt={item.name} />
              <p>{item.name}</p>
              <p className='product-type'>{isCollection ? "Collection" : "Perfume"}</p>
              <div className="list-product-details">
                {isCollection ? (
                  item.collectionItems?.length > 0 ? (
                    item.collectionItems.map((collectionItem, index) => (
                      <p key={`${collectionItem.name}-${index}`}>
                        {collectionItem.name}
                      </p>
                    ))
                  ) : (
                    <p>-</p>
                  )
                ) : (
                  item.sizes?.length > 0 ? (
                    item.sizes.map((sizeItem) => (
                      <div
                        key={sizeItem.size}
                        className="list-size-row">
                        <span>{sizeItem.size}</span>
                        <button type="button" onClick={() => removePerfumeSize(item._id, sizeItem.size)}
                          className="remove-size-button"> X </button>
                      </div>
                    ))
                  ) : (
                    <p>No sizes available</p>
                  )
                )}
              </div>

              <div className="list-product-price">
                {isCollection ? (
                  <p>{item.price} EGP</p>
                ) : (
                  item.sizes?.map((sizeItem) => (
                    <p key={sizeItem.size}>
                      {sizeItem.size} ➡ {sizeItem.price} EGP
                    </p>
                  ))
                )}
              </div>
              <div className="list-actions">
                <img src={assets.edit_icon} alt="Edit" className='edit-icon' onClick={() => setEditingProduct(item)} />
                <p onClick={() => removePerfume(item._id)} className='cursor'>X</p>
              </div>
            </div>
          );
        })}
      </div>
      {editingProduct && (
        <EditProductForm product={editingProduct} onClose={() => setEditingProduct(null)} onUpdated={fetchList} url={url}/> )}
    </div>
  )
}

export default List
