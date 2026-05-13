const http = require("http");
const url = require("url");

const PORT = 2000;

const conversionRates = {
  usd: 1500,
  eur: 1700,
  cny: 2000,
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && pathname === "/convert") {
    const { amount, currency } = query;

    // Validate: missing fields
    if (!amount || !currency) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          error: "Missing required query parameters: amount and currency",
        })
      );
      return;
    }

    // Validate: amount must be a valid number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          error: "Invalid amount. Must be a positive number.",
        })
      );
      return;
    }

    // Validate: currency must be supported
    const normalizedCurrency = currency.toLowerCase();
    if (!conversionRates[normalizedCurrency]) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          error: `Unsupported currency "${currency}". Supported: usd, eur, cny.`,
        })
      );
      return;
    }

    const convertedAmount = numericAmount * conversionRates[normalizedCurrency];

    res.writeHead(200);
    res.end(
      JSON.stringify({
        input: {
          amount: numericAmount,
          currency: normalizedCurrency,
        },
        convertedAmount,
        unit: "RWF",
      })
    );
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});
