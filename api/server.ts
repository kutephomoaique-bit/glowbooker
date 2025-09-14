import { createApp } from "../server/app";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize the app only once (cold start optimization)
  if (!app) {
    try {
      app = await createApp();
      console.log('✅ Express app initialized for serverless');
    } catch (error) {
      console.error('❌ Failed to initialize Express app:', error);
      return res.status(500).json({ 
        message: "Internal server error during app initialization",
        error: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      });
    }
  }

  // Handle the request with the Express app
  app(req, res);
}