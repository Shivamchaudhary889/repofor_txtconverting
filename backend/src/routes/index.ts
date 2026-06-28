import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dataRouter from "./data";
import aiRouter from "./ai";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dataRouter);
router.use("/ai", aiRouter);

export default router;
