const sequelize = require("../database");
const {app} = require("../core/middleware");
const {PORT} = require("../core/settings");


async function startServer() {
    try {
        await sequelize.sync({force: false});
        console.log('Database & tables created!');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

async function init() {
    await startServer();
}

init().then(() => {
    console.log('Server started successfully.');
}).catch((error) => {
    console.error('Error during server start:', error);
});