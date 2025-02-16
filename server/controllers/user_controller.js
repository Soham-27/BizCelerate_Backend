import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import axios from 'axios';

export const addUser = async (req, res) => {
    try {
        // Extract business ID from authenticated request
        const businessId = req.business.id; // Assuming middleware attaches `req.business`

        // Extract user details from request body
        const { username, purchaseFrequency, averageOrderValue, frequentItems, currentTier, pointsBalance,joined_at } = req.body;

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
                pointsBalance: pointsBalance || 0,

                joined_at:joined_at
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


export const recommandLoyaltyPrograms = async (req, res) => {
    try {
      const { id } = req.query;
      const userId = id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // Fetch user details along with business info
      const userData = await prisma.user.findFirst({
        where: { id: userId },
        include: {
          business: {
            select: {
              name: true,
              offers: true
            }
          }
        }
      });
      console.log(userData)
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const question = `
        As a loyalty program recommender system, your task is to generate loyalty recommendations based on user data.
        Username: ${userData.username}.
        Purchase Frequency: ${userData.purchaseFrequency} times.
        Average Order Value: $${userData.averageOrderValue}.
        Frequent Items Ordered: ${userData.frequentItems}.
        Points Balance: ${userData.pointsBalance}.
        Joined Business: ${userData.joined_at} months ago.
        Business Name: ${userData.business.name}.
        Available Offers: ${userData.business.offers}.
        Generate 3-4 loyalty program recommendations based on business offers and user behavior.
        1. Ensure recommendations are only from the given business offers.
        2. Generate 3-4 Loyalty recommdations which tells offer that given to user based from its history and business offers.
        3. If no offers are available, suggest general loyalty perks.
        4. in response do not include "you" like sentence just tell recommendations 
        Format the response as a valid JSON object with this exact structure:
        {
          "recommendations": ["Loyalty Suggestion 1", "Loyalty Suggestion 2"]
        }
        Return ONLY the JSON object with no ladditional text.
      `;
  
      const apiRequestData = {
        question: question,
        randomness: 0.5,
        stream_data: false,
        training_data: "You are Alex, an expert in loyalty program recommendations.",
        response_type: "json"
      };
  
      const response = await axios({
        method: 'post',
        url: 'https://api.worqhat.com/api/ai/content/v2',
        headers: {
          'Authorization': `Bearer wh_m73e7is2NaABF5BrgUuUVcpSwNETf5NTi5p97Bd`,
          'Content-Type': 'application/json'
        },
        data: apiRequestData
      });
  
      // Check if response.data exists and has the content field
      if (!response.data || !response.data.content) {
        throw new Error('Invalid response structure from API');
      }
  
      // Parse the content string from the response
      const parsedContent = JSON.parse(response.data.content);
  
      // Verify the parsed content has the recommendations array
      if (!parsedContent || !parsedContent.recommendations) {
        throw new Error('Invalid recommendations format in API response');
      }
  
      // Return the parsed recommendations
      return res.status(200).json(parsedContent);
  
    } catch (error) {
      console.error('Error in recommandLoyaltyPrograms:', error);
      
      return res.status(500).json({
        message: "Failed to generate recommendations",
        error: error.message || 'Unknown error occurred'
      });
    }
  };

export const askAI = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Question is required" });
        }

        const data = JSON.stringify({
            question,
            preserve_history: true,
            randomness: 0.5,
            stream_data: false,
            training_data: "You are Alex and you are loyalty recommadations genertor",
            response_type: "text"
        });

        

        const config = {
            method: 'post',
            url: 'https://api.worqhat.com/api/ai/content/v2', // Replace with actual API URL
            headers: { 
                'Authorization': `Bearer ${process.env.worqhat}`,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios(config);

        res.status(200).json({ message: "AI Response", response: response.data });
    } catch (error) {
        console.error("Error calling AI API:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};