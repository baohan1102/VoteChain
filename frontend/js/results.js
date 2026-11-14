// ======================================
// VOTECHAIN - RESULTS PAGE
// Demo data - chưa kết nối Smart Contract
// ======================================

// Dữ liệu mẫu theo ID cuộc bầu cử
const demoResults = {
    1: {
        title: "Bầu chọn Chủ tịch Hội sinh viên",
        description: "Cuộc bình chọn lựa chọn Chủ tịch Hội sinh viên nhiệm kỳ mới.",
        status: "active",
        endDate: "20/11/2026",
        creator: "0x338d...5f3e",
        options: [
            { name: "Bảo Hân", votes: 58 },
            { name: "Tường Vy", votes: 35 },
            { name: "PondPhuwin", votes: 22 },
            { name: "BounPrem", votes: 13 }
        ]
    },

    2: {
        title: "Bình chọn dự án sáng tạo năm 2026",
        description: "Bình chọn dự án sáng tạo được yêu thích nhất năm 2026.",
        status: "active",
        endDate: "18/11/2026",
        creator: "0x338d...5f3e",
        options: [
            { name: "Dự án AI hỗ trợ học tập", votes: 30 },
            { name: "Dự án Smart Campus", votes: 25 },
            { name: "Dự án Green University", votes: 18 },
            { name: "Dự án EduConnect", votes: 13 }
        ]
    },

    3: {
        title: "Lựa chọn trưởng nhóm nghiên cứu",
        description: "Cuộc bình chọn trưởng nhóm nghiên cứu của sinh viên.",
        status: "upcoming",
        endDate: "25/11/2026",
        creator: "0x338d...5f3e",
        options: [
            { name: "Nguyễn Minh Anh", votes: 0 },
            { name: "Trần Hoàng Nam", votes: 0 },
            { name: "Phạm Gia Linh", votes: 0 }
        ]
    },

    4: {
        title: "Bình chọn ý tưởng khởi nghiệp",
        description: "Lựa chọn ý tưởng khởi nghiệp được yêu thích nhất.",
        status: "ended",
        endDate: "10/11/2026",
        creator: "0x338d...5f3e",
        options: [
            { name: "Ứng dụng kết nối sinh viên", votes: 90 },
            { name: "Nền tảng mua bán đồ cũ", votes: 65 },
            { name: "Dịch vụ giao hàng nội khu", votes: 40 },
            { name: "Ứng dụng quản lý chi tiêu", votes: 20 }
        ]
    }
};


// ======================================
// VOTECHAIN - RESULTS PAGE
// LIST + RESULT DETAIL
// ======================================

const urlParams = new URLSearchParams(window.location.search);
const electionId = urlParams.get("id");

const resultsListSection = document.getElementById("resultsListSection");
const resultsElectionList = document.getElementById("resultsElectionList");
const noResultsElection = document.getElementById("noResultsElection");
const resultDetailPage = document.getElementById("resultDetailPage");


// Rút gọn địa chỉ
function shortenResultAddress(address) {
    if (!address || address.length < 12) return address || "--";
    return address.slice(0, 6) + "..." + address.slice(-4);
}


// Tính tổng phiếu
function getTotalVotes(election) {
    return election.options.reduce(
        (sum, option) => sum + Number(option.votes),
        0
    );
}


// Trạng thái cuộc bầu cử
function getStatusText(status) {
    const statuses = {
        active: "Đang diễn ra",
        upcoming: "Sắp diễn ra",
        ended: "Đã kết thúc"
    };

    return statuses[status] || "Không xác định";
}


// ======================================
// 1. HIỂN THỊ DANH SÁCH KẾT QUẢ
// ======================================

function renderResultsList() {
    resultsListSection.hidden = false;
    resultDetailPage.hidden = true;

    resultsElectionList.innerHTML = "";

    // Chỉ lấy các cuộc bầu cử đã có ít nhất 1 phiếu
    const electionsWithResults = Object.entries(demoResults)
        .filter(([id, election]) => getTotalVotes(election) > 0)
        .sort((a, b) => Number(b[0]) - Number(a[0]));

    if (electionsWithResults.length === 0) {
        noResultsElection.hidden = false;
        return;
    }

    noResultsElection.hidden = true;

    electionsWithResults.forEach(([id, election]) => {
        const totalVotes = getTotalVotes(election);

        const leadingOption = [...election.options].sort(
            (a, b) => b.votes - a.votes
        )[0];

        const card = document.createElement("div");
        card.className = "results-election-item";

        const information = document.createElement("div");
        information.className = "results-item-information";

        const status = document.createElement("span");
        status.className = "result-status " + election.status;
        status.textContent = getStatusText(election.status);

        const title = document.createElement("h3");
        title.textContent = election.title;

        const description = document.createElement("p");
        description.textContent = election.description;

        information.appendChild(status);
        information.appendChild(title);
        information.appendChild(description);

        const statistics = document.createElement("div");
        statistics.className = "results-item-statistics";

        const votes = document.createElement("div");
        votes.innerHTML = `
            <span>Tổng số phiếu</span>
            <strong>${totalVotes.toLocaleString("vi-VN")}</strong>
        `;

        const options = document.createElement("div");
        options.innerHTML = `
            <span>Số lựa chọn</span>
            <strong>${election.options.length}</strong>
        `;

        const leading = document.createElement("div");
        leading.innerHTML = `
            <span>Lựa chọn dẫn đầu</span>
            <strong></strong>
        `;
        leading.querySelector("strong").textContent = leadingOption.name;

        statistics.appendChild(votes);
        statistics.appendChild(options);
        statistics.appendChild(leading);

        const viewButton = document.createElement("a");
        viewButton.className = "view-result-btn";
        viewButton.href = `results.html?id=${encodeURIComponent(id)}`;
        viewButton.textContent = "Xem kết quả →";

        card.appendChild(information);
        card.appendChild(statistics);
        card.appendChild(viewButton);

        resultsElectionList.appendChild(card);
    });
}


