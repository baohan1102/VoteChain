
// ======================================
// VOTECHAIN - RESULTS PAGE
// Kết nối Smart Contract - Sepolia
// ======================================

const urlParams = new URLSearchParams(window.location.search);
const electionId = urlParams.get("id");

const resultsListSection = document.getElementById("resultsListSection");
const resultsElectionList = document.getElementById("resultsElectionList");
const noResultsElection = document.getElementById("noResultsElection");
const resultDetailPage = document.getElementById("resultDetailPage");

let allElections = [];

// ======================================
// 1. HÀM HỖ TRỢ
// ======================================

function shortenResultAddress(address) {
    if (!address || address.length < 12) return address || "--";
    return address.slice(0, 6) + "..." + address.slice(-4);
}

function getTotalVotes(election) {
    return election.options.reduce(
        (sum, option) => sum + Number(option.votes),
        0
    );
}

function getStatus(timestampStart, timestampEnd) {
    const now = Math.floor(Date.now() / 1000);

    if (now < Number(timestampStart)) return "upcoming";
    if (now > Number(timestampEnd)) return "ended";

    return "active";
}

function getStatusText(status) {
    const statuses = {
        active: "Đang diễn ra",
        upcoming: "Sắp diễn ra",
        ended: "Đã kết thúc"
    };

    return statuses[status] || "Không xác định";
}

