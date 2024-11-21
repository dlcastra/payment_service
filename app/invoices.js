// Base
// ...
// Installed
const express = require('express');
const {v4: uuidv4} = require('uuid');
// Local
const {
    getMonobankPublicKey,
    verifySignature,
    createInvoice,
    createTransaction
} = require("../app/utils");

const {updateTransactionStatus, sendToDjangoWebhook} = require("./utils");

const router = express.Router();

router.post("/make-transaction", async (req, res) => {
    const transactionId = uuidv4();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const webhookUrl = `${baseUrl}/webhook`;

    const invoiceUrl = await createInvoice(req, transactionId, webhookUrl)
    if (!invoiceUrl) {
        return res.status(500).json({error: "Invoice creation failed."});
    }

    const transaction = await createTransaction(req, transactionId, invoiceUrl)
    if (!transaction) {
        return res.status(400).json({error: "Invalid data. Transaction could not be created."});
    }
    transaction.invoiceUrl = invoiceUrl;

    res.status(201).json({"details": {transactionId, invoiceUrl}});
})

router.post("/webhook", async (req, res) => {
    const publicKey = await getMonobankPublicKey();

    // Check signature
    try {
        const xSign = req.headers["x-sign"];
        if (!xSign) {
            return res.status(400).json({error: "Header is missing"});
        }
        const isValid = verifySignature(req, publicKey, xSign);
        if (isValid) {
            console.log("Signature is valid");
        } else {
            return res.status(400).json({error: "Invalid signature"});
        }
    } catch (error) {
        console.error("Error verifying signature:", error.message);
        return res.status(400).json({error: error.message});
    }

    // Transaction status
    const {reference, status} = req.body;
    if (status) {
        const is_updated = await updateTransactionStatus(reference, status);
        if (!is_updated) {
            console.log("Reference not found")
            return res.status(404).json({error: "Reference not found"})
        }
    }

    // Callback
    const djangoWebhookUrl = "http://host.docker.internal:8000/api/wallet/webhook/";
    const is_sent = await sendToDjangoWebhook(req.body, reference, status, djangoWebhookUrl);

    if (!is_sent.success) {
        return res.status(400).json({ error: is_sent.error || "Failed to send data to webhook" });
    }

    res.status(200).json({message: "OK"});
});

module.exports = router;