import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve('app/(dashboard)');
const DASHBOARD_IMPORT = `import { DashboardLayout } from "@/components/layouts/DashboardLayout"`;

function removeZod(content: string): string {
  content = content.replace(
    /^[ \t]*(?:\/\/)?[ \t]*import\s+\{?\s*z\s*\}?\s+from\s+['"]zod['"];?\s*$/gm,
    ''
  );
  content = content.replace(
    /const\s+\w+\s*=\s*z\.(object|array)\s*\([^;]*\);?/gms,
    ''
  );
  content = content.replace(
    /\w+\s*=\s*\w+\.(safeParse|parse|validate)\([^;]*\);?/gms,
    ''
  );
  content = content.replace(
    /(await\s+)?\w+\.(safeParse|parse|validate)\([^;]*\);?/gms,
    '// validation removed'
  );
  content = content.replace(
    /^[ \t]*,?[ \t]*\w+:\s*z\.[a-zA-Z0-9_\(\)\.\[\]"'\s,]*,?[ \t]*$/gm,
    ''
  );
  content = content.replace(/\n{2,}/g, '\n');
  return content;
}

function replaceReturnWithDashboardLayout(content: string): {
  content: string;
  replaced: boolean;
  returnIndex: number;
} {
  const dashboardScaffold = `return (\n  <DashboardLayout\n    left={\n      <div className=\"space-y-4\">\n        {/* TODO: Port your left sidebar content here */}\n      </div>\n    }\n    center={\n      <div className=\"space-y-4\">\n        {/* TODO: Port your main content here */}\n      </div>\n    }\n    right={\n      <div className=\"space-y-4\">\n        {/* TODO: Port your right sidebar content here */}\n      </div>\n    }\n  />\n);`;
  let replaced = false;
  let returnIndex = -1;
  content = content.replace(/return\s*\(([^;]*?)\);/gs, (match, p1, offset) => {
    if (!replaced) {
      replaced = true;
      returnIndex = offset;
      return dashboardScaffold;
    }
    return match;
  });
  if (!replaced) {
    content =
      `// TODO: MANUAL REVIEW - Could not confidently replace main return with DashboardLayout\n` +
      content;
  }
  return { content, replaced, returnIndex };
}

function ensureDashboardImport(content: string): string {
  if (!content.includes('DashboardLayout')) {
    const importMatch = content.match(/import\s+.*?from\s+['"][^'"]*['"];?\n?/);
    if (importMatch) {
      return content.replace(
        importMatch[0],
        importMatch[0] + DASHBOARD_IMPORT + ';\n'
      );
    } else {
      return DASHBOARD_IMPORT + ';\n' + content;
    }
  }
  return content;
}

function removeOrphanedCodeAfterReturn(
  content: string,
  returnIndex: number
): string {
  if (returnIndex === -1) return content;
  // Find the next closing curly brace after the returnIndex (end of function)
  const afterReturn = content.slice(returnIndex);
  const closingIndex = afterReturn.indexOf('}');
  if (closingIndex !== -1) {
    // Keep everything up to and including the closing brace
    return (
      content.slice(0, returnIndex + closingIndex + 1) +
      '\n// TODO: Cleaned up orphaned code after DashboardLayout return.'
    );
  } else {
    // If no closing brace, just keep up to the end
    return (
      content.slice(0, returnIndex) +
      '\n// TODO: MANUAL REVIEW - Could not find function end after DashboardLayout return.'
    );
  }
}

function simplifyPage(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = removeZod(content);
  const {
    content: replacedContent,
    replaced,
    returnIndex,
  } = replaceReturnWithDashboardLayout(content);
  let cleanedContent = replacedContent;
  if (replaced) {
    cleanedContent = removeOrphanedCodeAfterReturn(
      replacedContent,
      returnIndex
    );
  }
  cleanedContent = ensureDashboardImport(cleanedContent);
  fs.writeFileSync(filePath, cleanedContent, 'utf8');
  console.log(`✅ Cleaned: ${filePath}`);
}

function findPageFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPageFiles(fullPath);
    } else if (entry.name === 'page.tsx') {
      simplifyPage(fullPath);
    }
  }
}

findPageFiles(PAGES_DIR);
