const axios = require('axios');
const crypto = require("crypto")

const MONOBANK_TOKEN = process.env.MONOBANK_TOKEN;

async function getMonobankPublicKey() {
    try {
        const response = await axios.get(
            'https://api.monobank.ua/api/merchant/pubkey',
            {headers: {'X-Token': MONOBANK_TOKEN}}
        );
        return response.data.key;
    } catch (error) {
        console.error('Error fetching Monobank public key:', error);
        throw error;
    }
}

function verifySignature(req, publicKey) {
    if (!publicKey) {
        throw new Error('Public key is undefined');
    }

    if (!req.body) {
        throw new Error('Request body is undefined');
    }

    const xSignBase64 = req.headers['X-Sign'];
    if (!xSignBase64) {
        throw new Error('X-Sign header is missing');
    }

    const bodyBytes = Buffer.from(JSON.stringify(req.body));
    const signatureBytes = Buffer.from(xSignBase64, 'base64');

    const verify = crypto.createVerify('sha256');
    verify.update(bodyBytes);
    verify.end();

    const isValid = crypto.verify(publicKeyBytes, signatureBytes)
    if (!isValid) {
        throw new Error("Signature is not valid")
    }

    return isValid
}

// EXPORT
module.exports = {
    getMonobankPublicKey,
    verifySignature
}