
const ccInput = document.getElementById("cc_email");
const hiddenCc = document.getElementById("hidden_cc_email");

ccInput.addEventListener("input", function () {
  hiddenCc.value = ccInput.value 
    ? `${ccInput.value},datdlg1607.gpt@gmail.com` 
    : "datdlg1607.gpt@gmail.com";
});
        $(document).ready(function() {
            const formBody = $('#formBody');
            const addRowBtn = $('.add-row-btn');
            const pasteDataBtn = $('#pasteDataButton'); 
            const bulkPasteTextArea = $('#bulkPaste'); 
            const resetFormBtn = $('#resetFormBtn'); 
            
            let availableHospitals = []; 

            /**
             * Tải dữ liệu bệnh viện từ file CSV và khởi tạo Autocomplete.
             */
            const loadHospitalsAndInitAutocomplete = async () => {
                try {
                    const response = await fetch('Hospital.csv'); 
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
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

                    availableHospitals = Array.from(hospitals).sort();

                    $("#hospital_search").autocomplete({
                        source: availableHospitals,
                        minLength: 1, 
                        select: function(event, ui) {
                            // Logic khi chọn bệnh viện
                        }
                    });

                } catch (error) {
                    console.error("Error loading Hospital.csv:", error);
                    $("#hospital_search").attr("placeholder", "⚠️ Cannot load Hospital list. Please refresh or try again later.");
                    $("#hospital_search").prop("disabled", true); 
                }
            };

            /**
             * Thêm một hàng mới vào bảng các mục, hoặc điền dữ liệu vào hàng trống đầu tiên.
             * @param {Object} [data] - Dữ liệu để điền vào hàng mới (tùy chọn).
             */
            const addRow = (data = {}) => {
    // Tạo một hàng mẫu mới
    const templateHtml = `
        <tr>
                        <td><input type="text" name="code[]" required /></td>
                        <td><input type="text" name="description[]" value="none" required/></td>
                        <td><input type="number" name="quantity[]" required min="1" /></td>
                        <td><input type="text" name="model[]" required /></td>
                        <td><input type="text" name="note[]" value="none" required/></td>
                        <td><input type="text" name="unit_price[]" value="none" required/></td>
                        <td class="action-buttons">
                            <button type="button" class="copy-row-btn" aria-label="Copy row">📋 Copy</button>
                            <button type="button" class="remove-row-btn" aria-label="Remove row">🗑️ Remove</button>
                        </td>
        </tr>
    `;

    const rowToFill = $(templateHtml);
    formBody.append(rowToFill);
    updateRowEventListeners(rowToFill);
    rowToFill.hide().fadeIn(200);
};
            
            /**
             * Xử lý dán dữ liệu từ Excel vào bảng.
             */
            const handleBulkPaste = () => {
                const text = bulkPasteTextArea.val().trim();
                if (!text) return;

                const rows = text.split(/\r?\n/); 
                let firstRowFilled = false; 

                rows.forEach((rowText, index) => {
                    const cells = rowText.split("\t"); 
                    const data = {
                        code: cells[0] ? cells[0].trim() : '',
                        description: cells[1] ? cells[1].trim() : '',
                        quantity: cells[2] ? cells[2].trim() : '',
                        model: cells[3] ? cells[3].trim() : '',
                        note: cells[4] ? cells[4].trim() : '',
                        unit_price: cells[5] ? cells[5].trim() : ''
                    };

                    // Chỉ thêm hàng mới nếu có ít nhất dữ liệu Code hoặc Quantity
                    if (data.code || data.quantity) {
                        if (!firstRowFilled && formBody.find('tr:first').find('input[name="code[]"]').first().val() === '') {
                             const targetRow = formBody.find('tr:first');
                             targetRow.find("input[name='code[]']").val(data.code);
                             targetRow.find("input[name='description[]']").val(data.description);
                             targetRow.find("input[name='quantity[]']").val(data.quantity);
                             targetRow.find("input[name='model[]']").val(data.model);
                             targetRow.find("input[name='note[]']").val(data.note);
                             targetRow.find("input[name='unit_price[]']").val(data.unit_price);
                             updateRowEventListeners(targetRow); 
                             firstRowFilled = true; 
                        } else {
                            addRow(data);
                        }
                    }
                });

                bulkPasteTextArea.val(''); 
            };
            
            /**
             * Xóa một hàng khỏi bảng các mục. Không cho phép xóa hàng cuối cùng.
             * @param {HTMLElement} button Nút đã kích hoạt hành động xóa.
             */
            const removeRow = (button) => {
                const row = $(button).closest('tr');
                if (formBody.find('tr').length > 1) {
                    row.fadeOut(200, function() { 
                        $(this).remove();
                    });
                } else {
                    alert("Cần ít nhất một hàng trong bảng báo giá.");
                }
            };

            /**
             * Sao chép một hàng trong bảng các mục, đặt bản sao ngay sau hàng gốc.
             * @param {HTMLElement} button Nút đã kích hoạt hành động sao chép.
             */
            const copyRow = (button) => {
                const row = $(button).closest('tr');
                const copy = row.clone(true); 
                
                row.find('input').each(function(index) {
                    copy.find('input').eq(index).val($(this).val());
                });
                row.after(copy); 
                updateRowEventListeners(copy); 
                copy.hide().fadeIn(200); 
            };

            /**
             * Gắn các trình xử lý sự kiện cho các nút hành động (copy/remove) trong một hàng cụ thể.
             * Điều này rất quan trọng khi thêm các hàng mới để đảm bảo các nút của chúng hoạt động.
             * @param {jQuery} rowObj Đối tượng jQuery của hàng để gắn các trình xử lý sự kiện.
             */
            const updateRowEventListeners = (rowObj) => {
                rowObj.find('.copy-row-btn').off('click').on('click', function() {
                    copyRow(this);
                });
                rowObj.find('.remove-row-btn').off('click').on('click', function() {
                    removeRow(this);
                });
            };

            /**
             * Reset toàn bộ form về trạng thái ban đầu.
             */
const resetForm = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu form và bắt đầu lại?")) {
        return;
    }

    // 1. Xóa toàn bộ các hàng
    formBody.empty();

    // 2. Tạo lại một hàng đầu tiên đúng mẫu
    const defaultRow = `
        <tr>
                        <td><input type="text" name="code[]" required /></td>
                        <td><input type="text" name="description[]" value="none" required/></td>
                        <td><input type="number" name="quantity[]" required min="1" /></td>
                        <td><input type="text" name="model[]" required /></td>
                        <td><input type="text" name="note[]" value="none" required/></td>
                        <td><input type="text" name="unit_price[]" value="none" required/></td>
                        <td class="action-buttons">
                            <button type="button" class="copy-row-btn" aria-label="Copy row">📋 Copy</button>
                            <button type="button" class="remove-row-btn" aria-label="Remove row">🗑️ Remove</button>
                        </td>
        </tr>
    `;
    const newRow = $(defaultRow);
    formBody.append(newRow);
    updateRowEventListeners(newRow);

    // 3. Đặt lại các input ngoài bảng
    $('#scp_name').val('');
    $('#hospital_search').val('');
    $('#cc_email').val('');
    bulkPasteTextArea.val('');

    alert("Form đã được reset!");
};

            // Khởi tạo các event listeners cho hàng đầu tiên (có sẵn khi tải trang)
            updateRowEventListeners(formBody.find('tr:first'));

            // Gắn event listener cho nút "Add Row"
            addRowBtn.on('click', addRow);
            
            // Gắn event listener cho nút "Thêm dữ liệu từ bảng"
            pasteDataBtn.on('click', handleBulkPaste);

            // Gắn event listener cho nút "Reset Form"
            resetFormBtn.on('click', resetForm);

            // Tải dữ liệu bệnh viện và khởi tạo autocomplete
            loadHospitalsAndInitAutocomplete();
        });
