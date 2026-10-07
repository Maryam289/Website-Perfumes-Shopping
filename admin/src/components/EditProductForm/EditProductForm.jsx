import React, { useEffect, useState } from 'react'
import './EditProductForm.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const EditProductForm = ({ product, onClose, onUpdated, url }) => {

    // Product data
    const [data, setData] = useState({
        name: "",
        description: "",
        gender: "Men",
        season: "-"
    })

    // Main image
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState("")

    // Perfume sizes
    const [sizes, setSizes] = useState({
        "30ml": {
            selected: false,
            price: ""
        },
        "50ml": {
            selected: false,
            price: ""
        }
    })
    const [collectionItems, setCollectionItems] = useState([])
    const [collectionItemsCount, setCollectionItemsCount] = useState(2)

    const [loading, setLoading] = useState(false)

    // Load product data
    useEffect(() => {
        if (!product) return

        setData({
            name: product.name || "",
            description: product.description || "",
            gender: product.gender || "Men",
            season: product.season || "-"
        })

        // Existing main image
        setImage(null)
        setImagePreview(product.image?.url || "")

        // Existing sizes
        const productSizes = product.sizes || []

        setSizes({
            "30ml": {
                selected: productSizes.some(
                    (item) => item.size === "30ml"
                ),
                price:
                    productSizes.find(
                        (item) => item.size === "30ml"
                    )?.price || ""
            },

            "50ml": {
                selected: productSizes.some(
                    (item) => item.size === "50ml"
                ),
                price:
                    productSizes.find(
                        (item) => item.size === "50ml"
                    )?.price || ""
            }
        })

        // Existing collection items
        const existingCollectionItems = product.collectionItems || []
        setCollectionItems(existingCollectionItems.map((item) => 
            ({
                name: item.name || "",
                description: item.description || "",
                price: item.price || "",
                gender: item.gender || "Men",
                season: item.season || "-",
                // Existing Cloudinary image
                image: item.image || null,
                // New file selected by admin
                imageFile: null,
                // Preview URL
                imagePreview: item.image?.url || ""
            }))
        )
        setCollectionItemsCount(existingCollectionItems.length || 2)

    }, [product])

    // Change normal product data
    const onChangeHandler = (event) => {
        const { name, value } = event.target
        setData((previousData) => ({
            ...previousData,
            [name]: value
        }))
    }

    // Change main image
    const onImageChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
    }

    // Change collection item data
    const updateCollectionItem = (index, field, value) => {
        setCollectionItems((previousItems) => {
            return previousItems.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item
                }
                return {...item, [field]: value
                }
            })
        })
    }

    // Change collection item image
    const onCollectionItemImageChange = (index, event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const preview = URL.createObjectURL(file)
        setCollectionItems((previousItems) => {
            return previousItems.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item
                }
                return {
                    ...item,
                    imageFile: file,
                    imagePreview: preview
                }
            })
        })
    }

    // Change collection item image
    const onCollectionItemCountChange = (event) => {
        const count = Number(event.target.value)
        setCollectionItemsCount(count)
        setCollectionItems((previousItems) => {
            const updatedItems = [...previousItems]
            if (count > updatedItems.length) {
                while (updatedItems.length < count) {
                    updatedItems.push({
                        name: "",
                        description: "",
                        price: "",
                        gender: "Men",
                        season: "-",
                        image: null,
                        imageFile: null,
                        imagePreview: ""
                    })
                }
            
            } else if(count < updatedItems.length) {
                updatedItems.splice(count)
            }
            return updatedItems
        })
    }

    // Change size selection
    const onSizeSelectChange = (size) => {
        setSizes((previousSizes) => ({
            ...previousSizes,
            [size]: {
                ...previousSizes[size],
                selected: !previousSizes[size].selected
            }
        }))
    }

    // Change size price
    const onSizePriceChange = (size, value) => {
        setSizes((previousSizes) => ({
            ...previousSizes,
            [size]: {
                ...previousSizes[size],
                price: value
            }
        }))
    }

    // Submit update
    const handleSubmit = async (event) => {
        event.preventDefault()
        if (loading) return
        try {
            setLoading(true)

            if (product.productType === "collection") {
                // console.log("COLLECTION ITEMS COUNT:", collectionItems.length)
                // console.log("COLLECTION ITEMS:", collectionItems)
                // console.log("SELECTED COUNT:", collectionItemsCount)
                if (collectionItems.length < 2 || collectionItems.length > 4) {
                    toast.error("Collection must contain between 2 and 4 items")
                    setLoading(false)
                    return
                }

                const invalidItem = collectionItems.some((item) =>
                    !item.name.trim() ||
                    !item.description.trim() ||
                    !item.price ||
                    !Number.isFinite(Number(item.price)) ||
                    Number(item.price) <= 0
                )
                if (invalidItem) {
                    // console.log("Error: ", error);
                    
                    toast.error("Please complete all collection items")
                    setLoading(false)
                    return
                }
            }

            const formData = new FormData()

            if (product.productType === "perfume"){
                
                // Validate selected sizes
                const selectedSizes = Object.entries(sizes)
                    .filter(([, sizeData]) => sizeData.selected)
                    .map(([size, sizeData]) => ({size, price: Number(sizeData.price)}))

                if (selectedSizes.length === 0) {
                    toast.error("Please select at least one size")
                    setLoading(false)
                    return
                }

                const invalidPrice = selectedSizes.some(
                    (item) => !Number.isFinite(item.price) || item.price <= 0
                )

                if (invalidPrice) {
                    toast.error("Please enter a valid price for every selected size")
                    setLoading(false)
                    return
                }

                formData.append("sizes", JSON.stringify(selectedSizes))
            }

            // Create FormData
            formData.append("_id", product._id)
            formData.append("id", product._id)
            formData.append("productType", product.productType)
            formData.append("name", data.name)
            formData.append("description", data.description)
            formData.append("gender", data.gender)
            formData.append("season", data.season)
            // formData.append("sizes", JSON.stringify(selectedSizes))

            if (product.productType === "collection") {
                const collectionItemsData = collectionItems.map((item) => ({
                    name: item.name,
                    description: item.description,
                    price: Number(item.price),
                    gender: item.gender,
                    season: item.season,
                    image: item.image
                }))

                formData.append(
                    "collectionItems",
                    JSON.stringify(collectionItemsData)
                )

                collectionItems.forEach((item, index) => {
                    if (item.imageFile) {
                        formData.append(`itemImage${index}`, item.imageFile)
                    }
                })
            }

            // Send new image only if changed
            if (image) {
                formData.append("image", image)
            }

            // Send update request
            console.log("NEW IMAGE:", image);
            console.log("FORM DATA IMAGE:", formData.get("image"));
            const response = await axios.put(`${url}/api/perfume/update`, formData)

            if (response.data.success) {
                toast.success(response.data.message)

                // Refresh List
                await onUpdated()

                // Close Edit Form
                onClose()

            } else {
                toast.error(response.data.message || "Error updating product")
            }

        } catch (error) {
            console.log("UPDATE PRODUCT ERROR:", error)
            toast.error(error.response?.data?.message || "Something went wrong")

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="edit-overlay">
            <div className="edit-form">
                {/* Header */}
                <div className="edit-form-header">
                    <h2>Edit Product</h2>
                    <button type="button" className="edit-close-button" onClick={onClose}> X </button>
                </div>

                <form className="flex-col" onSubmit={handleSubmit}>

                    {/* Product Type */}
                    <div className="edit-product-type flex-col">
                        <p>Product Type</p>
                        <input type="text" value={
                            product.productType === "perfume" ? "Perfume" : "Collection"
                        }
                        disabled/>
                    </div>

                    {/* Main Image */}
                    <div className="edit-img-upload flex-col">
                        <p>Product Image</p>
                        <label htmlFor="edit-image">
                            <img src={imagePreview ? imagePreview : assets.upload_img}
                            alt={data.name}
                            />
                        </label>

                        <input id="edit-image" type="file" accept="image/*" hidden onChange={onImageChange}/>
                    </div>

                    {/* Product Name */}
                    <div className="edit-product-name flex-col">
                        <p>Product Name</p>
                        <input type="text" name="name" value={data.name} onChange={onChangeHandler} placeholder="Product name" required/>
                    </div>

                    {/* Product Description */}
                    <div className="edit-product-description flex-col">
                        <p>Product Description</p>
                        <textarea name="description" value={data.description} 
                        onChange={onChangeHandler} rows="6" placeholder="Product description" required/>
                    </div>

                    {/* Gender + Season */}
                    <div className="edit-category">
                        <div className="flex-col">
                            <p>Perfume Type</p>
                            <select name="gender" value={data.gender} onChange={onChangeHandler}>
                                <option value="Men"> Men </option>
                                <option value="Women">Women</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>

                        <div className="flex-col">
                            <p>Perfume Season</p>
                            <select name="season" value={data.season} onChange={onChangeHandler}>
                                <option value="-">-</option>
                                <option value="Summer">Summer</option>
                                <option value="Winter">Winter</option>
                            </select>
                        </div>
                    </div>

                    {/* Sizes */}
                    {product.productType === "perfume" && (
                        <div className="edit-sizes-container">
                            <p className="edit-section-title">Available Sizes & Prices</p>

                            {/* 30ml */}
                            <div className="edit-size-price">
                                <div className="edit-size flex-col">
                                    <label className="edit-size-checkbox">
                                        <input type="checkbox" checked={sizes["30ml"].selected}
                                            onChange={() => onSizeSelectChange("30ml")}/>
                                        <span>30ml</span>
                                    </label>
                                </div>

                                <div className="edit-price flex-col">
                                    <p>30ml Price</p>
                                    <input type="number" min="0" step="0.01" placeholder="400 EGP"

                                    value={sizes["30ml"].price} onChange={(event) =>
                                        onSizePriceChange("30ml", event.target.value)
                                    }
                                    disabled={!sizes["30ml"].selected}/>
                                </div>
                            </div>

                            {/* 50ml */}
                            <div className="edit-size-price">
                                <div className="edit-size flex-col">
                                    <label className="edit-size-checkbox">
                                        <input type="checkbox" checked={ sizes["50ml"].selected} onChange={() =>
                                            onSizeSelectChange("50ml")}/>
                                        <span>50ml</span>
                                    </label>
                                </div>

                                <div className="edit-price flex-col">
                                    <p>50ml Price</p>
                                    <input type="number" min="0" step="0.01" placeholder="600 EGP"
                                    value={sizes["50ml"].price} onChange={(event) =>
                                        onSizePriceChange("50ml", event.target.value)
                                    } disabled={!sizes["50ml"].selected}/>
                                </div>
                            </div>
                        </div>
                    )}

                    {product.productType === "collection" && (
                        <div className="edit-collection-container">
                            <p className="edit-section-title">Collection Items</p>
                            <div className="edit-collection-count flex-col">
                                <p>Number of Items</p>
                                <select value={collectionItemsCount} onChange={onCollectionItemCountChange}>
                                    <option value={2}>2 items</option>
                                    <option value={3}>3 items</option>
                                    <option value={4}>4 items</option>
                                </select>
                            </div>

                            {collectionItems.map((item, index) => (
                                <div className="collection-item" key={index}>
                                    <h3>Item {index + 1}</h3>

                                    {/* Item Image */}
                                    <div className="collection-item-image flex-col">
                                        <p>Item Image</p>
                                        <label htmlFor={`edit-item-image-${index}`}>
                                            <img src={item.imagePreview || assets.upload_img} alt={item.name}/>
                                        </label>

                                        <input id={`edit-item-image-${index}`} type="file" accept="image/*" hidden onChange={(event) =>
                                        onCollectionItemImageChange(index, event)}/>
                                    </div>

                                    {/* Item Name */}
                                    <div className="collection-item-field flex-col">
                                        <p>Item Name</p>
                                        <input type="text" value={item.name} onChange={(event) =>
                                            updateCollectionItem(index, "name", event.target.value)
                                            } required/>
                                    </div>

                                    {/* Item Description */}
                                    <div className="collection-item-field flex-col">
                                        <p>Item Description</p>
                                        <textarea rows="5" value={item.description} onChange={(event) =>
                                            updateCollectionItem( index, "description", event.target.value)
                                        } required/>
                                    </div>

                                    {/* Item Price */}
                                    <div className="collection-item-field flex-col">
                                        <p>Item Price</p>
                                        <input type="number" min="0" step="0.01" value={item.price}
                                        onChange={(event) =>
                                            updateCollectionItem(index, "price", event.target.value)
                                        } required/>
                                    </div>

                                    {/* Item Gender + Season */}
                                    <div className="collection-item-category">
                                        <div className="flex-col">
                                            <p>Item Type</p>
                                            <select value={item.gender} onChange={(event) =>
                                                updateCollectionItem(index, "gender", event.target.value)
                                            }>
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

                    {/* Actions */}
                    <div className="edit-form-actions">
                        <button className='cancel-button' type="button" onClick={onClose} disabled={loading}>Cancel</button>
                        <button className='update-button' type="submit" disabled={loading}>
                            {loading ? "Updating..." : "UPDATE"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProductForm