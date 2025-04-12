import app from "./app";
import connectDB from "./db/connectDB";

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/medi-match";

// Connect to MongoDB
connectDB(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
