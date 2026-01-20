import { randomUUID } from "crypto";
import type { AuthTokens, SessionInfo, UserMe, CustomerMe } from "@shared/schema";

export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user?: UserMe;
  customer?: CustomerMe;
}

export interface IStorage {
  createSession(tokens: AuthTokens, user?: UserMe, customer?: CustomerMe): string;
  getSession(sessionId: string): SessionData | undefined;
  updateSession(sessionId: string, data: Partial<SessionData>): void;
  deleteSession(sessionId: string): void;
  getSessionInfo(sessionId: string): SessionInfo;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, SessionData>;

  constructor() {
    this.sessions = new Map();
  }

  createSession(tokens: AuthTokens, user?: UserMe, customer?: CustomerMe): string {
    const sessionId = randomUUID();
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    
    this.sessions.set(sessionId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      user,
      customer,
    });

    return sessionId;
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, data: Partial<SessionData>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, { ...session, ...data });
    }
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getSessionInfo(sessionId: string): SessionInfo {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { isAuthenticated: false };
    }

    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      user: session.user,
      customer: session.customer,
    };
  }
}

export const storage = new MemStorage();