function formatDate(timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// ======================================
// 2. LẤY DỮ LIỆU TỪ BLOCKCHAIN
// ======================================

async function loadElectionsFromBlockchain() {
    try {
        const contract = await window.VoteChain.getReadContract();

        const pollCount = Number(await contract.pollCount());

        allElections = [];

        for (let i = 1; i <= pollCount; i++) {
            const poll = await contract.polls(i);
            const result = await contract.getResults(i);

            const options = [];

            for (let j = 0; j < result[0].length; j++) {
                options.push({
                    name: result[0][j],
                    votes: Number(result[1][j])
                });
            }

            const election = {
                id: i,
                title: poll[0],
                description: poll[1],
                startTime: Number(poll[2]),
                endTime: Number(poll[3]),
                creator: poll[4],
                totalVotes: Number(poll[5]),
                status: getStatus(poll[2], poll[3]),
                endDate: formatDate(poll[3]),
                options: options
            };

            allElections.push(election);
        }

        console.log("Đã tải dữ liệu kết quả từ Blockchain:", allElections);
        const dataSource = document.getElementById("dataSource");

if (dataSource) {
    dataSource.textContent = "Nguồn dữ liệu: Blockchain Sepolia";
}

        return allElections;

    } catch (error) {
        console.error("Lỗi tải kết quả Blockchain:", error);
        throw error;
    }
}

// ======================================
// 3. HIỂN THỊ DANH SÁCH KẾT QUẢ
// ======================================

function renderResultsList() {
    if (!resultsListSection || !resultsElectionList) return;

    resultsListSection.hidden = false;

    if (resultDetailPage) {
        resultDetailPage.hidden = true;
    }

    resultsElectionList.innerHTML = "";

    // Chỉ hiển thị cuộc bình chọn đã có phiếu
    const electionsWithResults = allElections
        .filter(election => getTotalVotes(election) > 0)
        .sort((a, b) => b.id - a.id);

    if (electionsWithResults.length === 0) {
        if (noResultsElection) {
            noResultsElection.hidden = false;
        }
        return;
    }

    if (noResultsElection) {
        noResultsElection.hidden = true;
    }

    electionsWithResults.forEach(election => {
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

        leading.querySelector("strong").textContent =
            leadingOption ? leadingOption.name : "--";

        statistics.appendChild(votes);
        statistics.appendChild(options);
        statistics.appendChild(leading);

        const viewButton = document.createElement("a");
        viewButton.className = "view-result-btn";
        viewButton.href = `results.html?id=${election.id}`;
        viewButton.textContent = "Xem kết quả →";

        card.appendChild(information);
        card.appendChild(statistics);
        card.appendChild(viewButton);

        resultsElectionList.appendChild(card);
    });
}

// ======================================
// 4. HIỂN THỊ THÔNG TIN CUỘC BÌNH CHỌN
// ======================================

function renderElectionInfo(election) {
    setText("electionTitle", election.title);
    setText("electionDescription", election.description);
    setText("electionEndDate", election.endDate);

    setText(
        "electionCreator",
        shortenResultAddress(election.creator)
    );

    setText("electionId", "Mã cuộc bầu cử: #" + election.id);

    const status = document.getElementById("resultStatus");

    if (status) {
        status.textContent = getStatusText(election.status);
        status.className = "result-status " + election.status;
    }
}

// ======================================
// 5. THỐNG KÊ KẾT QUẢ
// ======================================

function renderStatistics(election) {
    const totalVotes = getTotalVotes(election);

    setText("totalVotes", totalVotes.toLocaleString("vi-VN"));
    setText("totalOptions", election.options.length);

    if (totalVotes === 0) {
        setText("leadingOption", "--");
        return;
    }

    const leading = [...election.options].sort(
        (a, b) => b.votes - a.votes
    )[0];

    setText("leadingOption", leading.name);
}

// ======================================
// 6. BIỂU ĐỒ VÀ CHI TIẾT PHIẾU
// ======================================

function renderChart(election) {
    const chartContainer = document.getElementById("chartContainer");
    const resultDetailList = document.getElementById("resultDetailList");
    const emptyResults = document.getElementById("emptyResults");

    if (!chartContainer || !resultDetailList) return;

    chartContainer.innerHTML = "";
    resultDetailList.innerHTML = "";

    const totalVotes = getTotalVotes(election);

    chartContainer.hidden = totalVotes === 0;

    if (emptyResults) {
        emptyResults.hidden = totalVotes !== 0;
    }

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
// 7. HIỂN THỊ TRANG CHI TIẾT
// ======================================

function loadResultDetail() {
    if (resultsListSection) {
        resultsListSection.hidden = true;
    }

    if (resultDetailPage) {
        resultDetailPage.hidden = false;
    }

    const election = allElections.find(
        item => item.id === Number(electionId)
    );

    if (!election) {
        if (resultDetailPage) {
            resultDetailPage.hidden = true;
        }

        if (resultsListSection) {
            resultsListSection.hidden = false;
        }

        if (resultsElectionList) {
            resultsElectionList.innerHTML = "";

            const message = document.createElement("p");
            message.textContent = "Không tìm thấy cuộc bầu cử này.";

            resultsElectionList.appendChild(message);
        }

        if (noResultsElection) {
            noResultsElection.hidden = true;
        }

        return;
    }

    renderElectionInfo(election);
    renderStatistics(election);
    renderChart(election);
}

// ======================================
// 8. TẢI LẠI DỮ LIỆU
// ======================================

async function refreshResults() {
    const refreshButton = document.getElementById("refreshResults");

    try {
        if (refreshButton) {
            refreshButton.disabled = true;
        }

        await loadElectionsFromBlockchain();

        if (electionId) {
            loadResultDetail();
        } else {
            renderResultsList();
        }

    } catch (error) {
        console.error("Không thể làm mới kết quả:", error);
        alert(
            "Không thể tải dữ liệu từ Blockchain. " +
            "Hãy kiểm tra MetaMask và mạng Sepolia."
        );
    } finally {
        if (refreshButton) {
            refreshButton.disabled = false;
        }
    }
}

// ======================================
// 9. SỰ KIỆN LÀM MỚI
// ======================================

const refreshButton = document.getElementById("refreshResults");

if (refreshButton) {
    refreshButton.addEventListener("click", refreshResults);
}

// ======================================
// 10. KHỞI TẠO TRANG
// ======================================

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await loadElectionsFromBlockchain();

        if (electionId) {
            loadResultDetail();
        } else {
            renderResultsList();
        }

        if (typeof checkWalletConnection === "function") {
            checkWalletConnection();
        }

    } catch (error) {
        console.error("Lỗi khởi tạo trang kết quả:", error);

        if (resultsElectionList) {
            resultsElectionList.innerHTML = "";

            const message = document.createElement("p");
            message.textContent =
                "Không thể tải kết quả từ Blockchain. " +
                "Vui lòng kiểm tra MetaMask và mạng Sepolia.";

            resultsElectionList.appendChild(message);
        }

        if (noResultsElection) {
            noResultsElection.hidden = true;
        }
    }
});
