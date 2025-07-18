document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('formBody');
    const pasteBtn = document.getElementById('pasteDataButton');
    const bulkPaste = document.getElementById('bulkPaste');

    // Hàm tạo một hàng mới từ mảng giá trị
    function createRow(data) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><input type="text" name="code[]" value="${data[0] || ''}" required /></td>
            <td><input type="text" name="description[]" value="${data[1] || 'none'}" required /></td>
            <td><input type="number" name="quantity[]" value="${data[2] || 1}" min="1" required /></td>
            <td><input type="text" name="model[]" value="${data[3] || ''}" required /></td>
            <td><input type="text" name="note[]" value="${data[4] || 'none'}" required /></td>
            <td><input type="text" name="unit_price[]" value="${data[5] || 'none'}" required /></td>
            <td class="action-buttons">
                <button type="button" class="copy-row-btn">📋 Copy</button>
                <button type="button" class="remove-row-btn">🗑️ Remove</button>
            </td>
        `;

        tableBody.appendChild(row);
    }

    // Hàm xử lý dán dữ liệu từ Excel vào textarea
    pasteBtn.addEventListener('click', function () {
        const lines = bulkPaste.value.trim().split('\n');

        lines.forEach(line => {
            const values = line.split('\t'); // Dữ liệu cách nhau bằng tab
            createRow(values);
        });

        bulkPaste.value = ''; // Xóa nội dung sau khi xử lý
    });

    // Nút thêm 1 dòng trống
    document.querySelector('.add-row-btn').addEventListener('click', () => {
        createRow(['', 'none', 1, '', 'none', 'none']);
    });

    // Xử lý copy & remove
    tableBody.addEventListener('click', function (event) {
        const button = event.target;

        if (button.classList.contains('remove-row-btn')) {
            const row = button.closest('tr');
            if (row) row.remove();
        }

        if (button.classList.contains('copy-row-btn')) {
            const row = button.closest('tr');
            const inputs = row.querySelectorAll('input');
            const values = Array.from(inputs).map(input => input.value);
            createRow(values);
        }
    });

    // Reset email CC nếu có
    const ccEmailInput = document.getElementById('cc_email');
    const hiddenCcEmail = document.getElementById('hidden_cc_email');

    ccEmailInput.addEventListener('input', function () {
        hiddenCcEmail.value = ccEmailInput.value;
    });

    // Nút reset toàn bộ form
    document.getElementById('resetFormBtn').addEventListener('click', function () {
        document.getElementById('quotationForm').reset();

        // Chỉ giữ lại 1 dòng đầu tiên
        const allRows = tableBody.querySelectorAll('tr');
        allRows.forEach((row, index) => {
            if (index > 0) row.remove();
        });
    });
});
