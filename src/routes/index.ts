import express from "express";
import {
  createUserController,
  getAllUsers,
  signInController,
} from "../controllers/userController";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/auth/signup", createUserController);
router.post("/auth/signin", signInController);

export default router;
