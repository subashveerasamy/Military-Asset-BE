import express from 'express'
import { getUserDetails, updateUserInfo, updateUserInfoByAdmin, userLogin, userRegister } from '../Controllers/Users.controller.js';
import authMiddleware from '../Middleware/AuthMiddleware.js'
const router= express.Router();

router.post("/newuser", userRegister);
router.post("/userlogin", userLogin);
router.put("/updateuser", updateUserInfo);
router.put("/updateuserbyadmin", authMiddleware(['admin']), updateUserInfoByAdmin)
router.get("/getuser",authMiddleware(['admin', 'base_commander', 'logistics_officer']), getUserDetails);
export default router;