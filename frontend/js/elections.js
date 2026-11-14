
// ===================================
// VOTECHAIN - ELECTIONS PAGE
// Đã kết nối Smart Contract
// ===================================

let elections = [];

const statusInfo = {
    active: {
        label: "Đang diễn ra",
        className: "status-active",
        button: "Tham gia bỏ phiếu"
    },
    upcoming: {
        label: "Sắp diễn ra",
        className: "status-upcoming",
        button: "Chưa mở bỏ phiếu"
    },
    ended: {
        label: "Đã kết thúc",
        className: "status-ended",
        button: "Xem kết quả"
    }
};

// Chuyển đổi dữ liệu thành chuỗi an toàn khi hiển thị HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Định dạng thời gian
function formatDate(timestamp) {
    return new Date(Number(timestamp) * 1000)
        .toLocaleDateString("vi-VN");
}

// Xác định trạng thái cuộc bình chọn
function getElectionStatus(startTime, endTime) {
    const now = Math.floor(Date.now() / 1000);

    if (now < Number(startTime)) {
        return "upcoming";
    }

    if (now <= Number(endTime)) {
        return "active";
    }

    return "ended";
}

// ===================================
// LẤY DỮ LIỆU TỪ SMART CONTRACT
// ===================================

async function loadElectionsFromBlockchain() {
    const list = document.getElementById("electionList");

    try {
        if (!window.VoteChain) {
            throw new Error("Không tìm thấy thư viện VoteChain.");
        }

        if (list) {
            list.innerHTML = "<p>Đang tải dữ liệu Blockchain...</p>";
        }

        // Kết nối Smart Contract ở chế độ đọc
        const contract = await window.VoteChain.getReadContract();

        // Lấy tổng số cuộc bình chọn
        const pollCount = await contract.pollCount();

        elections = [];

        // Đọc từng cuộc bình chọn
        for (let i = 1n; i <= pollCount; i++) {

            const poll = await contract.polls(i);

            // Lấy phương án và số phiếu
            const result = await contract.getResults(i);

            const options = result[0];
            const voteCounts = result[1];

            const election = {
                id: i.toString(),
                title: poll.title,
                description: poll.description,
                category: "Blockchain",
                status: getElectionStatus(
                    poll.startTime,
                    poll.endTime
                ),
                votes: poll.totalVotes.toString(),
                candidates: options.length,
                options: Array.from(options),
                voteCounts: Array.from(voteCounts).map(
                    count => count.toString()
                ),
                startTime: poll.startTime.toString(),
                endTime: poll.endTime.toString(),
                creator: poll.creator,
                endDate: formatDate(poll.endTime)
            };

            elections.push(election);
        }

        console.log("Đã tải danh sách từ Blockchain:", elections);

        updateStatistics();
        filterElections();

    } catch (error) {
        console.error("Lỗi tải cuộc bình chọn:", error);

        if (list) {
            list.innerHTML = `
                <p class="error-message">
                    Không thể tải dữ liệu từ Blockchain.
                    <br>
                    ${escapeHTML(error.message)}
                </p>
            `;
        }

        const noElection = document.getElementById("noElection");
        if (noElection) {
            noElection.style.display = "none";
        }
    }
}

// ===================================
// HIỂN THỊ DANH SÁCH
// ===================================

function renderElections(data) {
    const list = document.getElementById("electionList");
    const noElection = document.getElementById("noElection");

    if (!list || !noElection) return;

    list.innerHTML = "";

    if (data.length === 0) {
        noElection.style.display = "block";
        return;
    }

    noElection.style.display = "none";

    data.forEach(election => {
        const status = statusInfo[election.status];

        let buttonHTML = "";

        if (election.status === "active") {
            buttonHTML = `
                <a href="vote.html?id=${encodeURIComponent(election.id)}"
                   class="vote-button">
                    ${status.button} →
                </a>
            `;
        } else if (election.status === "ended") {
            buttonHTML = `
                <a href="results.html?id=${encodeURIComponent(election.id)}"
                   class="vote-button">
                    ${status.button} →
                </a>
            `;
        } else {
            buttonHTML = `
                <button class="vote-button disabled" disabled>
                    ${status.button}
                </button>
            `;
        }

        list.innerHTML += `
            <article class="election-card">

                <div class="card-top">
                    <span class="card-category">
                        ${escapeHTML(election.category)}
                    </span>

                    <span class="status-badge ${status.className}">
                        ${status.label}
                    </span>
                </div>

                <h3>${escapeHTML(election.title)}</h3>

                <p>${escapeHTML(election.description)}</p>

                <div class="card-info">
                    <div>
                        Số phiếu
                        <strong>${escapeHTML(election.votes)}</strong>
                    </div>

                    <div>
                        Phương án
                        <strong>${election.candidates}</strong>
                    </div>

                    <div>
                        Kết thúc
                        <strong>${escapeHTML(election.endDate)}</strong>
                    </div>
                </div>

                ${buttonHTML}

            </article>
        `;
    });
}

// ===================================
// CẬP NHẬT THỐNG KÊ
// ===================================

function updateStatistics() {
    const total = document.getElementById("totalElections");
    const active = document.getElementById("activeElections");
    const ended = document.getElementById("endedElections");

    if (total) {
        total.textContent = elections.length;
    }

    if (active) {
        active.textContent = elections.filter(
            item => item.status === "active"
        ).length;
    }

    if (ended) {
        ended.textContent = elections.filter(
            item => item.status === "ended"
        ).length;
    }
}

// ===================================
// TÌM KIẾM VÀ LỌC
// ===================================

function filterElections() {
    const searchInput = document.getElementById("searchElection");
    const statusFilter = document.getElementById("statusFilter");

    if (!searchInput || !statusFilter) return;

    const keyword = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;

    const filtered = elections.filter(item => {

        const matchesKeyword =
            item.title.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword);

        const matchesStatus =
            selectedStatus === "all" ||
            item.status === selectedStatus;

        return matchesKeyword && matchesStatus;
    });

    renderElections(filtered);
}

// ===================================
// KHỞI CHẠY TRANG
// ===================================

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchElection");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) {
        searchInput.addEventListener("input", filterElections);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", filterElections);
    }

    loadElectionsFromBlockchain();
});
