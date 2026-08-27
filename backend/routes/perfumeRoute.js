import express from "express"
import { addPerfume, listPerfume, removePerfume, removePerfumeSize } from "../controllers/perfumeController.js"
import multer from "multer"

const perfumeRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req, file, cb)=>{
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({storage});


perfumeRouter.post("/add", upload.fields([
    { name: "image", maxCount:1 },
    { name: "itemImage0", maxCount:1 },
    { name: "itemImage1", maxCount:1 },
    { name: "itemImage2", maxCount:1 },
]), addPerfume)
perfumeRouter.get("/list", listPerfume)
perfumeRouter.post("/remove", removePerfume);
perfumeRouter.post("/remove-size", removePerfumeSize)



export default perfumeRouter;


