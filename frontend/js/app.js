
// ======================================
// VOTECHAIN - MAIN JAVASCRIPT
// ======================================

// Dữ liệu minh họa cho giao diện.
// Sau này sẽ thay bằng dữ liệu lấy từ Smart Contract.

const sampleElections = [
    {
        id: 1,
        title: "Bạn chọn địa điểm nào cho chuyến du lịch?",
        description: "Cùng bình chọn địa điểm phù hợp cho chuyến đi sắp tới.",
        category: "Du lịch",
        votes: 56,
        status: "Đang diễn ra",
        deadline: "20/11/2026"
    },
    {
        id: 2,
        title: "Lựa chọn chủ đề cho sự kiện sinh viên",
        description: "Bình chọn chủ đề mà bạn yêu thích nhất cho sự kiện.",
        category: "Sự kiện",
        votes: 42,
        status: "Đang diễn ra",
        deadline: "22/11/2026"
    },
    {
        id: 3,
        title: "Chọn hoạt động ngoại khóa của lớp",
        description: "Cùng lựa chọn hoạt động ngoại khóa cho tập thể lớp.",
        category: "Giáo dục",
        votes: 30,
        status: "Đang diễn ra",
        deadline: "25/11/2026"
    }
];

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

// Tạo HTML cho một thẻ bình chọn
function createElectionCard(election) {
    return `
        <article class="election-card">

            <div class="card-top">
                <span class="card-category">
                    ${election.category}
                </span>

                <span class="card-status">
                    ● ${election.status}
                </span>
            </div>

            <h3>${election.title}</h3>

            <p>${election.description}</p>

            <div class="card-meta">
                <span>◉ ${election.votes} lượt bình chọn</span>
                <span>Hạn: ${election.deadline}</span>
            </div>

            <a href="election-detail.html?id=${election.id}"
               class="card-link">
                Xem chi tiết →
            </a>

        </article>
    `;
}

// Hiển thị danh sách bình chọn nổi bật
function renderFeaturedElections() {
    const container = document.getElementById("featuredElections");

    if (!container) return;

    container.innerHTML = sampleElections
        .map(election => createElectionCard(election))
        .join("");
}

// Hiển thị thống kê mẫu
function renderStatistics() {
    const totalElections = document.getElementById("totalElections");
    const totalVotes = document.getElementById("totalVotes");

    if (totalElections) {
        totalElections.textContent =
            String(sampleElections.length).padStart(2, "0");
    }

    if (totalVotes) {
        const total = sampleElections.reduce(
            (sum, election) => sum + election.votes,
            0
        );

        totalVotes.textContent = total;
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

// Khởi chạy khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {

    renderFeaturedElections();

    renderStatistics();

    setupMobileMenu();

    const connectButton = document.getElementById("connectWalletBtn");

    if (connectButton) {
        connectButton.addEventListener("click", function () {
            if (window.connectWallet) {
                window.connectWallet();
            }
        });
    }

    if (window.checkWalletConnection) {
        window.checkWalletConnection();
    }

});
