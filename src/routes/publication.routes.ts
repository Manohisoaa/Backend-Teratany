import express from "express";
import {
  commentPublicatonController,
  getAllPublicationsController,
  getCommentsController,
  getFollowingPublicatonsController,
  getPublicationController,
  getReactsCommentController,
  getReactsPublicationController,
  getUserPublicatonsController,
  publishController,
  reactCommentController,
  reactPublicatonController,
  sharePublicationController,
} from "../controllers/publication.controllers";

const router = express.Router();

router.post("/", publishController);
router.post("/share/:publicationId", sharePublicationController);
router.post("/comment/:publicationId", commentPublicatonController);
router.post("/react/:publicationId", reactPublicatonController);
router.get("/comments/:publicationId", getCommentsController);
router.post("/reactComment/:commentId", reactCommentController);
router.get("/user/:userId", getUserPublicatonsController);
router.get("/publications", getAllPublicationsController);
router.get("/:publicationId", getPublicationController);
router.get("/reacts/:publicationId", getReactsPublicationController);
router.get("/reactsComment/:commentId", getReactsCommentController);
router.get("/publications/following", getFollowingPublicatonsController);
export default router;
