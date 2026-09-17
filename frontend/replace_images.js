import fs from 'fs';
import path from 'path';

// List of cool tech images from Unsplash (IDs only, to preserve query params like w=800 etc where possible, or replace entire URL)
const techImageUrls = [
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5", // Laptop
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", // Headphones
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30", // Watch
  "https://images.unsplash.com/photo-1511707171634-5f8c7eece11d", // Phone
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", // Desk setup
  "https://images.unsplash.com/photo-1518770660439-4636190af475", // Circuit board / tech
  "https://images.unsplash.com/photo-1527443195645-1133f7f28990", // Tech workspace
  "https://images.unsplash.com/photo-1615663245857-ac93bb7c3c9c", // Mechanical keyboard
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12", // Apple Watch
  "https://images.unsplash.com/photo-1583394838336-acd977736f90", // Airpods
];

const filesToProcess = [
  'src/components/sections/SharedSections.tsx',
  'src/components/auth/AuthModal.tsx',
  'src/pages/Home.tsx'
];

let counter = 0;

filesToProcess.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace unsplash image IDs. A generic unsplash URL looks like:
    // https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=...
    content = content.replace(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g, (match) => {
      // Keep testimonial avatars if they look like portraits (optional, but let's replace all with tech setups or diverse avatars if we had them. Let's just use tech for everything except avatars).
      // Wait, the prompt says "toutes des image de la tech". Let's replace ALL of them.
      const newUrl = techImageUrls[counter % techImageUrls.length];
      counter++;
      return newUrl;
    });

    // We also need to fix texts in Home.tsx that say "Women's Fashion", "Men Fashion", etc.
    content = content.replace(/Women Fashion/g, "Latest Gadgets");
    content = content.replace(/Men Fashion/g, "Pro Setup");
    content = content.replace(/Women's Fashion/g, "Laptops");
    content = content.replace(/Men's Fashion/g, "Audio");
    content = content.replace(/Women's Accessories/g, "Accessories");
    content = content.replace(/Men's Accessories/g, "Wearables");

    // Also change MOCK titles
    content = content.replace(/'Shiny Dress'/g, "'MacBook Pro M3'");
    content = content.replace(/'Long Dress'/g, "'Sony WH-1000XM5'");
    content = content.replace(/'Full Sweater'/g, "'Keychron Q1 Pro'");
    content = content.replace(/'White Dress'/g, "'Apple Watch Ultra'");
    content = content.replace(/'Colorful Dress'/g, "'iPad Pro 12.9'");
    content = content.replace(/'White Shirt'/g, "'Logitech MX Master 3S'");
    content = content.replace(/'Al Karam'/g, "'Premium Tech'");
    
    // SharedSections.tsx fixes
    content = content.replace(/"White Dress"/g, '"MacBook Air"');
    content = content.replace(/"Black Dress"/g, '"AirPods Pro 2"');
    content = content.replace(/"Red Dress"/g, '"Razer Blade 15"');

    fs.writeFileSync(filePath, content);
  }
});

console.log("Replaced images and text successfully.");
