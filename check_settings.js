
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const ID_INSTANCE = env.GREEN_API_ID_INSTANCE;
const API_TOKEN_INSTANCE = env.GREEN_API_TOKEN_INSTANCE;

async function checkWebhookSettings() {
  console.log('--- Vérification des Paramètres Webhook Green-API ---');
  try {
    const response = await fetch(
      `https://api.green-api.com/waInstance${ID_INSTANCE}/getSettings/${API_TOKEN_INSTANCE}`
    );
    const data = await response.json();
    console.log('Paramètres actuels:', JSON.stringify(data, null, 2));

    if (!data.webhookUrl) {
      console.log('❌ Webhook URL non défini !');
    } else {
      console.log('✅ Webhook URL:', data.webhookUrl);
    }
    
    console.log('webhookUrlToken:', data.webhookUrlToken);
    
  } catch (err) {
    console.error('Erreur:', err);
  }
}

checkWebhookSettings();
