
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// API cung cấp cấu hình Blockchain cho frontend
app.get("/api/config", (req, res) => {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const chainId = Number(process.env.CHAIN_ID);

    if (!contractAddress || !chainId) {
        return res.status(500).json({
            success: false,
            message: "Chưa cấu hình CONTRACT_ADDRESS hoặc CHAIN_ID trong .env"
        });
    }

    res.json({
        success: true,
        contractAddress,
        chainId
    });
});

// Phục vụ các file frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.listen(PORT, () => {
    console.log(`VoteChain đang chạy tại http://localhost:${PORT}`);
});
