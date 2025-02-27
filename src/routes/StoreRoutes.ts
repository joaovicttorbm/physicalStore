import { Router } from "express";
import { StoreController } from "../controllers/StoreController.js";
import StoreMiddleware from "../middleware/StoreMiddleware.js";


const router = Router();
const storeController = new StoreController();

router.post("/stores", StoreMiddleware.validateAddress , storeController.createStore);
router.get("/stores/:cep", storeController.findStores);

export default router;
