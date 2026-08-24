import mongoose from "mongoose";

// علشان نخلي البرفيوم له id واحد لكن لاحجام مختلفه و منكررش المنتج مرتين
const sizeSchema = new mongoose.Schema({
    size: {type: String, enum: ["30ml", "50ml"], required: true},
    price: {type: Number, required: true, min: 0}
}, {_id: false});

const collectionItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    gender:{type: String, enum:["Men", "Women", "Both"], required: true},
    season:{type: String, enum:["-" ,"Summer", "Winter"], default: "-"}
}, { _id: false});


const perfumeSchema = new mongoose.Schema({
    productType: {type:String, enum:["perfume", "collection"], default:"perfume", required:true},
    name: {type:String, required: true},
    description: {type: String, required: true},
    image:{type: String, required: true},
    // size for just perfume not collection(testers)
    sizes:{type: [sizeSchema], default: []},
    collectionItems: {type: [collectionItemSchema], default: [], validate:{
        validator: function (items){
            if (this.productType === "collection") {
                return items.length === 3;
            } return true;
        }, message: "A collection must contain exactly 3 items"
    }},
    gender:{type: String, enum:["Men", "Women", "Both"], required: true},
    season:{type: String, enum:["-" ,"Summer", "Winter"], default:"-"},
    price: {type: Number, default: 0, min: 0}
    }, {timestamps: true});


const perfumeModel = mongoose.models.perfume || mongoose.model("perfume", perfumeSchema);

export default perfumeModel;