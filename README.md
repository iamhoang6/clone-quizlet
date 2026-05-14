# ⚡ Quizlet Clone

Một script JavaScript chạy trực tiếp trong DevTools Console giúp bạn trích xuất flashcards từ Quizlet và xuất ra nhiều định dạng khác nhau: **TXT, CSV, JSON, Anki TXT, Markdown**.

Script có giao diện preview ngay trên trang, tự cuộn để load toàn bộ thẻ, loại bỏ trùng lặp và cho phép tải file hoặc copy nội dung vào clipboard.

> Dùng cho mục đích học tập cá nhân hoặc với nội dung bạn có quyền sử dụng.

---

## ✨ Tính năng

- Tự động cuộn trang để load toàn bộ flashcards
- Hỗ trợ nhiều selector để tăng khả năng tương thích với các phiên bản giao diện Quizlet
- Preview tối đa 50 thẻ đầu tiên trước khi tải
- Xuất nhiều định dạng:
  - TXT: `question | answer`
  - CSV: `STT, Question, Answer`
  - JSON: dữ liệu có cấu trúc
  - Anki: `question<TAB>answer`
  - Markdown: bảng markdown
- Tự động loại bỏ flashcard trùng lặp
- Hiển thị số lượng thẻ và số thẻ trùng lặp đã bỏ
- Copy kết quả vào clipboard
- Tự đặt tên file theo tiêu đề học phần

---

## 🚀 Cách sử dụng nhanh

### 1. Mở bộ flashcards trên Quizlet

Truy cập trang bộ thẻ Quizlet bạn muốn trích xuất, ví dụ trang `/flashcards` hoặc `/set`.

### 2. Mở DevTools Console

Trên Chrome, Edge hoặc trình duyệt Chromium:

- Windows/Linux: nhấn `F12` hoặc `Ctrl + Shift + I`
- macOS: nhấn `Cmd + Option + I`
- Chọn tab **Console**

### 3. Dán script và chạy

Mở file:

```txt
export-quizlet-flashcards.js
```

Copy toàn bộ nội dung file, dán vào Console rồi nhấn `Enter`.

### 4. Chọn định dạng và tải về

Sau khi chạy, một cửa sổ **Quizlet Clone Pro** sẽ hiện trên trang. Bạn có thể:

- Xem trước flashcards
- Chọn định dạng xuất file
- Bấm **Tải về**
- Hoặc bấm nút clipboard để copy nội dung

---

## 📦 Định dạng xuất file

### TXT

```txt
Apple | Quả táo
Book | Quyển sách
Computer | Máy tính
```

### CSV

```csv
STT,Question,Answer
1,"Apple","Quả táo"
2,"Book","Quyển sách"
```

### JSON

```json
{
  "set": "Tên học phần",
  "total": 2,
  "cards": [
    {
      "STT": 1,
      "question": "Apple",
      "answer": "Quả táo"
    }
  ]
}
```

### Anki

Định dạng tab-separated, phù hợp để import vào Anki:

```txt
Apple	Quả táo
Book	Quyển sách
```

Khi import vào Anki:

1. Mở Anki
2. Chọn **File → Import**
3. Chọn file `.txt`
4. Chọn phân cách bằng tab
5. Map trường đầu là **Front**, trường sau là **Back**

### Markdown

Xuất thành bảng Markdown, tiện để đưa vào GitHub, Notion hoặc tài liệu học tập.

---

## 🧠 Cách script hoạt động

Script gồm các phần chính:

1. **Inject UI overlay** vào trang để hiển thị tiến trình, preview và nút tải.
2. **Auto-scroll** xuống cuối trang để Quizlet load toàn bộ flashcards.
3. **Thử nhiều selector DOM** để đọc flashcards từ các phiên bản giao diện khác nhau của Quizlet.
4. **Làm sạch dữ liệu** bằng cách gom khoảng trắng và loại bỏ nội dung rỗng.
5. **Deduplication** bằng `Set` để bỏ các cặp question/answer trùng nhau.
6. **Export dữ liệu** sang TXT, CSV, JSON, Anki TXT hoặc Markdown.
7. **Tạo file tải xuống** bằng `Blob` và thẻ `<a>` tạm thời.

---

## ⚠️ Lưu ý

- Script chỉ chạy trong trình duyệt, trực tiếp trên trang Quizlet đang mở.
- Nếu Quizlet thay đổi cấu trúc HTML/CSS, selector có thể cần cập nhật.
- Một số trình duyệt có thể chặn clipboard API; khi đó hãy dùng nút tải file.
- Nếu Console chặn paste code lần đầu, hãy làm theo hướng dẫn của trình duyệt để bật paste thủ công.
- Không dùng script để sao chép, chia sẻ hoặc phân phối nội dung mà bạn không có quyền sử dụng.

---
