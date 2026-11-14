
const request = require("supertest");
const app = require("../src/App.js");

describe("WorkSpace health endpoints", () => {
    test("GET /health returns 200", async () => {
        const response = await request(app).get("/health");

        console.log(response)

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test("GET /ready returns a valid readiness response", async () => {
        const response = await request(app).get("/ready");

        expect([200, 503]).toContain(response.status);
    });

    test("Unknown routes return 404", async () => {
        const response = await request(app).get("/this-route-does-not-exist");

        expect(response.status).toBe(404);
    });
});
