import { Router } from "express";
import { verifyStatement } from "../controllers/financeCOntroller.js";
import multer from "multer";
import fs from "fs";

const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.memoryStorage();

const upload = multer({ storage });

const router = Router();

router.post("/", upload.array("files", 10), verifyStatement);

export default router;
