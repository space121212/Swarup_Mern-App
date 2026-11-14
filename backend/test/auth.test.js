
const request = require("supertest");
const app = require("../src/App.js");

describe("Authentication API", () => {
    test("Login without credentials returns 400", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({});

        expect(response.status).toBe(400);
    });

    test("Login with invalid credentials is rejected", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "invalid-user@example.com",
                password: "WrongPassword123!"
            });

        expect([400, 401]).toContain(response.status);
    });
});
