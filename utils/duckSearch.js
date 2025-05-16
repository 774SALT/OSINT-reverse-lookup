const axios = require('axios');
const cheerio = require('cheerio');

const SOCIAL_DOMAINS = [
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'linkedin.com',
  'pipl.com',
  'beenverified.com',
  'whitepages.com',
  'spokeo.com',
  'peekyou.com',
  'peoplefinder.com',
  'truthfinder.com',
  'fastpeoplesearch.com',
  'mylife.com',
  'intelius.com'
];

async function searchNumberOnline(phone) {
  const query = encodeURIComponent(`"${phone}"`);
  const url = `https://duckduckgo.com/html/?q=${query}`;
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const $ = cheerio.load(res.data);
    const results = [];
    $('.result__a').each((i, el) => {
      const link = $(el).attr('href');
      if (!link) return;
      // Check if link contains any social domain keywords
      const isSocial = SOCIAL_DOMAINS.some(domain => link.includes(domain));
      results.push({ url: link, isSocial });
    });
    return results;
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { searchNumberOnline };
