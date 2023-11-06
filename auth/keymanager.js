// Function to check if the provided API key is valid
const isValidApiKey = (apiKey) => {
  // Retrieve the API keys from environment variables
  const validApiKeys = [
    process.env.API_KEY_1,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
  ];

  // Check if the provided API key exists in the list of valid keys
  return validApiKeys.includes(apiKey);
};

module.exports = isValidApiKey;
