import { NextFunction,Request,Response } from "express";
import { JWT_SECRET } from ".";
import { WORKER_JWT_SECRET } from ".";
import jwt from "jsonwebtoken"

export function authMiddleware(req:Request,res:Response,next:NextFunction){
    const authHeader = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(authHeader,JWT_SECRET);
        
        //@ts-ignore
        if(decoded.userId){
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else{
            return res.status(403).json({
                message:"You are not logged in"
            })
        }
    } catch (error) {
        return res.status(403).json({
            message:"You are not logged in"
        })
    }
}

export function workerMiddleware(req:Request,res:Response,next:NextFunction){
    const authHeader = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(authHeader,WORKER_JWT_SECRET);
        
        //@ts-ignore
        if(decoded.userId){
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else{
            return res.status(403).json({
                message:"You are not logged in"
            })
        }
    } catch (error) {
        return res.status(403).json({
            message:"You are not logged in"
        })
    }
}