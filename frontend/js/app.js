
// ======================================
// VOTECHAIN - MAIN JAVASCRIPT
// Dữ liệu lấy trực tiếp từ Smart Contract
// ======================================

// Hiển thị thông báo
function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Định dạng ngày tháng
function formatDate(timestamp) {
    const date = new Date(Number(timestamp) * 1000);

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// Xác định trạng thái cuộc bình chọn
function getElectionStatus(startTime, endTime) {
    const now = Math.floor(Date.now() / 1000);
    const start = Number(startTime);
    const end = Number(endTime);

    if (now < start) {
        return "Sắp diễn ra";
    }

    if (now <= end) {
        return "Đang diễn ra";
    }

    return "Đã kết thúc";
}

// Tạo HTML cho một thẻ bình chọn
function createElectionCard(election) {
    return `
        <article class="election-card">

            <div class="card-top">
                <span class="card-category">
                    Blockchain
                </span>

                <span class="card-status">
                    ● ${election.status}
                </span>
            </div>

            <h3>${escapeHTML(election.title)}</h3>

            <p>${escapeHTML(election.description || "Chưa có mô tả cho cuộc bình chọn này.")}</p>

            <div class="card-meta">
                <span>◉ ${election.votes} lượt bình chọn</span>
                <span>Hạn: ${election.deadline}</span>
            </div>

            <a href="vote.html?id=${election.id}"
               class="card-link">
                Tham gia bình chọn →
            </a>

        </article>
    `;
}

// Ngăn nội dung từ Smart Contract chèn HTML ngoài ý muốn
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Hiển thị danh sách bình chọn nổi bật
function renderFeaturedElections(elections) {
    const container = document.getElementById("featuredElections");

    if (!container) return;

    if (elections.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Hiện chưa có cuộc bình chọn nào trên Blockchain.</p>
                <a href="create-election.html" class="btn btn-primary">
                    Tạo cuộc bình chọn
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = elections
        .map(election => createElectionCard(election))
        .join("");
}

// Hiển thị thống kê từ Blockchain
function renderStatistics(totalElections, totalVotes) {
    const electionsElement = document.getElementById("totalElections");
    const votesElement = document.getElementById("totalVotes");

    if (electionsElement) {
        electionsElement.textContent = totalElections;
    }

    if (votesElement) {
        votesElement.textContent = totalVotes;
    }
}

// Đọc dữ liệu các cuộc bình chọn từ Smart Contract
async function loadHomepageData() {
    const container = document.getElementById("featuredElections");

    try {
        if (!window.VoteChain) {
            throw new Error("Không tìm thấy thư viện kết nối VoteChain.");
        }

        if (container) {
            container.innerHTML = "<p>Đang tải dữ liệu từ Blockchain...</p>";
        }

        // Kết nối Smart Contract ở chế độ đọc
        const contract = await window.VoteChain.getReadContract();

        // Lấy tổng số cuộc bình chọn
        const pollCount = Number(await contract.pollCount());

        const elections = [];
        let totalVotes = 0;

        // Đọc từng cuộc bình chọn
        for (let i = 1; i <= pollCount; i++) {
            const poll = await contract.polls(i);

            const title = poll[0];
            const description = poll[1];
            const startTime = poll[2];
            const endTime = poll[3];
            const creator = poll[4];
            const votes = Number(poll[5]);

            totalVotes += votes;

            elections.push({
                id: i,
                title: title,
                description: description,
                startTime: startTime,
                endTime: endTime,
                creator: creator,
                votes: votes,
                status: getElectionStatus(startTime, endTime),
                deadline: formatDate(endTime)
            });
        }

        // Cập nhật thống kê
        renderStatistics(pollCount, totalVotes);

        // Lấy tối đa 3 cuộc bình chọn mới nhất
        const featuredElections = elections
            .slice()
            .reverse()
            .slice(0, 3);

        // Hiển thị danh sách nổi bật
        renderFeaturedElections(featuredElections);

        console.log("Đã tải dữ liệu trang chủ từ Blockchain.");
        console.log("Tổng cuộc bình chọn:", pollCount);
        console.log("Tổng lượt bỏ phiếu:", totalVotes);
        console.log("Danh sách bình chọn:", elections);

    } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);

        const electionsElement = document.getElementById("totalElections");
        const votesElement = document.getElementById("totalVotes");

        if (electionsElement) {
            electionsElement.textContent = "--";
        }

        if (votesElement) {
            votesElement.textContent = "--";
        }

        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Không thể tải dữ liệu từ Blockchain.</p>
                    <p>
                        Vui lòng kiểm tra MetaMask, chuyển sang mạng
                        Sepolia và tải lại trang.
                    </p>
                    <button class="btn btn-primary" onclick="loadHomepageData()">
                        Thử tải lại
                    </button>
                </div>
            `;
        }
    }
}

// Xử lý menu trên điện thoại
function setupMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
    });
}

// Xử lý nút kết nối ví
function setupWalletButton() {
    const connectButton = document.getElementById("connectWalletBtn");

    if (connectButton) {
        connectButton.addEventListener("click", function () {
            if (window.connectWallet) {
                window.connectWallet();
            } else {
                showToast("Không tìm thấy chức năng kết nối ví.");
            }
        });
    }

    if (window.checkWalletConnection) {
        window.checkWalletConnection();
    }
}

// Khởi chạy khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {

    // Tải dữ liệu thật từ Smart Contract
    loadHomepageData();

    // Giữ chức năng menu
    setupMobileMenu();

    // Giữ chức năng kết nối MetaMask
    setupWalletButton();

});
