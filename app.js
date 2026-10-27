/**
 * ============================================================================
 * QUẢN LÝ CÔNG VIỆC (TODO LIST) - JAVASCRIPT THUẦN (AI-DRIVEN)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 4.1. KHAI BÁO DỮ LIỆU & HẰNG SỐ TOÀN CỤC
// ----------------------------------------------------------------------------

/**
 * Hằng số khóa lưu trữ dữ liệu trong localStorage
 */
const STORAGE_KEY = "todos";

/**
 * Mảng chứa danh sách công việc.
 * Mỗi công việc là một Object gồm 5 thuộc tính:
 * - id: number (Date.now(), không trùng)
 * - title: string (Không rỗng, tối đa 100 ký tự, bỏ khoảng trắng hai đầu)
 * - priority: string ("thap" | "trung-binh" | "cao")
 * - deadline: string (Định dạng "YYYY-MM-DD", được phép để trống)
 * - done: boolean (Mặc định là false)
 */
let todos = [];

/**
 * Bộ lọc hiện tại: "all" (Tất cả), "pending" (Đang làm), "done" (Đã xong), "overdue" (Quá hạn)
 * Khởi tạo mặc định ban đầu là "all"
 */
let currentFilter = "all";

/**
 * Biến timeout điều khiển thanh thông báo hệ thống
 */
let notificationTimeout = null;

// ----------------------------------------------------------------------------
// CÁC PHẦN TỬ DOM THƯỜNG DÙNG
// ----------------------------------------------------------------------------
const todoForm = document.getElementById("todo-form");
const editingIdInput = document.getElementById("editing-id");
const todoTitleInput = document.getElementById("todo-title");
const todoPrioritySelect = document.getElementById("todo-priority");
const todoDeadlineInput = document.getElementById("todo-deadline");
const titleError = document.getElementById("title-error");
const btnSubmit = document.getElementById("btn-submit");
const btnSubmitText = document.getElementById("btn-submit-text");
const btnCancel = document.getElementById("btn-cancel");

const searchInput = document.getElementById("search-input");
const btnClearSearch = document.getElementById("btn-clear-search");
const filterButtons = document.querySelectorAll(".btn-filter");

const todoListElement = document.getElementById("todo-list");
const emptyStateElement = document.getElementById("empty-state");
const emptyMessageElement = document.getElementById("empty-message");

const statPending = document.getElementById("stat-pending");
const statPercent = document.getElementById("stat-percent");
const statOverdue = document.getElementById("stat-overdue");
const btnDeleteCompleted = document.getElementById("btn-delete-completed");
const notificationBar = document.getElementById("notification-bar");

// ----------------------------------------------------------------------------
// 4.9. CÁC HÀM TIỆN ÍCH DÙNG CHUNG (STORAGE & FORMAT & NOTIFICATION)
// ----------------------------------------------------------------------------

/**
 * Ghi danh sách todos vào localStorage
 */
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/**
 * Đọc danh sách todos từ localStorage
 * @returns {Array} Mảng các công việc
 */
function loadData() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
    return [];
  }
}

/**
 * Lấy chuỗi ngày hiện tại dạng "YYYY-MM-DD" theo giờ địa phương
 * @returns {string} Ngày hôm nay (YYYY-MM-DD)
 */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Kiểm tra xem công việc có bị quá hạn hay không.
 * Quy tắc: Công việc quá hạn là công việc chưa xong (done === false) và có hạn chót trước ngày hôm nay.
 * @param {Object} todo - Đối tượng công việc
 * @returns {boolean} True nếu quá hạn, ngược lại false
 */
function isOverdue(todo) {
  if (todo.done) return false;
  if (!todo.deadline) return false;
  return todo.deadline < getTodayString();
}

/**
 * Chuyển đổi định dạng ngày "YYYY-MM-DD" sang "dd/mm/yyyy" để hiển thị
 * @param {string} dateString - Chuỗi ngày YYYY-MM-DD
 * @returns {string} Chuỗi ngày dd/mm/yyyy
 */
