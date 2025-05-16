const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { googleSearch } = require('./utils/googleSearch');
const { verifyPhone } = require('./utils/numVerify');
const { checkEmailBreach } = require('./utils/hibp');
const { searchHunter } = require('./utils/hunter');
const { checkSocialLinks } = require('./utils/social');
const { searchNumberOnline } = require('./utils/duckSearch');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
    const phone = await ask('📞 Enter a phone number (e.g. +1234567890): ');
    const email = await ask('✉️  Enter an email to check for breaches: ');
    console.log('\n🔍 Running OSINT...\n');

    const phoneInfo = await verifyPhone(phone);
    const googleResults = await googleSearch(phone);
    const duckResults = await searchNumberOnline(phone);
    const breachResults = await checkEmailBreach(email);
    const hunterResults = await searchHunter(email);
    const socialLinks = await checkSocialLinks(email, phoneInfo);


    const report = {
        timestamp: new Date().toISOString(),
        phone,
        email,
        phoneInfo,
        googleResults,
        duckResults,
        breaches: breachResults,
        hunter: hunterResults,
        socialProfiles: socialLinks
    };

    console.log('📞 Phone Info:', phoneInfo);
    if (!googleResults.error) {
        const socialLinks = googleResults.filter(r => r.isSocial).map(r => r.url);
        const otherLinks = googleResults.filter(r => !r.isSocial).map(r => r.url);

        console.log('\n🔍 Google Social Links:\n', socialLinks.join('\n') || 'None found');
        console.log('\n🔍 Google Other Links:\n', otherLinks.join('\n') || 'None found');

        report.googleResults = { socialLinks, otherLinks };
    } else {
        console.log('\n🔍 Google Search Error:', googleResults.error);
        report.googleResults = { error: googleResults.error };
    }
    // console.log('\n🔗 Google Links:\n', googleResults.join('\n') || 'None found');
    //   console.log('\n🔎 DuckDuckGo Links:\n', duckResults.join('\n') || 'None found');
    if (!duckResults.error) {
        const socialLinks = duckResults.filter(r => r.isSocial).map(r => r.url);
        const otherLinks = duckResults.filter(r => !r.isSocial).map(r => r.url);

        console.log('\n🔎 DuckDuckGo Social Links:\n', socialLinks.join('\n') || 'None found');
        console.log('\n🔎 DuckDuckGo Other Links:\n', otherLinks.join('\n') || 'None found');

        // Add to your report object
        report.duckResults = { socialLinks, otherLinks };
    } else {
        console.log('\n🔎 DuckDuckGo Search Error:', duckResults.error);
        report.duckResults = { error: duckResults.error };
    }
    console.log('\n🛡️ Email Breaches:\n');
    if (breachResults?.error) console.log(`❌ ${breachResults.error}`);
    else if (breachResults.length === 0) console.log('✅ No breaches found!');
    else breachResults.forEach(b => {
        console.log(`🔓 ${b.name} (${b.domain})`);
        console.log(`  Date: ${b.date}`);
        console.log(`  Data: ${b.data.join(', ')}`);
        console.log(`  Verified: ${b.verified}\n`);
    });

    console.log('\n🔍 Hunter.io Info:', hunterResults);
    console.log('\n🌐 Social Profiles:', socialLinks.join('\n') || 'None found');

    const fileName = `report-${Date.now()}.json`;
    const filePath = path.join(__dirname, 'reports', fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${filePath}`);

    rl.close();
})();