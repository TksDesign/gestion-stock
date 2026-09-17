import fs from 'fs';
import path from 'path';

// Hand-picked ultra premium tech images
const premiumImages = [
  "photo-1611186871340-1b26bc6594b5", // 0 MacBook Dark
  "photo-1618366712010-f4ae9c647dcb", // 1 Premium Headphones
  "photo-1546868871-7041f2a55e12", // 2 Apple Watch
  "photo-1605236453806-6fa3685824c0", // 3 iPhone Pro Dark
  "photo-1600267175161-c47022e11f11", // 4 Dark RGB Setup / Ultrawide
  "photo-1508614589041-8f56d56fc678", // 5 Drone DJI
  "photo-1516035069371-29a1b244cc32", // 6 Sony Alpha Camera
  "photo-1595225476474-8752175856f2", // 7 RGB Mechanical Keyboard
  "photo-1544244015-0422c541c888", // 8 iPad Pro with pencil
  "photo-1606220588913-b3eea415a2ed", // 9 AirPods Pro
];

const filesToProcess = [
  'src/components/sections/SharedSections.tsx',
  'src/components/auth/AuthModal.tsx',
  'src/pages/Home.tsx',
  'src/pages/Favorites.tsx',
  'src/pages/Products.tsx',
  'src/pages/ProductDetails.tsx',
];

// Let's create a deterministic mapping based on the currently found photo IDs.
let uniqueOldPhotos = new Set();
filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/photo-[a-zA-Z0-9-]+/g) || [];
    matches.forEach(m => uniqueOldPhotos.add(m));
  }
});

const oldPhotosArray = Array.from(uniqueOldPhotos);
const map = {};
oldPhotosArray.forEach((old, index) => {
  map[old] = premiumImages[index % premiumImages.length];
});

// Exceptional overrides for specific hero sections to look amazing:
const OVERRIDES = {
  // Home hero banners
  'photo-1615663245857-ac93bb7c3c9c': 'photo-1600267175161-c47022e11f11', // Desktop setup
  'photo-1546868871-7041f2a55e12': 'photo-1544244015-0422c541c888', // iPad
  'photo-1583394838336-acd977736f90': 'photo-1605236453806-6fa3685824c0', // iPhone
  'photo-1593640408182-31c70c8268f5': 'photo-1611186871340-1b26bc6594b5', // MacBook
  // Products page hero
  'photo-1550745165-9bc0b252726f': 'photo-1550745165-9bc0b252726f', // Leave it or replace? Let's use the neon matrix one: photo-1550745165-9bc0b252726f is actually pretty good. Let's change it to a sick dark tech layout.
};
OVERRIDES['photo-1550745165-9bc0b252726f'] = 'photo-1518770660439-4636190af475';

// Also replace titles in Home to match
const titleReplacements = [
  { old: "MacBook Pro M3", new: "MacBook Pro 16\" M3 Max" },
  { old: "Sony WH-1000XM5", new: "Sony WH-1000XM5" },
  { old: "Keychron Q1 Pro", new: "Custom RGB Mechanical Keyboard" },
  { old: "Apple Watch Ultra", new: "Apple Watch Ultra 2" },
  { old: "iPad Pro 12.9", new: "iPad Pro 12.9\" M2" },
  { old: "Logitech MX Master 3S", new: "Sony Alpha A7 IV" },
];

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/photo-[a-zA-Z0-9-]+/g, (match) => {
      if (OVERRIDES[match]) return OVERRIDES[match];
      return map[match] || premiumImages[0];
    });

    titleReplacements.forEach(tr => {
      content = content.replace(new RegExp(tr.old, 'g'), tr.new);
    });

    fs.writeFileSync(file, content);
  }
});

console.log("Images swapped with ultra-premium set!");
