# Frontend Pages Summary - Quick Reference

## 📄 DANH SÁCH TRANG CẦN TẠO (13 pages)

### 🔐 AUTHENTICATION (3 pages)
1. **Login** `/login` - Email/password + Google OAuth
2. **Signup** `/signup` - Đăng ký với email
3. **Forgot Password** `/forgot-password` - Reset password qua email

---

### 🏠 MAIN PAGES (10 pages)

4. **Personal Dashboard** `/dashboard`
   - My issues stats (total, due today, due soon)
   - Issues grouped by status
   - My teams grid
   - Quick access to projects

5. **Teams List** `/teams`
   - Grid of team cards
   - Show role, members count, projects count
   - Create new team button

6. **Team Detail** `/teams/:id`
   - **4 tabs**: Projects, Members, Activity, Settings
   - Invite members
   - Manage roles
   - View/create projects

7. **Project Detail - Kanban Board** `/projects/:id?view=board`
   - Drag & drop issues between columns
   - Default columns: Backlog, In Progress, Done
   - Custom columns support
   - Filters: status, assignee, priority, labels

8. **Project Detail - List View** `/projects/:id?view=list`
   - Table view of all issues
   - Sortable columns
   - Same filters as Kanban

9. **Project Detail - Dashboard** `/projects/:id?view=dashboard`
   - Charts: issue by status, by priority
   - Completion rate
   - Recent issues
   - Issues due soon

10. **Issue Detail** `/issues/:id` (Modal or page)
    - Left: Description, AI buttons, Subtasks, Comments
    - Right: Status, Priority, Assignee, Due date, Labels
    - AI Summary & Suggestion buttons

11. **Create Issue** (Modal)
    - Form with all fields
    - AI label recommendation
    - AI duplicate detection

12. **Notifications** `/notifications`
    - List of notifications (unread first)
    - Mark as read
    - Click to navigate to issue/team

13. **User Profile** `/profile`
    - **3 tabs**: Profile, Security, Preferences
    - Edit name, avatar
    - Change password
    - Delete account

---

## 🎨 COMPONENTS CẦN TẠO (15+ components)

### Layout Components
- `Sidebar` - Navigation menu with teams/projects tree
- `Header` - Logo, search, notifications bell, user menu
- `DashboardLayout` - Sidebar + Header + Content wrapper

### Card Components
- `IssueCard` - For Kanban board (draggable)
- `TeamCard` - For teams grid
- `ProjectCard` - For projects grid
- `StatCard` - For dashboard stats

### Form Components
- `IssueForm` - Create/edit issue
- `CommentForm` - Add comment
- `InviteForm` - Invite team member

### Display Components
- `PriorityBadge` - 🔴 HIGH, 🟡 MEDIUM, 🟢 LOW
- `StatusBadge` - Colored status tags
- `LabelTag` - Issue labels (colored)
- `UserAvatar` - Avatar with fallback initials
- `SubtaskList` - Checkbox list
- `CommentBox` - Comment display with edit/delete

### Special Components
- `KanbanColumn` - Droppable column for Kanban
- `AIButton` - Button that calls AI features with loading state
- `NotificationBell` - Icon with unread count badge

---

## 🎯 PROMPTS MẪU CHO V0/LOVABLE

### Prompt 1: Login Page
```
Tạo login page cho ứng dụng "Jira Lite" với:
- React + TypeScript + Shadcn/ui
- Email và password inputs với validation
- "Remember me" checkbox
- Button "Login" và "Login with Google" (với icon)
- Links: "Forgot password?", "Sign up"
- Card layout ở giữa màn hình, background gradient
- Tailwind CSS cho styling
- Error messages hiển thị dưới form
```

