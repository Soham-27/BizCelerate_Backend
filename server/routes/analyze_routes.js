import { Router } from "express";
import { isAuthenticated } from "../controllers/business_controller";
import { getAnalysis } from "../controllers/analyze_controller";
const AnalyzeRouter=Router();

AnalyzeRouter.get("/analyz",isAuthenticated,getAnalysis)

export default AnalyzeRouter