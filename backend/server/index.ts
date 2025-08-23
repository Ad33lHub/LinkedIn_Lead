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


// import express, { type Request, Response, NextFunction } from "express";
// import http from "http";
// import { registerRoutes } from "./routes";
// import path from "path";
// import fs from "fs";

// const app = express();

// // 🔥 SINGLE CORS CONFIGURATION - sabse upar
// app.use((req, res, next) => {
//   // Allow any origin
//   res.header('Access-Control-Allow-Origin', '*');
  
//   // Allow methods
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
//   // Allow headers
//   res.header('Access-Control-Allow-Headers', 
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control'
//   );
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Max-Age', '86400'); // Cache for 24 hours
//     return res.status(200).json({
//       message: 'CORS preflight successful',
//       allowedMethods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
//       allowedHeaders: 'Content-Type, Authorization'
//     });
//   }
  
//   next();
// });

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// // Health check endpoint - CORS test ke liye
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     cors: 'Enabled for all origins',
//     timestamp: new Date().toISOString(),
//     method: req.method,
//     origin: req.headers.origin || 'No origin header',
//     userAgent: req.headers['user-agent']
//   });
// });

// // API test endpoint
// app.get('/api/test', (req, res) => {
//   res.json({
//     message: 'CORS test successful!',
//     receivedHeaders: {
//       origin: req.headers.origin,
//       'content-type': req.headers['content-type'],
//       authorization: req.headers.authorization ? 'Present' : 'Not present'
//     },
//     timestamp: new Date().toISOString()
//   });
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
//           time: new Date().toISOString(),
//           cors: "Enabled for all origins",
//           endpoints: {
//             health: "/health",
//             apiTest: "/api/test",
//             apiRoutes: "/api/*"
//           }
//         });
//       });
//     }

//     // 404 handler for API routes
//     app.use('/api/*', (req, res) => {
//       res.status(404).json({
//         message: 'API endpoint not found',
//         path: req.path,
//         method: req.method,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Global error handler
//     app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//       const status = err.status || err.statusCode || 500;
//       const message = err.message || "Internal Server Error";
      
//       log(`Error: ${status} - ${message} - Path: ${req.path}`, "error");
      
//       res.status(status).json({ 
//         message,
//         path: req.path,
//         method: req.method,
//         timestamp: new Date().toISOString()
//       });
//     });

//     // Create and start server
//     const server = http.createServer(app);
//     const port = parseInt(process.env.PORT || '10000', 10);

//     server.listen(port, "0.0.0.0", () => {
//       log(`✅ Backend API server running on http://localhost:${port}`);
//       log(`📁 API endpoints available at http://localhost:${port}/api/*`);
//       log(`🏥 Health check: http://localhost:${port}/health`);
//       log(`🔧 CORS test: http://localhost:${port}/api/test`);

//       if (process.env.NODE_ENV !== "production") {
//         log(`🔧 Development: Run frontend separately (usually on port 3000)`);
//         log(`🌐 CORS enabled for ALL origins (*)`);
//       }
//     });

//   } catch (error: any) {
//     log(`❌ Failed to start server: ${error.message}`, "error");
//     console.error(error);
//     process.exit(1);
//   }
// })();




import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

// 🔥 SIRF EK BAAR CORS - Ye sabse upar
app.use(cors({
  origin: [
    'http://localhost:3000',     // React dev server
    'http://localhost:5173',     // Vite dev server
    'http://localhost:3001',     // Alternative ports
    "https://linkedin-lead-53woyfp71-adeels-projects-22208b30.vercel.app" // Production domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// 🔥 Handle OPTIONS explicitly
app.options('*', cors());

// Body parsers (CORS ke baad)
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

// 🔥 Health check endpoint (CORS test ke liye)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    port: process.env.PORT || 5000
  });
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
          time: new Date().toISOString(),
          cors: "enabled",
          endpoints: [
            "/health",
            "/api/leads",
            "/api/settings"
          ]
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
    
    // 🔥 Port ko environment variable se ya default 5000
    const port = parseInt(process.env.PORT || '5000', 10);

    server.listen(port, "0.0.0.0", () => {
      log(`✅ Backend API server running on http://localhost:${port}`);
      log(`📁 API endpoints available at http://localhost:${port}/api/*`);
      log(`🏥 Health check: http://localhost:${port}/health`);
      log(`🌐 CORS enabled for frontend domains`);

      if (process.env.NODE_ENV !== "production") {
        log(`🔧 Development: Run frontend separately (usually on port 3000)`);
      }
    });

  } catch (error: any) {
    log(`❌ Failed to start server: ${error.message}`, "error");
    process.exit(1);
  }
})();
