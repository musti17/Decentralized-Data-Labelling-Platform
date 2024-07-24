import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "..";
import { authMiddleware } from "../middleware";
import { createTaskInput } from "../types";

const router = Router();

const prismaClient = new PrismaClient();

const DEFAULT_TITLE = "Select the number of cats";
//signin with a wallet
//signing a message
router.post("/signin", async(req,res) =>{
    //ToDo: Add sign verification logic here
    const hardcodedWalletAddress = "0xD4554f629Ea76254C0b566D9F0C1753EDd6C8E27";

    const existingUser = await prismaClient.user.findFirst({
        where:{
            address:hardcodedWalletAddress
        }
    })

    if(existingUser){
        const token = jwt.sign({
            userId:existingUser.id
        },JWT_SECRET)

        res.json({
            token
        })
    }
    //means user not exists and we have to create new user
    else{
        const newUser = await prismaClient.user.create({
            data:{
                address:hardcodedWalletAddress
            }
        })

        const token = jwt.sign({
            userId:newUser.id
        },JWT_SECRET)

        res.json({
            token
        })
    } 
});


router.post("/task",authMiddleware,async (req,res) => {
    //@ts-ignore
    const userId = req.userId;
    //validate the inputs from the user
    const body = req.body;
    
    const parseData = createTaskInput.safeParse(body);

    if(!parseData.success){
        return res.status(411).json({
            message:"You've sent the wrong inputs"
        })
    }

    //parse the signature here to ensure the person has paid $50 or smth
    let response = await prismaClient.$transaction(async tx => {
        const response = await tx.task.create({
            data: {
                title:parseData.data.title ?? DEFAULT_TITLE,
                amount:"1",
                signature:parseData.data.signature,
                user_id:userId
            }
        })

        await tx.option.createMany({
            data: parseData.data.options.map(x => ({
                image_url : x.imageUrl,
                task_id : response.id
            }))
        })

        return response;
    })

    res.json({
        id: response.id
    })

})

export default router;