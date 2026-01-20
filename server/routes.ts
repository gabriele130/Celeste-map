import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  loginPincodeSchema, 
  loginOtpSchema, 
  forgotPasswordSchema,
  editCustomerSchema,
  createEmployeeSchema,
  editEmployeeSchema,
  calculatePricesSchema,
  createTicketSchema,
  addFavoriteSchema,
  translateTextSchema,
  sendControlMessageSchema,
} from "@shared/schema";

const API_BASE_URL = process.env.API_BASE_URL || "https://api.example.com";
const SESSION_COOKIE = "jfl_session";
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

async function apiRequest(
  path: string, 
  options: RequestInit = {}, 
  accessToken?: string
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${path}`;
  return fetch(url, { ...options, headers });
}

async function refreshTokens(refreshToken: string): Promise<{ access_token: string; refresh_token?: string; expires_in: number } | null> {
  try {
    const response = await apiRequest("/v1/authenticate/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch {
    return null;
  }
}

function getSessionId(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE];
}

function setSessionCookie(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE);
}

async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const session = storage.getSession(sessionId);
  if (!session) {
    clearSessionCookie(res);
    res.status(401).json({ message: "Session expired" });
    return;
  }

  if (session.expiresAt < Date.now() + TOKEN_REFRESH_BUFFER_MS && session.refreshToken) {
    const newTokens = await refreshTokens(session.refreshToken);
    if (newTokens) {
      storage.updateSession(sessionId, {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token || session.refreshToken,
        expiresAt: Date.now() + newTokens.expires_in * 1000,
      });
      (req as any).session = storage.getSession(sessionId);
    } else {
      clearSessionCookie(res);
      res.status(401).json({ message: "Session expired" });
      return;
    }
  } else if (session.expiresAt < Date.now()) {
    clearSessionCookie(res);
    res.status(401).json({ message: "Session expired" });
    return;
  }

  (req as any).session = storage.getSession(sessionId);
  (req as any).sessionId = sessionId;
  next();
}

async function proxyRequest(
  req: Request, 
  res: Response, 
  method: string, 
  apiPath: string,
  body?: unknown
): Promise<void> {
  const session = (req as any).session;
  const sessionId = (req as any).sessionId;
  
  try {
    let response = await apiRequest(apiPath, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    }, session?.accessToken);

    if (response.status === 401 && session?.refreshToken) {
      const newTokens = await refreshTokens(session.refreshToken);
      if (newTokens) {
        storage.updateSession(sessionId, {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || session.refreshToken,
          expiresAt: Date.now() + newTokens.expires_in * 1000,
        });
        
        response = await apiRequest(apiPath, {
          method,
          body: body ? JSON.stringify(body) : undefined,
        }, newTokens.access_token);
      } else {
        clearSessionCookie(res);
        res.status(401).json({ message: "Session expired" });
        return;
      }
    }

    const contentType = response.headers.get("content-type");
    
    if (response.status === 401) {
      clearSessionCookie(res);
      res.status(401).json({ message: "Session expired" });
      return;
    }

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error(`API Error [${method} ${apiPath}]:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/login-pincode", async (req, res) => {
    try {
      const data = loginPincodeSchema.parse(req.body);
      
      const response = await apiRequest("/v2/authenticate/pincode", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Login failed" }));
        res.status(response.status).json(error);
        return;
      }

      const tokens = await response.json();
      const sessionId = storage.createSession(tokens);
      setSessionCookie(res, sessionId);
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/login-otp", async (req, res) => {
    try {
      const data = loginOtpSchema.parse(req.body);
      
      const response = await apiRequest("/v1/authenticate/otp", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Login failed" }));
        res.status(response.status).json(error);
        return;
      }

      const tokens = await response.json();
      const sessionId = storage.createSession(tokens);
      setSessionCookie(res, sessionId);
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      console.error("OTP login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      
      const response = await apiRequest("/legacy/api/mobile/authentication/authenticate/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        res.status(response.status).json(error);
        return;
      }

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Request failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = getSessionId(req);
    if (sessionId) {
      storage.deleteSession(sessionId);
    }
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.get("/api/auth/session", (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      res.json({ isAuthenticated: false });
      return;
    }
    const sessionInfo = storage.getSessionInfo(sessionId);
    res.json(sessionInfo);
  });

  app.get("/api/users/me", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/users/me");
  });

  app.get("/api/customers/me", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/customers/me");
  });

  app.put("/api/customers/me", requireAuth, async (req, res) => {
    try {
      const data = editCustomerSchema.parse(req.body);
      await proxyRequest(req, res, "PUT", "/v1/customers/me", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Update failed" });
    }
  });

  app.get("/api/customer-wallet", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/customer-wallet");
  });

  app.get("/api/connectors", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/connectors${query ? `?${query}` : ""}`);
  });

  app.get("/api/connectors/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/connectors/${req.params.id}`);
  });

  app.get("/api/vehicles/makes", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/vehicles/makes");
  });

  app.get("/api/vehicles/makes/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/vehicles/makes/${req.params.id}`);
  });

  app.get("/api/vehicles/model-groups", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/vehicles/model-groups${query ? `?${query}` : ""}`);
  });

  app.get("/api/vehicles/model-groups/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/vehicles/model-groups/${req.params.id}`);
  });

  app.get("/api/vehicles/models", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/vehicles/models${query ? `?${query}` : ""}`);
  });

  app.get("/api/vehicles/models/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/vehicles/models/${req.params.id}`);
  });

  app.get("/api/vehicles/model-variants", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/vehicles/model-variants${query ? `?${query}` : ""}`);
  });

  app.get("/api/vehicles/model-variants/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/vehicles/model-variants/${req.params.id}`);
  });

  app.get("/api/vehicles/search", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/vehicles/search${query ? `?${query}` : ""}`);
  });

  app.get("/api/products", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/products");
  });

  app.get("/api/product-groups", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/product-groups");
  });

  app.get("/api/product-bundles", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/product-bundles${query ? `?${query}` : ""}`);
  });

  app.post("/api/favorite-products", requireAuth, async (req, res) => {
    try {
      const data = addFavoriteSchema.parse(req.body);
      await proxyRequest(req, res, "POST", "/v1/favorite-products", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorite-products/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "DELETE", `/v1/favorite-products/${req.params.id}`);
  });

  app.post("/api/cart/calculate-prices", requireAuth, async (req, res) => {
    try {
      const data = calculatePricesSchema.parse(req.body);
      await proxyRequest(req, res, "POST", "/v1/cart/calculate-prices", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Calculation failed" });
    }
  });

  app.get("/api/prepared-tickets", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/prepared-tickets${query ? `?${query}` : ""}`);
  });

  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const data = createTicketSchema.parse(req.body);
      await proxyRequest(req, res, "POST", "/v1/tickets", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.get("/api/tickets/:id/notes", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/tickets/${req.params.id}/notes`);
  });

  app.get("/api/historical-tickets", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/historical-tickets${query ? `?${query}` : ""}`);
  });

  app.get("/api/employees", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/employees");
  });

  app.post("/api/employees", requireAuth, async (req, res) => {
    try {
      const data = createEmployeeSchema.parse(req.body);
      await proxyRequest(req, res, "POST", "/v1/employees", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to add employee" });
    }
  });

  app.get("/api/employees/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/employees/${req.params.id}`);
  });

  app.put("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const data = editEmployeeSchema.parse(req.body);
      await proxyRequest(req, res, "PUT", `/v1/employees/${req.params.id}`, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.get("/api/chats/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/chats/${req.params.id}`);
  });

  app.get("/api/chats", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/chats${query ? `?${query}` : ""}`);
  });

  app.get("/api/service-center", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/service-center");
  });

  app.get("/api/service-center/status", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/service-center/status");
  });

  app.get("/api/system/countries", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/system/countries");
  });

  app.get("/api/system/currencies", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", "/v1/system/currencies");
  });

  app.get("/api/channels/:id", requireAuth, (req, res) => {
    proxyRequest(req, res, "GET", `/v1/channels/${req.params.id}`);
  });

  app.post("/api/translate", requireAuth, async (req, res) => {
    try {
      const data = translateTextSchema.parse(req.body);
      await proxyRequest(req, res, "POST", "/v1/translate", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.post("/api/channel-actions/send-control-message", requireAuth, async (req, res) => {
    try {
      const data = sendControlMessageSchema.parse(req.body);
      await proxyRequest(req, res, "POST", "/v1/channel-actions/send-control-message", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/channel-attachments", requireAuth, (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    proxyRequest(req, res, "GET", `/v1/channel-attachments${query ? `?${query}` : ""}`);
  });

  app.post("/api/channel-attachments", requireAuth, (req, res) => {
    proxyRequest(req, res, "POST", "/v1/channel-attachments", req.body);
  });

  return httpServer;
}
