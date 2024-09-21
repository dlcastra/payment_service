const axios = require('axios');

const MONOBANK_TOKEN = process.env.MONOBANK_TOKEN;

async function getMonobankPublicKey() {
    try {
        const response = await axios.get('https://api.monobank.ua/api/merchant/pubkey', {
            headers: {'X-Token': MONOBANK_TOKEN}
        });
q
        return response.data.key;
    } catch (error) {
        console.error('Error fetching Monobank public key:', error);
        throw error;
    }
}

