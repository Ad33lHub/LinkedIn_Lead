// import express, { type Request, Response, NextFunction } from "express";
// import http from "http";
// import { registerRoutes } from "./routes";
// import path from "path";
// import fs from "fs";

// const app = express();

// // Enable CORS for frontend
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(200);
//   } else {
//     next();
//   }
// });

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Custom logging function
// function log(message: string, source = "express") {
//   const formattedTime = new Date().toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });
  
//   console.log(`${formattedTime} [${source}] ${message}`);
// }

// // Logging middleware
// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }

//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// // Static files serving (for production)
// function serveStaticFiles() {
//   const distPath = path.resolve(process.cwd(), "dist", "client");
  
//   if (fs.existsSync(distPath)) {
//     log("Serving static files from: " + distPath);
//     app.use(express.static(distPath));
    
//     // Fallback to index.html for SPA routing
//     app.use("*", (req, res, next) => {
//       // Skip API routes
//       if (req.originalUrl.startsWith("/api")) {
//         return next();
//       }
      
//       const indexPath = path.resolve(distPath, "index.html");
//       if (fs.existsSync(indexPath)) {
//         res.sendFile(indexPath);
//       } else {
//         res.status(404).json({ message: "Frontend not built. Run 'npm run build' first." });
//       }
//     });
//   } else {
//     log("No dist folder found. Frontend will be served separately.", "warning");
//   }
// }

// (async () => {
//   try {
//     // Register API routes first
//     await registerRoutes(app);

//     // Serve static files (production) or show info message (development)
//     if (process.env.NODE_ENV === "production") {
//       serveStaticFiles();
//     } else {
//       log("Development mode: Frontend should run separately on another port", "info");
      
//       // Optional: Serve a simple message for non-API routes in development
//       app.use("*", (req, res, next) => {
//         if (req.originalUrl.startsWith("/api")) {
//           return next();
//         }
        
//         res.json({ 
//           message: "Backend API is running", 
//           frontend: "Run frontend separately in development mode",
//           time: new Date().toISOString()
//         });
//       });
//     }

//     // Global error handler
//     app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//       const status = err.status || err.statusCode || 500;
//       const message = err.message || "Internal Server Error";
//       log(`Error: ${status} - ${message}`, "error");
//       res.status(status).json({ message });
//     });

//     // Create and start server
//     const server = http.createServer(app);
//     const port = parseInt(process.env.PORT || '5000', 10);
    
//     server.listen(port, "0.0.0.0", () => {
//       log(`✅ Backend API server running on http://localhost:${port}`);
//       log(`📁 API endpoints available at http://localhost:${port}/api/*`);
      
//       if (process.env.NODE_ENV !== "production") {
//         log(`🔧 Development: Run frontend separately (usually on port 3000)`);
//       }
//     });

//   } catch (error: any) {
//     log(`❌ Failed to start server: ${error.message}`, "error");
//     process.exit(1);
//   }
// })();



import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";
const cors = require('cors');

const app = express();



app.use(cors({
  origin: '*',                    // 🔥 Koi bhi domain allow
  credentials: false,             // ⚠️ credentials false karna padega with *
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Agar credentials chahiye with any origin (Not recommended for production)
app.use(cors({
  origin: true,                   // 🔥 Any origin but credentials work karta hai
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Logging middleware
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
      if (capturedJsonResponse) {
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

// Static files serving (for production)
function serveStaticFiles() {
  const distPath = path.resolve(process.cwd(), "dist", "client");

  if (fs.existsSync(distPath)) {
    log("Serving static files from: " + distPath);
    app.use(express.static(distPath));

    // Fallback to index.html for SPA routing
    app.use("*", (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }

      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ message: "Frontend not built. Run 'npm run build' first." });
      }
    });
  } else {
    log("No dist folder found. Frontend will be served separately.", "warning");
  }
}

(async () => {
  try {
    // Register API routes first
    await registerRoutes(app);

    // Serve static files (production) or show info message (development)
    if (process.env.NODE_ENV === "production") {
      serveStaticFiles();
    } else {
      log("Development mode: Frontend should run separately on another port", "info");

      // Optional: Serve a simple message for non-API routes in development
      app.use("*", (req, res, next) => {
        if (req.originalUrl.startsWith("/api")) {
          return next();
        }

        res.json({
          message: "Backend API is running",
          frontend: "Run frontend separately in development mode",
          time: new Date().toISOString()
        });
      });
    }

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${status} - ${message}`, "error");
      res.status(status).json({ message });
    });

    // Create and start server
    const server = http.createServer(app);
    const port = parseInt(process.env.PORT || '5000', 10);

    server.listen(port, "0.0.0.0", () => {
      log(`✅ Backend API server running on http://localhost:${port}`);
      log(`📁 API endpoints available at http://localhost:${port}/api/*`);

      if (process.env.NODE_ENV !== "production") {
        log(`🔧 Development: Run frontend separately (usually on port 3000)`);
      }
    });

  } catch (error: any) {
    log(`❌ Failed to start server: ${error.message}`, "error");
    process.exit(1);
  }
})();
