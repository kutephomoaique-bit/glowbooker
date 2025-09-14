import { createServer, type Server } from "http";
import { createApp } from "./app";
import { setupVite, log } from "./vite";

(async () => {
  const app = await createApp();
  const server = createServer(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Custom static serving to avoid catch-all route interfering with API routes
    const path = await import("path");
    const fs = await import("fs");
    const express = await import("express");
    const distPath = path.resolve(import.meta.dirname, "..", "dist/public");

    if (!fs.existsSync(distPath)) {
      throw new Error(
        `Could not find the build directory: ${distPath}, make sure to build the client first`,
      );
    }

    // Serve static files
    app.use(express.default.static(distPath));

    // Only serve index.html for non-API routes
    app.use((req: any, res: any, next: any) => {
      // If this is an API route that wasn't matched, let it 404 properly
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }
      
      // For all other routes, serve index.html for client-side routing
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
