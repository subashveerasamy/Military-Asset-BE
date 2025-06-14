import express from 'express'
import { getUserDetails, otpGenerator, updatePassword, updateUserInfo, updateUserInfoByAdmin, userLogin, userRegister, validateOtp } from '../Controllers/Users.controller.js';
import authMiddleware from '../Middleware/AuthMiddleware.js'
const router= express.Router();

router.post("/newuser", userRegister);
router.post("/userlogin", userLogin);
router.put("/updateuser", updateUserInfo);
router.put("/updateuserbyadmin", authMiddleware(['admin']), updateUserInfoByAdmin)
router.get("/getuser",authMiddleware(['admin', 'base_commander', 'logistics_officer']), getUserDetails);
router.post("/otp", otpGenerator);
router.post("/otpverify", validateOtp);
router.put("/resetpassword", updatePassword);
export default router;