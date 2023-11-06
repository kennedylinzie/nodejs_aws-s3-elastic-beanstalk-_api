// apiAuthMiddleware.js
const isValidApiKey = require("./keymanager");

const apiAuthMiddleware = (req, res, next) => {
  // const apiKey = req.body.apiKey;
  const apiKey = req.headers.apikey;

  // Check if the API key is present
  if (!apiKey) {
    return res.status(401).json({ error: "API key missing" });
  }

  // Validate the API key against your stored keys or perform any necessary checks
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // If the API key is valid, continue to the next middleware or route handler
  next();
};

module.exports = apiAuthMiddleware;
