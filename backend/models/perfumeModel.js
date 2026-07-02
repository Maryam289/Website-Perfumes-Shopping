import mongoose from "mongoose";

const perfumeSchema = new mongoose.Schema({
    name: {type:String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image:{type: String, required: true},
    size:{type: String, required: true}

})


const perfumeModel = mongoose.models.perfume || mongoose.model("perfume", perfumeSchema);

export default perfumeModel;