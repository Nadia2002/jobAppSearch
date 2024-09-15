import { Router } from "express";
import * as UC from "./user.controller.js"
import {auth} from "../../middleware/auth.js"
const router = Router()
router.post("/signUp",UC.signUp)
router.get("/verifyEmail/:token",UC.verifyEmail)
router.get("/refreshToken/:rfToken",UC.refreshToken)
router.post("/signIn",UC.signIn)
router.patch("/update",auth(),UC.updateAccount)
router.delete("/delete",auth(),UC.deleteAccount)
router.get("/getData",auth(),UC.getData)
router.get("/getDataById/:id",UC.getDataById)
router.patch("/upDatePassword/:id",UC.updatePassword)
router.post("/forgetPassword",UC.forgetPassword)
router.post("/resetPassword",UC.resetPassword)
router.post("/recoveryEmail",UC.getAccountsByEmail)

export default router