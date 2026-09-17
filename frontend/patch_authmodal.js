import fs from 'fs';

const path = 'src/components/auth/AuthModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("document.body.style.overflow = 'hidden'")) {
  content = content.replace(
    "const [isLoading, setIsLoading] = useState(false);",
    "const [isLoading, setIsLoading] = useState(false);\n\n  useEffect(() => {\n    if (isOpen) {\n      document.body.style.overflow = 'hidden';\n    } else {\n      document.body.style.overflow = 'unset';\n    }\n    return () => { document.body.style.overflow = 'unset'; };\n  }, [isOpen]);"
  );
  if (!content.includes("import { useEffect")) {
    content = content.replace("import { useState }", "import { useState, useEffect }");
  }
  fs.writeFileSync(path, content);
}
