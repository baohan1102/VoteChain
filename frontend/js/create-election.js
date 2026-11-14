
// =========================================
// VOTECHAIN - CREATE ELECTION PAGE
// Frontend demo - chua ket noi Smart Contract
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("createElectionForm");
    const optionList = document.getElementById("optionList");
    const addOptionBtn = document.getElementById("addOptionBtn");

    const titleInput = document.getElementById("pollTitle");
    const descriptionInput = document.getElementById("pollDescription");
    const startTimeInput = document.getElementById("startTime");
    const endTimeInput = document.getElementById("endTime");

    const optionCount = document.getElementById("optionCount");
    const previewTitle = document.getElementById("previewTitle");
    const previewDescription = document.getElementById("previewDescription");
    const previewOptionCount = document.getElementById("previewOptionCount");

    const submitBtn = document.getElementById("submitPollBtn");

    // Toast notification
    function showCreateToast(message) {
        const toast = document.getElementById("createToast");

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    // Lay danh sach lua chon
    function getOptions() {
        return Array.from(
            document.querySelectorAll(".poll-option")
        );
    }

    // Cap nhat so luong lua chon
    function updateOptions() {
        const options = getOptions();
        const count = options.length;

        optionCount.textContent = count + " lựa chọn";
        previewOptionCount.textContent = count;

        options.forEach(function (input, index) {
            const row = input.closest(".option-input-row");

            row.querySelector(".option-number").textContent =
                String(index + 1).padStart(2, "0");

            const removeBtn = row.querySelector(".remove-option");

            removeBtn.disabled = count <= 2;
        });
    }

    // Them lua chon moi
    addOptionBtn.addEventListener("click", function () {

        const options = getOptions();

        if (options.length >= 10) {
            showCreateToast("Chỉ được tạo tối đa 10 lựa chọn!");
            return;
        }

        const row = document.createElement("div");
        row.className = "option-input-row";

        row.innerHTML = `
            <span class="option-number"></span>

            <input
                type="text"
                class="poll-option"
                placeholder="Nhập lựa chọn mới"
                maxlength="100"
                required
            >

            <button
                type="button"
                class="remove-option"
                title="Xóa lựa chọn"
            >
                ×
            </button>
        `;

        optionList.appendChild(row);

        updateOptions();

        row.querySelector("input").focus();
    });

    // Xoa lua chon
    optionList.addEventListener("click", function (event) {

        if (!event.target.classList.contains("remove-option")) {
            return;
        }

        if (getOptions().length <= 2) {
            showCreateToast("Phải có ít nhất 2 lựa chọn!");
            return;
        }

        event.target.closest(".option-input-row").remove();

        updateOptions();
    });

    // Cap nhat xem truoc tieu de
    titleInput.addEventListener("input", function () {
        previewTitle.textContent =
            titleInput.value.trim() || "Tên cuộc bình chọn";
    });

    // Cap nhat xem truoc mo ta
    descriptionInput.addEventListener("input", function () {
        previewDescription.textContent =
            descriptionInput.value.trim() ||
            "Mô tả cuộc bình chọn sẽ xuất hiện ở đây.";
    });

    // Gioi han thoi gian bat dau va ket thuc
    startTimeInput.addEventListener("change", function () {
        endTimeInput.min = startTimeInput.value;
    });

    // Kiem tra bieu mau
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        const options = getOptions().map(function (input) {
            return input.value.trim();
        });

        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        // Kiem tra tieu de
        if (!title) {
            showCreateToast("Vui lòng nhập tên cuộc bình chọn!");
            titleInput.focus();
            return;
        }

        // Kiem tra mo ta
        if (!description) {
            showCreateToast("Vui lòng nhập mô tả!");
            descriptionInput.focus();
            return;
        }

        // Kiem tra so luong lua chon
        if (options.length < 2) {
            showCreateToast("Phải có ít nhất 2 lựa chọn!");
            return;
        }

        // Kiem tra lua chon trong
        if (options.some(option => option.length === 0)) {
            showCreateToast("Vui lòng nhập đầy đủ các lựa chọn!");
            return;
        }

        // Kiem tra lua chon trung nhau
        const normalizedOptions = options.map(option =>
            option.toLowerCase()
        );

        if (new Set(normalizedOptions).size !== options.length) {
            showCreateToast("Các lựa chọn không được trùng nhau!");
            return;
        }

        // Kiem tra thoi gian
        if (!startTime || !endTime) {
            showCreateToast("Vui lòng chọn thời gian bình chọn!");
            return;
        }

        const startTimestamp = new Date(startTime).getTime();
        const endTimestamp = new Date(endTime).getTime();

        if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
            showCreateToast("Thời gian không hợp lệ!");
            return;
        }

        if (startTimestamp >= endTimestamp) {
            showCreateToast("Thời gian kết thúc phải sau thời gian bắt đầu!");
            return;
        }

        if (endTimestamp <= Date.now()) {
            showCreateToast("Thời gian kết thúc phải ở tương lai!");
            return;
        }

        // Du lieu chuan bi gui len Smart Contract
        const pollData = {
            title: title,
            description: description,
            options: options,
            startTime: Math.floor(startTimestamp / 1000),
            endTime: Math.floor(endTimestamp / 1000)
        };

        console.log("Du lieu cuoc binh chon:", pollData);

        // Hien tai chua gui giao dich Blockchain
        showCreateToast(
            "Thông tin hợp lệ! Chờ tích hợp Smart Contract để tạo cuộc bình chọn."
        );

        console.log(
            "Chua gui giao dich. Day la du lieu frontend demo."
        );
    });

    // Khoi tao
    updateOptions();

    // Kiem tra ket noi vi neu wallet.js ho tro
    if (typeof checkWalletConnection === "function") {
        checkWalletConnection();
    }

});
