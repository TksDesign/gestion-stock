import fs from 'fs';
const path = 'src/features/products/components/QuickViewModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the end of the file with the correct syntax
content = content.replace("  ),\n  document.body\n  );\n};\n", "  ),\n  document.body\n);\n};\n");
// wait, if I just write it manually it's safer. Let's just sed it.
