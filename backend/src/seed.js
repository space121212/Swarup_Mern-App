require("dotenv").config();

const connectDB=require('./config/db.js')

const {seedRBAC}=require('./seed/rbac.js')


const runSeed=async()=>{


    try {

        await connectDB();
        await seedRBAC();
        console.log("Seed completed successfully");

        process.exit(0);
        
    } catch (error) {
        console.error("Seed failed:", error.message);

        process.exit(1);
    }
}

runSeed();