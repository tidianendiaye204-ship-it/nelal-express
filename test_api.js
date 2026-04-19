
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const ID_INSTANCE = env.GREEN_API_ID_INSTANCE;
const API_TOKEN_INSTANCE = env.GREEN_API_TOKEN_INSTANCE;
const TEST_PHONE = '2217711165368'; // Admin phone from .env

async function testGreenApi() {
  console.log('--- Test Green-API Instance Status ---');
  try {
    const response = await fetch(
      `https://api.green-api.com/waInstance${ID_INSTANCE}/getStateInstance/${API_TOKEN_INSTANCE}`
    );
    const data = await response.json();
    console.log('État de l\'instance:', data);

    if (data.stateInstance === 'authorized') {
        console.log('Instance AUTORISÉE. Test d\'envoi...');
        const sendResp = await fetch(
          `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: `${TEST_PHONE}@c.us`,
              message: 'Test de connexion Nelal Express (Bot check)'
            })
          }
        );
        const sendData = await sendResp.json();
        console.log('Résultat envoi:', sendData);
    } else {
        console.log('ALERTE: L\'instance n\'est pas autorisée. Veuillez scanner le QR code.');
    }
  } catch (err) {
    console.error('Erreur test:', err);
  }
}

testGreenApi();
