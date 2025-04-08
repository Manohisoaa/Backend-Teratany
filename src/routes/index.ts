import express from "express";
import {
  createUserController,
  getAllUsers,
  signInController,
  updateProfileController,
  updatePictureController,
  getCurrentUserController,
} from "../controllers/userController";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/auth/signup", createUserController);
router.post("/auth/signin", signInController);
router.put("/user/profile", updateProfileController);
router.put("/user/image", updatePictureController);
router.get("/user/current", getCurrentUserController);
export default router;
