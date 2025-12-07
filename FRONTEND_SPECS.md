# Frontend Specifications - Jira Lite MVP

## Tech Stack đề xuất
- **Framework**: React + TypeScript / Next.js
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: Zustand / React Query
- **Routing**: React Router / Next.js routing
- **HTTP Client**: Axios / Fetch
- **Drag & Drop**: @dnd-kit hoặc react-beautiful-dnd
- **Charts**: Recharts / Chart.js
- **Icons**: Lucide React / Heroicons

---

## 1. AUTHENTICATION PAGES

### 1.1 Login Page (`/login`)

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         [LOGO] Jira Lite            │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  Email                      │  │
│   │  [___________________]      │  │
│   │                             │  │
│   │  Password                   │  │
│   │  [___________________]      │  │
│   │                             │  │
│   │  [ ] Remember me            │  │
│   │                             │  │
│   │  [   Login   ]              │  │
│   │                             │  │
│   │  ─── OR ───                 │  │
│   │                             │  │
│   │  [🔵 Login with Google]     │  │
│   │                             │  │
│   │  Forgot password?           │  │
│   │  Don't have account? Signup │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Email/password login form
- Google OAuth button
- Remember me checkbox
- Forgot password link
- Link to signup page
- Form validation
- Loading states
- Error messages

**API Calls:**
- `POST /api/auth/login`
- `POST /api/auth/google/callback` (Google OAuth)

---

### 1.2 Signup Page (`/signup`)

**Layout:** Similar to Login

**Fields:**
- Name (1-50 chars)
- Email (valid email format)
- Password (min 6 chars)
- Confirm Password

**Features:**
- Validation real-time
- Password strength indicator
- Google OAuth option
- Link to login

**API Calls:**
- `POST /api/auth/signup`

---

### 1.3 Forgot Password Page (`/forgot-password`)

**Layout:**
```
┌─────────────────────────────────────┐
│     Reset Your Password             │
│                                     │
│  Enter email to receive reset link │
│                                     │
│  Email                              │
│  [________________________]         │
│                                     │
│  [  Send Reset Link  ]              │
│                                     │
│  ← Back to Login                    │
└─────────────────────────────────────┘
```

**API Calls:**
- `POST /api/auth/password-reset/request`

---

## 2. MAIN LAYOUT

### 2.1 Dashboard Layout (sau khi login)

**Structure:**
```
┌──────────────────────────────────────────────────────┐
│ [☰] Jira Lite    [Search...]     [🔔] [👤]          │ ← Header
├─────────┬────────────────────────────────────────────┤
│         │                                            │
│ Sidebar │          Main Content Area                 │
│         │                                            │
│ • Home  │                                            │
│ • Teams │                                            │
│         │                                            │
│ MY TEAMS│                                            │
│ ▼ Team1 │                                            │
│   ├Proj1│                                            │
│   └Proj2│                                            │
│ ▼ Team2 │                                            │
│         │                                            │
└─────────┴────────────────────────────────────────────┘
```

**Sidebar Components:**
- Toggle button
- Navigation menu
- Teams list (collapsible)
- Projects under each team
- Create Team/Project buttons
- User settings at bottom

**Header Components:**
- Logo/App name
- Global search
- Notifications icon (with unread badge)
- User avatar + dropdown menu

**User Dropdown Menu:**
- Profile
- Settings
- Change Password
- Logout

---

## 3. CORE PAGES

### 3.1 Personal Dashboard (`/dashboard`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Welcome back, [User Name]! 👋                       │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ My Issues    │ │ Due Today    │ │ Due Soon    │ │
│  │     12       │ │      3       │ │     7       │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ │
│                                                      │
│  My Assigned Issues                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ Backlog (3)                                  │   │
│  │ • Fix login bug              [HIGH] 🔴      │   │
│  │ • Update docs                [MED]  🟡      │   │
│  │                                              │   │
│  │ In Progress (2)                              │   │
│  │ • Implement API              [HIGH] 🔴      │   │
│  │                                              │   │
│  │ Done (7)                                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  My Teams & Projects                                │
│  [Team cards grid with project counts...]           │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Stats cards: Total issues, Due today, Due soon
- My assigned issues grouped by status
- Quick access to teams and projects
- Recent activity feed
- Chart showing issue completion trend

