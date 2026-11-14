
// ===================================
// VOTECHAIN - VOTING PAGE
// DEMO ONLY - CHƯA GHI LÊN BLOCKCHAIN
// ===================================

let selectedCandidateId = null;

const candidateNames = {
    1: "Nguyễn Minh Anh",
    2: "Trần Hoàng Nam",
    3: "Phạm Gia Linh",
    4: "Quách Tuấn Việt"
};

document.addEventListener("DOMContentLoaded", function () {

    const candidateCards = document.querySelectorAll(".candidate-card");
    const selectButtons = document.querySelectorAll(".select-candidate");
    const confirmButton = document.getElementById("confirmVote");
    const selectedText = document.getElementById("selectedCandidate");

    // Lấy ID cuộc bầu cử từ URL
    const params = new URLSearchParams(window.location.search);
    const electionId = params.get("id") || "1";

    console.log("Election ID:", electionId);

    // Chọn ứng viên
    selectButtons.forEach(button => {
        button.addEventListener("click", function () {

            selectedCandidateId = this.dataset.candidate;

            // Xóa trạng thái lựa chọn cũ
            candidateCards.forEach(card => {
                card.classList.remove("selected");
            });

            // Đánh dấu ứng viên được chọn
            const selectedCard = this.closest(".candidate-card");
            selectedCard.classList.add("selected");

            // Cập nhật nội dung xác nhận
            selectedText.textContent =
                "Bạn đã chọn: " +
                candidateNames[selectedCandidateId];

            // Cho phép xác nhận
            confirmButton.disabled = false;

            // Đổi nội dung các nút
            selectButtons.forEach(btn => {
                btn.textContent = "Chọn ứng viên";
            });

            this.textContent = "✓ Đã chọn";
        });
    });

    // Xác nhận bỏ phiếu demo
    confirmButton.addEventListener("click", function () {

        if (!selectedCandidateId) {
            showVoteToast("Vui lòng chọn một ứng viên!");
            return;
        }

        const candidateName =
            candidateNames[selectedCandidateId];

        const confirmed = window.confirm(
            "Bạn xác nhận lựa chọn " +
            candidateName +
            " cho cuộc bầu cử này?"
        );

        if (!confirmed) return;

        // Đây chỉ là thao tác demo giao diện.
        // Chưa gửi giao dịch đến Smart Contract.
        showVoteToast(
            "Đã xác nhận lựa chọn demo. Chức năng ghi phiếu sẽ được tích hợp sau khi có Smart Contract."
        );

        console.log({
            electionId: electionId,
            candidateId: selectedCandidateId,
            candidateName: candidateName
        });
    });

});

// Hiển thị thông báo
function showVoteToast(message) {
    const toast = document.getElementById("voteToast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}
