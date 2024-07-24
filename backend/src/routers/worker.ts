import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { WORKER_JWT_SECRET } from "..";
import { workerMiddleware } from "../middleware";
import jwt from "jsonwebtoken";

const router = Router();

const prismaClient = new PrismaClient();


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