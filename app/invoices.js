// Base
// ...
// Installed
const {v4: uuidv4} = require('uuid');
const sequelize = require("../database")
// Local
const {PORT} = require("../core/settings");
const {app} = require("../core/middleware");
const {
    getMonobankPublicKey,
    verifySignature,
    createInvoice,
    createTransaction
} = require("../app/utils");


async function startServer() {
    try {
        await sequelize.sync({ force: false });
        console.log('Database & tables created!');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

app.get("/check-signature", async (req, res) => {
    try {
        const publicKey = await getMonobankPublicKey();
        const checkSignature = verifySignature(req, publicKey);

        res.json({data: checkSignature});
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error: "An error occurred during signature verification"});

    }
});

app.post("/make-transaction", async (req, res) => {
    const transactionId = uuidv4();
    const transaction = await createTransaction(req, transactionId)
    if (!transaction) {
        return res.status(400).json({error: "Invalid data. Transaction could not be created."});
    }

    const invoice = await createInvoice(
        req,
        "https://webhook.site/2968557e-0fca-4b6b-9c41-96828ec83aae"
    )
    res.json(invoice)
})

// RUN SERVER
await startServer()