**API Calls:**
- `GET /api/issues?assignee_id=me`
- `GET /api/teams`
- `GET /api/notifications/unread-count`

---

### 3.2 Teams List (`/teams`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  My Teams                          [+ Create Team]   │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ 👥 Marketing      │  │ 👥 Engineering    │        │
│  │ Owner             │  │ Member            │        │
│  │ 12 members        │  │ 25 members        │        │
│  │ 5 projects        │  │ 8 projects        │        │
│  │                   │  │                   │        │
│  │ [View Team]       │  │ [View Team]       │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ 👥 Design         │  │ + Create New     │        │
│  │ Admin             │  │   Team           │        │
│  │ 8 members         │  │                  │        │
│  │ 3 projects        │  │                  │        │
│  │                   │  │                  │        │
│  │ [View Team]       │  │                  │        │
│  └──────────────────┘  └──────────────────┘        │
└──────────────────────────────────────────────────────┘
```

**Team Card Info:**
- Team name
- User's role (Owner/Admin/Member)
- Member count
- Project count
- Quick action button

**API Calls:**
- `GET /api/teams`

---

### 3.3 Team Detail Page (`/teams/:teamId`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  ← Back    👥 Marketing Team                         │
│                                                      │
│  ┌─ Tabs ─────────────────────────────────────────┐ │
│  │ Projects | Members | Activity | Settings       │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  [TAB: Projects]                                     │
│                                                      │
│  Projects (5)                      [+ New Project]   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ⭐ Website Redesign        [ACTIVE] [★]      │   │
│  │ 12 issues • 8 done • 33% complete                │
│  │ Last updated 2 hours ago                         │
│  ├─────────────────────────────────────────────┤   │
│  │ Mobile App                [ACTIVE] [☆]      │   │
│  │ 25 issues • 15 done • 60% complete               │
│  │ Last updated 1 day ago                           │
│  └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

[TAB: Members]
┌──────────────────────────────────────────────────────┐
│  Members (12)                     [+ Invite Member]  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 👤 John Doe          OWNER       [⚙️]        │   │
│  │    john@company.com                              │
│  │    Joined 3 months ago                           │
│  ├─────────────────────────────────────────────┤   │
│  │ 👤 Jane Smith        ADMIN       [⚙️]        │   │
│  │    jane@company.com                              │
│  │    Joined 2 months ago                           │
│  ├─────────────────────────────────────────────┤   │
│  │ 👤 Bob Wilson        MEMBER      [⚙️]        │   │
│  │    bob@company.com                               │
│  │    Joined 1 month ago                            │
│  └─────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**Tabs:**
1. **Projects Tab:**
   - List of all projects
   - Project cards with stats
   - Create project button
   - Favorite toggle

2. **Members Tab:**
   - List of all members
   - Role badges
   - Invite button (OWNER/ADMIN only)
   - Member actions dropdown (change role, kick)

3. **Activity Tab:**
   - Timeline of team activities
   - Filter by type

4. **Settings Tab:** (OWNER/ADMIN only)
   - Edit team name
   - Delete team
   - Transfer ownership

**API Calls:**
- `GET /api/teams/:id`
- `GET /api/projects?team_id=:id`
- `POST /api/teams/:id/invite`
- `PUT /api/teams/:id`

---

### 3.4 Project Detail Page (`/projects/:projectId`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  ← Marketing Team > Website Redesign        [⋮]     │
│                                                      │
│  ┌─ Tabs ─────────────────────────────────────────┐ │
│  │ Board | List | Dashboard | Settings           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  [TAB: Board - Kanban View]                          │
│                                                      │
│  [Filter: All] [Assignee ▼] [Priority ▼] [+ Issue]  │
│                                                      │
│  ┌──────────┬───────────┬──────────┬──────────┐    │
│  │ Backlog  │ In Prog.. │ Review   │ Done     │    │
│  │   (5)    │   (3)     │   (2)    │  (12)    │    │
│  ├──────────┼───────────┼──────────┼──────────┤    │
│  │┌────────┐│┌────────┐ │┌────────┐│┌────────┐│    │
│  ││Fix bug ││││API impl│ ││Code rev│││Deploy  ││    │
│  ││🔴 HIGH ││││🟡 MED  │ ││🟢 LOW  │││✓ Done  ││    │
│  ││@john   ││││@jane   │ ││@bob    │││        ││    │
│  ││📎 2    ││││📎 5    │ ││        │││        ││    │
│  │└────────┘│└────────┘ │└────────┘│└────────┘│    │
│  │          │           │          │          │    │
│  │ [+ Add]  │ [+ Add]   │ [+ Add]  │ [+ Add]  │    │
│  └──────────┴───────────┴──────────┴──────────┘    │
└──────────────────────────────────────────────────────┘
```

