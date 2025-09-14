import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// Simple log function for serverless compatibility (no dev dependencies)
function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] ${message}`);
}

export async function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        // Only log response data in development to prevent sensitive data leaks
        if (capturedJsonResponse && process.env.NODE_ENV !== 'production') {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Production admin setup - ensure admin account exists on startup
  // Skip admin setup in Vercel serverless functions to prevent cold start timeouts
  if ((process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1') && !process.env.VERCEL) {
    try {
      console.log('🔧 Setting up production admin account...');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await execAsync('node scripts/production-admin-setup.js');
      console.log('✅ Production admin setup completed');
    } catch (error) {
      console.warn('⚠️  Production admin setup failed:', error instanceof Error ? error.message : String(error));
    }
  }

  // Register API routes
  await registerRoutes(app);

  // Error handler - must be at the very end of middleware stack
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Server error:', err);
    }

    res.status(status).json({ message });
  });

  return app;
}