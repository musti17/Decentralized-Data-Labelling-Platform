import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = "mustafa1232";

const prismaClient = new PrismaClient();

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

export default router;