**Kanban Board Features:**
- Drag & drop issues between columns
- Issue cards show:
  - Title
  - Priority (color coded)
  - Assignee avatar
  - Labels
  - Subtask progress (3/5)
  - Comment count
- WIP limit indicator
- Quick add issue in each column
- Filters: Status, Assignee, Priority, Labels

**List View:**
```
┌──────────────────────────────────────────────────────┐
│  Title            Status    Priority  Assignee  Due  │
│  ─────────────────────────────────────────────────── │
│  Fix login bug    Backlog   🔴 HIGH   @john    Today│
│  Update docs      In Prog   🟡 MED    @jane    12/15│
│  Add tests        Done      🟢 LOW    @bob     12/10│
└──────────────────────────────────────────────────────┘
```

**Dashboard View:**
- Issue count by status (pie chart)
- Completion rate
- Issue count by priority (bar chart)
- Recent issues (5)
- Issues due soon (5)
- Assignee workload

**API Calls:**
- `GET /api/projects/:id`
- `GET /api/issues?project_id=:id`
- `PATCH /api/issues/:id/status` (drag & drop)
- `POST /api/issues`

---

### 3.5 Issue Detail Modal/Page (`/issues/:issueId`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Fix login bug with special characters     [✕]      │
│  #123 • Created by @john • 2 days ago                │
│                                                      │
│  ┌────────────────────────┬─────────────────────┐   │
│  │ Description            │ Details             │   │
│  │                        │                     │   │
│  │ Users cannot login..   │ Status: Backlog ▼   │   │
│  │ when password has..    │ Priority: 🔴 HIGH ▼  │   │
│  │                        │ Assignee: @john ▼    │   │
│  │ [✨ AI Summary]        │ Due: [📅 12/20/24]  │   │
│  │ [💡 AI Suggestion]     │                     │   │
│  │                        │ Labels:             │   │
│  │ ─── Subtasks (3/5) ─── │ [bug] [urgent]      │   │
│  │ ☑ Research issue       │                     │   │
│  │ ☑ Write test           │ Created: 2d ago     │   │
│  │ ☑ Fix code             │ Updated: 1h ago     │   │
│  │ ☐ Code review          │                     │   │
│  │ ☐ Deploy               │ [History]           │   │
│  │ [+ Add subtask]        │                     │   │
│  │                        │                     │   │
│  │ ─── Comments (5) ───   │                     │   │
│  │                        │                     │   │
│  │ 👤 @jane 1h ago        │                     │   │
│  │ I'll look into this... │                     │   │
│  │                        │                     │   │
│  │ 👤 @bob 30m ago        │                     │   │
│  │ Found the root cause.. │                     │   │
│  │                        │                     │   │
│  │ [Write a comment...]   │                     │   │
│  │ [Comment] [Cancel]     │                     │   │
│  └────────────────────────┴─────────────────────┘   │
│                                                      │
│  [Delete Issue]                      [Save Changes]  │
└──────────────────────────────────────────────────────┘
```

**Left Panel:**
- Description (editable)
- AI Summary button (generates summary)
- AI Suggestion button (suggests solution)
- Subtasks list (checkbox, add new)
- Comments section (add, edit own, delete)

**Right Panel:**
- Status dropdown (Backlog/In Progress/Done/Custom)
- Priority dropdown (HIGH/MEDIUM/LOW)
- Assignee selector (team members)
- Due date picker
- Labels (multi-select, max 5)
- Metadata (created, updated)
- History button (shows changes)

**AI Features:**
- Click "AI Summary" → Shows loading → Displays 2-4 sentence summary
- Click "AI Suggestion" → Shows loading → Displays solution approach
- Rate limit warning if exceeded

**API Calls:**
- `GET /api/issues/:id`
- `PUT /api/issues/:id`
- `POST /api/issues/:id/ai/summary`
- `POST /api/issues/:id/ai/suggestion`
- `POST /api/issues/:id/subtasks`
- `POST /api/comments`
- `GET /api/comments/issue/:id`

---

### 3.6 Create Issue Modal

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Create New Issue                           [✕]     │
│                                                      │
│  Title *                                             │
│  [_____________________________________________]     │
│                                                      │
│  Description                                         │
│  [                                             ]     │
│  [                                             ]     │
│  [                                             ]     │
│                                                      │
│  Project *        Status          Priority          │
│  [Select ▼]       [Backlog ▼]     [MEDIUM ▼]        │
│                                                      │
│  Assignee         Due Date        Labels            │
│  [Select ▼]       [📅 Pick]       [Select ▼]        │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 💡 AI Label Recommendation                   │   │
│  │ Suggested: [bug] [frontend] [urgent]        │   │
│  │ [Apply Suggestions]                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ ⚠️ Similar Issues Found                      │   │
│  │ • Fix login redirect issue (#122)           │   │
│  │ • Login validation bug (#98)                │   │
│  │ [View Similar] [Ignore & Create]             │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│              [Cancel]  [Create Issue]                │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Form validation
- AI Label Recommendation (after title/description filled)
- AI Duplicate Detection (warns about similar issues)
- All fields from issue schema
- Create and stay / Create and open

**API Calls:**
- `GET /api/projects?team_id=:id`
- `POST /api/issues`
- AI endpoints (optional)

---

### 3.7 Notifications Panel (`/notifications`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Notifications                   [Mark all as read]  │
│                                                      │
│  ┌─ Unread (3) ───────────────────────────────────┐ │
│  │ 🔴 @john assigned you to "Fix bug"             │ │
│  │    2 hours ago                          [Mark] │ │
│  ├────────────────────────────────────────────────┤ │
│  │ 💬 @jane commented on "Update docs"            │ │
│  │    5 hours ago                          [Mark] │ │
│  ├────────────────────────────────────────────────┤ │
│  │ ⚠️ Issue "Deploy API" is due today             │ │
│  │    8 hours ago                          [Mark] │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ Earlier ──────────────────────────────────────┐ │
│  │ ✅ @bob completed "Add tests"                  │ │
│  │    1 day ago                                   │ │
│  ├────────────────────────────────────────────────┤ │
│  │ 👥 You were added to "Design Team"             │ │
│  │    2 days ago                                  │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Unread notifications highlighted
- Click to navigate to related issue/team
- Mark individual as read
- Mark all as read
- Group by date
- Real-time updates (optional)

**API Calls:**
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/mark-all-read`

