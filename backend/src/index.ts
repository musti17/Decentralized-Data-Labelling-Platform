import express from "express";
import userRouter from "./routers/user"
import workerRouter from "./routers/worker"
const app = express();

app.use(express.json());

export const JWT_SECRET = "mustafa1232";
export const WORKER_JWT_SECRET = JWT_SECRET+"worker";

app.use("/v1/user",userRouter);
app.use("/v1/worker",workerRouter);

app.listen(3000);