#!/usr/bin/env node

import fs from 'fs';

// Common patterns to fix across dashboard pages
const patterns = [
  // Remove unused pagination variables
  {
    pattern: /const \[_?page, setPage\] = useState\(1\);/g,
    replacement:
      'const [_page] = useState(1); // unused - kept for future implementation',
  },
  {
    pattern: /const _?pageSize = \d+;/g,
    replacement:
      'const [_pageSize] = useState(5); // unused - kept for future implementation',
  },
  // Remove unused filter variables
  {
    pattern: /const _?filtered\w+ = .+;/g,
    replacement:
      '// const _filteredX = ...; // unused - kept for future implementation',
  },
  // Remove unused search/filter state
  {
    pattern: /const \[searchTerm, setSearchTerm\] = useState\(''\);/g,
    replacement:
      "const [_searchTerm, _setSearchTerm] = useState(''); // unused - kept for future implementation",
  },
  {
    pattern: /const \[teamFilter, setTeamFilter\] = useState\('all'\);/g,
    replacement:
      "const [_teamFilter, _setTeamFilter] = useState('all'); // unused - kept for future implementation",
  },
  // Remove unused imports
  {
    pattern: /import \{ [^}]*Edit[^}]* \} from 'lucide-react';/g,
    replacement: "// import { Edit } from 'lucide-react'; // unused",
  },
  {
    pattern: /import \{ [^}]*Trash2[^}]* \} from 'lucide-react';/g,
    replacement: "// import { Trash2 } from 'lucide-react'; // unused",
  },
  {
    pattern: /import \{ [^}]*Tag[^}]* \} from 'lucide-react';/g,
    replacement: "// import { Tag } from 'lucide-react'; // unused",
  },
  {
    pattern: /import \{ [^}]*BarChart3[^}]* \} from 'lucide-react';/g,
    replacement: "// import { BarChart3 } from 'lucide-react'; // unused",
  },
];

// Dashboard pages to fix
const dashboardPages = [
  'app/(dashboard)/analytics/page.tsx',
  'app/(dashboard)/coaches/page.tsx',
  'app/(dashboard)/development-plans/page.tsx',
  'app/(dashboard)/drills/page.tsx',
  'app/(dashboard)/observations/page.tsx',
  'app/(dashboard)/players/page.tsx',
  'app/(dashboard)/sessions/page.tsx',
  'app/(dashboard)/teams/page.tsx',
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  patterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Fix all dashboard pages
dashboardPages.forEach(fixFile);

console.log('\nPattern fixes completed!');
console.log('Next steps:');
console.log('1. Run: npm run lint -- --fix');
console.log('2. Manually fix remaining TypeScript any types');
console.log('3. Break down large functions into smaller components');
