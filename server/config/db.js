const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    if (process.env.NODE_ENV === "development") 
      console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV === "development") 
      console.error(`ConnectDB Error: ${error.message}`);
    else 
      console.error("Server error");
    process.exit(1);
  }
};
module.exports = connectDB;

