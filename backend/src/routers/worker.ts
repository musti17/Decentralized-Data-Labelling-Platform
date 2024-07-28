import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { WORKER_JWT_SECRET } from "..";
import { workerMiddleware } from "../middleware";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { TOTAL_DECIMALS } from "../config";
import jwt from "jsonwebtoken";

const router = Router();

const prismaClient = new PrismaClient();

const TOTAL_SUBMISSIONS = 100;

router.get("/balance",workerMiddleware,async(req,res) =>{
    //@ts-ignore
    const userId:string = req.userId;

    const worker = await prismaClient.worker.findFirst({
        where:{
            id:Number(userId)
        }
    })

    res.json({
        pending_amount:worker?.pending_amount,
        locked_amount:worker?.locked_amount
    })

})

router.post("/submission",workerMiddleware,async(req,res) => { 
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = createSubmissionInput.safeParse(body);    

    if(parsedBody.success){
        const task = await getNextTask(Number(userId));
        if(!task || task?.id !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id"
            })
        }

        const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();

       const submission = await prismaClient.$transaction(async tx => {
        const submission = await tx.submission.create({
            data:{
                option_id:Number(parsedBody.data.selection),
                worker_id:userId,
                task_id:Number(parsedBody.data.taskId),
                amount: Number(amount)
            }
        })

        await tx.worker.update({
            where:{
                id:userId
            },
            data:{
                pending_amount:{
                    increment:Number(amount)
                }
            }
        })

        return submission;
       })

        const nextTask = await getNextTask(Number(userId));
        res.json({
            nextTask,
            amount
        })
    }
    else{
        res.status(411).json({
            message:"Incorrect inputs"
        })
    }
})

router.get("/nextTask",workerMiddleware,async(req,res) => {
    //@ts-ignore
    const userId: string = req.userId;

    const task = await getNextTask(Number(userId));

    if(!task){
        res.status(411).json({
            message:"No more tasks left gor you to review"
        })
    }else{
        res.json({
            task
        })
    }
})

// JWT FOR WORKET = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyMTgyNDQ0NH0.ZQ8r0pobvMgvzPc9LxhFVeOcDJdKCw9_oLTlNg2O2so
router.post("/signin",async (req,res) =>{
    //ToDo: Add sign verification logic here
    const hardcodedWalletAddress = "0xD4554f629Ea76254C0b566D9F0C1753EDd6C8F10";

    const existingUser = await prismaClient.worker.findFirst({
        where:{
            address:hardcodedWalletAddress
        }
    })

    if(existingUser){
        const token = jwt.sign({
            userId:existingUser.id
        },WORKER_JWT_SECRET)

        res.json({
            token
        })
    }
    //means user not exists and we have to create new user
    else{
        const newUser = await prismaClient.worker.create({
            data:{
                address:hardcodedWalletAddress,
                pending_amount:0,
                locked_amount:0
            }
        })

        const token = jwt.sign({
            userId:newUser.id
        },WORKER_JWT_SECRET)

        res.json({
            token
        })
    } 
});

export default router;