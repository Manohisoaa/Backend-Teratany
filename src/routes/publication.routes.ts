import express from "express";
import { commentPublicatonController, getPublicationController, publishController, reactPublicatonController, sharePublicationController } from "../controllers/publication.controllers";


const router = express.Router();

router.post("/", publishController);
router.post("/share/:publicationId", sharePublicationController);
router.post("/comment/:publicationId", commentPublicatonController);
router.post("/react/:publicationId", reactPublicatonController);
router.get("/:publicationId", getPublicationController);
// router.get("/")

export default router;