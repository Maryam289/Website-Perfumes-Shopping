import perfumeModel from "../models/perfumeModel.js";
import path from "path";

import fs from 'fs'


const deleteFile = (filename) => {
    if (!filename) {
        return;
    }

    const filePath = path.join("uploads", filename);
    fs.unlink(filePath, (error) => {
        if (error) {
            console.log("Could not delete file: ", error.message);
        }
    });
};

// add perfume items

const addPerfume = async (req, res) => {
    // console.log(req.file);
    // console.log(req.files);
    // console.log(req.body);
    // let image_filename = `${req.file.filename}`;

    try {
        const{
            productType,
            name,
            description,
            gender,
            season
        } = req.body;
        const mainImage = req.files?.image?.[0]?.filename;
        if (!mainImage) {
            return res.json({success: false, message: "Main image is required"});
        }

        if (productType === "perfume") {
            let sizes;
            try {
                sizes = JSON.parse(req.body.sizes || "[]");
            } catch (error) {
                return res.json({success: false, message: "Invalid sizes data"});
            }
            if (sizes.length === 0) {
                return res.json({success: false, message: "Please add at least one size"});
            }
            const perfume = new perfumeModel({
                productType:"perfume",
                name,
                description,
                image: mainImage,
                gender,
                season,
                sizes
            });
            await perfume.save();
            return res.json({success: true, message: "Perfume Added"});
        }

        if (productType === "collection") {
            let collectionItemsData;
            try {
                collectionItemsData = JSON.parse(req.body.collectionItems || "[]");
            } catch (error) {
                return res.json({success: false, message: "Invalid collection items data"})
            }
            if (!Array.isArray(collectionItemsData) || collectionItemsData.length !== 3) {
                return res.json({success: false, message:"Collection must contain exactly 3 items"});
            }
            const collectionItems = collectionItemsData.map((item, index) => {
                const imageField = `itemImage${index}`;
                const itemImage = req.files?.[imageField]?.[0]?.filename;
                return {
                    name: item.name,
                    description: item.description,
                    image: itemImage,
                    price: Number(item.price),
                    gender: item.gender,
                    season: item.season
                };
            });

            const missingImage =  collectionItems.some((item) => !item.image);
            if (missingImage) {
                return res.json({success: false, message: "All collection item images are required"});
            }

            const invalidPrice = collectionItems.some((item) => !Number.isFinite(item.price) || item.price <= 0);
            if (invalidPrice) {
                return res.json({success: false, message: "All collection item prices must be valid"})
            }

            const totalPrice = collectionItems.reduce((total, item) => total + item.price, 0);

            const collection = new perfumeModel({
                productType: "collection",
                name,
                description,
                image: mainImage,
                gender,
                season,
                collectionItems,
                price: totalPrice
            });
            await collection.save();
            
            return res.json({success: true, message: "Collection Added"});
        }
        return res.json({success: false, message:"Invalid product type"});
    } catch (error) {
        console.log("ADD PRODUCT ERROR");
        res.json({success: false, message: error.message || "Error while adding product"});
    }


    // old code
    // const perfume = new perfumeModel({
    //     name:req.body.name,
    //     description:req.body.description,
    //     price:req.body.price,
    //     image:image_filename,
    //     size:req.body.size,
    //     gender:req.body.gender,
    //     season:req.body.season
    // })

    // try {
    //     await perfume.save();
    //     res.json({success:true, message:"Perfume Added"})
    // } catch(error){
    //     console.log(error)
    //     res.json({success:false, message:"Error"})
    // }

};


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
        if (!perfume) {
            return res.json({success:false, message:"Product not found"});
        }
        deleteFile(perfume.image);

        if (perfume.productType === "collection" && perfume.collectionItems) {
            perfume.collectionItems.forEach((item) => {
                deleteFile(item.image);
            })
        }

        await perfumeModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Perfume Removed"})
        // fs.unlink(`uploads/${perfume.image}`, ()=>{})
    } catch (error){
        console.log(error);
        res.json({success:false, message:"Error"})
    }
}

const removePerfumeSize = async (req, res) => {
    try {
        const { id, size } = req.body;
        const product = await perfumeModel.findById(id);

        if (!product) {
            return res.json({success: false, message: "Product not found"});
        }

        if (product.productType !== "perfume") {
            return res.json({success: false, message: "Sizes can only be removed from perfumes" });
        }

        const sizeExists = product.sizes.some(
            (sizeItem) => sizeItem.size === size
        );

        if (!sizeExists) {
            return res.json({success: false, message: "Size not found"});
        }

        if (product.sizes.length === 1) {
        return res.json({success: false, message: "Cannot remove the last size. Delete the product instead."});
        }

        product.sizes = product.sizes.filter(
            (sizeItem) => sizeItem.size !== size
        );

        await product.save();
        res.json({success: true, message: `${size} removed successfully`});

    } catch (error) {
        console.log(error);

        res.json({success: false, message: "Error removing size"});
    }
};

export{addPerfume, listPerfume, removePerfume, removePerfumeSize}