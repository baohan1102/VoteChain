// ========================================
// VOTECHAIN - SMART CONTRACT CONNECTION
// ========================================

(function () {
    let contractAddress = "";
    let contractABI = null;
    let provider = null;
    let signer = null;
    let contract = null;

    const SEPOLIA_CHAIN_ID = 11155111;

    // 1. Tải cấu hình và ABI
    async function initVoteChain() {
        try {
            // Lấy địa chỉ Contract từ server (.env)
            const configResponse = await fetch("/api/config");

            if (!configResponse.ok) {
                throw new Error("Không thể tải cấu hình từ server.");
            }

            const config = await configResponse.json();

            if (!config.success) {
                throw new Error(config.message);
            }

            contractAddress = config.contractAddress;

            if (Number(config.chainId) !== SEPOLIA_CHAIN_ID) {
                throw new Error("CHAIN_ID trong .env không đúng Sepolia.");
            }

            // Lấy ABI
            const abiResponse = await fetch("/src/contracts/VoteChainABI.json");

            if (!abiResponse.ok) {
                throw new Error("Không tìm thấy file VoteChainABI.json.");
            }

            contractABI = await abiResponse.json();

            console.log("VoteChain đã tải cấu hình và ABI thành công.");

            return true;

        } catch (error) {
            console.error("Lỗi khởi tạo VoteChain:", error);
            throw error;
        }
    }

    // 2. Kiểm tra MetaMask và mạng Sepolia
    async function checkSepoliaNetwork() {
        if (!window.ethereum) {
            throw new Error("Bạn chưa cài đặt MetaMask.");
        }

        const chainId = await window.ethereum.request({
            method: "eth_chainId"
        });

        if (parseInt(chainId, 16) !== SEPOLIA_CHAIN_ID) {
            throw new Error("Vui lòng chuyển MetaMask sang mạng Sepolia.");
        }

        return true;
    }

    // 3. Kết nối Smart Contract
    async function connectContract() {
        try {
            if (!contractABI || !contractAddress) {
                await initVoteChain();
            }

            await checkSepoliaNetwork();

            provider = new ethers.BrowserProvider(window.ethereum);

            signer = await provider.getSigner();

            contract = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );

            console.log("Đã kết nối Smart Contract:", contractAddress);

            return contract;

        } catch (error) {
            console.error("Lỗi kết nối Smart Contract:", error);
            throw error;
        }
    }

    // 4. Lấy Contract để đọc dữ liệu
    async function getReadContract() {
        if (!contractABI || !contractAddress) {
            await initVoteChain();
        }

        if (!window.ethereum) {
            throw new Error("Bạn chưa cài đặt MetaMask.");
        }

        await checkSepoliaNetwork();

        provider = new ethers.BrowserProvider(window.ethereum);

        return new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        );
    }

    // 5. Lấy Contract để thực hiện giao dịch
    async function getWriteContract() {
        if (!contract) {
            await connectContract();
        }

        return contract;
    }

    // 6. Xuất các hàm để những file JS khác sử dụng
    window.VoteChain = {
        initVoteChain,
        connectContract,
        getReadContract,
        getWriteContract,
        checkSepoliaNetwork
    };

})();