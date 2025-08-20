import { Router } from "express";

import multer from "multer";
import {
  contextLoaderByText,
  contextLoaderByFile,
  contextLoaderByWebsite,
  chat,
  deleteContext,
} from "../controllers/ai.controllers.js";


const storage = multer.memoryStorage();

const upload = multer({ storage });



const router = Router();

router.post("/contextLoaderByText",contextLoaderByText);

router.post("/contextLoaderByFile",upload.single("file"),contextLoaderByFile);

router.post("/contextLoaderByWebsite",contextLoaderByWebsite);

router.post("/chat",chat)

router.delete("/deleteContext",deleteContext)



export default router;