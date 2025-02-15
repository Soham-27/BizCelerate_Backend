import { Router } from "express";
import { registerBusiness,isAuthenticated, updateBusinessOffers, updateBusinessProfile, loginBusiness, generateContent} from "../controllers/business_controller.js";


const businessRouter=Router();
businessRouter.post("/register",registerBusiness)
businessRouter.get('/dashboard', isAuthenticated, (req, res) => {
    res.json(req.business);
});
businessRouter.post("/login",loginBusiness)
businessRouter.post("/generate-content",)
businessRouter.put('/update-profile', isAuthenticated,updateBusinessProfile);
businessRouter.post("/generate_content",isAuthenticated,generateContent)
export default businessRouter;