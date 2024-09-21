// Base
// ...
// Installed
// ...
// Local
const {PORT} = require("../core/settings");
const {app} = require("../core/middleware");
const {getMonobankPublicKey, verifySignature} = require("../app/utils");


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get("/check-signature", async (req, res) => {
    try {
        const publicKey = await getMonobankPublicKey();
        const checkSignature = verifySignature(req, publicKey);

        res.json({data: checkSignature});
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred during signature verification" });

    }
});