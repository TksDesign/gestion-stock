const fs = require('fs');
const path = 'src/features/products/components/QuickViewModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add useEffect import
content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { useEffect } from 'react';");

// Add useEffect logic
const hookLogic = `
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
`;
content = content.replace("const handleAddToCart = () => {", hookLogic + "\n  const handleAddToCart = () => {");

fs.writeFileSync(path, content);
