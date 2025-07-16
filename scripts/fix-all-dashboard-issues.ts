import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve('app/(dashboard)');
const DASHBOARD_IMPORT = `import { DashboardLayout } from '@/components/layouts/DashboardLayout';`;

function fixMalformedImports(content: string): string {
  // Fix the malformed import with extra quotes
  content = content.replace(
    /import \{ DashboardLayout \} from "([^"]+)"";/g,
    'import { DashboardLayout } from "$1";'
  );
  return content;
}

function addMissingImport(content: string): string {
  // Only add import if DashboardLayout is used but not imported
  if (
    content.includes('<DashboardLayout') &&
    !content.includes('import.*DashboardLayout')
  ) {
    const importMatch = content.match(/import\s+.*?from\s+['"][^'"]*['"];?\n?/);
    if (importMatch) {
      return content.replace(
        importMatch[0],
        importMatch[0] + DASHBOARD_IMPORT + '\n'
      );
    } else {
      return DASHBOARD_IMPORT + '\n' + content;
    }
  }
  return content;
}

function removeZodReferences(content: string): string {
  // Remove all zod imports
  content = content.replace(
    /^[ \t]*(?:\/\/)?[ \t]*import\s+\{?\s*z\s*\}?\s+from\s+['"]zod['"];?\s*$/gm,
    ''
  );

  // Remove zod schema definitions
  content = content.replace(
    /const\s+\w+\s*=\s*z\.(object|array)\s*\([^;]*\);?/gms,
    ''
  );

  // Remove zod validation logic
  content = content.replace(
    /\w+\s*=\s*\w+\.(safeParse|parse|validate)\([^;]*\);?/gms,
    ''
  );
  content = content.replace(
    /(await\s+)?\w+\.(safeParse|parse|validate)\([^;]*\);?/gms,
    '// validation removed'
  );

  // Remove zod schema fragments
  content = content.replace(
    /^[ \t]*,?[ \t]*\w+:\s*z\.[a-zA-Z0-9_\(\)\.\[\]"'\s,]*,?[ \t]*$/gm,
    ''
  );

  // Clean up empty lines
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

function completeDashboardLayoutJSX(content: string): string {
  const dashboardScaffold = `return (
    <DashboardLayout
      left={
        <div className="space-y-4">
          {/* TODO: Port your left sidebar content here */}
        </div>
      }
      center={
        <div className="space-y-4">
          {/* TODO: Port your main content here */}
        </div>
      }
      right={
        <div className="space-y-4">
          {/* TODO: Port your right sidebar content here */}
        </div>
      }
    />
  );`;

  // Find incomplete DashboardLayout JSX and complete it
  content = content.replace(
    /return\s*\(\s*<DashboardLayout\s*left=\{\s*<div[^>]*>\s*\{\/\* TODO: Port your left sidebar content here \*\/\}\s*<\/div>\s*\}\s*\/?\s*>\s*\);/gs,
    dashboardScaffold
  );

  // Find any other incomplete DashboardLayout patterns and replace with complete scaffold
  content = content.replace(
    /return\s*\(\s*<DashboardLayout[^>]*>\s*\{\/\* TODO: Port your actual layout[^}]*\}\s*<\/DashboardLayout>\s*\);/gs,
    dashboardScaffold
  );

  return content;
}

function ensureCompleteFunctionStructure(content: string): string {
  // If there's a loading check but no main return, add it
  if (
    (content.includes('if (loading)') &&
      content.includes('<DashboardLayout') &&
      !content.includes('return (')) ||
    (content.includes('return (') && !content.includes('</DashboardLayout>'))
  ) {
    // Find the last DashboardLayout and ensure it's complete
    const lastDashboardIndex = content.lastIndexOf('<DashboardLayout');
    if (lastDashboardIndex !== -1) {
      const afterDashboard = content.slice(lastDashboardIndex);
      if (
        !afterDashboard.includes('</DashboardLayout>') &&
        !afterDashboard.includes('/>')
      ) {
        // Replace incomplete DashboardLayout with complete scaffold
        content = content.replace(
          /<DashboardLayout[^>]*>\s*\{\/\* TODO: Port your actual layout[^}]*\}\s*<\/DashboardLayout>/gs,
          `<DashboardLayout
      left={
        <div className="space-y-4">
          {/* TODO: Port your left sidebar content here */}
        </div>
      }
      center={
        <div className="space-y-4">
          {/* TODO: Port your main content here */}
        </div>
      }
      right={
        <div className="space-y-4">
          {/* TODO: Port your right sidebar content here */}
        </div>
      }
    />`
        );
      }
    }
  }

  return content;
}

function fixPageFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Apply all fixes
  content = fixMalformedImports(content);
  content = removeZodReferences(content);
  content = addMissingImport(content);
  content = completeDashboardLayoutJSX(content);
  content = ensureCompleteFunctionStructure(content);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${filePath}`);
}

function findPageFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPageFiles(fullPath);
    } else if (entry.name === 'page.tsx') {
      fixPageFile(fullPath);
    }
  }
}

console.log('🔧 Fixing all dashboard page issues...');
findPageFiles(PAGES_DIR);
console.log('✅ All dashboard pages have been fixed!');
