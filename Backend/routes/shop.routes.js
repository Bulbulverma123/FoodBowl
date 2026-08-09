import express from "express";
import { createEditShop, getMyShop, getShopByCity } from "../controllers/shop.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/", isAuth, upload.single('image'), createEditShop);
router.get("/my-shop", isAuth, getMyShop);
router.get("/get-my", isAuth, getMyShop);
router.get("/city/:city", getShopByCity);
router.get("/get-by-city/:city", getShopByCity);

export default router;
