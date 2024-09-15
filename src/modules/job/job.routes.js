import { Router } from "express";
import * as JC  from "./job.controller.js"
import {auth, authRoles} from "../../middleware/auth.js"
const router = Router()
router.post("/addJob",auth(),authRoles("Company_HR"),JC.addJob)
router.put("/updateJob/:jobId",auth(),authRoles("Company_HR"),JC.updateJob)
router.delete("/deleteJob/:jobId",auth(),authRoles("Company_HR"),JC.deleteJob)
router.get("/companyJob", auth(), authRoles("Company_HR","User"), JC.getJobByCompany);
router.get("/filterJob",auth(), authRoles("Company_HR","User"), JC.filterJob)
router.post("/jobs/:jobId/apply", auth, authRoles("User"), JC.applyToJob);

export default router