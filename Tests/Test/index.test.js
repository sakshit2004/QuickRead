const request = require("supertest");
const app = require("../Server/index"); // Adjust path to your index.js

describe("News API Server", () => {
  const BASE_URL = "/";

  it("should fetch all news", async () => {
    const response = await request(app).get(`${BASE_URL}all-news`).query({
      pageSize: 10,
      page: 1,
      q: "test",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should fetch top headlines", async () => {
    const response = await request(app).get(`${BASE_URL}top-headlines`).query({
      pageSize: 10,
      page: 1,
      category: "general",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should fetch news by country", async () => {
    const response = await request(app).get(`${BASE_URL}country/us`).query({
      pageSize: 10,
      page: 1,
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
