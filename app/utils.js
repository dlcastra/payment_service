const axios = require('axios');
const crypto = require("crypto")

const {Transaction} = require("../models/transaction")
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

function verifySignature(req, publicKey, xSign) {
    if (!publicKey) {
        throw new Error('Public key is undefined');
    }

    if (!req.body) {
        throw new Error('Request body is undefined');
    }

    const publicKeyPem = Buffer.from(publicKey, "base64").toString("utf-8");
    const signature = Buffer.from(xSign, 'base64');
    const bodyBytes = Buffer.from(JSON.stringify(req.body), 'utf-8');

    const verify = crypto.createVerify('SHA256');
    verify.update(bodyBytes);
    verify.end();

    const isValid = verify.verify(publicKeyPem, signature);
    if (!isValid) {
        throw new Error("Signature is not valid");
    }

    return isValid;
}

async function createInvoice(req, uuid, webhook_url) {
    const amount = req.body["amount"];
    const currency = req.body["ccy"];

    const merchants_info = {
        "reference": uuid,
        "destination": "Transaction from credit card to wallet app",
    };
    const request_body = {
        "webHookUrl": webhook_url,
        "amount": amount,
        "ccy": currency,
        "merchantPaymInfo": merchants_info
    };

    try {
        const response = await axios.post(
            "https://api.monobank.ua/api/merchant/invoice/create",
            request_body,
            {
                headers: {'X-Token': MONOBANK_TOKEN}
            }
        );
        const invoiceUrl = response.data.pageUrl;
        console.log(response.status);
        return invoiceUrl;

    } catch (error) {
        console.error('Error creating invoice:', error);
        return {error: error}
    }
}

async function createTransaction(req, transactionId, invoiceUrl) {
    try {
        return await Transaction.create({
            transactionId: transactionId,
            userId: req.body["userId"],
            userWalletAddr: req.body["walletAddr"],
            amount: req.body["amount"],
            ccy: req.body["ccy"].toString(),
            invoiceUrl: invoiceUrl
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return false;
    }
}

async function updateTransactionStatus(reference, status) {
    const transaction = await Transaction.findOne({ where: { transactionId: reference } });
    if (!transaction) {
        console.warn(`Transaction with ID "${reference}" not found`)
        return false;
    }

    transaction.transactionStatus = status;
    await transaction.save();

    console.info(`Status of transaction "${reference}" updated to "${status}"`);
    return true
}

async function sendToDjangoWebhook(body, reference, status, webhookUrl) {
    const djangoWebhookUrl = webhookUrl;
    const transaction = await Transaction.findOne({ where: { transactionId: reference } });
    if (!transaction) {
        console.warn(`Transaction with ID "${reference}" not found`)
        return { success: false, error: "Transaction not found" };
    }

    try {
        await axios.post(djangoWebhookUrl, {
            user_id: transaction.userId,
            transactionId: reference,
            invoiceId: body.invoiceId,
            ccy: body.ccy,
            amount: transaction.amount,
            status: status,
        });
        console.log("Data successfully sent to store_service");
        return { success: true };
    } catch (error) {
        console.error(`Failed to send data to Django: ${error.message}`)
        return { success: false, error: error.message };
    }
}


// EXPORT
module.exports = {
    getMonobankPublicKey,
    verifySignature,
    createInvoice,
    createTransaction,
    updateTransactionStatus,
    sendToDjangoWebhook
}