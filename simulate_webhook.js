
const fs = require('fs');

async function testWebhook() {
  console.log('--- Simulant un Webhook entrant ---');
  const payload = {
    typeWebhook: 'incomingMessageReceived',
    senderData: {
      chatId: '221770000000@c.us',
      senderName: 'Test'
    },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: {
        textMessage: 'Commande'
      }
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/whatsapp/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
        const data = await response.json();
        console.log('Réponse du webhook:', data);
    } else {
        console.log('Erreur HTTP:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    }
  } catch (err) {
    console.error('Erreur de connexion (Serveur non lancé ?):', err.message);
  }
}

testWebhook();
