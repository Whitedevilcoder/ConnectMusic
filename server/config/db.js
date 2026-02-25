import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Adding the family: 4 option to force IPv4
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4 
        });
        console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host} 🚀`);
    } catch (error) {
        console.error(`[Database Error] Connection failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;