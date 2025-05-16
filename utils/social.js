// utils/social.js
const axios = require('axios');

function matchLocation(phoneInfo, profileText) {
  if (!phoneInfo || !profileText) return false;

  const locationTerms = [
    phoneInfo.country?.toLowerCase(),
    phoneInfo.location?.toLowerCase(),
    phoneInfo.carrier?.toLowerCase()
  ].filter(Boolean);

  const textLower = profileText.toLowerCase();
  return locationTerms.some(term => textLower.includes(term));
}

async function fetchProfileText(url) {
  try {
    const res = await axios.get(url, { timeout: 5000 });
    if (res.status !== 200) return "";
    // Very naive way to extract profile "text" from the HTML:
    // Just get meta description or title tag as a proxy for bio/description
    const html = res.data;
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescMatch && metaDescMatch[1]) return metaDescMatch[1];
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) return titleMatch[1];
    return "";
  } catch {
    return "";
  }
}

async function checkSocialLinks(emailOrUsername, phoneInfo) {
  const platforms = [
    { name: "Facebook", url: `https://www.facebook.com/${emailOrUsername}` },
    { name: "Twitter", url: `https://twitter.com/${emailOrUsername}` },
    { name: "Instagram", url: `https://www.instagram.com/${emailOrUsername}` },
    { name: "LinkedIn", url: `https://www.linkedin.com/in/${emailOrUsername}` }
  ];

  const validProfiles = [];

  for (const platform of platforms) {
    try {
      // First check if profile exists
      const res = await axios.head(platform.url, { timeout: 5000 });
      if (res.status === 200) {
        // Fetch profile text (bio, meta description, etc.)
        const profileText = await fetchProfileText(platform.url);

        // Check if phone info location terms match profile text
        if (matchLocation(phoneInfo, profileText)) {
          validProfiles.push(platform.url);
          console.log(`✅ Matched profile: ${platform.name} - ${platform.url}`);
        } else {
          console.log(`❌ Ignored profile (location mismatch): ${platform.name} - ${platform.url}`);
        }
      }
    } catch (err) {
      // Profile doesn't exist or not accessible - skip silently
    }
  }

  return validProfiles;
}

module.exports = { checkSocialLinks };
