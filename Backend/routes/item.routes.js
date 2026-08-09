import express from "express";
import { addItem, editItem, getItemById, deleteItem, getItemByCity, getItemsByShop, searchItems, rating } from "../controllers/item.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/", isAuth, upload.single('image'), addItem);
router.put("/:itemId", isAuth, upload.single('image'), editItem);
router.get("/city/:city", getItemByCity);
router.get("/get-by-city/:city", getItemByCity);
router.get("/shop/:shopId", getItemsByShop);
router.get("/search", searchItems);
router.post("/rating", rating);
router.get("/delete/:itemId", isAuth, deleteItem);
router.delete("/delete/:itemId", isAuth, deleteItem);
router.delete("/:itemId", isAuth, deleteItem);
router.get("/:itemId", getItemById);

export default router;
