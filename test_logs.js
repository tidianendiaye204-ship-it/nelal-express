
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testLogging() {
  console.log('--- Test manuel de LOGGING dans whatsapp_logs ---');
  const payload = {
    typeWebhook: 'test_local_script',
    senderData: { chatId: '12345@c.us' },
    messageData: { textMessageData: { textMessage: 'Hello' } }
  };
  
  const { data, error } = await supabase.from('whatsapp_logs').insert({
    type_webhook: 'test_local_script',
    payload: payload,
    wa_id: '12345'
  }).select();

  if (error) {
    console.error('❌ Erreur insertion log:', error);
  } else {
    console.log('✅ Log inséré avec succès:', data);
  }
}

testLogging();
