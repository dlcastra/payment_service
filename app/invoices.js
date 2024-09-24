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

router.get("/check-signature", async (req, res) => {
    try {
        const publicKey = await getMonobankPublicKey();
        const checkSignature = verifySignature(req, publicKey);

        res.json({data: checkSignature});
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "An error occurred during signature verification"});

    }
});

router.post("/make-transaction", async (req, res) => {
    const transactionId = uuidv4();

    const invoiceUrl = await createInvoice(req, transactionId, "https://webhook.site/2968557e-0fca-4b6b-9c41-96828ec83aae",)
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

module.exports = router;