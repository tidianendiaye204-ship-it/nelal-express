
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

const supabase = createClient(url, key);

async function testZones() {
    const { data: zones, error } = await supabase.from('zones').select('id, name');
    if (error) {
        console.error('Error fetching zones:', error);
        return;
    }
    console.log('Available Zones:', zones);

    const queries = ['Pikine', 'Plateau', 'Rufisque', 'Dakar Plateau', 'Yeumbeul'];
    
    for (const query of queries) {
        console.log(`\nTesting query: "${query}"`);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 200,
                system: `Tu es un assistant expert de la géographie du Sénégal. 
Ton rôle est d'associer la zone ou le quartier cité par l'utilisateur à l'une de nos zones de livraison.

Voici les zones disponibles : ${JSON.stringify(zones.map(z => ({ id: z.id, name: z.name })))}

Règles de matching :
1. Sois indulgent sur l'orthographe et les accents.
2. Si l'utilisateur cite un quartier spécifique qui appartient à une zone plus large dans la liste, choisis cette zone.
3. Réponds UNIQUEMENT avec le JSON suivant : {"zone_id": "ID", "zone_name": "NOM_ZONE_TROUVÉE"}.
4. Si vraiment aucune zone ne correspond, réponds {"zone_id": null}.
Ne donne aucune explication, juste le JSON.`,
                messages: [{ role: 'user', content: `L'utilisateur a écrit : "${query}"` }],
            }),
        });

        if (!response.ok) {
            console.error('Anthropic API Error:', response.status, await response.text());
            continue;
        }

        const result = await response.json();
        console.log('Claude response:', result.content[0].text);
    }
}

testZones();
