import { PrismaClient } from '@prisma/client';

export const getAnalysis=async(req ,res)=>{
    try {
        const sector=req.business.sector;
        console.log(sector);
    } catch (error) {
        console.log(error)
    }
}