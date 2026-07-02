import perfumeModel from "../models/perfumeModel.js";

import fs from 'fs'


// add perfume items

const addPerfume = async (req, res) => {
    // console.log(req.file);
    // console.log(req.files);
    // console.log(req.body);
    let image_filename = `${req.file.filename}`;

    const perfume = new perfumeModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        image:image_filename,
        size:req.body.size
    })

    try {
        await perfume.save();
        res.json({success:true, message:"Perfume Added"})
    } catch(error){
        console.log(error)
        res.json({success:false, message:"Error"})
    }

}


// all perfume list
const listPerfume = async (req, res) => {
    try{
        const perfumes = await perfumeModel.find({});
        res.json({success:true, data:perfumes})
    }catch (error){
        console.log(error);
        res.json({success:false, message:"Error"})
    }
}

// remove perfume item
const removePerfume = async(req, res) => {
    try{
        const perfume = await perfumeModel.findById(req.body.id);
        fs.unlink(`uploads/${perfume.image}`, ()=>{})

        await perfumeModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Perfume Removed"})
    } catch (error){
        console.log(error);
        res.json({success:false, message:"Error"})
    }
}

export{addPerfume, listPerfume, removePerfume}