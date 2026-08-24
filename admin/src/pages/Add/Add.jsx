import React, { useEffect, useState } from 'react'
import './Add.css'
import {assets} from '../../assets/assets'
import axios from "axios"
import { toast } from 'react-toastify'

const initialCollectionItem = {
  name: "",
  description: "",
  price: "",
  gender: "Men",
  season: "-",
  image: null
}


const Add = ({url}) => {

    // Product type
  const [productType, setProductType] = useState("perfume")

  // const url = " http://localhost:4000";
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name:"",
    description:"",
    // price:"",
    // size:"Tester",
    gender:"Men",
    season:"-"
  })

  // Perfume sizes
  const [sizes, setSizes] = useState({
    "30ml": {
      selected: true,
      price: ""
    },
    "50ml": {
      selected: false,
      price: ""
    }
  })

  // Collection items
  const [collectionItems, setCollectionItems] = useState([
    { ...initialCollectionItem },
    { ...initialCollectionItem },
    { ...initialCollectionItem }
  ])



  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((previousData) => (
      {...previousData, [name]: value}))
  }

  // Change product type
  const onProductTypeChange = (event) => {
    const value = event.target.value
    setProductType(value)

    // Clear values that belong to the previous type
    if (value === "perfume") {
      setCollectionItems([
        { ...initialCollectionItem },
        { ...initialCollectionItem },
        { ...initialCollectionItem }
      ])} else {
        setSizes({
          "30ml": {
            selected: true,
            price: ""
          },
          "50ml": {
            selected: false,
            price: ""
          }
        })
      }
  }

  // Change perfume size selection
  const onSizeSelectChange = (size) => {
    setSizes((previousSizes) => ({
      ...previousSizes,
      [size]: {
        ...previousSizes[size],
        selected: !previousSizes[size].selected
      }
    }))
  }


  // Change perfume size price
  const onSizePriceChange = (size, value) => {
    setSizes((previousSizes) => ({
      ...previousSizes,
      [size]: {
        ...previousSizes[size],
        price: value
      }
    }))
  }


  // Update one collection item
  const updateCollectionItem = (index, field, value) => {
    setCollectionItems((previousItems) => {
      return previousItems.map(
        (item, itemIndex) => {
          if (itemIndex !== index) {
            return item
          }
          return {
            ...item,
            [field]: value
          }
        }
      )
    })
  }



  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Main image is required for both perfume and collection
      if (!image) {
        toast.error("Please upload the main image")
        return
      }
      // Validate perfume
      if (productType === "perfume") {
        const selectedSizes = Object.entries(sizes).filter(
          ([, sizeData]) => sizeData.selected)
          .map(([size, sizeData]) => ({
            size,
            price: Number(sizeData.price)
          })
          )

          if (selectedSizes.length === 0) {
            toast.error("Please select at least one size")
            return
          }

          const invalidPrice = selectedSizes.some((item) => !item.price || item.price <= 0)

          if (invalidPrice) {
            toast.error("Please enter a valid price for every selected size")
            return
          }
          await submitPerfume(selectedSizes)
          return
      }

      // Validate collection
      if (productType === "collection") {
        const invalidItem =
          collectionItems.some((item) =>
            !item.name.trim() ||
            !item.description.trim() ||
            !item.image)

        if (invalidItem) {
          toast.error("Please complete all 3 collection items")
          return
        }

        await submitCollection()
        return
      }
      toast.error("Invalid product type")

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  // submit normal perfume
  const submitPerfume = async(selectedSizes) => {
    const formData = new FormData();
    formData.append("productType", "perfume")
    formData.append("name", data.name)
    formData.append("description", data.description)
    // formData.append("price", Number(data.price))
    formData.append("sizes", JSON.stringify(selectedSizes))
    formData.append("image", image)
    formData.append("gender", data.gender)
    formData.append("season", data.season)
    const response = await axios.post(`${url}/api/perfume/add`, formData)
    if (response.data.success) {
      resetForm()
      // setData({
      //   name:"",
      //   description:"",
      //   price:"",
      //   size:"30ml",
      //   gender:"Men",
      //   season:"-"
      // })
      // setImage(false)
      toast.success(response.data.message)
    }
    else{
      toast.error(response.data.message)
    }
  }


  // Submit collection
  const submitCollection = async () => {
    const formData = new FormData()
    formData.append("productType", "collection")
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("gender", data.gender)
    formData.append("season", data.season)
    formData.append("image", image)

    // Send collection item data without images
    const itemsWithoutImages = collectionItems.map(({image, ...item}) => item)
    formData.append("collectionItems", JSON.stringify(itemsWithoutImages))

    // Send every collection item image separately
    collectionItems.forEach((item, index) => {
      formData.append(`itemImage${index}`, item.image)
    })

    const response = await axios.post(`${url}/api/perfume/add`, formData)

    if (response.data.success) {
      resetForm()
      toast.success(response.data.message)
    } else {
      toast.error(response.data.message)
    }
  }

  // Reset form
  const resetForm = () => {
    setProductType("perfume")
    setImage(false)
    setData({
      name: "",
      description: "",
      gender: "Men",
      season: "-"
    })

    setSizes({
      "30ml": {
        selected: true,
        price: ""
      },
      "50ml": {
        selected: false,
        price: ""
      }
    })

    setCollectionItems([
      { ...initialCollectionItem },
      { ...initialCollectionItem },
      { ...initialCollectionItem }
    ])
  }



  // const [productType, setProductType] = useState("perfume");
  // const[size, setSize] = useState([{
  //   size: "30ml"
  //   price: ""
  // }])

  // const [collectionItems, setCollectionItems] = useState([
  //   {
  //   name: "",
  //   description: "",
  //   price: "",
  //   gender: "Men",
  //   season: "-",
  //   image: null
  //   },
  //   {
  //   name: "",
  //   description: "",
  //   price: "",
  //   gender: "Men",
  //   season: "-",
  //   image: null
  //   },
  //   {
  //   name: "",
  //   description: "",
  //   price: "",
  //   gender: "Men",
  //   season: "-",
  //   image: null
  //   },

  // ])

  // useEffect(()=>{
  //   console.log(data)
  // },[data])

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        {/* Product Type */}
        <div className="add-product-type flex-col">
          <p>Product Type</p>
          <select value={productType} onChange={onProductTypeChange}>
            <option value="perfume">Perfume</option>
            <option value="collection">Collection</option>
          </select>
        </div>

        {/* Main Image */}
        <div className="add-img-upload flex-col">
          <p>{productType === "collection" ? "Upload Collection Image" : "Upload Image"}</p>

          <label htmlFor="image">
            <img src={image?URL.createObjectURL(image):assets.upload_img} alt="" />
          </label>
          <input onChange={(event)=>setImage(event.target.files[0])} type="file" id="image" accept="image/*" hidden required />
        </div>

        {/* Product Name */}
        <div className="add-product-name flex-col">
          <p>{productType === "collection" ? "Collection Name" : "Product Name"}</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
        </div>

        {/* Product Description */}
        <div className="add-product-description flex-col">
          <p>{productType === "collection" ? "Collection Description" : "Product Description"}</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
        </div>

        {/* Gender + Season */}
        <div className="add-category">
          <div className="add-category-type flex-col">
            <p>perfume Type</p>
            <select onChange={onChangeHandler} name="gender" value={data.gender}>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="add-category-season flex-col">
            <p>perfume Season</p>
            <select onChange={onChangeHandler} name="season" value={data.season}>
              <option value="-">-</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
        </div>

        {/* NORMAL PERFUME */}
        {productType === "perfume" && (
          <div className="add-sizes-container">
            <p className="add-section-title">Available Sizes & Prices</p>

            {/* 30ml */}
            <div className="add-size-price">
              <div className="add-size flex-col">
                <label className="add-size-checkbox">
                  <input type="checkbox" checked={sizes["30ml"].selected} onChange={() => 
                  onSizeSelectChange("30ml")}/>
                  <span>30ml</span>
                </label>
              </div>

              <div className="add-price flex-col">
                <p>30ml Price</p>
                <input type="number" min="0" step="0.01" placeholder="400 EGP" value={sizes["30ml"].price}
                  onChange={(event) => onSizePriceChange("30ml", event.target.value)}
                  disabled={!sizes["30ml"].selected}/>
              </div>
            </div>

            {/* 50ml */}
            <div className="add-size-price">
              <div className="add-size flex-col">
                <label className="add-size-checkbox">
                  <input type="checkbox" checked={sizes["50ml"].selected} onChange={() => 
                  onSizeSelectChange("50ml")}/>
                  <span>50ml</span>
                </label>
              </div>

              <div className="add-price flex-col">
                <p>50ml Price</p>
                <input type="number" min="0" step="0.01" placeholder="600 EGP" value={sizes["50ml"].price}
                  onChange={(event) => onSizePriceChange("50ml", event.target.value)}
                  disabled={!sizes["50ml"].selected}/>
              </div>
            </div>
            </div>
        )}

            {/* COLLECTION */}
            {productType === "collection" && (
              <div className="collection-items-container">
                <p className="add-section-title">Collection Items</p>
                {collectionItems.map((item, index) => (
                  <div className="collection-item" key={index}>
                    <h3>Item {index + 1}</h3>
                    {/* Item Image */}
                    <div className="collection-item-image flex-col">
                      <p>Item Image</p>
                      <label htmlFor={`itemImage${index}`}>
                        <img src={item.image ? URL.createObjectURL(item.image) : assets.upload_img} alt=""/>
                      </label>
                      <input id={`itemImage${index}`} type="file" accept="image/*" hidden onChange={(event) =>
                          updateCollectionItem(index, "image", event.target.files[0])}/>
                    </div>

                    {/* Item Name */}
                    <div className="collection-item-field flex-col">
                      <p>Item Name</p>
                      <input type="text" placeholder="Type item name" value={item.name} onChange={(event) =>
                      updateCollectionItem(index, "name", event.target.value)} required/>
                    </div>
                  
                    {/* Item Description */}
                    <div className="collection-item-field flex-col">
                      <p>Item Description</p>
                      <textarea rows="5" placeholder="Write item description" value={item.description} onChange={(event) =>
                      updateCollectionItem(index, "description", event.target.value)} required/>
                    </div>

                    <div className="collection-item-field flex-col">
                      <p>Item Price</p>
                      <input type="number" min="0" step="0.01" placeholder="50 EGP" value={item.price}
                      onChange={(event) => updateCollectionItem(index, "price", event.target.value)} required/>
                    </div>

                    {/* Item Gender + Season */}
                    <div className="collection-item-category">
                      <div className="flex-col">
                        <p>Item Type</p>
                          <select value={item.gender} onChange={(event) =>
                          updateCollectionItem(index, "gender", event.target.value)}>

                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Both">Both</option>
                          </select>
                      </div>

                      <div className="flex-col">
                        <p>Item Season</p>
                        <select value={item.season} onChange={(event) =>
                        updateCollectionItem(index, "season", event.target.value)}>

                          <option value="-">-</option>
                          <option value="Summer">Summer</option>
                          <option value="Winter">Winter</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            )}

              {/* <p>Product size</p>
              <select onChange={onChangeHandler} name="size">
                <option value="Tester">Tester</option>
                <option value="30ml">30ml</option>
                <option value="50ml">50ml</option>
              </select>
            </div>
            <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='400 EGP' />
            </div>
          </div> */}

        <button type='submit' className='add-btn'> ADD </button>

      </form>
    </div>
  )
}

export default Add
