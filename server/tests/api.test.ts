import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("ResearchGraph API Endpoints", () => {
  it("GET /api/health returns valid health payload", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("database");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("GET / returns API metadata", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("ResearchGraph API");
  });

  it("GET /api/papers validates pagination query params", async () => {
    const res = await request(app).get("/api/papers?page=-1");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain("positive integer");
  });

  it("GET /api/graph/path returns 400 when missing required startId and targetId", async () => {
    const res = await request(app).get("/api/graph/path");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain("required");
  });

  it("GET /api/unknown-endpoint returns 404", async () => {
    const res = await request(app).get("/api/unknown-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
