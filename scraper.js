const fs = require('fs');

const sourceUrls = [
  "https://raw.githubusercontent.com/Mosifree/-FREE2CONFIG/refs/heads/main/Reality",
  "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
  "https://raw.githubusercontent.com/Epodonnis/v2ray-configs/main/All_Configs_Sub.txt",
  "https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray",
  "https://raw.githubusercontent.com/freefq/free/master/v2"
];

async function scrapeNodes() {
  console.log("🕷️ Starting Web Scraper...");
  let allLinks = new Set(); 

  for (const url of sourceUrls) {
    try {
      console.log(`⬇️ Fetching: ${url}`);
      const response = await fetch(url);
      if (!response.ok) continue;

      let text = await response.text();

      if (!text.includes('://')) {
        try {
          text = Buffer.from(text.trim(), 'base64').toString('utf-8');
        } catch (e) {
          console.log(`Skipping: Could not decode Base64 from ${url}`);
        }
      }

      const lines = text.split('\n');
      for (const line of lines) {
        const link = line.trim();
        if (link.startsWith('vless://') || link.startsWith('hy2://') || link.startsWith('hysteria2://') || link.startsWith('tuic://')) {
          allLinks.add(link);
        }
      }
    } catch (err) {
      console.error(`❌ Failed to fetch ${url}`);
    }
  }

  const finalLinks = Array.from(allLinks);
  console.log(`\n✅ Successfully scraped ${finalLinks.length} unique proxy nodes!`);

  if (finalLinks.length === 0) {
    console.log("No links found. Exiting...");
    process.exit(1);
  }

  const rawContent = finalLinks.join('\n');
  const base64Content = Buffer.from(rawContent).toString('base64');
  fs.writeFileSync('sub.txt', base64Content);

  const githubUsername = process.env.GITHUB_ACTOR || "YOUR_USERNAME";
  const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "proxy-master-list";
  const mySubscriptionUrl = `https://raw.githubusercontent.com/${githubUsername}/${repoName}/main/sub.txt`;

  const masterData = {
    version: "1.0",
    last_updated: new Date().toISOString(),
    total_nodes_scraped: finalLinks.length,
    subscriptions: [
      mySubscriptionUrl
    ]
  };

  fs.writeFileSync('nodes.json', JSON.stringify(masterData, null, 2));
  console.log(`💾 Saved sub.txt and nodes.json successfully!`);
}

scrapeNodes();
