import express from "express";
import { addItem, editItem, getItemById, deleteItem, getItemByCity, getItemsByShop, searchItems, rating } from "../controllers/item.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/", isAuth, upload.single('image'), addItem);
router.put("/:itemId", isAuth, upload.single('image'), editItem);
router.get("/:itemId", getItemById);
router.delete("/:itemId", isAuth, deleteItem);
router.get("/city/:city", getItemByCity);
router.get("/shop/:shopId", getItemsByShop);
router.get("/search", searchItems);
router.post("/rating", rating);

export default router;
