import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve('app/(dashboard)');
const DASHBOARD_IMPORT = `import { DashboardLayout } from "@/components/layouts/DashboardLayout";`;

function fixImports(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has the import
  if (content.includes('DashboardLayout')) {
    return;
  }

  // Add import after the first import statement
  const importMatch = content.match(/import\s+.*?from\s+['"][^'"]*['"];?\n?/);
  if (importMatch) {
    const updatedContent = content.replace(
      importMatch[0],
      importMatch[0] + DASHBOARD_IMPORT + '\n'
    );
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Fixed imports: ${filePath}`);
  } else {
    // If no imports found, add at the top
    const updatedContent = DASHBOARD_IMPORT + '\n' + content;
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Added import: ${filePath}`);
  }
}

function findPageFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPageFiles(fullPath);
    } else if (entry.name === 'page.tsx') {
      fixImports(fullPath);
    }
  }
}

findPageFiles(PAGES_DIR);