### Prompt 2: Dashboard
```
Tạo personal dashboard với React + TypeScript + Shadcn/ui:
- Header: "Welcome back, [Name]!" với avatar
- 3 stat cards: "My Issues (12)", "Due Today (3)", "Due Soon (7)"
- Section "My Assigned Issues" với issues grouped theo status (Backlog, In Progress, Done)
- Mỗi issue card có: title, priority badge (red/yellow/green), due date
- Section "My Teams" với team cards grid (team name, role badge, member count)
- Responsive design, Tailwind CSS
```

### Prompt 3: Kanban Board
```
Tạo Kanban board với React + TypeScript + @dnd-kit:
- 4 columns có thể drag & drop: Backlog, In Progress, Review, Done
- Issue cards có: title, priority badge, assignee avatar, labels, subtask progress (3/5), comment count
- Filter bar ở trên: Assignee dropdown, Priority dropdown, Labels multi-select
- "Add Issue" button ở mỗi column
- WIP limit indicator (5/10) ở header mỗi column
- Shadcn/ui components, Tailwind CSS
- Smooth drag animation
```

### Prompt 4: Issue Detail Modal
```
Tạo issue detail modal với React + TypeScript + Shadcn/ui Dialog:
- 2 columns: Left (description/comments), Right (metadata)
- Left:
  * Rich text description (editable)
  * Buttons "✨ AI Summary" và "💡 AI Suggestion"
  * Subtasks checklist với checkboxes
  * Comments list với add comment form
- Right:
  * Status dropdown (Backlog/In Progress/Done)
  * Priority dropdown (HIGH/MEDIUM/LOW) với color
  * Assignee select (với avatar)
  * Due date picker
  * Labels multi-select (max 5)
  * Created/Updated timestamps
- Header: Issue title, #123, close button
- Footer: Delete button (left), Save button (right)
- Tailwind CSS, responsive
```

### Prompt 5: Team Detail Page
```
Tạo team detail page với React + TypeScript + Shadcn/ui Tabs:
- Header: Back button, team name, team icon
- 4 tabs: Projects, Members, Activity, Settings
- Projects tab:
  * List of project cards với: name, status badge, issue count, progress bar
  * "Create Project" button
  * Star icon để favorite
- Members tab:
  * List of members với: avatar, name, email, role badge (OWNER/ADMIN/MEMBER)
  * "Invite Member" button
  * Dropdown menu mỗi member (Change Role, Remove) nếu là admin
- Activity tab:
  * Timeline of activities với icons
- Settings tab (chỉ OWNER/ADMIN thấy):
  * Edit team name
  * Delete team button (danger)
- Tailwind CSS, responsive
```

### Prompt 6: Notifications Panel
```
Tạo notifications panel với React + TypeScript + Shadcn/ui:
- Header: "Notifications", "Mark all as read" button
- 2 sections: "Unread (3)" và "Earlier"
- Mỗi notification card có:
  * Icon (🔴 assigned, 💬 comment, ⚠️ due date, ✅ completed)
  * Message text
  * Timestamp (2 hours ago)
  * "Mark as read" button
- Unread notifications có background khác biệt
- Click vào notification navigate đến issue/team
- Empty state khi không có notifications
- Tailwind CSS, smooth animations
```

### Prompt 7: Create Issue Form
```
Tạo create issue modal form với React + TypeScript + Shadcn/ui:
- Title input (required, max 200 chars)
- Description textarea (max 5000 chars)
- Project select dropdown
- Status dropdown (default: Backlog)
- Priority dropdown (default: MEDIUM)
- Assignee select với avatar
- Due date picker
- Labels multi-select (max 5)
- AI features:
  * "💡 Get Label Recommendations" button
  * Hiển thị "⚠️ Similar Issues Found" với list nếu có
- Footer: "Cancel" và "Create Issue" buttons
- Form validation real-time
- Tailwind CSS
```

