import fs from 'fs';

const path = 'src/features/products/components/QuickViewModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("createPortal")) {
  // Import createPortal
  content = content.replace("import { useEffect } from 'react';", "import { useEffect } from 'react';\nimport { createPortal } from 'react-dom';");
  
  // Wrap return in createPortal
  content = content.replace("  return (", "  return createPortal(");
  // The last bracket needs to be closed. Find the end of the return statement.
  // The return is the last statement in the component.
  content = content.replace(/  \);\n};\n$/, "  ),\n  document.body\n  );\n};\n");
  fs.writeFileSync(path, content);
}
