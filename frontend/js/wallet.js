
// ======================================
// VOTECHAIN - METAMASK WALLET
// ======================================

let currentAccount = null;

// Rút gọn địa chỉ ví
function shortenAddress(address) {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
}

// Lấy các phần tử hiển thị ví
function getWalletElements() {
    return {
        addressElements: document.querySelectorAll("#walletAddress"),
        connectButtons: document.querySelectorAll(
            "#connectWallet, #connectWalletBtn"
        )
    };
}

// Cập nhật giao diện ví
function updateWalletUI() {
    const { addressElements, connectButtons } = getWalletElements();

    addressElements.forEach(element => {
        element.textContent = currentAccount
            ? shortenAddress(currentAccount)
            : "";
    });

    connectButtons.forEach(button => {
        if (currentAccount) {
            button.textContent = "Đã kết nối";
            button.classList.add("wallet-connected");
        } else {
            button.textContent = "Kết nối ví";
            button.classList.remove("wallet-connected");
        }
    });
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

// Kiểm tra tài khoản đã được cấp quyền kết nối
async function checkWalletConnection() {
    if (!window.ethereum) {
        currentAccount = null;
        updateWalletUI();
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });

        currentAccount = accounts.length > 0
            ? accounts[0]
            : null;

        updateWalletUI();

    } catch (error) {
        console.error("Không thể kiểm tra ví:", error);
    }
}

// Theo dõi khi đổi tài khoản hoặc ngắt kết nối
if (window.ethereum) {
    window.ethereum.on("accountsChanged", function (accounts) {
        currentAccount = accounts.length > 0
            ? accounts[0]
            : null;

        updateWalletUI();
    });
}

// Kiểm tra ví mỗi khi trang được mở
document.addEventListener("DOMContentLoaded", function () {
    checkWalletConnection();
});

// Cho phép các file JavaScript khác sử dụng
window.connectWallet = connectWallet;
window.checkWalletConnection = checkWalletConnection;

window.getCurrentAccount = function () {
    return currentAccount;
};
