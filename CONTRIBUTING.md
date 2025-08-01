# 🤝 Contributing to GheedBot

Cảm ơn bạn đã quan tâm đến việc đóng góp cho GheedBot! Mọi đóng góp đều được chào đón.

## 📋 Quy trình đóng góp

### 🐛 Báo cáo lỗi

1. **Kiểm tra Issues hiện có** để đảm bảo lỗi chưa được báo cáo
2. **Tạo Issue mới** với template:
   ```
   **Mô tả lỗi:**
   Mô tả ngắn gọn về lỗi

   **Các bước tái tạo:**
   1. Gõ lệnh '...'
   2. Nhấn vào '...'
   3. Thấy lỗi

   **Kết quả mong đợi:**
   Mô tả những gì bạn mong đợi sẽ xảy ra

   **Kết quả thực tế:**
   Mô tả những gì thực sự xảy ra

   **Screenshots:**
   Nếu có, thêm screenshots để giúp giải thích vấn đề

   **Environment:**
   - OS: [e.g. Windows 10]
   - Node.js version: [e.g. 18.17.0]
   - Bot version: [e.g. 1.0.0]
   ```

### 💡 Đề xuất tính năng

1. **Tạo Issue** với label "enhancement"
2. **Mô tả chi tiết** tính năng mong muốn
3. **Giải thích** tại sao tính năng này hữu ích
4. **Đề xuất** cách implement (nếu có)

### 🔧 Đóng góp code

#### Thiết lập môi trường phát triển

1. **Fork repository**
2. **Clone fork của bạn:**
   ```bash
   git clone https://github.com/yourusername/gheedbot.git
   cd gheedbot
   ```

3. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

4. **Tạo file .env:**
   ```bash
   cp .env.example .env
   # Chỉnh sửa .env với Discord token của bạn
   ```

5. **Chạy tests:**
   ```bash
   npm test
   ```

#### Quy trình phát triển

1. **Tạo branch mới:**
   ```bash
   git checkout -b feature/amazing-feature
   # hoặc
   git checkout -b fix/bug-description
   ```

2. **Thực hiện thay đổi:**
   - Viết code sạch và có comment
   - Tuân thủ coding style hiện có
   - Thêm tests cho tính năng mới
   - Update documentation nếu cần

3. **Test thay đổi:**
   ```bash
   npm test
   npm run lint  # nếu có
   ```

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push branch:**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Tạo Pull Request**

## 📝 Coding Standards

### 🎯 JavaScript Style Guide

- **Sử dụng ES6+ features** khi có thể
- **Async/await** thay vì Promises chains
- **Const/let** thay vì var
- **Template literals** cho string interpolation
- **Destructuring** khi phù hợp

### 📁 File Structure

```
commands/
├── command-name.js     # Một file cho mỗi command
└── ...

utils/
├── utility-name.js     # Utility functions
└── ...

test/
├── test-*.js          # Test files
└── ...
```

### 🧪 Testing

- **Viết tests** cho tất cả functions mới
- **Test coverage** ít nhất 80%
- **Test cả success và error cases**
- **Sử dụng descriptive test names**

### 📖 Documentation

- **JSDoc comments** cho tất cả functions
- **README updates** cho tính năng mới
- **Inline comments** cho logic phức tạp
- **Examples** trong documentation

## 🎨 Commit Message Format

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Thay đổi documentation
- `style`: Formatting, missing semi colons, etc
- `refactor`: Code refactoring
- `test`: Thêm tests
- `chore`: Maintenance tasks

### Examples:
```
feat(hr): add multi-user support for HR calculator
fix(commands): resolve interaction timeout in weapon lookup
docs(readme): update installation instructions
test(hr): add tests for modal submission handling
```

## 🔍 Code Review Process

1. **Automated checks** phải pass (tests, linting)
2. **Ít nhất 1 reviewer** approve
3. **No merge conflicts**
4. **Documentation** được update nếu cần

## 📊 Data Contributions

### Thêm/sửa game data:

1. **Chỉnh sửa files** trong `data/` directory
2. **Validate JSON** format
3. **Test với bot** để đảm bảo hoạt động
4. **Provide sources** cho data changes

### Data format:
- **Consistent naming** conventions
- **Complete information** cho mỗi entry
- **Proper JSON structure**
- **No duplicate entries**

## 🚀 Release Process

1. **Version bump** trong package.json
2. **Update CHANGELOG.md**
3. **Create release tag**
4. **Deploy to production**

## ❓ Cần giúp đỡ?

- **Discord:** Join server và tag maintainers
- **GitHub Issues:** Tạo issue với label "question"
- **Email:** Contact maintainers directly

## 📜 Code of Conduct

- **Be respectful** và professional
- **No harassment** hoặc discrimination
- **Constructive feedback** only
- **Help newcomers** learn và contribute

---

Cảm ơn bạn đã đóng góp cho GheedBot! 🎉
