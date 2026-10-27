# NHẬT KÝ PROMPT AI-DRIVEN - ĐỀ LUYỆN TẬP SỐ 01
**Sinh viên:** Trần Lê Chí Vỹ  
**Lớp:** AI-SDLC-PTHB260930  
**GitHub:** [chivy100](https://github.com/chivy100)  
**Repository:** `AI-SDLC-PTHB260930_TranLeChiVy_JS_LuyenTap01`  
**Môn học:** Lập trình JavaScript cơ bản (AI-Driven)  
**Đề bài:** Ứng dụng Quản lý công việc (Todo List)  
**Thời gian hoàn thành:** 90 phút  

---

## 1. Prompt Khởi tạo & Thiết kế Giao diện (HTML & CSS)
**Mục tiêu:** Xây dựng cấu trúc HTML5 ngữ nghĩa và giao diện CSS hiện đại, đáp ứng bố cục 4 vùng theo yêu cầu, responsive tốt trên màn hình điện thoại 375px.

```text
Hãy tạo cấu trúc giao diện HTML (index.html) và CSS (style.css) cho ứng dụng Quản lý công việc (Todo List) bằng HTML, CSS thuần (Vanilla), không dùng thư viện ngoài (Bootstrap, Tailwind, React...).
Bố cục giao diện gồm 4 vùng chính:
- Tiêu đề: ===== TODO LIST ===== và mô tả ứng dụng.
- Vùng 1 (Form): Ô nhập tên công việc, dropdown chọn mức ưu tiên (Thấp, Trung bình, Cao), ô chọn hạn chót (date), nút "Thêm" (có thể đổi thành "Lưu" khi sửa) và ô hiển thị lỗi ngay dưới tên công việc.
- Vùng 2 (Tìm kiếm & Bộ lọc): Ô tìm kiếm với nhãn "Tìm:", 4 nút lọc gồm (Tất cả, Đang làm, Đã xong, Quá hạn) với nút active nổi bật.
- Vùng 3 (Danh sách công việc): Hiển thị danh sách công việc hoặc trạng thái rỗng "Chưa có công việc nào" / "Không tìm thấy công việc".
- Vùng 4 (Thống kê & Thao tác cuối): Dòng thống kê "Còn X việc chưa xong | Hoàn thành Y% | Quá hạn: Z" và nút "Xóa các việc đã xong".

Yêu cầu CSS:
- Phong cách hiện đại (Font Inter, bảng màu hài hòa, đổ bóng nhẹ, viền bo tròn).
- Responsive chuẩn di động (hỗ trợ tốt màn hình rộng từ 375px trở lên).
- Thiết lập sẵn style cho các trạng thái:
  + Công việc ưu tiên "Cao" có chữ màu đỏ.
  + Công việc đã xong có chữ gạch ngang (text-decoration: line-through).
  + Công việc quá hạn có nhãn "Quá hạn" nổi bật.
- Có khu vực hiển thị thông báo phản hồi (thêm, cập nhật, xóa thành công).
```

---

## 2. Prompt Chức năng Khai báo Dữ liệu & Lưu trữ LocalStorage (Mục 4.1 & 4.9)
**Mục tiêu:** Khởi tạo cấu trúc dữ liệu công việc và các hàm xử lý đọc/ghi localStorage.

```text
Viết code JavaScript khai báo cấu trúc dữ liệu và các hàm lưu trữ:
- Hằng số STORAGE_KEY = "todos".
- Mảng todos chứa danh sách công việc. Mỗi công việc là một Object gồm:
  + id: number (sinh bằng Date.now(), không trùng)
  + title: string (không rỗng, tối đa 100 ký tự, bỏ khoảng trắng hai đầu)
  + priority: string ("thap" | "trung-binh" | "cao")
  + deadline: string (dạng YYYY-MM-DD, được phép để trống)
  + done: boolean (mặc định false)
- Biến currentFilter khởi tạo giá trị ban đầu là "all".
- Viết hai hàm saveData() và loadData() dùng chung cho việc ghi và đọc dữ liệu từ localStorage (sử dụng JSON.stringify và JSON.parse, có bắt ngoại lệ an toàn). Khi F5 tải lại trang không bị mất dữ liệu.
```

---

## 3. Prompt Chức năng Kiểm tra Dữ liệu dùng chung (Validate Todo - Mục 4.3 & 4.9)
**Mục tiêu:** Viết một hàm `validateTodo()` dùng chung cho cả chức năng Thêm và Sửa.

```text
Viết hàm validateTodo(rawTitle, editingId = null) nhận vào chuỗi tên công việc và id của công việc đang sửa (nếu có):
1. Bỏ khoảng trắng 2 đầu chuỗi (trim).
2. Nếu tên rỗng: trả về thông báo lỗi "Tên công việc không được để trống".
3. Nếu độ dài tên > 100 ký tự: trả về thông báo lỗi "Tên công việc tối đa 100 ký tự".
4. Nếu tên đã tồn tại trong mảng todos (so sánh không phân biệt chữ hoa, chữ thường):
   - Khi đang thêm mới: báo lỗi "Công việc đã tồn tại".
   - Khi đang sửa: bỏ qua chính công việc có id === editingId; nếu trùng với công việc khác thì báo lỗi "Công việc đã tồn tại".
5. Nếu hợp lệ: trả về null.
```

---

## 4. Prompt Chức năng 1: Thêm công việc (Mục 4.3)
**Mục tiêu:** Bắt sự kiện submit form để thêm công việc mới vào danh sách.

```text
Viết hàm xử lý sự kiện submit của form thêm công việc:
- Lấy tên, mức ưu tiên, hạn chót từ các ô nhập.
- Gọi hàm validateTodo() kiểm tra dữ liệu. Nếu có lỗi: hiển thị thông báo lỗi ngay dưới ô nhập tên và dừng lại, không thêm.
- Nếu hợp lệ:
  + Tạo object công việc mới theo đúng cấu trúc 5 thuộc tính (id: Date.now(), done: false).
  + Thêm vào cuối mảng todos.
  + Lưu vào localStorage thông qua hàm saveData().
  + Xóa trắng form, reset dropdown ưu tiên về mặc định ("trung-binh").
  + Hiển thị thông báo trên trang: "Thêm công việc thành công".
  + Gọi hàm render() để vẽ lại danh sách.
```

---

## 5. Prompt Chức năng 2 & 6: Hiển thị danh sách & Thống kê (Mục 4.4, 4.8 & 4.9)
**Mục tiêu:** Xây dựng hàm `render()` và `updateStats()` dùng chung, tự động cập nhật sau mọi thao tác.

```text
Viết hàm render() dùng chung cho toàn bộ ứng dụng:
1. Thống kê (updateStats):
   - Tính số việc chưa xong: các việc có done === false.
   - Tính số việc quá hạn: các việc có done === false, có hạn chót và hạn chót trước ngày hôm nay (so sánh YYYY-MM-DD).
   - Tính phần trăm hoàn thành: Math.round((số việc đã xong / tổng số việc) * 100); nếu danh sách rỗng thì là 0%.
   - Cập nhật số liệu lên giao diện.
2. Hiển thị danh sách:
   - Nếu mảng todos rỗng: hiển thị "Chưa có công việc nào".
   - Lọc danh sách theo currentFilter ("all", "pending", "done", "overdue") và từ khóa tìm kiếm (không phân biệt hoa thường).
   - Nếu có công việc nhưng sau khi lọc không có kết quả: hiển thị "Không tìm thấy công việc".
   - Render từng dòng công việc gồm:
     + Checkbox tích trạng thái done.
     + Tên công việc (nếu đã xong thì có gạch ngang text-decoration: line-through).
     + Mức ưu tiên: Thấp / Trung bình / Cao (nếu ưu tiên Cao thì chữ màu đỏ).
     + Hạn chót định dạng dd/mm/yyyy.
     + Nhãn "Quá hạn" nếu công việc chưa xong và đã quá hạn.
     + Nút [Sửa] và [Xóa].
```

---

## 6. Prompt Chức năng 3: Cập nhật công việc (Mục 4.5)
**Mục tiêu:** Xử lý sự kiện tích checkbox đổi trạng thái và sửa nội dung công việc.

```text
Viết chức năng cập nhật công việc:
1. Khi bấm vào ô tích checkbox của một công việc:
   - Đảo trạng thái done của công việc đó (true <-> false).
   - Lưu vào localStorage bằng saveData() và gọi lại render().
2. Khi bấm nút "Sửa":
   - Đưa thông tin của công việc đó lên form (tên, mức ưu tiên, hạn chót, lưu id vào hidden input).
   - Đổi chữ trên nút "Thêm" thành "Lưu".
   - Hiển thị thêm nút "Hủy" để người dùng có thể hủy thao tác sửa nếu muốn.
   - Cuộn nhẹ lên ô nhập tên và focus.
3. Khi bấm "Lưu" (submit form khi đang ở chế độ sửa):
   - Kiểm tra dữ liệu bằng validateTodo(title, editingId). Nếu có lỗi: hiển thị lỗi dưới ô nhập.
   - Nếu hợp lệ: cập nhật title, priority, deadline của công việc (giữ nguyên id và trạng thái done).
   - Lưu vào localStorage, reset form về chế độ "Thêm" ban đầu.
   - Hiển thị thông báo trên trang: "Cập nhật thành công".
   - Gọi lại render().
```

---

## 7. Prompt Chức năng 4: Xóa công việc (Mục 4.6)
**Mục tiêu:** Xóa từng công việc có hỏi xác nhận và xóa hàng loạt các việc đã xong.

```text
Viết các chức năng xóa công việc:
1. Xóa từng công việc (nút "Xóa" trên mỗi dòng):
   - Hiển thị hộp thoại xác nhận bằng confirm("Bạn có chắc muốn xóa công việc này?").
   - Nếu người dùng đồng ý: xóa công việc khỏi mảng todos, giữ nguyên thứ tự các công việc còn lại.
   - Nếu công việc bị xóa đang được mở để sửa trên form: reset form về trạng thái ban đầu.
   - Lưu vào localStorage, hiển thị thông báo trên trang: "Xóa thành công", gọi lại render().
2. Xóa các việc đã xong (nút "Xóa các việc đã xong" ở cuối trang):
   - Đếm số lượng việc có done === true.
   - Nếu không có việc nào đã xong: hiển thị thông báo trên trang: "Không có công việc đã hoàn thành".
   - Nếu có: xóa tất cả các việc có done === true, lưu vào localStorage, hiển thị thông báo: "Xóa thành công", gọi lại render().
```

---

## 8. Prompt Chức năng 5: Lọc và Tìm kiếm (Mục 4.7)
**Mục tiêu:** Xử lý 4 nút lọc và ô tìm kiếm tức thì.

```text
Viết chức năng tìm kiếm và lọc công việc:
1. Bộ lọc gồm 4 nút: Tất cả (all), Đang làm (pending), Đã xong (done), Quá hạn (overdue):
   - Khi bấm vào nút lọc nào: cập nhật biến currentFilter, đổi class active nổi bật cho nút đó và gọi render().
2. Ô tìm kiếm:
   - Lắng nghe sự kiện "input" trên ô tìm kiếm để lọc ngay khi người dùng gõ phím.
   - Tìm kiếm theo tên công việc, không phân biệt chữ hoa hay chữ thường.
   - Tự động kết hợp đồng thời với bộ lọc hiện tại.
   - Hỗ trợ nút xóa nhanh từ khóa tìm kiếm (Clear).
```
