import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studyLessonsRouter from "./study-lessons";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studyLessonsRouter);

export default router;
