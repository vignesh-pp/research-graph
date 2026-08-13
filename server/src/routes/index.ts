import { Router } from "express";
import { dashboardRouter } from "./dashboard.routes.js";
import { paperRouter } from "./paper.routes.js";
import { researcherRouter } from "./researcher.routes.js";
import { topicRouter } from "./topic.routes.js";
import { institutionRouter } from "./institution.routes.js";
import { methodRouter } from "./method.routes.js";
import { datasetRouter } from "./dataset.routes.js";
import { graphRouter } from "./graph.routes.js";
import { searchRouter } from "./search.routes.js";
import { healthRouter } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/papers", paperRouter);
apiRouter.use("/researchers", researcherRouter);
apiRouter.use("/topics", topicRouter);
apiRouter.use("/institutions", institutionRouter);
apiRouter.use("/methods", methodRouter);
apiRouter.use("/datasets", datasetRouter);
apiRouter.use("/graph", graphRouter);
apiRouter.use("/search", searchRouter);
