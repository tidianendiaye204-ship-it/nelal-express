
const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "components/RealtimeNotifications.tsx",
  "components/PhotoUploadButton.tsx",
  "components/LiveTracker.tsx",
  "app/auth/login/page.tsx",
  "app/auth/signup/page.tsx",
  "components/LiveOrderUpdater.tsx",
  "components/LiveClientUpdater.tsx"
];

const basePath = "c:/src/mes projets/nelal-express";

filesToUpdate.forEach(fileRelPath => {
  const fullPath = path.join(basePath, fileRelPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/@\/lib\/supabase\/client/g, '@/utils/supabase/client');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${fileRelPath}`);
  } else {
    console.warn(`File not found: ${fileRelPath}`);
  }
});
