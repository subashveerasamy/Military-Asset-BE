import express from 'express';
import { addArmsData, assignArms, expenditure, getAssignedData, getBaseData, returnArm, transfer, updateTransactionFromRequesting } from '../Controllers/BaseData.controller.js';
import authMiddleware from '../Middleware/AuthMiddleware.js';

const router=express.Router();

router.post("/newtransaction", transfer);
router.put("/updatetransactionfromrequesting", authMiddleware(['admin', 'base_commander']), updateTransactionFromRequesting);
router.get("/getbasedata",authMiddleware(['admin', 'base_commander', 'logistics_officer']), getBaseData);
router.post("/assignarms", assignArms);
router.get("/getassigneddata", getAssignedData);
router.put("/expenditure", expenditure);
router.put("/returnarm", returnArm);
router.post("/addarmsdata", addArmsData);

export default router;