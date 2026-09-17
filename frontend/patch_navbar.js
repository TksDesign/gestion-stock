import fs from 'fs';

function patchNavbar(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes("useFavoritesStore")) {
    content = content.replace(
      "import { useCartStore } from '../../store/cartStore';",
      "import { useCartStore } from '../../store/cartStore';\nimport { useFavoritesStore } from '../../store/favoritesStore';"
    );
    
    // Sometimes it's missing useCartStore entirely? Let's check. 
    // Actually HomeNavbar has useCartStore. Let's see:
  }
  
  fs.writeFileSync(path, content);
}
patchNavbar('src/components/layout/HomeNavbar.tsx');
patchNavbar('src/components/layout/ShopNavbar.tsx');
