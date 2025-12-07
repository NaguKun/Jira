# Jira Lite MVP - Backend API

Backend API cho ứng dụng Issue Tracking (Jira Lite MVP) sử dụng FastAPI.

## Tính năng chính

### Authentication
- ✅ Đăng ký/Đăng nhập với Email/Password
- ✅ JWT Authentication
- ✅ Password reset (với email)
- ✅ Google OAuth (cấu hình trong .env)
- ✅ Profile management
- ✅ Account deletion (soft delete)

### Team Management
- ✅ Tạo và quản lý teams
- ✅ Roles: OWNER, ADMIN, MEMBER
- ✅ Mời thành viên qua email
- ✅ Quản lý members (kick, leave, change role)
- ✅ Activity logs

### Project Management
- ✅ Tạo projects trong team (max 15/team)
- ✅ Archive/Unarchive projects
- ✅ Favorite projects
- ✅ Custom statuses (max 5 custom + 3 default)
- ✅ WIP limits cho Kanban columns

### Issue Management
- ✅ CRUD issues (max 200/project)
- ✅ Assign to team members
- ✅ Priority levels (HIGH/MEDIUM/LOW)
- ✅ Due dates
- ✅ Labels (max 20/project, max 5/issue)
- ✅ Subtasks (max 20/issue)
- ✅ Drag & drop status update
- ✅ Issue history tracking
- ✅ Search và filter

### AI Features
- ✅ AI Summary (tóm tắt issue)
- ✅ AI Suggestion (gợi ý giải pháp)
- ✅ Rate limiting (10 requests/minute/user)
- ✅ Caching AI results

### Comments & Notifications
- ✅ Comments trên issues
- ✅ In-app notifications
- ✅ Notification triggers (assign, comment, etc.)
- ✅ Mark as read

## Cài đặt

### 1. Requirements
- Python 3.9+
- pip

### 2. Clone và setup

```bash
# Tạo virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình các biến môi trường trong `.env`:

```env
# Required
SECRET_KEY=your-secret-key-here-change-this

# Optional (for AI features)
OPENAI_API_KEY=your-openai-api-key

# Optional (for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Chạy server

```bash
# Development mode (with auto-reload)
python main.py

# Hoặc sử dụng uvicorn trực tiếp
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server sẽ chạy tại: http://localhost:8000

## API Documentation

Sau khi chạy server, truy cập:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Cấu trúc project

```
.
├── app/
│   ├── core/               # Core functionality
│   │   ├── config.py       # Settings
│   │   ├── database.py     # Database setup
│   │   └── security.py     # Auth & JWT
│   ├── models/             # SQLAlchemy models
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── project.py
│   │   ├── issue.py
│   │   ├── comment.py
│   │   └── ...
│   ├── schemas/            # Pydantic schemas
│   │   ├── user.py
│   │   ├── team.py
│   │   └── ...
│   ├── routes/             # API endpoints
│   │   ├── auth.py
│   │   ├── teams.py
│   │   ├── projects.py
│   │   ├── issues.py
│   │   └── ...
│   └── utils/              # Utilities
│       ├── email.py        # Email sending
│       ├── permissions.py  # Access control
│       ├── ai_service.py   # AI integration
│       └── helpers.py      # Helper functions
├── main.py                 # FastAPI app
├── requirements.txt        # Dependencies
├── .env.example           # Environment template
└── README.md              # This file
```

## API Endpoints chính

### Authentication
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại
- `PUT /api/auth/me` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi password
- `POST /api/auth/password-reset/request` - Yêu cầu reset password
- `DELETE /api/auth/me` - Xóa account

### Teams
- `POST /api/teams` - Tạo team
- `GET /api/teams` - List teams
- `GET /api/teams/{team_id}` - Chi tiết team
- `PUT /api/teams/{team_id}` - Cập nhật team
- `DELETE /api/teams/{team_id}` - Xóa team
- `POST /api/teams/{team_id}/invite` - Mời member
- `POST /api/teams/{team_id}/members/{user_id}/role` - Đổi role
- `DELETE /api/teams/{team_id}/members/{user_id}` - Kick member
- `POST /api/teams/{team_id}/leave` - Rời team

### Projects
- `POST /api/projects` - Tạo project
- `GET /api/projects` - List projects
- `GET /api/projects/{project_id}` - Chi tiết project
- `PUT /api/projects/{project_id}` - Cập nhật project
- `DELETE /api/projects/{project_id}` - Xóa project
- `POST /api/projects/{project_id}/archive` - Archive
- `POST /api/projects/{project_id}/favorite` - Favorite

### Issues
- `POST /api/issues` - Tạo issue
- `GET /api/issues` - List issues (với filters)
- `GET /api/issues/{issue_id}` - Chi tiết issue
- `PUT /api/issues/{issue_id}` - Cập nhật issue
- `PATCH /api/issues/{issue_id}/status` - Cập nhật status (drag & drop)
- `DELETE /api/issues/{issue_id}` - Xóa issue
- `POST /api/issues/{issue_id}/ai/summary` - AI Summary
- `POST /api/issues/{issue_id}/ai/suggestion` - AI Suggestion
- `POST /api/issues/{issue_id}/subtasks` - Tạo subtask

### Comments
- `POST /api/comments` - Tạo comment
- `GET /api/comments/issue/{issue_id}` - List comments
- `PUT /api/comments/{comment_id}` - Cập nhật comment
- `DELETE /api/comments/{comment_id}` - Xóa comment

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Đếm unread
- `PATCH /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

## Testing API

### 1. Đăng ký user mới
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Đăng nhập
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Lưu `access_token` để sử dụng cho các requests tiếp theo.

### 3. Tạo team
```bash
curl -X POST http://localhost:8000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Team"
  }'
```

## Database

- Sử dụng SQLite (file `jira_lite.db`)
- Auto-create tables khi chạy lần đầu
- Soft delete cho tất cả entities chính

## AI Features Configuration

Để sử dụng AI features, cần:

1. Có OpenAI API key
2. Thêm `OPENAI_API_KEY` vào `.env`
3. AI features sẽ tự động available

Rate limits:
- 10 requests/minute/user
- Kết quả được cache tự động

## Production Deployment

### Khuyến nghị:
1. Sử dụng PostgreSQL thay vì SQLite
2. Set `SECRET_KEY` an toàn
3. Cấu hình CORS chính xác
4. Sử dụng HTTPS
5. Set up proper logging
6. Sử dụng Redis cho rate limiting (thay vì in-memory)

### Deploy lên Render/Railway:
```bash
# Thêm vào runtime.txt
python-3.11.0

# Command để chạy
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Phát triển thêm

Các tính năng có thể bổ sung:
- [ ] Google OAuth implementation đầy đủ
- [ ] WebSocket cho real-time updates
- [ ] Dashboard statistics APIs
- [ ] Export issues to CSV/JSON
- [ ] Bulk operations
- [ ] Advanced search với Elasticsearch
- [ ] File attachments
- [ ] Email notifications (thay vì chỉ in-app)

## License

MIT License

## Support

Nếu cần hỗ trợ, vui lòng tạo issue hoặc liên hệ.