### Prompt 8: Sidebar Navigation
```
Tạo sidebar navigation với React + TypeScript + Shadcn/ui:
- Collapsible sidebar (toggle button)
- Logo và app name ở top
- Navigation links:
  * 🏠 Dashboard
  * 👥 Teams
- Section "MY TEAMS" với expandable team list:
  * Team name với expand icon
  * Nested project list dưới mỗi team
  * Click vào project navigate đến project detail
- "Create Team" button ở bottom
- Active state highlighting
- Smooth collapse animation
- Tailwind CSS, width 250px khi expanded, 60px khi collapsed
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First */
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */
```

### Mobile Adaptations:
- Sidebar → Hamburger menu overlay
- Kanban → Horizontal scroll hoặc list view
- Tables → Card layout
- Modals → Full screen
- Stats grid → Stack vertically

---

## 🎨 COLOR SCHEME

```javascript
// colors.js
export const colors = {
  // Priority
  priorityHigh: '#ef4444',    // Red
  priorityMedium: '#f59e0b',  // Yellow
  priorityLow: '#10b981',     // Green

  // Status
  statusBacklog: '#94a3b8',   // Gray
  statusProgress: '#3b82f6',  // Blue
  statusDone: '#10b981',      // Green

  // UI
  primary: '#3b82f6',         // Blue
  danger: '#ef4444',          // Red
  success: '#10b981',         // Green
  warning: '#f59e0b',         // Yellow
}
```

---

## 🔌 API ENDPOINTS CẦN GỌI

### Auth
- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/auth/me`
- PUT `/api/auth/me`
- POST `/api/auth/change-password`

### Teams
- GET `/api/teams`
- POST `/api/teams`
- GET `/api/teams/:id`
- PUT `/api/teams/:id`
- POST `/api/teams/:id/invite`

### Projects
- GET `/api/projects?team_id=:id`
- POST `/api/projects`
- GET `/api/projects/:id`
- PUT `/api/projects/:id`

### Issues
- GET `/api/issues?project_id=:id`
- POST `/api/issues`
- GET `/api/issues/:id`
- PUT `/api/issues/:id`
- PATCH `/api/issues/:id/status`
- POST `/api/issues/:id/ai/summary`
- POST `/api/issues/:id/ai/suggestion`

### Comments
- GET `/api/comments/issue/:id`
- POST `/api/comments`

### Notifications
- GET `/api/notifications`
- GET `/api/notifications/unread-count`
- PATCH `/api/notifications/:id/read`

---

## 📦 DEPENDENCIES CHÍNH

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.14.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "tailwindcss": "^3.3.6",
    "lucide-react": "^0.294.0",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4"
  }
}
```

---

## ✅ CHECKLIST HOÀN THÀNH

### Phase 1: Auth & Layout
- [ ] Login page
- [ ] Signup page
- [ ] Forgot password page
- [ ] Dashboard layout (Sidebar + Header)
- [ ] Protected routes

### Phase 2: Core Features
- [ ] Personal dashboard
- [ ] Teams list
- [ ] Team detail (all tabs)
- [ ] Create team modal
- [ ] Invite member modal

### Phase 3: Projects & Issues
- [ ] Kanban board (drag & drop)
- [ ] List view
- [ ] Dashboard view
- [ ] Issue detail modal
- [ ] Create issue modal
- [ ] Edit issue

### Phase 4: Additional Features
- [ ] Comments section
- [ ] Notifications panel
- [ ] User profile page
- [ ] AI features integration
- [ ] Search functionality

### Phase 5: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Mobile responsive
- [ ] Dark mode (optional)

---

## 🚀 THỨ TỰ NÊN LÀM

1. **Setup project** với Vite/Next.js
2. **Auth pages** (Login, Signup) + routing
3. **Dashboard Layout** (Sidebar, Header)
4. **Personal Dashboard** page
5. **Teams** pages (List, Detail, Create)
6. **Projects** - Kanban board
7. **Issue** detail modal
8. **Comments** & Notifications
9. **Polish** & responsive

---

**Tip**: Prompt từng page một cho v0/Lovable, test API integration, rồi mới làm page tiếp theo!
