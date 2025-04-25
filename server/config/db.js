const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.MYSQLDATABASE,
    process.env.MYSQLUSER,
    process.env.MYSQLPASSWORD,
    {
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT,
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,  // This is the key change
                minVersion: 'TLSv1.2'
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false,
        retry: {
            max: 3
        }
    }
);

const connectDB = async () => {
    let retries = 5;
    while (retries) {
        try {
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
            await sequelize.sync({ alter: true });
            console.log('Database synchronized');
            break;
        } catch (error) {
            console.error('Unable to connect to the database:', {
                error: error.message,
                host: process.env.MYSQLHOST,
                port: process.env.MYSQLPORT,
                database: process.env.MYSQLDATABASE,
                user: process.env.MYSQLUSER
            });
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (retries === 0) {
                console.error('Max retries reached. Could not connect to database.');
                // Don't exit process, let the application handle it
                break;
            }
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = { sequelize, connectDB };