import express, { type Router } from "express"
import { loginUser } from "../controllers/user.js";

const router: Router =express.Router()


router.post("/login",loginUser)
export default router;