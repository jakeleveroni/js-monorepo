import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import request from "supertest";
import app from "../../server";

let server: any;

beforeAll(() => {
  server = app.listen(3001);
});

afterAll(() => {
  server.close();
});

describe("authentication api tests", () => {
  it("can register user", async () => {
    await request(server)
      .post("/api/register")
      .send({ username: "testuser", password: "testpassword123" })
      .set("Accept", "application/json")
      .expect(200)
      .then(response => {
        expect(response.body).toEqual({ message: "registered" });
     })
  });

  it("registered users can login", async () => {
    await request(server)
      .post("/api/login")
      .send({ username: "testuser", password: "testpassword123" })
      .set("Accept", "application/json")
      .expect(200)
      .then(response => {
        // @ts-expect-error -- they typed the headers wrong, cookies is a string array
        const cookies = response.headers['set-cookie'] as string[];
        expect(cookies.join('')).toInclude('auth_token')
        expect(cookies.join('')).toInclude('refresh_token')
        expect(cookies).toHaveLength(2)
        expect(response.body).toEqual({ message: "authorized" });
      })
  });
});
