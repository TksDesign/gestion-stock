import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import { Favorites }")) {
  content = content.replace(
    "import { Products } from './pages/Products';",
    "import { Products } from './pages/Products';\nimport { Favorites } from './pages/Favorites';"
  );
  
  content = content.replace(
    '<Route path="/products" element={<Products />} />',
    '<Route path="/products" element={<Products />} />\n              <Route path="/favorites" element={<Favorites />} />'
  );
  fs.writeFileSync(path, content);
}
