import { UserController } from "./controllers/UserControler";
import { Router } from "express";
import { SurveysController } from "./controllers/SurveysController";

const router = Router();
const usersController = new UserController();
const surveysController = new SurveysController();

router.post("/users", usersController.create);

router.post("/surveys", surveysController.create);
router.get("/surveys", surveysController.show);

export { router };
