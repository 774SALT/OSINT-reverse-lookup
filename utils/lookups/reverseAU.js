const axios = require('axios')
const cheerio = require('cheerio')

async function reverseAustraliaLookup(e164Number) {
  try {
    const cleanedNumber = e164Number.replace(/\+61/, '0') // Convert to national format
    const url = `https://www.reverseaustralia.com/lookup/${cleanedNumber}`

    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })

    const $ = cheerio.load(res.data)
    const name = $('div.commentbox h3').first().text().trim()
    const description = $('div.commentbox p').first().text().trim()

    const callerType = $('div#listing h2').text().trim()
    const tags = []
    $('span.tag').each((_, el) => tags.push($(el).text().trim()))

    return {
      url,
      name: name || null,
      description: description || null,
      callerType: callerType || null,
      tags: tags.length ? tags : null
    }
  } catch (err) {
    return {
      error: 'Lookup failed or no data found',
      message: err.message
    }
  }
}

module.exports = { reverseAustraliaLookup };