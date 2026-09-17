import fs from 'fs';

function addFavoritesToNavbar(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes("useFavoritesStore")) {
    // 1. Add import for store
    content = content.replace(
      "import { useCartStore } from '../../store/cartStore';",
      "import { useCartStore } from '../../store/cartStore';\nimport { useFavoritesStore } from '../../store/favoritesStore';"
    );
    
    // 2. Add Heart icon import from lucide-react
    if (!content.includes("Heart,")) {
      content = content.replace(
        "import { Moon, Sun, User, Menu, X, ChevronDown } from 'lucide-react';",
        "import { Moon, Sun, User, Menu, X, ChevronDown, Heart } from 'lucide-react';"
      );
      content = content.replace(
        "import { Moon, Sun, Search, User, Menu, X } from 'lucide-react';",
        "import { Moon, Sun, Search, User, Menu, X, Heart } from 'lucide-react';"
      );
    }
    
    // 3. Add state hook
    content = content.replace(
      "const cartCount = items.reduce((total, item) => total + item.quantity, 0);",
      "const cartCount = items.reduce((total, item) => total + item.quantity, 0);\n  const favCount = useFavoritesStore(state => state.favoriteIds.length);"
    );
    
    // 4. Insert Heart button right before Cart button
    const favButton = `
            <button 
              onClick={() => alert("Favoris ajoutés : " + favCount + " articles")}
              className="relative text-gray-900 dark:text-white hover:text-red-500 transition-colors p-2 cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {favCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-full">
                  {favCount}
                </span>
              )}
            </button>
`;
    content = content.replace(
      /<button \s*onClick=\{openCart\}/,
      favButton + "\n            <button \n              onClick={openCart}"
    );
    
    fs.writeFileSync(path, content);
  }
}

addFavoritesToNavbar('src/components/layout/HomeNavbar.tsx');
addFavoritesToNavbar('src/components/layout/ShopNavbar.tsx');