---

### 3.8 User Profile Page (`/profile`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  ← Back                                              │
│                                                      │
│  ┌─ Tabs ─────────────────────────────────────────┐ │
│  │ Profile | Security | Preferences               │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  [TAB: Profile]                                      │
│                                                      │
│  ┌────────────────┐                                  │
│  │   [Avatar]     │  Name                            │
│  │   [Change]     │  [________________]              │
│  └────────────────┘                                  │
│                        Email                          │
│                        john@company.com (verified)   │
│                                                      │
│                        Profile Image URL             │
│                        [____________________]        │
│                                                      │
│                        [Save Changes]                │
│                                                      │
└──────────────────────────────────────────────────────┘

[TAB: Security]
┌──────────────────────────────────────────────────────┐
│  Change Password                                     │
│                                                      │
│  Current Password                                    │
│  [_______________________]                           │
│                                                      │
│  New Password                                        │
│  [_______________________]                           │
│                                                      │
│  Confirm New Password                                │
│  [_______________________]                           │
│                                                      │
│  [Change Password]                                   │
│                                                      │
│  ─────────────────────────────────────────────      │
│                                                      │
│  Delete Account                                      │
│  [⚠️ Delete My Account]                              │
└──────────────────────────────────────────────────────┘
```

**API Calls:**
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `POST /api/auth/change-password`
- `DELETE /api/auth/me`

---

## 4. COMPONENTS LIBRARY

### 4.1 Reusable Components

**IssueCard Component:**
```typescript
interface IssueCardProps {
  issue: {
    id: number;
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: string;
    assignee?: User;
    labels: Label[];
    subtaskProgress?: { completed: number; total: number };
    commentCount: number;
  };
  onClick: () => void;
  draggable?: boolean;
}
```

**PriorityBadge Component:**
- HIGH: Red circle 🔴
- MEDIUM: Yellow circle 🟡
- LOW: Green circle 🟢

**StatusBadge Component:**
- Different colors for each status
- Customizable

**UserAvatar Component:**
- Shows user image or initials
- Tooltip with user name

**LabelTag Component:**
- Colored tags for labels
- Max 5 per issue

**CommentBox Component:**
- Avatar + name + timestamp
- Comment content
- Edit/Delete buttons (if owner)

---

## 5. USER FLOWS

### Flow 1: Complete Issue Creation
1. User clicks "+ New Issue"
2. Modal opens
3. Fill title and description
4. AI suggests labels (optional)
5. AI checks for duplicates (optional)
6. Select project, assignee, priority
7. Click "Create Issue"
8. Notification sent to assignee
9. Modal closes, issue appears in list

### Flow 2: Kanban Drag & Drop
1. User drags issue card
2. Visual feedback (ghost card)
3. Drop in new column
4. API updates status
5. Issue position updated
6. History recorded

### Flow 3: AI Summary Generation
1. User opens issue detail
2. Clicks "AI Summary" button
3. Button shows loading spinner
4. API call to generate summary
5. Summary displayed in modal/section
6. Result cached for future views

### Flow 4: Team Invitation
1. OWNER/ADMIN clicks "Invite Member"
2. Modal opens with email input
3. Enter email and send
4. Email sent to invitee
5. Invitee clicks link
6. Auto-joins team (if signed up) or shown signup
7. Team member list updated

---

## 6. RESPONSIVE DESIGN

### Mobile Layout Considerations:

**Sidebar:**
- Collapsible hamburger menu
- Overlay on mobile

**Kanban Board:**
- Horizontal scroll
- Cards stack vertically on small screens
- Simplified card view

**Tables:**
- Convert to cards on mobile
- Show essential info only

**Modals:**
- Full screen on mobile
- Slide up animation

---

## 7. STATE MANAGEMENT

### Global State:
- Current user
- Authentication token
- Teams list
- Current team
- Current project
- Notifications

### API State (React Query):
- Issues list
- Projects list
- Team members
- Comments
- Cache and refetch strategies

---

## 8. ROUTING STRUCTURE

```
/login
/signup
/forgot-password
/reset-password?token=xxx

