import express from "express";
import { createEditShop, getMyShop, getShopByCity } from "../controllers/shop.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/", isAuth, upload.single('image'), createEditShop);
router.get("/my-shop", isAuth, getMyShop);
router.get("/city/:city", getShopByCity);

export default router;
