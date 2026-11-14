
// ===================================
// VOTECHAIN - ELECTIONS PAGE
// Demo data - chưa kết nối Blockchain
// ===================================

const elections = [
    {
        id: 1,
        title: "Bầu chọn Chủ tịch Hội sinh viên",
        category: "Giáo dục",
        description: "Cuộc bầu chọn đại diện sinh viên nhiệm kỳ mới.",
        status: "active",
        votes: 128,
        candidates: 4,
        endDate: "20/11/2026"
    },
    {
        id: 2,
        title: "Bình chọn dự án sáng tạo năm 2026",
        category: "Công nghệ",
        description: "Bình chọn dự án công nghệ được yêu thích nhất.",
        status: "active",
        votes: 86,
        candidates: 5,
        endDate: "18/11/2026"
    },
    {
        id: 3,
        title: "Lựa chọn trưởng nhóm nghiên cứu",
        category: "Nghiên cứu",
        description: "Cuộc bầu chọn trưởng nhóm nghiên cứu khoa học.",
        status: "upcoming",
        votes: 0,
        candidates: 3,
        endDate: "25/11/2026"
    },
    {
        id: 4,
        title: "Bình chọn ý tưởng khởi nghiệp",
        category: "Khởi nghiệp",
        description: "Tìm kiếm ý tưởng khởi nghiệp nổi bật của sinh viên.",
        status: "ended",
        votes: 215,
        candidates: 6,
        endDate: "10/11/2026"
    }
];

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

// Render danh sách cuộc bầu cử
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
                <a href="vote.html?id=${election.id}" class="vote-button">
                    ${status.button} →
                </a>
            `;
        } else if (election.status === "ended") {
            buttonHTML = `
                <a href="results.html?id=${election.id}" class="vote-button">
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
                        ${election.category}
                    </span>

                    <span class="status-badge ${status.className}">
                        ${status.label}
                    </span>
                </div>

                <h3>${election.title}</h3>

                <p>${election.description}</p>

                <div class="card-info">
                    <div>
                        Số phiếu
                        <strong>${election.votes}</strong>
                    </div>

                    <div>
                        Ứng viên
                        <strong>${election.candidates}</strong>
                    </div>

                    <div>
                        Kết thúc
                        <strong>${election.endDate}</strong>
                    </div>
                </div>

                ${buttonHTML}
            </article>
        `;
    });
}

// Cập nhật thống kê
function updateStatistics() {
    document.getElementById("totalElections").textContent =
        elections.length;

    document.getElementById("activeElections").textContent =
        elections.filter(item => item.status === "active").length;

    document.getElementById("endedElections").textContent =
        elections.filter(item => item.status === "ended").length;
}

// Tìm kiếm và lọc
function filterElections() {
    const keyword = document
        .getElementById("searchElection")
        .value.toLowerCase()
        .trim();

    const selectedStatus =
        document.getElementById("statusFilter").value;

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

// Khởi chạy trang
document.addEventListener("DOMContentLoaded", function () {
    updateStatistics();
    renderElections(elections);

    document
        .getElementById("searchElection")
        .addEventListener("input", filterElections);

    document
        .getElementById("statusFilter")
        .addEventListener("change", filterElections);
});