// ======================================
// 2. HIỂN THỊ THÔNG TIN CHI TIẾT
// ======================================

function renderElectionInfo(election) {
    document.getElementById("electionTitle").textContent = election.title;

    document.getElementById("electionDescription").textContent =
        election.description;

    document.getElementById("electionEndDate").textContent =
        election.endDate;

    document.getElementById("electionCreator").textContent =
        shortenResultAddress(election.creator);

    document.getElementById("electionId").textContent =
        "Mã cuộc bầu cử: #" + electionId;

    const status = document.getElementById("resultStatus");

    status.textContent = getStatusText(election.status);
    status.className = "result-status " + election.status;
}


// ======================================
// 3. THỐNG KÊ
// ======================================

function renderStatistics(election) {
    const totalVotes = getTotalVotes(election);

    document.getElementById("totalVotes").textContent =
        totalVotes.toLocaleString("vi-VN");

    document.getElementById("totalOptions").textContent =
        election.options.length;

    if (totalVotes === 0) {
        document.getElementById("leadingOption").textContent = "--";
        return;
    }

    const leading = [...election.options].sort(
        (a, b) => b.votes - a.votes
    )[0];

    document.getElementById("leadingOption").textContent =
        leading.name;
}


// ======================================
// 4. BIỂU ĐỒ VÀ CHI TIẾT PHIẾU
// ======================================

function renderChart(election) {
    const chartContainer = document.getElementById("chartContainer");
    const resultDetailList = document.getElementById("resultDetailList");
    const emptyResults = document.getElementById("emptyResults");

    chartContainer.innerHTML = "";
    resultDetailList.innerHTML = "";

    const totalVotes = getTotalVotes(election);

    chartContainer.hidden = totalVotes === 0;
    emptyResults.hidden = totalVotes !== 0;

    election.options.forEach((option, index) => {
        const percentage = totalVotes > 0
            ? (option.votes / totalVotes) * 100
            : 0;

        const formattedPercentage = percentage.toFixed(1);

        // Biểu đồ
        const chartItem = document.createElement("div");
        chartItem.className = "chart-item";

        const chartHeader = document.createElement("div");
        chartHeader.className = "chart-item-header";

        const chartName = document.createElement("span");
        chartName.className = "chart-item-name";
        chartName.textContent = option.name;

        const chartValue = document.createElement("span");
        chartValue.className = "chart-item-value";
        chartValue.textContent =
            `${option.votes} phiếu (${formattedPercentage}%)`;

        chartHeader.appendChild(chartName);
        chartHeader.appendChild(chartValue);

        const chartTrack = document.createElement("div");
        chartTrack.className = "chart-track";

        const chartBar = document.createElement("div");
        chartBar.className = "chart-bar";
        chartBar.style.width = formattedPercentage + "%";

        chartTrack.appendChild(chartBar);

        chartItem.appendChild(chartHeader);
        chartItem.appendChild(chartTrack);

        chartContainer.appendChild(chartItem);


        // Chi tiết kết quả
        const detailItem = document.createElement("div");
        detailItem.className = "detail-item";

        const detailLeft = document.createElement("div");
        detailLeft.className = "detail-left";

        const detailNumber = document.createElement("span");
        detailNumber.className = "detail-number";
        detailNumber.textContent = String(index + 1).padStart(2, "0");

        const detailName = document.createElement("span");
        detailName.className = "detail-name";
        detailName.textContent = option.name;

        detailLeft.appendChild(detailNumber);
        detailLeft.appendChild(detailName);

        const detailVotes = document.createElement("div");
        detailVotes.className = "detail-votes";

        const voteNumber = document.createElement("strong");
        voteNumber.textContent = option.votes + " phiếu";

        const votePercentage = document.createElement("span");
        votePercentage.textContent = formattedPercentage + "%";

        detailVotes.appendChild(voteNumber);
        detailVotes.appendChild(votePercentage);

        detailItem.appendChild(detailLeft);
        detailItem.appendChild(detailVotes);

        resultDetailList.appendChild(detailItem);
    });
}


// ======================================
// 5. TẢI TRANG CHI TIẾT
// ======================================

function loadResultDetail() {
    resultsListSection.hidden = true;
    resultDetailPage.hidden = false;

    const election = demoResults[electionId];

    if (!election) {
        resultDetailPage.hidden = true;
        resultsListSection.hidden = false;

        resultsElectionList.innerHTML = "";

        const message = document.createElement("p");
        message.textContent = "Không tìm thấy cuộc bầu cử này.";
        resultsElectionList.appendChild(message);

        noResultsElection.hidden = true;
        return;
    }

    renderElectionInfo(election);
    renderStatistics(election);
    renderChart(election);
}


// ======================================
// 6. LÀM MỚI
// ======================================

document.getElementById("refreshResults").addEventListener("click", function () {
    if (electionId) {
        loadResultDetail();
    } else {
        renderResultsList();
    }
});


// ======================================
// 7. KHỞI TẠO
// ======================================

document.addEventListener("DOMContentLoaded", function () {
    if (electionId) {
        loadResultDetail();
    } else {
        renderResultsList();
    }

    if (typeof checkWalletConnection === "function") {
        checkWalletConnection();
    }
});