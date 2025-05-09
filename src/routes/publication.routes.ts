import express from "express";
import { commentPublicatonController, publishController, sharePublicationController } from "../controllers/publication.controllers";


const router = express.Router();

router.post("/", publishController);
router.post("/share/:publicationId", sharePublicationController);
router.post("/comment/:publicationId", commentPublicatonController);

export default router;