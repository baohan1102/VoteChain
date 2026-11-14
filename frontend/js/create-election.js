
// =========================================
// VOTECHAIN - CREATE ELECTION PAGE
// Connected to Smart Contract
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

    // Gioi han thoi gian
    startTimeInput.addEventListener("change", function () {
        endTimeInput.min = startTimeInput.value;
    });

    // =========================================
    // TAO CUOC BINH CHON TREN BLOCKCHAIN
    // =========================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (submitBtn.disabled) {
            return;
        }

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

        if (options.length > 10) {
            showCreateToast("Chỉ được tạo tối đa 10 lựa chọn!");
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

        if (
            Number.isNaN(startTimestamp) ||
            Number.isNaN(endTimestamp)
        ) {
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

        // Chuyen sang Unix timestamp (giay)
        const startUnix = Math.floor(startTimestamp / 1000);
        const endUnix = Math.floor(endTimestamp / 1000);

        const pollData = {
            title: title,
            description: description,
            options: options,
            startTime: startUnix,
            endTime: endUnix
        };

        console.log("Du lieu cuoc binh chon:", pollData);

        // Bat dau gui giao dich
        try {

            submitBtn.disabled = true;
            submitBtn.textContent = "Đang kết nối ví...";

            // Lay Smart Contract co quyen ghi
            if (!window.VoteChain) {
                throw new Error(
                    "Không tìm thấy VoteChain. Vui lòng kiểm tra contract.js."
                );
            }

            const contract = await window.VoteChain.getWriteContract();

            submitBtn.textContent = "Vui lòng xác nhận trên MetaMask...";

            // Goi ham createPoll tren Smart Contract
            const transaction = await contract.createPoll(
                title,
                description,
                options,
                startUnix,
                endUnix
            );

            console.log("Transaction:", transaction.hash);

            showCreateToast("Đã gửi giao dịch! Đang chờ Blockchain xác nhận...");

            submitBtn.textContent = "Đang xác nhận giao dịch...";

            // Cho giao dich duoc xac nhan
            const receipt = await transaction.wait();

            console.log("Giao dịch đã xác nhận:", receipt);

            // Doc lai tong so cuoc binh chon
            const readContract = await window.VoteChain.getReadContract();

            const totalPolls = await readContract.pollCount();

            console.log("Tổng số cuộc bình chọn:", totalPolls.toString());

            // Tim ID vua tao tu event PollCreated
            let createdPollId = null;

            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);

                    if (parsedLog && parsedLog.name === "PollCreated") {
                        createdPollId = parsedLog.args.pollId.toString();
                        break;
                    }
                } catch (error) {
                    // Bo qua log khong thuoc contract
                }
            }

            console.log("ID cuộc bình chọn vừa tạo:", createdPollId);

            showCreateToast(
                "Tạo cuộc bình chọn thành công trên Blockchain!"
            );

            // Cap nhat trang thai nut
            submitBtn.textContent = "Đã tạo thành công";

            // Chuyen sang trang danh sach sau 2 giay
            setTimeout(function () {
                window.location.href = "elections.html";
            }, 2000);

        } catch (error) {

            console.error("Lỗi tạo cuộc bình chọn:", error);

            let message = "Không thể tạo cuộc bình chọn. Vui lòng thử lại.";

            if (error.code === 4001 ||
                error.code === "ACTION_REJECTED") {
                message = "Bạn đã từ chối giao dịch trên MetaMask.";
            }
            else if (error.message &&
                error.message.includes("Title cannot be empty")) {
                message = "Tên cuộc bình chọn không được để trống.";
            }
            else if (error.message &&
                error.message.includes("At least 2 options required")) {
                message = "Cần ít nhất 2 lựa chọn.";
            }
            else if (error.message &&
                error.message.includes("Invalid time range")) {
                message = "Khoảng thời gian bình chọn không hợp lệ.";
            }
            else if (error.message &&
                error.message.includes("End time must be future")) {
                message = "Thời gian kết thúc phải ở tương lai.";
            }
            else if (error.message &&
                error.message.includes("insufficient funds")) {
                message = "Ví không đủ SepoliaETH để trả phí giao dịch.";
            }
            else if (error.reason) {
                message = "Giao dịch thất bại: " + error.reason;
            }

            showCreateToast(message);

            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Tạo cuộc bình chọn <span>→</span>';
        }
    });

    // Khoi tao
    updateOptions();

    // Kiem tra ket noi vi neu wallet.js ho tro
    if (typeof checkWalletConnection === "function") {
        checkWalletConnection();
    }

});
