import express from "express";
import {
  createUserController,
  getAllUsers,
  signInController,
  updateProfileController,
  updatePictureController,
  getCurrentUserController,
  searchUsersController,
  getOneUserController,
  getUserFollowersController,
  getUserFollowingController,
  followUserController,
} from "../controllers/user.controllers";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/search", searchUsersController);
router.post("/auth/signup", createUserController);
router.post("/auth/signin", signInController);
router.put("/user/profile", updateProfileController);
router.put("/user/image", updatePictureController);
router.get("/user/current", getCurrentUserController);
router.get("/user/:id/followers", getUserFollowersController);
router.get("/user/:id/following", getUserFollowingController);
router.post("/user/:id/follow", followUserController);
router.get("/user/:id", getOneUserController);
export default router;
