document.addEventListener("DOMContentLoaded", () => {
    const section = document.getElementById("manageVotersSection");
    const addressInput = document.getElementById("voterAddress");
    const addButton = document.getElementById("addVoterBtn");
    const message = document.getElementById("voterMessage");

    if (!section || !addressInput || !addButton || !message) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const pollId = params.get("id");

    if (!pollId || !/^[1-9]\d*$/.test(pollId)) {
        return;
    }

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    // Kiểm tra ví hiện tại có phải người tạo cuộc bình chọn không
    async function checkCreator() {
        try {
            if (!window.ethereum) return;

            const accounts = await window.ethereum.request({
                method: "eth_accounts"
            });

            if (!accounts || accounts.length === 0) return;

            const contract = await window.VoteChain.getReadContract();

            const poll = await contract.polls(pollId);

            // polls() trả về:
            // [title, description, startTime, endTime, creator, totalVotes]
            const creatorAddress = poll[4];

            const currentAddress = accounts[0];

            if (
                creatorAddress.toLowerCase() === currentAddress.toLowerCase()
            ) {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        } catch (error) {
            console.error("Lỗi kiểm tra người tạo:", error);
        }
    }

    // Cấp quyền bỏ phiếu cho địa chỉ ví
    async function addVoter() {
        try {
            if (!window.ethereum) {
                throw new Error("Bạn chưa cài đặt MetaMask.");
            }

            const voterAddress = addressInput.value.trim();

            if (!ethers.isAddress(voterAddress)) {
                throw new Error("Địa chỉ ví không hợp lệ.");
            }

            addButton.disabled = true;
            addButton.textContent = "Đang xử lý...";
            showMessage("Đang kiểm tra và gửi giao dịch...");

            // Yêu cầu người dùng kết nối ví nếu chưa kết nối
            await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            // Kiểm tra đúng mạng Sepolia
            await window.VoteChain.checkSepoliaNetwork();

            const contract = await window.VoteChain.getWriteContract();

            // Kiểm tra người đang thao tác có phải người tạo không
            const signer = await contract.runner.getAddress();
            const poll = await contract.polls(pollId);

            if (poll[4].toLowerCase() !== signer.toLowerCase()) {
                throw new Error(
                    "Chỉ người tạo cuộc bình chọn mới được cấp quyền."
                );
            }

            // Kiểm tra người này đã được cấp quyền chưa
            const alreadyAllowed = await contract.allowedVoters(
                pollId,
                voterAddress
            );

            if (alreadyAllowed) {
                throw new Error("Địa chỉ ví này đã được cấp quyền.");
            }

            // Gửi giao dịch cấp quyền
            const transaction = await contract.addVoter(
                pollId,
                voterAddress
            );

            showMessage("Đã gửi giao dịch. Vui lòng xác nhận trên MetaMask.");

            // Chờ giao dịch được xác nhận trên Blockchain
            await transaction.wait();

            showMessage(
                "Cấp quyền bỏ phiếu thành công!",
                true
            );

            addressInput.value = "";

            console.log("Đã cấp quyền cho:", voterAddress);
            console.log("Transaction hash:", transaction.hash);

        } catch (error) {
            console.error("Lỗi cấp quyền:", error);

            let errorMessage = error.reason || error.shortMessage || error.message;

            if (error.code === 4001) {
                errorMessage = "Bạn đã từ chối giao dịch trên MetaMask.";
            }

            showMessage(errorMessage || "Không thể cấp quyền bỏ phiếu.");

        } finally {
            addButton.disabled = false;
            addButton.textContent = "Cấp quyền bỏ phiếu";
        }
    }

    addButton.addEventListener("click", addVoter);

    // Kiểm tra khi tải trang và khi đổi tài khoản MetaMask
    checkCreator();

    if (window.ethereum) {
        window.ethereum.on("accountsChanged", checkCreator);
        window.ethereum.on("chainChanged", () => {
            window.location.reload();
        });
    }
});