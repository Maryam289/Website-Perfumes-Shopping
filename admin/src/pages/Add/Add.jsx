import './Add.css'
import axios from "axios"
import { toast } from 'react-toastify'
import ProductForm from '../../components/ProductForm/ProductForm'


const Add = ({url}) => {

  const handleAdd = async (formData) => {
    try {
      if (formData.productType === "perfume") {
        return await submitPerfume(formData);
      }
      if (formData.productType === "collection") {
        return await submitCollection(formData);
      }
      return false;

    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );
      return false
    }
  };

  // submit normal perfume
  const submitPerfume = async({ data, image, sizes }) => {
    const formData = new FormData();
    formData.append("productType", "perfume")
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("sizes", JSON.stringify(sizes))
    formData.append("image", image)
    formData.append("gender", data.gender)
    formData.append("season", data.season)
    const response = await axios.post(`${url}/api/perfume/add`, formData)
    if (response.data.success) {
      toast.success(response.data.message)
      return true
    }
    else{
      toast.error(response.data.message)
      return false
    }
  }


  // Submit collection
  const submitCollection = async ({ data, image, collectionItems }) => {
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
      toast.success(response.data.message)
      return true
    } 
    toast.error(response.data.message)
    return false
  }

  return (
    <ProductForm
      onSubmit={handleAdd}
    />
  )
}

export default Add
