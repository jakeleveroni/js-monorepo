import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import app from "../../server";
import { mockDatabasePool } from "./utils/mock-db-pool";

let server: any;

mock.module("../../src/utils/db-pool", mockDatabasePool);

beforeAll(() => {
  server = app.locals.listen(3001);
});

afterAll(() => {
  server.close();
});

describe("authentication api tests", () => {
  it("can register user", async () => {
    const response = await request(server)
      .post("/api/register")
      .send({ username: "testuser", password: "testpassword123" })
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Account created" });
  });
});
