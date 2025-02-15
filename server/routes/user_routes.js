import { Router } from "express";
import { isAuthenticated } from "../controllers/business_controller.js";
import { addUser, getUsersByBusiness, recommandLoyaltyPrograms } from "../controllers/user_controller.js";

const userRouter=Router();

userRouter.post("/adduser",isAuthenticated,addUser);
userRouter.get("/all",isAuthenticated,getUsersByBusiness);
userRouter.get("/loyalty",isAuthenticated,recommandLoyaltyPrograms);
export default userRouter;