function formatDeadline(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/**
 * Hiển thị thông báo trên trang (không dùng alert/prompt)
 * @param {string} message - Nội dung thông báo
 * @param {"success" | "danger" | "info"} type - Kiểu hiển thị
 * @param {number} duration - Thời gian hiển thị (mili giây)
 */
function showNotification(message, type = "success", duration = 3000) {
  if (!notificationBar) return;

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notificationBar.textContent = message;
  notificationBar.className = `notification-bar ${type} show`;

  notificationTimeout = setTimeout(() => {
    notificationBar.className = "notification-bar";
    notificationBar.textContent = "";
  }, duration);
}

/**
 * Hiển thị lỗi kiểm tra dữ liệu dưới ô nhập tên công việc
 * @param {string} message - Thông báo lỗi
 */
function showTitleError(message) {
  if (titleError) {
    titleError.textContent = message;
  }
}

/**
 * Xóa thông báo lỗi dưới ô nhập tên
 */
function clearTitleError() {
  if (titleError) {
    titleError.textContent = "";
  }
}

// ----------------------------------------------------------------------------
// 4.9 & 4.3 & 4.5. KIỂM TRA DỮ LIỆU DÙNG CHUNG (validateTodo)
// ----------------------------------------------------------------------------

/**
 * Hàm kiểm tra dữ liệu công việc, dùng chung cho cả chức năng Thêm và Sửa.
 * @param {string} rawTitle - Tên công việc chưa trim
 * @param {number|null} editingId - ID của công việc đang sửa (nếu có, để bỏ qua khi so sánh trùng tên)
 * @returns {string|null} Chuỗi thông báo lỗi nếu không hợp lệ, hoặc null nếu hợp lệ
 */
function validateTodo(rawTitle, editingId = null) {
  const trimmedTitle = (rawTitle || "").trim();

  // 1. Kiểm tra rỗng
  if (trimmedTitle.length === 0) {
    return "Tên công việc không được để trống";
  }

  // 2. Kiểm tra độ dài tối đa 100 ký tự
  if (trimmedTitle.length > 100) {
    return "Tên công việc tối đa 100 ký tự";
  }

  // 3. Kiểm tra trùng tên (không phân biệt chữ hoa, chữ thường; bỏ qua chính nó nếu đang sửa)
  const isDuplicate = todos.some((item) => {
    if (editingId !== null && item.id === editingId) {
      return false; // Bỏ qua chính công việc đang sửa
    }
    return item.title.trim().toLowerCase() === trimmedTitle.toLowerCase();
  });

  if (isDuplicate) {
    return "Công việc đã tồn tại";
  }

  return null;
}

// ----------------------------------------------------------------------------
// 4.8. THỐNG KÊ (CHỨC NĂNG 6)
// ----------------------------------------------------------------------------

/**
 * Tính toán và cập nhật thông số thống kê công việc
 * - Số việc chưa xong
 * - Phần trăm hoàn thành: số việc đã xong / tổng số việc * 100, làm tròn số nguyên (0% khi rỗng)
 * - Số việc quá hạn
 */
function updateStats() {
  const total = todos.length;
  const pendingCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;
  const overdueCount = todos.filter(isOverdue).length;

  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  if (statPending) statPending.textContent = pendingCount;
  if (statPercent) statPercent.textContent = `${percent}%`;
  if (statOverdue) statOverdue.textContent = overdueCount;
}

// ----------------------------------------------------------------------------
// 4.4. HIỂN THỊ DANH SÁCH (CHỨC NĂNG 2) - HÀM RENDER DÙNG CHUNG
// ----------------------------------------------------------------------------

/**
 * Lọc và tìm kiếm danh sách công việc theo bộ lọc hiện tại và từ khóa tìm kiếm
 * @returns {Array} Danh sách công việc sau khi lọc
 */
function getFilteredTodos() {
  const keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();

  return todos.filter((todo) => {
    // 1. Lọc theo trạng thái / bộ lọc
    if (currentFilter === "pending" && todo.done) {
      return false;
    }
    if (currentFilter === "done" && !todo.done) {
      return false;
    }
    if (currentFilter === "overdue" && !isOverdue(todo)) {
      return false;
    }

    // 2. Lọc theo từ khóa tìm kiếm (không phân biệt hoa thường)
    if (keyword && !todo.title.toLowerCase().includes(keyword)) {
      return false;
    }

    return true;
  });
}

/**
 * Chuyển mã mức ưu tiên sang tên tiếng Việt hiển thị
 * @param {string} priority - "thap" | "trung-binh" | "cao"
 * @returns {string} Tên hiển thị
 */
function getPriorityLabel(priority) {
  switch (priority) {
    case "cao":
      return "Cao";
    case "trung-binh":
      return "Trung bình";
    case "thap":
    default:
      return "Thấp";
  }
}

/**
 * Hàm render dùng chung để vẽ lại giao diện từ dữ liệu.
 * Được gọi lại sau mọi thao tác thêm, sửa, xóa, lọc, tìm kiếm.
 */
function render() {
  // Cập nhật thống kê
  updateStats();

  const filteredList = getFilteredTodos();

  // Xử lý trạng thái rỗng
  if (todos.length === 0) {
    todoListElement.innerHTML = "";
    emptyMessageElement.textContent = "Chưa có công việc nào";
    emptyStateElement.classList.remove("hidden");
    return;
  }

  if (filteredList.length === 0) {
    todoListElement.innerHTML = "";
    emptyMessageElement.textContent = "Không tìm thấy công việc";
    emptyStateElement.classList.remove("hidden");
    return;
  }

  // Ẩn empty state nếu có dữ liệu hiển thị
  emptyStateElement.classList.add("hidden");

  // Tạo HTML danh sách công việc
  const itemsHtml = filteredList
    .map((todo) => {
      const isDoneClass = todo.done ? "is-done" : "";
      const isOverdueTodo = isOverdue(todo);
      const priorityLabel = getPriorityLabel(todo.priority);
      const formattedDeadline = formatDeadline(todo.deadline);

      return `
        <li class="todo-item ${isDoneClass}" data-id="${todo.id}">
          <div class="todo-main">
            <input 
              type="checkbox" 
              class="todo-checkbox" 
              ${todo.done ? "checked" : ""} 
              data-id="${todo.id}"
              aria-label="Đánh dấu hoàn thành cho ${escapeHtml(todo.title)}"
            >
            <div class="todo-content">
              <span class="todo-title">${escapeHtml(todo.title)}</span>
              <div class="todo-meta">
                <span class="priority-tag priority-${todo.priority}">
                  ${priorityLabel}
                </span>
                ${
                  formattedDeadline
                    ? `<span class="deadline-tag">&#128197; ${formattedDeadline}</span>`
                    : ""
                }
                ${
                  isOverdueTodo
                    ? `<span class="badge-overdue">Quá hạn</span>`
                    : ""
                }
              </div>
            </div>
          </div>
          <div class="todo-actions">
            <button type="button" class="btn-action btn-edit" data-id="${todo.id}">Sửa</button>
            <button type="button" class="btn-action btn-delete" data-id="${todo.id}">Xóa</button>
          </div>
        </li>
      `;
    })
    .join("");

  todoListElement.innerHTML = itemsHtml;
}

/**
 * Tiện ích ngăn ngừa mã HTML độc hại / XSS khi render chuỗi
 * @param {string} str - Chuỗi nguồn
 * @returns {string} Chuỗi đã escape
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ----------------------------------------------------------------------------
// 4.3. THÊM CÔNG VIỆC (CHỨC NĂNG 1) & 4.5. LƯU CẬP NHẬT (CHỨC NĂNG 3)
// ----------------------------------------------------------------------------

/**
 * Xử lý submit form (thêm mới hoặc cập nhật công việc đang sửa)
 * @param {Event} e - Sự kiện submit
 */
function handleFormSubmit(e) {
  e.preventDefault();
  clearTitleError();

  const title = todoTitleInput.value;
  const priority = todoPrioritySelect.value;
  const deadline = todoDeadlineInput.value;
  const editingIdStr = editingIdInput.value;
  const isEditing = editingIdStr !== "";
  const editingId = isEditing ? Number(editingIdStr) : null;

  // Kiểm tra tính hợp lệ bằng hàm validateTodo dùng chung
  const validationError = validateTodo(title, editingId);
  if (validationError) {
    showTitleError(validationError);
    todoTitleInput.focus();
    return;
  }

  if (isEditing) {
    // CẬP NHẬT CÔNG VIỆC
    const todoIndex = todos.findIndex((t) => t.id === editingId);
    if (todoIndex !== -1) {
      todos[todoIndex].title = title.trim();
      todos[todoIndex].priority = priority;
      todos[todoIndex].deadline = deadline; // giữ nguyên id và done

      saveData();
      resetForm();
      showNotification("Cập nhật thành công", "success");
      render();
    }
  } else {
    // THÊM MỚI CÔNG VIỆC
    const newTodo = {
      id: Date.now(),
      title: title.trim(),
      priority: priority,
      deadline: deadline || "",
      done: false,
    };

    todos.push(newTodo);
    saveData();
    resetForm();
    showNotification("Thêm công việc thành công", "success");
    render();
  }
}

/**
 * Đưa dữ liệu công việc lên form để chuẩn bị sửa
 * @param {number} id - ID của công việc cần sửa
 */
function startEditTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  editingIdInput.value = todo.id;
  todoTitleInput.value = todo.title;
  todoPrioritySelect.value = todo.priority;
  todoDeadlineInput.value = todo.deadline || "";

  btnSubmitText.textContent = "Lưu";
  btnCancel.classList.remove("hidden");

  clearTitleError();
  todoTitleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Reset form về trạng thái Thêm công việc ban đầu
 */
function resetForm() {
  todoForm.reset();
  editingIdInput.value = "";
  todoPrioritySelect.value = "trung-binh";
  btnSubmitText.textContent = "Thêm";
  btnCancel.classList.add("hidden");
  clearTitleError();
}

/**
 * Đổi trạng thái hoàn thành (done) của công việc
 * @param {number} id - ID của công việc
 */
function toggleTodoStatus(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.done = !todo.done;
  saveData();
  render();
}

// ----------------------------------------------------------------------------
// 4.6. XÓA CÔNG VIỆC (CHỨC NĂNG 4)
// ----------------------------------------------------------------------------

/**
 * Xóa một công việc theo id (có hỏi xác nhận bằng confirm())
 * @param {number} id - ID công việc cần xóa
 */
function deleteTodo(id) {
  const confirmed = confirm("Bạn có chắc muốn xóa công việc này?");
  if (!confirmed) return;

  todos = todos.filter((t) => t.id !== id);

  // Nếu công việc đang sửa bị xóa thì reset form
  if (editingIdInput.value && Number(editingIdInput.value) === id) {
    resetForm();
  }

  saveData();
  showNotification("Xóa thành công", "success");
  render();
}

/**
 * Xóa tất cả các công việc đã hoàn thành (done === true)
 */
function deleteCompletedTodos() {
  const completedCount = todos.filter((t) => t.done).length;

  if (completedCount === 0) {
    showNotification("Không có công việc đã hoàn thành", "danger");
    return;
  }

  todos = todos.filter((t) => !t.done);

  // Nếu công việc đang sửa nằm trong số đã hoàn thành và bị xóa
  if (
    editingIdInput.value &&
    !todos.some((t) => t.id === Number(editingIdInput.value))
  ) {
    resetForm();
  }

  saveData();
  showNotification("Xóa thành công", "success");
  render();
}

// ----------------------------------------------------------------------------
// 4.7. LỌC VÀ TÌM KIẾM (CHỨC NĂNG 5)
// ----------------------------------------------------------------------------

/**
 * Thiết lập bộ lọc đang chọn
 * @param {string} filterValue - "all" | "pending" | "done" | "overdue"
 */
function setFilter(filterValue) {
  currentFilter = filterValue;

  filterButtons.forEach((btn) => {
    if (btn.getAttribute("data-filter") === filterValue) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  render();
}

/**
 * Xử lý khi người dùng gõ vào ô tìm kiếm
 */
function handleSearchInput() {
  const value = searchInput.value;
  if (value.trim().length > 0) {
    btnClearSearch.classList.remove("hidden");
  } else {
    btnClearSearch.classList.add("hidden");
  }
  render();
}

/**
 * Xóa trắng ô tìm kiếm
 */
function clearSearch() {
  searchInput.value = "";
  btnClearSearch.classList.add("hidden");
  searchInput.focus();
  render();
}

// ----------------------------------------------------------------------------
// KHỞI TẠO VÀ GẮN SỰ KIỆN
// ----------------------------------------------------------------------------

function setupEventListeners() {
  // Submit Form (Thêm hoặc Lưu)
  todoForm.addEventListener("submit", handleFormSubmit);

  // Hủy sửa
  btnCancel.addEventListener("click", resetForm);

  // Xóa thông báo lỗi khi người dùng gõ lại tên
  todoTitleInput.addEventListener("input", () => {
    if (titleError.textContent) {
      clearTitleError();
    }
  });

  // Tìm kiếm theo tên (sự kiện input: lọc ngay khi gõ)
  searchInput.addEventListener("input", handleSearchInput);
  btnClearSearch.addEventListener("click", clearSearch);

  // Các nút bộ lọc
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      setFilter(filter);
    });
  });

  // Sự kiện uỷ quyền trên danh sách (Checkbox, Nút Sửa, Nút Xóa)
  todoListElement.addEventListener("click", (e) => {
    const target = e.target;

    // Tích checkbox đổi trạng thái
    if (target.classList.contains("todo-checkbox")) {
      const id = Number(target.getAttribute("data-id"));
      toggleTodoStatus(id);
      return;
    }

    // Bấm nút Sửa
    if (target.classList.contains("btn-edit")) {
      const id = Number(target.getAttribute("data-id"));
      startEditTodo(id);
      return;
    }

    // Bấm nút Xóa
    if (target.classList.contains("btn-delete")) {
      const id = Number(target.getAttribute("data-id"));
      deleteTodo(id);
      return;
    }
  });

  // Xóa các việc đã xong
  btnDeleteCompleted.addEventListener("click", deleteCompletedTodos);
}

/**
 * Khởi động ứng dụng khi DOM đã sẵn sàng
 */
function init() {
  todos = loadData();
  setupEventListeners();
  render();
}

// Chạy khởi tạo
document.addEventListener("DOMContentLoaded", init);
