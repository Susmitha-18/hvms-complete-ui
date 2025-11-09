import express from "express";
import { loginWorker, getAssignments, getSalary } from "../controllers/workerController.js";

const router = express.Router();

router.post("/login", loginWorker);
router.get("/assignments", getAssignments);
router.get("/salary", getSalary);

export default router;
