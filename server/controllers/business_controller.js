import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '3d'; // Token expiration time

// Generate JWT Token
const generateToken = (business) => {
    return jwt.sign({ id: business.id, email: business.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register Business
export const registerBusiness = async (req, res) => {
    try {
      // Only basic fields for registration
      const { name, email, password } = req.body;
  
      // Check if email already exists
      const existingBusiness = await prisma.business.findUnique({ where: { email } });
      if (existingBusiness) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new business. Other fields can be added later.
      const business = await prisma.business.create({
        data: {
          name,
          email,
          password: hashedPassword,
          // Optional fields (sector, type, etc.) are not provided at sign-up.
        }
      });
  
      // Generate JWT token
      const token = generateToken(business);
  
      res.status(201).json({ message: "Business registered successfully", token });
    } catch (error) {
      console.error("Error registering business:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};


export const updateBusinessProfile = async (req, res) => {
  try {
      // Extract additional fields from request body
      const { sector, type, targetCustomer, size, currentPainPoints, businessGoals, offers } = req.body;

      // Get the business ID from the authenticated request (set by your authentication middleware)
      const businessId = req.business.id;

      // Update the business record with the new information.
      const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
              sector,
              type,
              targetCustomer,
              size,
              currentPainPoints,
              businessGoals,
              offers
          },
          select: {
              id: true,
              name: true,
              email: true,
              sector: true,
              type: true,
              targetCustomer: true,
              size: true,
              currentPainPoints: true,
              businessGoals: true,
              offers: true,
              createdAt: true,
              updatedAt: true
          }
      });

      // Send the updated sector to the FastAPI service
      const fastApiResponse = await axios.post(`${process.env.FAST_API}/analyze`, {
          domain: sector
      });

      res.status(200).json({ 
          message: "Business profile updated successfully", 
          updatedBusiness
      });
  } catch (error) {
      console.error("Error updating business profile:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to Authenticate JWT
export const isAuthenticated = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized, no token provided" });
    }

    try {
        // Verify the token and extract the payload
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch the full business record from the database using the decoded id
        const business = await prisma.business.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                sector: true,
                type: true,
                targetCustomer: true,
                size: true,
                currentPainPoints: true,
                businessGoals: true,
                offers: true,
                createdAt: true,
                updatedAt: true,
                // Optionally include other fields like refreshToken if needed
              }
        });

        if (!business) {
            return res.status(404).json({ message: "Business not found" });
        }

        // Attach the full business record to the request object
        req.business = business;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(403).json({ message: "Invalid or expired token " ,error:error });
    }
};



export const updateBusinessOffers = async (req, res) => {
    try {
      // Extract the new offers from the request body.
      // Expecting an array of strings.
      const { offers } = req.body;
      
      // Validate the input.
      if (!offers || !Array.isArray(offers)) {
        return res.status(400).json({ message: "Offers must be provided as an array." });
      }
  
      // Use the authenticated business' id from req.business (set by isAuthenticated middleware).
      const businessId = req.business.id;
  
      // Update the business's offers field.
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: { offers },
        // Optionally select only the fields you want returned.
        select: { id: true, offers: true }
      });
  
      res.status(200).json({ message: "Offers updated successfully", updatedOffers: updatedBusiness.offers });
    } catch (error) {
      console.error("Error updating offers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};



export const loginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the business by email
    const business = await prisma.business.findFirst({ where: { email } });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Generate a JWT token
    const token = generateToken(business);
    
    res.status(200).json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

 



import axios from 'axios';

export const generateContent = async (req, res) => {
  try {
    const { post_type } = req.body;  // Ensure you're getting post_type
    const business = req.business;   // Ensure business data is attached

    if (!post_type || !business) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const requestBody = {
      product_details: business,  // Ensure this follows FastAPI schema
      content_type: post_type     // Make sure this is a string
    };

    console.log("Request Body:", requestBody);

    const response = await axios.post(`${process.env.FAST_API}/generate-content`, requestBody);

    return res.json(response.data);
  } catch (error) {
    console.error("Error generating content:", error?.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getinsights = async (req, res) => {
  try {
    const domain = req.business.sector; // Extract sector from authenticated business
    console.log("Fetching insights for:", domain);

    // Send a GET request to the FastAPI service
    const fastApiResponse = await axios.get(`${process.env.FAST_API}/insights/${domain}`);

    res.status(200).json({
      message: "Insights retrieved successfully",
      insights: fastApiResponse.data
    });
  } catch (error) {
    console.error("Error generating insight:", error?.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const predictCampaign = async (req, res) => {
  try {
    const name = req.business.name;
    const domain = req.business.sector;
    const { product, Budget, Duration, Clicks, Conversions, CTR, CPC, Conversion_Rate } = req.body;
    console.log(name)
    console.log(domain)

    // Construct request payload for FastAPI
    const requestData = {
      company_name: name,
      company_domain: domain,
      product:product,
      user_input: {
        Budget:parseInt(Budget),
        Duration:parseInt(Duration),
        Clicks:parseInt(Clicks),
        Conversions:parseInt(Conversions),
        CTR:parseFloat(CTR),
        CPC:parseFloat(CPC),
        Conversion_Rate:parseInt(Conversion_Rate)
      }
    };

    // Call FastAPI service
    const fastApiResponse = await axios.post(`${process.env.FAST_API}/predict_campaign`, requestData);

    // Return response to client
    res.status(200).json({
      message: "Campaign prediction successful",
      prediction: fastApiResponse.data
    });
  } catch (error) {
    console.error("Error predicting campaign:", error?.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const generateAds=async(req , res)=>{
  try {
    var data = JSON.stringify({
      "prompt": [
         `make a  Ad poster for ${req.business.name} whose in ${req.business.sector} this sector.
         1.poster contains offers ${req.business.offers}
         2.poster should be attractive and catchy for user
         3.Text on poster should be well alligened`
      ],
      "image_style": "poster",
      "orientation": "Square",
      "output_type": "url"
    });
 
  var config = {
  method: 'post',
  url: 'https://api.worqhat.com/api/ai/images/generate/v3',
  headers: { 
      'Authorization': `Bearer ${process.env.worqhat}`,
     'Content-Type': 'application/json'
  },
  data : data
  };
  const response = await axios(config);
  res.json({response:response.data});

  } catch (error) {
    console.error("Error generating images:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error generating images" });
  }
}