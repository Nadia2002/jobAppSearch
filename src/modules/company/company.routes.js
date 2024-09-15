import { Router } from "express";
import * as CC  from "./company.controller.js"
import {auth, authRoles} from "../../middleware/auth.js"
const router = Router()
router.post("/addCompany",auth(),authRoles("Company_HR"),CC.addCompany)
router.patch("/updateCompany/:companyId", auth(), authRoles("Company_HR"), CC.updateCompany)
router.delete("/deleteCompany/:companyId",auth(),authRoles("Company_HR"),CC.deleteCompany)
router.get("/getCompany/:companyId",auth(),authRoles("Company_HR"),CC.getCompany)
router.get("/searchCompany",auth(),authRoles("Company_HR", "User"), CC.searchCompanyByName);

export default router