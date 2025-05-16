const { reverseAustraliaLookup } = require('./reverseAU.js')
// You can import others like:
// import { reverseUSLookup } from './reverseUS.js'

const lookupMap = {
  AU: reverseAustraliaLookup,
  // US: reverseUSLookup,
  // GB: reverseUKLookup,
}

function getLookup(regionCode) {
  return lookupMap[regionCode] || null
}
module.exports = { getLookup }