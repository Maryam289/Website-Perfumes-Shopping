import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    cartData:{type:Object, default:{}}  // {"perfimeID_30ml": 2, "perfimeID_50ml": 1, "collection": 3, .....}
}, {minimize:false})


const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;