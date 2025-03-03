import { Router } from "express";
import { generateAttendance,registerClass} from "../controllers/class.controllers.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
router.post("/create-class", registerClass );
router.post("/generate-attendance", generateAttendance);

export default router;
