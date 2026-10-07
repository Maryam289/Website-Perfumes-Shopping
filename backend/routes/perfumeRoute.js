import express from "express"
import { addPerfume, listPerfume, removePerfume, removePerfumeSize, updatePerfume } from "../controllers/perfumeController.js"
import multer from "multer"

const perfumeRouter = express.Router();

// to save image item in cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// ليه memoryStorage
// لأن الصورة ستكون RAM مؤقتًا


perfumeRouter.post("/add", upload.fields([
    { name: "image", maxCount:1 },
    { name: "itemImage0", maxCount:1 },
    { name: "itemImage1", maxCount:1 },
    { name: "itemImage2", maxCount:1 },
    { name: "itemImage3", maxCount:1 },
]), addPerfume)
perfumeRouter.get("/list", listPerfume)
perfumeRouter.post("/remove", removePerfume);
perfumeRouter.post("/remove-size", removePerfumeSize)
perfumeRouter.put(
    "/update", upload.fields([
        { name: "image", maxCount: 1 },
        { name: "itemImage0", maxCount: 1 },
        { name: "itemImage1", maxCount: 1 },
        { name: "itemImage2", maxCount: 1 },
        { name: "itemImage3", maxCount: 1 },
    ]), updatePerfume);


export default perfumeRouter;


