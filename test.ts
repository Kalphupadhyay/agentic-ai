import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import axios from "axios";

export async function downloadWebsite(
  url: string,
  outputDir: string = "./downloaded_website"
) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // Get full HTML content
  const htmlContent = await page.content();
  fs.writeFileSync(path.join(outputDir, "index.html"), htmlContent, "utf8");

  // Extract and download CSS and JS
  const resources = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    ).map((l) => l.href);
    const scripts = Array.from(document.querySelectorAll("script[src]")).map(
      (s) => s.src
    );
    const imgs = Array.from(document.querySelectorAll("img")).map(
      (img) => img.src
    );
    return { links, scripts, imgs };
  });

  // Helper to download files
  async function downloadFile(fileUrl, folder) {
    try {
      const filename = path.basename(new URL(fileUrl).pathname);
      const filepath = path.join(folder, filename);
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      fs.writeFileSync(filepath, response.data);
    } catch (err) {
      console.log(`Failed to download ${fileUrl}: ${err.message}`);
    }
  }

  // Create subfolders
  const cssDir = path.join(outputDir, "css");
  const jsDir = path.join(outputDir, "js");
  const imgDir = path.join(outputDir, "images");

  [cssDir, jsDir, imgDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  });

  // Download CSS
  for (const css of resources.links) {
    await downloadFile(css, cssDir);
  }

  // Download JS
  for (const js of resources.scripts) {
    await downloadFile(js, jsDir);
  }

  // Download images
  for (const img of resources.imgs) {
    await downloadFile(img, imgDir);
  }

  await browser.close();
  await fixCssLinks(path.join(outputDir, "index.html"), cssDir);
  return `Website downloaded to ${outputDir}`;
}

function fixCssLinks(htmlFilePath: string, cssFolder: string) {
  if (!fs.existsSync(htmlFilePath)) {
    console.error("HTML file not found:", htmlFilePath);
    return;
  }

  let html = fs.readFileSync(htmlFilePath, "utf8");

  // Match all <link rel="stylesheet" href="...">
  const regex = /<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["'].*?>/gi;

  html = html.replace(regex, (match, href) => {
    const filename = path.basename(href); // extract filename only
    return `<link rel="stylesheet" href="./css/${filename}">`;
  });

  fs.writeFileSync(htmlFilePath, html, "utf8");
  console.log("CSS links updated successfully!");
}

downloadWebsite("https://hiteshchoudhary.com/");
