
/* ===================================
   VOTECHAIN - VOTING PAGE
   ĐÃ KẾT NỐI SMART CONTRACT
=================================== */

let selectedCandidateId = null;
let currentElectionId = null;
let currentContract = null;
let currentOptions = [];
let isVoting = false;

// ===================================
// HÀM HỖ TRỢ
// ===================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatDate(timestamp) {
    return new Date(Number(timestamp) * 1000)
        .toLocaleDateString("vi-VN");
}

function showVoteToast(message) {
    const toast = document.getElementById("voteToast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

function getErrorMessage(error) {
    if (error.code === 4001 ||
        error.code === "ACTION_REJECTED") {
        return "Bạn đã từ chối giao dịch trên MetaMask.";
    }

    const message =
        error.reason ||
        error.shortMessage ||
        error.info?.error?.message ||
        error.message ||
        "";

    if (message.includes("You are not allowed to vote")) {
        return "Ví của bạn chưa được người tạo cấp quyền bỏ phiếu.";
    }

    if (message.includes("You have already voted")) {
        return "Ví này đã bỏ phiếu cho cuộc bình chọn.";
    }

    if (message.includes("Poll has not started")) {
        return "Cuộc bình chọn chưa bắt đầu.";
    }

    if (message.includes("Poll has ended")) {
        return "Cuộc bình chọn đã kết thúc.";
    }

    if (message.includes("Invalid option")) {
        return "Phương án được chọn không hợp lệ.";
    }

    return message || "Có lỗi xảy ra khi bỏ phiếu.";
}

// ===================================
// LẤY THÔNG TIN CUỘC BÌNH CHỌN
// ===================================

async function loadElection() {
    try {
        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("id");

        if (!id || !/^[1-9]\d*$/.test(id)) {
            throw new Error("ID cuộc bình chọn không hợp lệ.");
        }

        currentElectionId = BigInt(id);

        if (!window.VoteChain) {
            throw new Error("Không tìm thấy VoteChain.");
        }

        showVoteToast("Đang tải dữ liệu Blockchain...");

        currentContract =
            await window.VoteChain.getReadContract();

        // Lấy thông tin cuộc bình chọn
        const poll = await currentContract.polls(
            currentElectionId
        );

        const title = poll.title;
        const description = poll.description;
        const startTime = poll.startTime;
        const endTime = poll.endTime;
        const creator = poll.creator;
        const totalVotes = poll.totalVotes;

        // Lấy danh sách phương án
        const result = await currentContract.getResults(
            currentElectionId
        );

        currentOptions = Array.from(result[0]);

        // Kiểm tra cuộc bình chọn có tồn tại không
        if (!title) {
            throw new Error("Không tìm thấy cuộc bình chọn.");
        }

        // Hiển thị thông tin
        document.getElementById("electionTitle").textContent =
            title;

        document.getElementById("electionDescription").textContent =
            description;

        document.getElementById("endDate").textContent =
            formatDate(endTime);

        document.getElementById("totalVotes").textContent =
            totalVotes.toString() + " phiếu";

        // Cập nhật số phương án
       document.getElementById("candidateCount").textContent =
    currentOptions.length + " phương án";

document.getElementById("candidateCountLabel").textContent =
    currentOptions.length + " phương án";

        document.querySelectorAll(".candidate-count").forEach(item => {
            item.textContent =
                currentOptions.length + " phương án";
        });

        // Cập nhật danh mục
        const category = document.querySelector(".vote-category");

        if (category) {
            category.textContent = "BLOCKCHAIN";
        }

        // Cập nhật trạng thái
        const now = Math.floor(Date.now() / 1000);

        let statusText = "";
        let statusClass = "";

        if (now < Number(startTime)) {
            statusText = "Sắp diễn ra";
            statusClass = "status-upcoming";
        } else if (now <= Number(endTime)) {
            statusText = "Đang diễn ra";
            statusClass = "status-active";
        } else {
            statusText = "Đã kết thúc";
            statusClass = "status-ended";
        }

        const statusBadge = document.querySelector(
            ".vote-heading .status-badge"
        );

        if (statusBadge) {
            statusBadge.textContent = statusText;
            statusBadge.className =
                "status-badge " + statusClass;
        }

        // Lưu thông tin để kiểm tra sau
        window.currentPollInfo = {
            creator,
            startTime: Number(startTime),
            endTime: Number(endTime)
        };

        // Hiển thị phương án từ Blockchain
        renderCandidates(currentOptions);

        // Kiểm tra trạng thái ví
        await checkVotingStatus();

        console.log("Đã tải cuộc bình chọn:", {
            id: id,
            title,
            description,
            options: currentOptions,
            totalVotes: totalVotes.toString(),
            creator
        });

    } catch (error) {
        console.error("Lỗi tải cuộc bình chọn:", error);

        showVoteToast(getErrorMessage(error));

        const list = document.getElementById("candidateList");

        if (list) {
            list.innerHTML = `
                <p class="error-message">
                    ${escapeHTML(getErrorMessage(error))}
                </p>
            `;
        }
    }
}

// ===================================
// HIỂN THỊ PHƯƠNG ÁN
// ===================================

function renderCandidates(options) {
    const list = document.getElementById("candidateList");

    if (!list) return;

    list.innerHTML = "";

    const avatarClasses = [
        "",
        "avatar-purple",
        "avatar-green",
        "avatar-orange"
    ];

    options.forEach((option, index) => {
        const card = document.createElement("article");

        card.className = "candidate-card";

        const avatarClass =
            avatarClasses[index % avatarClasses.length];

        card.innerHTML = `
            <div class="candidate-avatar ${avatarClass}">
                ${index + 1}
            </div>

            <h3>${escapeHTML(option)}</h3>

            <p class="candidate-position">
                Phương án ${index + 1}
            </p>

            <p class="candidate-description">
                Lựa chọn phương án này để tham gia bình chọn.
            </p>

            <button
                type="button"
                class="select-candidate"
                data-candidate="${index}">
                Chọn phương án
            </button>
        `;

        const button = card.querySelector(".select-candidate");

        button.addEventListener("click", function () {
            if (isVoting) return;

            selectedCandidateId = index;

            document.querySelectorAll(".candidate-card")
                .forEach(item => {
                    item.classList.remove("selected");
                });

            document.querySelectorAll(".select-candidate")
                .forEach(item => {
                    item.textContent = "Chọn phương án";
                });

            card.classList.add("selected");

            button.textContent = "✓ Đã chọn";

            document.getElementById("selectedCandidate").textContent =
                "Bạn đã chọn: " + option;

            document.getElementById("confirmVote").disabled = false;
        });

        list.appendChild(card);
    });
}

// ===================================
// KIỂM TRA QUYỀN BỎ PHIẾU
// ===================================

async function checkVotingStatus() {
    const confirmButton =
        document.getElementById("confirmVote");

    const selectedText =
        document.getElementById("selectedCandidate");

    if (!window.ethereum || !currentContract) {
        if (confirmButton) confirmButton.disabled = true;
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });

        if (!accounts || accounts.length === 0) {
            selectedText.textContent =
                "Vui lòng kết nối MetaMask để bỏ phiếu.";

            confirmButton.disabled = true;
            return;
        }

        const walletAddress = accounts[0];

        const allowed = await currentContract.allowedVoters(
            currentElectionId,
            walletAddress
        );

        const hasVoted = await currentContract.hasVoted(
            currentElectionId,
            walletAddress
        );

        if (hasVoted) {
            selectedText.textContent =
                "Ví này đã bỏ phiếu cho cuộc bình chọn.";

            confirmButton.disabled = true;

            showVoteToast("Bạn đã bỏ phiếu rồi.");
            return;
        }

        if (!allowed) {
            selectedText.textContent =
                "Ví chưa được người tạo cấp quyền bỏ phiếu.";

            confirmButton.disabled = true;
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const pollInfo = window.currentPollInfo;

        if (now < pollInfo.startTime) {
            selectedText.textContent =
                "Cuộc bình chọn chưa bắt đầu.";

            confirmButton.disabled = true;
            return;
        }

        if (now > pollInfo.endTime) {
            selectedText.textContent =
                "Cuộc bình chọn đã kết thúc.";

            confirmButton.disabled = true;
            return;
        }

        selectedText.textContent =
            "Ví của bạn đã được cấp quyền. Hãy chọn một phương án.";

        confirmButton.disabled = true;

    } catch (error) {
        console.error("Lỗi kiểm tra quyền bỏ phiếu:", error);
        confirmButton.disabled = true;
    }
}

// ===================================
// GỬI PHIẾU BẦU LÊN BLOCKCHAIN
// ===================================

async function submitVote() {
    if (isVoting) return;

    if (selectedCandidateId === null) {
        showVoteToast("Vui lòng chọn một phương án!");
        return;
    }

    const confirmButton =
        document.getElementById("confirmVote");

    const optionName = currentOptions[selectedCandidateId];

    const confirmed = window.confirm(
        "Bạn xác nhận bỏ phiếu cho phương án: " +
        optionName + "?"
    );

    if (!confirmed) return;

    try {
        isVoting = true;

        confirmButton.disabled = true;
        confirmButton.textContent = "Đang kết nối MetaMask...";

        // Kết nối ví và Smart Contract
        const contract =
            await window.VoteChain.getWriteContract();

        const signer = await contract.runner.getAddress();

        // Kiểm tra lại quyền ngay trước khi gửi giao dịch
        const allowed = await contract.allowedVoters(
            currentElectionId,
            signer
        );

        if (!allowed) {
            throw new Error(
                "Ví của bạn chưa được người tạo cấp quyền bỏ phiếu."
            );
        }

        const hasVoted = await contract.hasVoted(
            currentElectionId,
            signer
        );

        if (hasVoted) {
            throw new Error(
                "Ví này đã bỏ phiếu cho cuộc bình chọn."
            );
        }

        confirmButton.textContent =
            "Vui lòng xác nhận trên MetaMask...";

        // Gửi giao dịch bỏ phiếu
        const transaction = await contract.vote(
            currentElectionId,
            selectedCandidateId
        );

        console.log("Vote transaction:", transaction.hash);

        showVoteToast(
            "Đã gửi phiếu bầu! Đang chờ Blockchain xác nhận..."
        );

        confirmButton.textContent =
            "Đang xác nhận giao dịch...";

        // Chờ Blockchain xác nhận
        const receipt = await transaction.wait();

        console.log("Giao dịch bỏ phiếu thành công:", receipt);

        showVoteToast(
            "Bỏ phiếu thành công! Phiếu đã được ghi nhận trên Blockchain."
        );

        confirmButton.textContent = "Đã bỏ phiếu thành công";

        // Cập nhật dữ liệu mới nhất
        selectedCandidateId = null;

        document.getElementById("selectedCandidate").textContent =
            "Bạn đã bỏ phiếu thành công.";

        await loadElection();

        confirmButton.disabled = true;
        confirmButton.textContent = "Đã bỏ phiếu thành công";

    } catch (error) {
        console.error("Lỗi gửi phiếu bầu:", error);

        showVoteToast(getErrorMessage(error));

        confirmButton.disabled = false;
        confirmButton.textContent = "Xác nhận bỏ phiếu →";

        isVoting = false;
    }
}

// ===================================
// KHỞI CHẠY TRANG
// ===================================

document.addEventListener("DOMContentLoaded", function () {

    const confirmButton =
        document.getElementById("confirmVote");

    confirmButton.addEventListener("click", submitVote);

    loadElection();

    // Kiểm tra lại nếu người dùng đổi tài khoản MetaMask
    if (window.ethereum) {
        window.ethereum.on("accountsChanged", function () {
            selectedCandidateId = null;

            document.getElementById("selectedCandidate").textContent =
                "Đang kiểm tra tài khoản ví...";

            confirmButton.disabled = true;

            loadElection();
        });

        window.ethereum.on("chainChanged", function () {
            window.location.reload();
        });
    }
});
