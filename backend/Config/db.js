const mongoose = require('mongoose');

const connectToDatabase = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('MONGODB_URI is not set. Add it to backened/.env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to the database');
    } catch (err) {
        console.error(`Error connecting to the database: ${err}`);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
