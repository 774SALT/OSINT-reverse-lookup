const axios = require('axios');
require('dotenv').config();

async function searchHunter(email) {
  const apiKey = process.env.HUNTER_API_KEY;
  const domain = email.split('@')[1];
  const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}`;

  try {
    const res = await axios.get(url);
    return res.data.data.emails || [];
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { searchHunter };