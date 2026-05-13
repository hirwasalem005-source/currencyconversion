const express = require("express");

const app = express();
const PORT = 2000;

const conversionRates = {
  usd: 1500,
  eur: 1700,
  cny: 2000,
};

// ─── Middleware: Validate query parameters ────────────────────────────────────
function validateConversionInput(req, res, next) {
  const { amount, currency } = req.query;

  // Validate: missing fields
  if (!amount || !currency) {
    return res.status(400).json({
      error: "Missing required query parameters: amount and currency",
    });
  }

  // Validate: amount must be a valid positive number
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      error: "Invalid amount. Must be a positive number.",
    });
  }

  // Validate: currency must be supported
  const normalizedCurrency = currency.toLowerCase();
  if (!conversionRates[normalizedCurrency]) {
    return res.status(400).json({
      error: `Unsupported currency "${currency}". Supported: usd, eur, cny.`,
    });
  }

  // Attach cleaned values to request for use in route handler
  req.convertedData = {
    numericAmount,
    normalizedCurrency,
  };

  next();
}

// ─── Route ────────────────────────────────────────────────────────────────────
app.get("/convert", validateConversionInput, (req, res) => {
  const { numericAmount, normalizedCurrency } = req.convertedData;
  const convertedAmount = numericAmount * conversionRates[normalizedCurrency];

  res.status(200).json({
    input: {
      amount: numericAmount,
      currency: normalizedCurrency,
    },
    convertedAmount,
    unit: "RWF",
  });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
