import mongoose from "mongoose";

 export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://maryammagdy289_db_user:HRfVZ3IC4VuVzcRq@cluster0.rtrhmme.mongodb.net/perfume-shopping').then(()=>console.log("DB Connected"));

}