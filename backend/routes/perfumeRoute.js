import express from "express"
import { addPerfume, listPerfume, removePerfume } from "../controllers/perfumeController.js"
import multer from "multer"

const perfumeRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req, file, cb)=>{
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})


perfumeRouter.post("/add", upload.single("image"), addPerfume)
perfumeRouter.get("/list", listPerfume)
perfumeRouter.post("/remove", removePerfume);



export default perfumeRouter;


