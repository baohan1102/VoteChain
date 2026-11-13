
// ======================================
// VOTECHAIN - METAMASK WALLET
// ======================================

let currentAccount = null;

// Rút gọn địa chỉ ví để hiển thị
function shortenAddress(address) {
    if (!address) return "";

    return address.slice(0, 6) + "..." + address.slice(-4);
}

// Kết nối MetaMask
async function connectWallet() {
    if (!window.ethereum) {
        alert("Bạn chưa cài MetaMask. Vui lòng cài MetaMask trước!");
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        if (!accounts || accounts.length === 0) {
            alert("Không tìm thấy tài khoản MetaMask.");
            return;
        }

        currentAccount = accounts[0];

        updateWalletUI();

        if (typeof showToast === "function") {
            showToast("Kết nối ví thành công!");
        }

        return currentAccount;

    } catch (error) {
        console.error("Lỗi kết nối MetaMask:", error);

        if (error.code === 4001) {
            alert("Bạn đã từ chối yêu cầu kết nối ví.");
        } else {
            alert("Không thể kết nối MetaMask. Vui lòng thử lại.");
        }
    }
}

// Cập nhật giao diện sau khi kết nối
function updateWalletUI() {
    const addressElement = document.getElementById("walletAddress");
    const connectButton = document.getElementById("connectWalletBtn");

    if (addressElement && currentAccount) {
        addressElement.textContent = shortenAddress(currentAccount);
    }

    if (connectButton && currentAccount) {
        connectButton.textContent = "Đã kết nối";
        connectButton.classList.add("wallet-connected");
    }
}

// Kiểm tra ví đã kết nối trước đó chưa
async function checkWalletConnection() {
    if (!window.ethereum) return;

    try {
        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });

        if (accounts.length > 0) {
            currentAccount = accounts[0];
            updateWalletUI();
        }
    } catch (error) {
        console.error("Không thể kiểm tra ví:", error);
    }
}

// Theo dõi khi người dùng đổi tài khoản MetaMask
if (window.ethereum) {
    window.ethereum.on("accountsChanged", function (accounts) {
        currentAccount = accounts.length > 0 ? accounts[0] : null;

        if (currentAccount) {
            updateWalletUI();
        } else {
            const addressElement = document.getElementById("walletAddress");
            const connectButton = document.getElementById("connectWalletBtn");

            if (addressElement) addressElement.textContent = "";

            if (connectButton) {
                connectButton.textContent = "Kết nối ví";
                connectButton.classList.remove("wallet-connected");
            }
        }
    });
}

// Cho phép app.js sử dụng các hàm này
window.connectWallet = connectWallet;
window.checkWalletConnection = checkWalletConnection;
window.getCurrentAccount = function () {
    return currentAccount;
};
