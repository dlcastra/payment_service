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

    res.json({transactionId, invoiceUrl});
})

router.post("/webhook", async (req, res) => {
    const publicKey = await getMonobankPublicKey();

    try {
        const xSign = req.headers["x-sign"];
        if (!xSign) {
            return res.status(400).json({error: "Header is missing"});
        }

        const isValid = verifySignature(req, publicKey, xSign);
        if (isValid) {
            console.log("Signature is valid");
        } else {
            res.status(400).json({error: "Invalid signature"})
        }

    } catch (error) {
        console.error("Error verifying signature:", error.message);
        res.status(400).json({error: error.message});
    }
});

module.exports = router;