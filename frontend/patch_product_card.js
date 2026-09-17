import fs from 'fs';

const path = 'src/features/products/components/ProductCard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes("useFavoritesStore")) {
  content = content.replace(
    "import { useCartStore } from '../../../store/cartStore';",
    "import { useCartStore } from '../../../store/cartStore';\nimport { useFavoritesStore } from '../../../store/favoritesStore';"
  );
  
  // Add hooks inside component
  content = content.replace(
    "const openCart = useCartStore(state => state.openCart);",
    "const openCart = useCartStore(state => state.openCart);\n  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);\n  const isFav = useFavoritesStore(state => state.favoriteIds.includes(id));"
  );
  
  // Modify the heart button onClick and icon style
  content = content.replace(
    /onClick=\{\(e\) => e.preventDefault\(\)\}\s*>\s*<Heart className="w-4 h-4" \/>/,
    `onClick={(e) => { e.preventDefault(); toggleFavorite(id); }}\n        >\n          <Heart className={\`w-4 h-4 transition-colors \${isFav ? 'fill-red-500 text-red-500' : ''}\`} />`
  );
  
  // Note: the button opacity logic currently fades it out when not hovered. 
  // We probably want it to be permanently visible if it's a favorite!
  content = content.replace(
    "animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}",
    "animate={{ opacity: (isHovered || isFav) ? 1 : 0, x: (isHovered || isFav) ? 0 : 20 }}"
  );

  fs.writeFileSync(path, content);
}
