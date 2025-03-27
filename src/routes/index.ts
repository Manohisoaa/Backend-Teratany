import express from "express";
import {
  createUserController,
  getAllUsers,
  signInController,
  updateBioController,
} from "../controllers/userController";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/auth/signup", createUserController);
router.post("/auth/signin", signInController);
router.put("/user/bio", updateBioController);
export default router;
