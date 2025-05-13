import express from "express";
import { commentPublicatonController, getCommentsController, getPublicationController, publishController, reactCommentController, reactPublicatonController, sharePublicationController } from "../controllers/publication.controllers";


const router = express.Router();

router.post("/", publishController);
router.post("/share/:publicationId", sharePublicationController);
router.post("/comment/:publicationId", commentPublicatonController);
router.post("/react/:publicationId", reactPublicatonController);
router.get("/:publicationId", getPublicationController);
router.get("/comments/:publicationId", getCommentsController);
router.post("/reactComment/:commentId", reactCommentController);
export default router;