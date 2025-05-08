import express from "express";
import { publishController, sharePublicationController } from "../controllers/publication.controllers";


const router = express.Router();

router.post("/", publishController);
router.post("/share/:publicationId", sharePublicationController);

export default router;
