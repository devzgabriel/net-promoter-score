import { UserController } from "./controllers/UserControler";
import { Router } from "express";

const router = Router();
const userController = new UserController();
router.post("/users", userController.create);

export { router };
