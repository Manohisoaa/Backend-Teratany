import express from "express";
import {
  createUserController,
  getAllUsers,
} from "../controllers/userController";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/users", createUserController);

export default router;
