import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const addUser = async (req, res) => {
    try {
        // Extract business ID from authenticated request
        const businessId = req.business.id; // Assuming middleware attaches `req.business`

        // Extract user details from request body
        const { username, purchaseFrequency, averageOrderValue, frequentItems, currentTier, pointsBalance } = req.body;

        // Check if the username already exists under the same business
        const existingUser = await prisma.user.findUnique({
            where: {
                businessId_username: { businessId, username }
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with this username already exists under this business" });
        }

        // Create a new user
        const newUser = await prisma.user.create({
            data: {
                businessId,
                username,
                purchaseFrequency: purchaseFrequency || 0,
                averageOrderValue: averageOrderValue || 0,
                frequentItems: frequentItems || [],
                currentTier: currentTier || "Bronze",
                pointsBalance: pointsBalance || 0
            }
        });

        res.status(201).json({ message: "User added successfully", user: newUser });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getUsersByBusiness = async (req, res) => {
    try {
        // Extract business ID from authenticated request
        const businessId = req.business.id; // Assuming middleware attaches `req.business`

        // Fetch all users associated with the business
        const users = await prisma.user.findMany({
            where: { businessId }
        });

        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const recommandLoyaltyPrograms=async(req,res)=>{
    try {
        const user_id=req.query;
        
    } catch (error) {
        
    }
}