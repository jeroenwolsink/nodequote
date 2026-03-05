const request = require("supertest");
const { app, quotes, loadQuotes } = require("./server");

describe("Node Quote API", () => {
  // Load quotes once before all tests
  beforeAll(async () => {
    await loadQuotes();
  });

  // Clean up any open handles after all tests
  afterAll(() => {
    // Reset quotes array to prevent state leaking between test runs
    quotes.length = 0;
  });

  describe("GET /status", () => {
    it("should return status 200", async () => {
      const res = await request(app).get("/status");
      expect(res.statusCode).toBe(200);
    });

    it("should return a JSON response with status and message", async () => {
      const res = await request(app).get("/status");
      expect(res.body).toHaveProperty("status");
      expect(res.body).toHaveProperty("message");
    });

    it("should report 'ready' when quotes are loaded", async () => {
      const res = await request(app).get("/status");
      expect(res.body.status).toBe("ready");
      expect(res.body.message).toMatch(/initialized with \d+ quotes/);
    });
  });

  describe("GET /", () => {
    it("should return status 200", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
    });

    it("should return a quote with id, content, author, and version", async () => {
      const res = await request(app).get("/");
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("content");
      expect(res.body).toHaveProperty("author");
      expect(res.body).toHaveProperty("version");
    });

    it("should always include version V4", async () => {
      const res = await request(app).get("/");
      expect(res.body.version).toBe("V4");
    });

    it("should return random quotes (not always the same)", async () => {
      const results = new Set();
      // Request 10 times and collect unique quote ids
      for (let i = 0; i < 10; i++) {
        const res = await request(app).get("/");
        results.add(res.body.id);
      }
      // With 500+ quotes, 10 requests should yield at least 2 different quotes
      expect(results.size).toBeGreaterThan(1);
    });

    it("should not mutate the original quotes array", async () => {
      const originalQuote = { ...quotes[0] };
      await request(app).get("/");
      // The original quote in the array should not have a 'version' property
      expect(quotes[0]).not.toHaveProperty("version");
      expect(quotes[0]).toEqual(originalQuote);
    });
  });

  describe("GET /status (when no quotes loaded)", () => {
    let savedQuotes;

    beforeEach(() => {
      // Temporarily empty the quotes array
      savedQuotes = quotes.splice(0, quotes.length);
    });

    afterEach(() => {
      // Restore quotes
      quotes.push(...savedQuotes);
    });

    it("should report 'loading' when no quotes are available", async () => {
      const res = await request(app).get("/status");
      expect(res.body.status).toBe("loading");
    });

    it("should return 503 on GET / when no quotes are loaded", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty("error", "Quotes not loaded yet");
    });
  });

  describe("404 handling", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/nonexistent");
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Not found");
    });

    it("should return 404 for POST requests", async () => {
      const res = await request(app).post("/");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("loadQuotes()", () => {
    it("should load quotes from CSV file", () => {
      // Quotes were loaded in beforeAll
      expect(quotes.length).toBeGreaterThan(0);
    });

    it("should parse quotes with correct fields", () => {
      const quote = quotes[0];
      expect(quote).toHaveProperty("id");
      expect(quote).toHaveProperty("content");
      expect(quote).toHaveProperty("author");
      expect(typeof quote.id).toBe("string");
      expect(typeof quote.content).toBe("string");
      expect(typeof quote.author).toBe("string");
    });

    it("should load all quotes from the CSV", () => {
      // The CSV file contains 521 quotes
      expect(quotes.length).toBe(521);
    });
  });
});