/dashboard (protected)
/teams (protected)
/teams/:teamId (protected)
/projects/:projectId (protected)
/issues/:issueId (protected, can be modal)
/notifications (protected)
/profile (protected)

/accept-invite?token=xxx
/404
```

---

## 9. API INTEGRATION EXAMPLES

### Axios Setup:
```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Example API Calls:
```typescript
// api/auth.ts
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  signup: (data: SignupData) =>
    apiClient.post('/auth/signup', data),

  getMe: () =>
    apiClient.get('/auth/me'),
};

// api/issues.ts
export const issuesAPI = {
  list: (projectId: number) =>
    apiClient.get(`/issues?project_id=${projectId}`),

  create: (data: IssueCreateData) =>
    apiClient.post('/issues', data),

  update: (id: number, data: IssueUpdateData) =>
    apiClient.put(`/issues/${id}`, data),

  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/issues/${id}/status`, { status }),

  generateSummary: (id: number) =>
    apiClient.post(`/issues/${id}/ai/summary`),
};
```

---

## 10. STYLING GUIDELINES

### Color Palette:
```css
/* Primary */
--primary: #3b82f6;
--primary-dark: #2563eb;

/* Status Colors */
--status-backlog: #94a3b8;
--status-progress: #3b82f6;
--status-done: #10b981;

