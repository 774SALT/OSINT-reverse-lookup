const { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } = require('google-libphonenumber');
const axios = require('axios');
const cheerio = require('cheerio');
// const { reverseAustraliaLookup } = require('./lookups/reverseAU');
const { getLookup } = require('./lookups/index.js'); // ✅ dynamic lookup router

const phoneUtil = PhoneNumberUtil.getInstance();

async function verifyPhone(input) {
  try {
    const number = phoneUtil.parseAndKeepRawInput(input, 'AU')
    const isValid = phoneUtil.isValidNumber(number)
    const isPossible = phoneUtil.isPossibleNumber(number)
    const numberType = phoneUtil.getNumberType(number)

    const e164Format = phoneUtil.format(number, PhoneNumberFormat.E164)
    const internationalFormat = phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL)
    const nationalFormat = phoneUtil.format(number, PhoneNumberFormat.NATIONAL)

    const phoneInfo = {
      internationalFormat,
      nationalFormat,
      e164Format,
      countryCode: number.getCountryCode(),
      regionCode: phoneUtil.getRegionCodeForNumber(number),
      numberType: PhoneNumberType[numberType],
      isValid,
      isPossible,
      isMobile: numberType === PhoneNumberType.MOBILE,
      isFixedLine: numberType === PhoneNumberType.FIXED_LINE
    }

    // 🔄 Dynamic lookup based on region
    const regionCode = phoneInfo.regionCode
    const lookup = getLookup(regionCode)

    if (lookup) {
      phoneInfo.reverseLookup = await lookup(e164Format)
    }

    return phoneInfo
  } catch (err) {
    return { error: 'Invalid phone number or lookup failed.' }
  }
}

module.exports = { verifyPhone }