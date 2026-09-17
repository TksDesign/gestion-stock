import fs from 'fs';

const filesToProcess = [
  'src/components/sections/SharedSections.tsx',
  'src/components/auth/AuthModal.tsx',
  'src/pages/Home.tsx',
  'src/pages/Favorites.tsx',
  'src/pages/Products.tsx',
  'src/pages/ProductDetails.tsx',
];

const replacements = {
  'photo-1611186871340-1b26bc6594b5': 'photo-1517336714731-489689fd1ca8', 
  'photo-1600267175161-c47022e11f11': 'photo-1603302576837-37561b2e2302',
  'photo-1544244015-0422c541c888': 'photo-1525547719571-a2d4ac8945e2',
  'photo-1508614589041-8f56d56fc678': 'photo-1518770660439-4636190af475',
  'photo-1595225476474-8752175856f2': 'photo-1494173853739-c21f58b16055',
  'photo-1605236453806-6fa3685824c0': 'photo-1504610926078-a1611febcad3',
  'photo-1606220588913-b3eea415a2ed': 'photo-1583394838336-acd977736f90',
};

filesToProcess.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    for (const [bad, good] of Object.entries(replacements)) {
      content = content.replace(new RegExp(bad, 'g'), good);
    }

    fs.writeFileSync(file, content);
  }
});

console.log("Fixed 404 images!");
