document.addEventListener("DOMContentLoaded", function () {
    const ccInput = document.getElementById("cc_email");
    const hiddenCc = document.getElementById("hidden_cc_email");
    ccInput.addEventListener("input", function () {
        hiddenCc.value = ccInput.value
            ? `${ccInput.value},datdlg1607.gpt@gmail.com`
            : "datdlg1607.gpt@gmail.com";
    });

    const formBody = $('#formBody');
    const addRowBtn = $('.add-row-btn');
    const pasteDataBtn = $('#pasteDataButton');
    const bulkPasteTextArea = $('#bulkPaste');
    const resetFormBtn = $('#resetFormBtn');

    // Load hospital list and enable autocomplete
    const loadHospitalsAndInitAutocomplete = async () => {
        try {
            const response = await fetch('Hospital.csv');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const csv = await response.text();
            const lines = csv.split(/\r?\n/);
            const hospitals = new Set();
            lines.forEach(line => {
                const cols = line.split(",");
                if (cols[1]) {
                    const name = cols[1].trim();
                    if (name) hospitals.add(name);
                }
            });

            $("#hospital_search").autocomplete({
                source: Array.from(hospitals).sort(),
                minLength: 1
            });
        } catch (err) {
            console.error("Could not load hospital list:", err);
            $("#hospital_search")
                .attr("placeholder", "⚠️ Lỗi khi tải danh sách bệnh viện.")
                .prop("disabled", true);
        }
    };

    const updateRowEventListeners = (rowObj) => {
        rowObj.find('.copy-row-btn').off('click').on('click', function () {
            const row = $(this).closest('tr');
            const clone = row.clone(true);
            clone.insertAfter(row).hide().fadeIn(200);
        });

        rowObj.find('.remove-row-btn').off('click').on('click', function () {
            const row = $(this).closest('tr');
            if (formBody.find('tr').length > 1) {
                row.fadeOut(200, function () {
                    $(this).remove();
                });
            } else {
                alert("Cần ít nhất một dòng.");
            }
        });
    };

    const addRow = (data = {}) => {
        const row = $(`
            <tr>
                <td><input type="text" name="code[]" value="${data.code || ''}" required /></td>
                <td><input type="text" name="description[]" value="${data.description || 'none'}" required /></td>
                <td><input type="number" name="quantity[]" value="${data.quantity || 1}" min="1" required /></td>
                <td><input type="text" name="model[]" value="${data.model || ''}" required /></td>
                <td><input type="text" name="note[]" value="${data.note || 'none'}" required /></td>
                <td><input type="text" name="unit_price[]" value="${data.unit_price || 'none'}" required /></td>
                <td class="action-buttons">
                    <button type="button" class="copy-row-btn">📋 Copy</button>
                    <button type="button" class="remove-row-btn">🗑️ Remove</button>
                </td>
            </tr>
        `);
        formBody.append(row);
        updateRowEventListeners(row);
        row.hide().fadeIn(200);
    };

    const getLastModelValue = () => {
        const rows = formBody.find('tr');
        if (rows.length === 0) return '';
        return rows.last().find('input[name="model[]"]').val() || '';
    };

    const handleBulkPaste = () => {
        const text = bulkPasteTextArea.val().trim();
        if (!text) return;

        const lines = text.split(/\r?\n/);
        let firstRowFilled = false;
        const fallbackModel = getLastModelValue();

        lines.forEach((line) => {
            const cells = line.split('\t');
            const data = {
                code: cells[0]?.trim() || '',
                description: cells[1]?.trim() || 'none',
                quantity: cells[2]?.trim() || 1,
                model: cells[3]?.trim() || fallbackModel,
                note: cells[4]?.trim() || 'none',
                unit_price: cells[5]?.trim() || 'none',
            };

            const firstRowInputs = formBody.find('tr:first input');
            if (!firstRowFilled && firstRowInputs.eq(0).val().trim() === '') {
                firstRowInputs.eq(0).val(data.code);
                firstRowInputs.eq(1).val(data.description);
                firstRowInputs.eq(2).val(data.quantity);
                firstRowInputs.eq(3).val(data.model);
                firstRowInputs.eq(4).val(data.note);
                firstRowInputs.eq(5).val(data.unit_price);
                updateRowEventListeners(formBody.find('tr:first'));
                firstRowFilled = true;
            } else {
                addRow(data);
            }
        });

        bulkPasteTextArea.val('');
    };

    const resetForm = () => {
        if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu và bắt đầu lại?")) return;

        formBody.empty();

        const row = $(`
            <tr>
                <td><input type="text" name="code[]" required /></td>
                <td><input type="text" name="description[]" value="none" required /></td>
                <td><input type="number" name="quantity[]" value="1" min="1" required /></td>
                <td><input type="text" name="model[]" required /></td>
                <td><input type="text" name="note[]" value="none" required /></td>
                <td><input type="text" name="unit_price[]" value="none" required /></td>
                <td class="action-buttons">
                    <button type="button" class="copy-row-btn">📋 Copy</button>
                    <button type="button" class="remove-row-btn">🗑️ Remove</button>
                </td>
            </tr>
        `);
        formBody.append(row);
        updateRowEventListeners(row);

        $('#quotationForm')[0].reset();
        bulkPasteTextArea.val('');
    };

    // Khởi tạo
    updateRowEventListeners(formBody.find('tr:first'));
    addRowBtn.on('click', () => addRow());
    pasteDataBtn.on('click', handleBulkPaste);
    resetFormBtn.on('click', resetForm);
    loadHospitalsAndInitAutocomplete();
});
