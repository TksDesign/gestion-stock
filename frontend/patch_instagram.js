import fs from 'fs';

const path = 'src/components/sections/SharedSections.tsx';
let content = fs.readFileSync(path, 'utf8');

const instaImages = [
  "photo-1611186871340-1b26bc6594b5", // Mac
  "photo-1618366712010-f4ae9c647dcb", // Headphones
  "photo-1603302576837-37561b2e2302", // Neon laptop
  "photo-1525547719571-a2d4ac8945e2", // Setup
  "photo-1494173853739-c21f58b16055", // Keyboard
  "photo-1516035069371-29a1b244cc32"  // Camera
];

content = content.replace(
  "const InstaCard = ({ num, index, hoveredIndex, setHoveredIndex, scrollYProgress }) => {",
  `const instaImages = ${JSON.stringify(instaImages)};\n\nconst InstaCard = ({ num, index, hoveredIndex, setHoveredIndex, scrollYProgress }) => {`
);

content = content.replace(
  /src=\{\`https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+\?auto=format&fit=crop&q=80&w=800\`\}/,
  'src={`https://images.unsplash.com/${instaImages[index % instaImages.length]}?auto=format&fit=crop&q=80&w=800`}'
);

fs.writeFileSync(path, content);
console.log("Instagram section patched.");
