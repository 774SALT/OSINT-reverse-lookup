const google = require('googlethis');

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

async function googleSearch(query) {
  const options = { page: 1, safe: false };
  try {
    const response = await google.search(query, options);
    const results = response.results.map(r => {
      const url = r.url;
      const isSocial = SOCIAL_DOMAINS.some(domain => url.includes(domain));
      return { url, isSocial };
    });
    return results;
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = { googleSearch };
