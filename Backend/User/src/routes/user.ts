import express, { type Router } from "express"
import { loginUser, verifyUser } from "../controllers/user.js";

const router: Router =express.Router()


router.post("/login",loginUser)
router.post("/verify",verifyUser)
export default router;