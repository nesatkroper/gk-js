"use server"

import prisma from "@/lib/prisma";

export async function getTableCount() {
    try {
        const results = await prisma.$queryRaw`
            SELECT * FROM count;
        `;
        
        console.log(results)
        return results;
    } catch (error) {
        return console.log(error);
    
    }
}