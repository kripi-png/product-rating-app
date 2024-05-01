import type { Application } from "express";
import * as userController from "../controllers/userController";

export default (app: Application) => {
	app.route("/auth/register").post(userController.register);
}
