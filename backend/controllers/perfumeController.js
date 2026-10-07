import perfumeModel from "../models/perfumeModel.js";
import cloudinary from "../cloudinary.js";


const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                type: "upload"
            },
            (error, result) => {
                if (error) {
                    return reject(error)
                }
                if (!result?.secure_url || !result?.public_id) {
                    return reject(
                        new Error("Cloudinary upload completed without a valid URL or public_id")
                    )
                }
                resolve(result)
            }
        )
        uploadStream.end(fileBuffer)
    })
}

const verifyCloudinaryImage = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: "image",
            type: "upload"
        });
        return result;
    } catch (error) {
        throw new Error(`Cloudinary image verification failed: ${error.message}`)
    }
}

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            type: "upload",
            invalidate: true
        })
        console.log("CLOUDINARY DELETE RESULT:", result);
        return result;
        
    } catch (error) {
        console.log("Could not delete image from Cloudinary: ", error.message);
    }
}

// add perfume items
const addPerfume = async (req, res) => {
    try {
        const{
            productType,
            name,
            description,
            gender,
            season
        } = req.body;
        const mainImageFile = req.files?.image?.[0];
        if (!mainImageFile) {
            return res.json({success: false, message: "Main image is required"});
        }

        const mainImageResult = await uploadToCloudinary(mainImageFile.buffer, "perfume-shop/products");
        const mainImage = {
            url : mainImageResult.secure_url,
            public_id : mainImageResult.public_id
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
            if (!Array.isArray(collectionItemsData) || collectionItemsData.length < 2 || collectionItemsData.length > 4) {
                return res.json({success: false, message:"Collection must contain between 2 and 4 items"});
            }

            const collectionItems =[];
            for (let index = 0; index < collectionItemsData.length; index++) {
                const item = collectionItemsData[index];
                const imageField = `itemImage${index}`;
                const imageFile = req.files?.[imageField]?.[0];
                
                if (!imageFile) {
                    return res.json({success: false, message: `Image for collection item ${index + 1} are required`});
                }

                const imageResult = await uploadToCloudinary(
                    imageFile.buffer, "perfume-shop/collections"
                )

                const verifiedImage = await verifyCloudinaryImage(
                    imageResult.public_id
                );

                collectionItems.push({
                    name: item.name,
                    description: item.description,
                    image: {
                        url: verifiedImage.secure_url,
                        public_id: verifiedImage.public_id
                    },
                    price: Number(item.price),
                    gender: item.gender,
                    season: item.season
                });
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
        // Delete main image from Cloudinary
        if (perfume.image?.public_id) {
            await deleteFromCloudinary(perfume.image.public_id)
        }
        
        // Delete collection item images from Cloudinary
        if (perfume.productType === "collection" && perfume.collectionItems) {
            for (const item of perfume.collectionItems) {
                if (item.image?.public_id) {
                    await deleteFromCloudinary(item.image.public_id)
                }
            }
        }

        // Delete product from MongoDB
        await perfumeModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Perfume Removed"})
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

const updatePerfume = async (req, res) => {
    try {
        const { id, productType, name, description, gender, season } = req.body;

        // Find existing product
        const product = await perfumeModel.findById(id);

        if (!product) {
            return res.json({success: false, message: "Product not found"});
        }

        // Make sure product type cannot be changed
        if (product.productType !== productType) {
            return res.json({success: false, message: "Product type cannot be changed"});
        }

        // Update common product data
        product.name = name;
        product.description = description;
        product.gender = gender;
        product.season = season;

        // Keep old main image unless a new one is uploaded
        let oldMainImagePublicId = null;

        const mainImageFile = req.files?.image?.[0];

        if (mainImageFile) {

            // Save the OLD public_id as a string BEFORE changing product.image
            oldMainImagePublicId = product.image?.public_id;
            
            const newImageResult = await uploadToCloudinary(mainImageFile.buffer, "perfume-shop/products");

            const verifiedImage = await verifyCloudinaryImage (newImageResult.public_id)

            product.image = {url: verifiedImage.secure_url, public_id: verifiedImage.public_id};
        }

        // UPDATE NORMAL PERFUME
        if (productType === "perfume") {
            let sizes;
            try {
                sizes = JSON.parse(req.body.sizes || "[]");
            } catch (error) {
                return res.json({success: false, message: "Invalid sizes data"});
            }

            if (!Array.isArray(sizes) || sizes.length === 0) {
                return res.json({success: false, message: "Please add at least one size"});
            }

            // Validate sizes
            const validSizes = ["30ml", "50ml"];

            const invalidSize = sizes.some((item) =>
                !validSizes.includes(item.size) ||
                !Number.isFinite(Number(item.price)) ||
                Number(item.price) <= 0
            );

            if (invalidSize) {
                return res.json({success: false, message: "Invalid size or price"});
            }

            // Prevent duplicate sizes
            const sizeNames = sizes.map((item) => item.size);
            const hasDuplicateSizes = new Set(sizeNames).size !== sizeNames.length;

            if (hasDuplicateSizes) {
                return res.json({success: false, message: "Duplicate sizes are not allowed"});
            }

            product.sizes = sizes.map((item) => ({size: item.size, price: Number(item.price)   
            }));

            // Perfume does not use collection items
            product.collectionItems = [];
            product.price = 0;

            await product.save();

            console.log("PRODUCT SAVED TO MONGODB:", {id: product._id, image: product.image});

            // Delete old main image only after successful DB update
            if (oldMainImagePublicId) {
                await deleteFromCloudinary(oldMainImagePublicId);
            }

            return res.json({success: true, message: "Perfume updated successfully", data: product});
        }

        // UPDATE COLLECTION
        if (productType === "collection") {
            let collectionItemsData;
            try {
                collectionItemsData = JSON.parse(req.body.collectionItems || "[]");
            } catch (error) {
                return res.json({success: false, message: "Invalid collection items data"});
            }

            // Collection must contain 2-4 items
            if (!Array.isArray(collectionItemsData) ||
                collectionItemsData.length < 2 ||
                collectionItemsData.length > 4
            ) {
                return res.json({success: false, message: "Collection must contain between 2 and 4 items"});
            }

            const oldCollectionItems = product.collectionItems || [];

            const newCollectionItems = [];
            const oldImagesToDelete = [];

            // Process every collection item
            for (let index = 0; index < collectionItemsData.length; index++) {
                const item = collectionItemsData[index];
                if (!item.name?.trim() || !item.description?.trim()) {
                    return res.json({success: false, message: `Please complete collection item ${index + 1}`});
                }

                const price = Number(item.price);
                if (!Number.isFinite(price) || price <= 0) {
                    return res.json({success: false, message: `Invalid price for collection item ${index + 1}`});
                }

                const imageField = `itemImage${index}`;
                const newImageFile = req.files?.[imageField]?.[0];

                let image;

                // New image uploaded
                if (newImageFile) {
                    const imageResult = await uploadToCloudinary(newImageFile.buffer, "perfume-shop/collections");
                    image = {
                        url: imageResult.secure_url,
                        public_id: imageResult.public_id
                    };

                    // Existing item at this index
                    const oldItem = oldCollectionItems[index];

                    if (oldItem?.image?.public_id) {
                        oldImagesToDelete.push(oldItem.image.public_id);
                    }
                }

                // No new image -> keep old image
                else if (item.image?.url && item.image?.public_id) {
                    image = {
                        url: item.image.url,
                        public_id: item.image.public_id
                    };

                }

                // No image at all
                else {
                    return res.json({success: false, message: `Image for collection item ${index + 1} is required`
                    });

                }

                newCollectionItems.push({
                    name: item.name,
                    description: item.description,
                    image,
                    price,
                    gender: item.gender,
                    season: item.season || "-"
                });
            }

            // Delete images of removed items
            if (oldCollectionItems.length > newCollectionItems.length) {
                for (let index = newCollectionItems.length; index < oldCollectionItems.length; index++) {
                    const oldItem = oldCollectionItems[index];
                    if (oldItem?.image?.public_id) {
                        oldImagesToDelete.push(oldItem.image.public_id);
                    }
                }
            }

            // Update collection
            product.collectionItems = newCollectionItems;

            // Calculate total collection price
            product.price = newCollectionItems.reduce((total, item) => total + item.price, 0);

            // Collection does not use perfume sizes
            product.sizes = [];
            await product.save();

            // Delete old Cloudinary images
            for (const publicId of oldImagesToDelete) {
                await deleteFromCloudinary(publicId);
            }

            // Delete old main image if replaced
            if (oldMainImagePublicId) {
                await deleteFromCloudinary(oldMainImagePublicId);
            }

            return res.json({success: true, message: "Collection updated successfully", data: product});
        }

        return res.json({success: false, message: "Invalid product type"});

    } catch (error) {

        return res.json({success: false, message: error.message || "Error while updating product"});
    }
};

export{addPerfume, listPerfume, removePerfume, removePerfumeSize, updatePerfume}