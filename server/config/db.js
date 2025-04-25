const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

const setupSequelize = () => {
    try {
        sequelize = new Sequelize(
            process.env.MYSQLDATABASE,
            process.env.MYSQLUSER,
            process.env.MYSQLPASSWORD,
            {
                host: process.env.MYSQLHOST,
                port: process.env.MYSQLPORT,
                dialect: 'mysql',
                dialectOptions: {
                    ssl: {
                        rejectUnauthorized: true
                    }
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                logging: console.log // Remove this in production
            }
        );
        console.log('Sequelize instance created');
        return sequelize;
    } catch (error) {
        console.error('Sequelize setup error:', error);
        throw error;
    }
};

const connectDB = async () => {
    try {
        if (!sequelize) {
            setupSequelize();
        }
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync models with retry logic
        let retries = 5;
        while (retries > 0) {
            try {
                await sequelize.sync({ alter: true });
                console.log('Database synchronized');
                break;
            } catch (error) {
                retries--;
                if (retries === 0) throw error;
                console.log(`Database sync failed, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = { sequelize: setupSequelize(), connectDB };