
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRecentConvos() {
  console.log('--- Dernières Conversations WhatsApp ---');
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Erreur Supabase:', error);
    return;
  }

  if (data.length === 0) {
    console.log('Aucune conversation trouvée.');
  } else {
    data.forEach(convo => {
      console.log(`[${convo.updated_at}] WA_ID: ${convo.wa_id} | État: ${convo.state} | Data: ${JSON.stringify(convo.data)}`);
    });
  }
  console.log('----------------------------------------');
}

checkRecentConvos();