/* Priority Colors */
--priority-high: #ef4444;
--priority-medium: #f59e0b;
--priority-low: #10b981;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-900: #111827;
```

### Typography:
- Headers: Inter/Geist Sans
- Body: System fonts
- Code: Fira Code/Mono

---

## 11. ACCESSIBILITY

- Keyboard navigation support
- ARIA labels
- Focus indicators
- Color contrast ratios (WCAG AA)
- Screen reader friendly
- Alt text for images

---

## 12. PERFORMANCE

- Lazy load routes
- Virtual scrolling for long lists
- Debounce search inputs
- Optimize images
- Code splitting
- Memoize expensive components

---

## 13. ERROR HANDLING

**Display Patterns:**
- Toast notifications for success/errors
- Inline validation errors
- Empty states with helpful messages
- Loading skeletons
- Error boundaries

---

## PROMPT EXAMPLES FOR V0/LOVABLE

### Example 1: Login Page
```
Create a modern login page for a project management app called "Jira Lite" using React, TypeScript, and Shadcn/ui components. Include:
- Email and password input fields with validation
- "Remember me" checkbox
- "Login" button
- "Login with Google" button with Google icon
- Links to "Forgot password?" and "Sign up"
- Centered card layout with a subtle shadow
- Gradient background
- Loading states and error messages
Use Tailwind CSS for styling. The form should validate email format and password minimum length of 6 characters.
```

### Example 2: Kanban Board
```
Create a Kanban board component using React, TypeScript, and @dnd-kit/core for drag-and-drop. Include:
- 4 columns: Backlog, In Progress, Review, Done
- Issue cards showing: title, priority badge (red/yellow/green), assignee avatar, label tags, subtask progress (3/5), comment count icon
- Drag and drop between columns
- "Add issue" button in each column
- Filter bar above board with dropdowns for: Assignee, Priority, Labels
- WIP limit indicator showing current count / max count
- Responsive design that scrolls horizontally on mobile
Use Shadcn/ui for cards and badges, Tailwind for styling.
```

### Example 3: Issue Detail Modal
```
Create an issue detail modal/drawer using React, TypeScript, and Shadcn/ui. Include:
- Two-column layout: description/comments on left, metadata on right
- Left side: editable description textarea, "AI Summary" button, "AI Suggestion" button, subtasks checklist (with add button), comments section with add comment form
- Right side: Status dropdown, Priority dropdown, Assignee select, Due date picker, Labels multi-select (max 5), metadata (created date, updated date), History button
- Header: Issue title, issue number (#123), creator, created date, close button
- Footer: Delete button (left), Save button (right)
Use Shadcn/ui Dialog, Select, Textarea, Button components. Style with Tailwind CSS.
```

---

## 14. TESTING CHECKLIST

- [ ] All forms validate correctly
- [ ] API errors display properly
- [ ] Drag & drop works smoothly
- [ ] Notifications update in real-time
- [ ] Mobile responsive on all pages
- [ ] Authentication redirects work
- [ ] Protected routes enforce login
- [ ] AI features show loading states
- [ ] Images/avatars have fallbacks
- [ ] Empty states are helpful

---

**End of Frontend Specifications**

Use these specs to prompt v0.dev, Lovable, or Bolt.new for component generation!
