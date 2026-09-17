import fs from 'fs';

const premiumImagesStr = `
    'https://images.unsplash.com/photo-1611186871340-1b26bc6594b5?w=1200&q=80',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80',
    'https://images.unsplash.com/photo-1605236453806-6fa3685824c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1600267175161-c47022e11f11?w=1200&q=80',
    'https://images.unsplash.com/photo-1595225476474-8752175856f2?w=1200&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
    'https://images.unsplash.com/photo-1544244015-0422c541c888?w=1200&q=80',
`;

const files = ['src/pages/Favorites.tsx', 'src/pages/Products.tsx', 'src/pages/ProductDetails.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match the TECH_IMAGES array and replace its contents
  content = content.replace(/const TECH_IMAGES = \[([\s\S]*?)\];/g, `const TECH_IMAGES = [${premiumImagesStr}];`);
  fs.writeFileSync(file, content);
});
