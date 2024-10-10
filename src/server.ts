import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getXataClient, XataClient } from './xata';

// Load environment variables from .env
dotenv.config({ path: './.env' });

const apiKey = process.env.XATA_API_KEY

// Initialize Xata client with API key from environment
const xata = new XataClient({ apiKey,
  branch: 'main'
 });

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Custom validation middleware
const validateRequest = (req:  Request, res: Response, next: () => void) => {
  //Check if request body is empty
  if(!req.body){
    return res.status(400).json({message: 'Request body is required'});
  }

  //check if specific fields are present in the request body
  const requiredFields = ['name', 'email'];
  for(const field of requiredFields) {
    if(!req.body[field]){
      return res.status(400).json({message: `Missing required field: ${field}`})
  }
}

next();
};

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running");
});

// Fetch all users
app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const users = await xata.db.users.getMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Error retrieving users", error });
  }
});

// Fetch a user by ID
app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await xata.db.users.read(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: "Error retrieving user", error });
  }
});

// Create a new user
app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const newUser = await xata.db.users.create(req.body); // Create new user
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: "Error creating user", error });
  }
});

// Update a user (replace entire record)
app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const updatedUser = await xata.db.users.update(req.params.id, req.body);
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: "Error updating user", error });
  }
});

// Partially update a user
app.patch("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const updatedUser = await xata.db.users.update(req.params.id, req.body); // Partially update user
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error('Error partially updating user:', error);
    res.status(500).json({ message: "Error updating user", error });
  }
});

// Delete a user
app.delete("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    await xata.db.users.delete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Error deleting user", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
