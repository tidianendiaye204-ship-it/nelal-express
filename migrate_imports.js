
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "app/dashboard/page.tsx",
  "app/dashboard/livreur/layout.tsx",
  "app/dashboard/layout.tsx",
  "app/dashboard/livreur/page.tsx",
  "app/dashboard/client/layout.tsx",
  "app/dashboard/livreur/disponibles/page.tsx",
  "app/dashboard/client/page.tsx",
  "app/dashboard/client/profil/page.tsx",
  "app/commander/page.tsx",
  "app/api/push/route.ts",
  "app/api/cron/daily-recap/route.ts",
  "app/dashboard/admin/zones/page.tsx",
  "actions/livreur.ts",
  "app/dashboard/admin/page.tsx",
  "actions/auth.ts",
  "app/dashboard/client/commandes/[id]/page.tsx",
  "app/dashboard/admin/layout.tsx",
  "app/dashboard/client/nouvelle-commande/page.tsx",
  "app/dashboard/client/commandes/page.tsx",
  "app/dashboard/admin/livreurs/page.tsx",
  "app/t/[token]/page.tsx",
  "app/dashboard/admin/orders/[id]/assign/page.tsx",
  "app/suivi/[id]/page.tsx",
  "actions/orders.ts",
  "actions/profile.ts",
  "actions/quartiers.ts",
  "actions/reperes.ts"
];

const basePath = "c:/src/mes projets/nelal-express";

filesToUpdate.forEach(fileRelPath => {
  const fullPath = path.join(basePath, fileRelPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/@\/lib\/supabase\/server/g, '@/utils/supabase/server');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${fileRelPath}`);
  } else {
    console.warn(`File not found: ${fileRelPath}`);
  }
});
