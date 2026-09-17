import fs from 'fs';

const path = 'src/components/cart/MiniCart.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("document.body.style.overflow = 'hidden'")) {
  content = content.replace(
    "const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();",
    "const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();\n\n  useEffect(() => {\n    if (isOpen) {\n      document.body.style.overflow = 'hidden';\n    } else {\n      document.body.style.overflow = 'unset';\n    }\n    return () => { document.body.style.overflow = 'unset'; };\n  }, [isOpen]);"
  );
  if (!content.includes("import { useEffect")) {
    content = content.replace("import { useState }", "import { useState, useEffect }");
  } else {
    content = content.replace("import { useState }", "import { useState, useEffect }"); // fallback if separate
  }
  fs.writeFileSync(path, content);
}
