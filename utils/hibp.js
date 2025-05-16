const axios = require('axios');
require('dotenv').config();

async function checkEmailBreach(email) {
  const apiKey = process.env.HIBP_API_KEY;
  const headers = {
    'hibp-api-key': apiKey,
    'User-Agent': 'osint-node-tool'
  };

  const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;

  try {
    const res = await axios.get(url, { headers });
    return res.data.map(breach => ({
      name: breach.Name,
      domain: breach.Domain,
      date: breach.BreachedDate,
      data: breach.DataClasses,
      verified: breach.IsVerified
    }));
  } catch (err) {
    if (err.response?.status === 404) return []; // No breach
    return { error: err.message };
  }
}

module.exports = { checkEmailBreach };