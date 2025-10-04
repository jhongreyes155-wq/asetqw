# Design Guidelines: Lab Lifecycle Management System

## Design Approach

**Selected Framework**: Design System Approach using **Linear + Material Design** principles

**Rationale**: This is a utility-focused productivity application requiring efficient workflows for lab review and submission. Linear's clean, modern admin interface combined with Material Design's robust component patterns provides the optimal balance of aesthetics and functionality for data-heavy admin tools.

**Core Design Principles**:
- Clarity over decoration - every element serves a functional purpose
- Efficient information hierarchy for quick scanning and decision-making
- Consistent interaction patterns across admin and author interfaces
- Professional, trustworthy aesthetic appropriate for administrative tools

---

## Color Palette

### Dark Mode (Primary)
- **Background**: 
  - Primary: 217 30% 12% (deep navy-slate)
  - Secondary: 217 28% 16% (elevated surfaces)
  - Tertiary: 217 26% 20% (cards, modals)

- **Primary Brand**: 217 91% 60% (vibrant blue for CTAs and active states)

- **Text**:
  - Primary: 217 15% 95%
  - Secondary: 217 12% 70%
  - Tertiary: 217 10% 55%

- **Status Colors**:
  - Draft: 45 93% 47% (amber)
  - Pending: 217 91% 60% (blue)
  - Approved: 142 76% 36% (green)
  - Rejected: 0 84% 60% (red)

- **Borders**: 217 20% 24%

### Light Mode
- **Background**:
  - Primary: 0 0% 100%
  - Secondary: 217 33% 97%
  - Tertiary: 217 30% 94%

- **Primary Brand**: 217 91% 50%

- **Text**:
  - Primary: 217 30% 12%
  - Secondary: 217 15% 35%
  - Tertiary: 217 10% 55%

- **Status Colors**: Same hues, adjusted lightness for light backgrounds

---

## Typography

**Font Stack**: 
- Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Monospace: 'JetBrains Mono', 'Fira Code', monospace (for lab IDs, technical data)

**Type Scale**:
- Dashboard Headers: text-2xl (24px) font-semibold
- Section Titles: text-xl (20px) font-semibold
- Card Titles: text-lg (18px) font-medium
- Body Text: text-base (16px) font-normal
- Labels/Metadata: text-sm (14px) font-medium
- Captions: text-xs (12px) font-normal

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16** (consistent rhythm)
- Component padding: p-6 or p-8
- Card spacing: gap-6 or gap-8
- Section margins: mb-12 or mb-16
- Page containers: max-w-7xl with px-6

**Grid Structure**:
- Admin Review Queue: Single column table layout, full-width cards on mobile
- Lab Forms: Two-column layout on desktop (md:grid-cols-2), single on mobile
- Dashboard Stats: Three-column grid (grid-cols-1 md:grid-cols-3) for metrics

---

## Component Library

### Navigation
- **Admin Sidebar**: Fixed left sidebar (w-64), collapsible on mobile
  - Top section: Logo + role indicator
  - Navigation items with icons (Review Queue, All Labs, Settings)
  - Active state: bg-primary/10 with left border accent
  
- **Author Top Nav**: Horizontal navbar with user menu
  - Logo left, actions right (Create Lab, Profile dropdown)
  - Mobile: Hamburger menu

### Data Display
- **Review Queue Table**:
  - Zebra striping for rows (alternate bg-secondary)
  - Hover state: bg-tertiary transition
  - Status badges: Rounded-full px-3 py-1 with status colors
  - Action buttons in row: Small ghost buttons with icons

- **Lab Cards** (Author view):
  - White/elevated background with shadow-sm
  - Top: Lab title + status badge
  - Middle: Description preview (line-clamp-2)
  - Bottom: Metadata (author, date) + action buttons
  - Border-l-4 with status color accent

### Forms
- **Lab Creation/Edit Form**:
  - Input fields: bg-secondary, border-borders, rounded-lg, px-4 py-3
  - Focus state: ring-2 ring-primary
  - Labels: text-sm font-medium mb-2
  - Required indicators: text-red asterisk
  - Textarea: min-h-32 for description fields
  - Select dropdowns: Custom styled with chevron icon

### Actions & Feedback
- **Review Modal**:
  - Centered overlay (max-w-2xl)
  - Header: Lab title + close button
  - Body: Lab details + comment textarea
  - Footer: Approve (green) + Reject (red) buttons with loading states

- **Buttons**:
  - Primary: bg-primary text-white px-6 py-3 rounded-lg font-medium
  - Secondary: bg-secondary text-primary border-borders
  - Danger: bg-red text-white
  - Ghost: hover:bg-secondary transition
  - Small variants: px-4 py-2 text-sm

- **Toast Notifications**:
  - Fixed top-right position
  - Success: bg-green text-white
  - Error: bg-red text-white
  - Slide-in animation, auto-dismiss after 4s

### Status Indicators
- **Status Badges**: 
  - Draft: bg-amber/10 text-amber border-amber/20
  - Pending: bg-blue/10 text-blue border-blue/20
  - Approved: bg-green/10 text-green border-green/20
  - Rejected: bg-red/10 text-red border-red/20
  - Consistent: px-3 py-1 rounded-full text-xs font-medium

---

## Specific Page Layouts

### Admin Review Queue
- Top bar: "Pending Labs" heading + filter dropdown (All/Urgent)
- Main area: Table with columns: Title, Author, Submitted Date, Tags, Actions
- Each row: Quick review button opens modal
- Empty state: Centered illustration + "No pending labs" message

### Author Dashboard
- Stats row: Three cards showing Draft (count), Pending (count), Approved (count)
- Below: Tabs for "My Drafts" and "Submitted Labs"
- Lab grid: Masonry-style cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Floating action button: "+ Create Lab" (fixed bottom-right on mobile)

### Lab Detail Pages
- Breadcrumb navigation at top
- Two-column layout: Main content (left 2/3) + Sidebar (right 1/3)
- Main: Title, description, content sections
- Sidebar: Status, author info, timestamps, admin comments (if rejected), action buttons
- Admin view: Additional "Change Status" section in sidebar

---

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: None (instant navigation for productivity)
- Modal entrance: fade-in + scale-95 to scale-100 (150ms)
- Button hovers: bg color transition (150ms)
- Loading states: Subtle spinner or skeleton screens
- Status changes: Brief highlight flash (bg-primary/20) on updated row

---

## Responsive Behavior

- **Desktop (lg+)**: Full sidebar + multi-column layouts
- **Tablet (md)**: Collapsible sidebar, two-column grids
- **Mobile (base)**: 
  - Hamburger menu navigation
  - Single column layouts
  - Bottom sheet modals instead of centered
  - Sticky action buttons at bottom

---

## Accessibility Notes

- All interactive elements: min-h-11 (44px touch target)
- Form inputs: Associated labels with proper for/id attributes
- Status badges: Include aria-label with full status text
- Modal: Focus trap, close on Escape key
- Color contrast: WCAG AA compliance maintained in all themes
- Keyboard navigation: Tab order follows visual hierarchy, Enter activates primary actions