# Quick Start Guide

## Cài đặt nhanh

### 1. Cài đặt dependencies

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Chạy server

**Windows:**
```bash
run.bat
```

**Hoặc chạy trực tiếp:**
```bash
python main.py
```

Server sẽ chạy tại: **http://localhost:8000**

### 3. Kiểm tra API

Mở trình duyệt và truy cập:
- **API Docs**: http://localhost:8000/docs

## Test nhanh

### 1. Đăng ký user đầu tiên

Truy cập http://localhost:8000/docs và tìm endpoint `POST /api/auth/signup`

Click "Try it out" và nhập:
```json
{
  "email": "admin@test.com",
  "password": "password123",
  "name": "Admin User"
}
```

### 2. Đăng nhập

Sử dụng endpoint `POST /api/auth/login`:
```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

Copy `access_token` từ response.

### 3. Authorize

1. Click nút "Authorize" ở đầu trang docs
2. Nhập: `Bearer YOUR_ACCESS_TOKEN` (thay YOUR_ACCESS_TOKEN bằng token vừa copy)
3. Click "Authorize"

Bây giờ bạn có thể test tất cả endpoints!

## Flow test cơ bản

1. **Tạo Team**: `POST /api/teams`
   ```json
   {"name": "My First Team"}
   ```

2. **Tạo Project**: `POST /api/projects`
   ```json
   {
     "name": "My First Project",
     "description": "Test project",
     "team_id": 1
   }
   ```

3. **Tạo Issue**: `POST /api/issues`
   ```json
   {
     "title": "Fix login bug",
     "description": "Users cannot login with special characters in password",
     "project_id": 1,
     "priority": "HIGH"
   }
   ```

4. **Test AI Summary**: `POST /api/issues/1/ai/summary`
   - Yêu cầu: Phải có `OPENAI_API_KEY` trong `.env`
   - Issue phải có description > 10 ký tự

## Tính năng có sẵn

✅ **Authentication** - Đăng ký, đăng nhập, profile
✅ **Teams** - Tạo team, mời members, quản lý roles
✅ **Projects** - Tạo projects, archive, favorite
✅ **Issues** - CRUD, assign, labels, subtasks
✅ **AI Features** - Summary, Suggestion (cần OpenAI API key)
✅ **Comments** - Comment trên issues
✅ **Notifications** - Thông báo in-app

## Troubleshooting

### Lỗi "No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### Lỗi "Could not validate credentials"
- Kiểm tra token đã authorize chưa
- Token có thể đã hết hạn (24 giờ), đăng nhập lại

### AI features không hoạt động
- Thêm `OPENAI_API_KEY` vào file `.env`
- Đảm bảo có credit trong OpenAI account

### Database reset
```bash
# Xóa database file
del jira_lite.db

# Chạy lại server (sẽ tạo database mới)
python main.py
```

## Cấu hình thêm

### Email (cho password reset, team invites)
Chỉnh sửa trong `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Google OAuth
1. Tạo project tại Google Cloud Console
2. Tạo OAuth 2.0 credentials
3. Thêm vào `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Deployment

Backend này có thể deploy lên:
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

Xem chi tiết trong `README.md`

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Python version (cần 3.9+)
2. Virtual environment đã activate chưa
3. Dependencies đã cài đủ chưa
4. File `.env` đã tồn tại chưa
