# Customer Portal Design Guidelines

## Design Approach
**Selected Approach:** Modern SaaS Dashboard System (inspired by Linear, Vercel Dashboard, Stripe)
**Justification:** This is a utility-focused, information-dense customer portal requiring clarity, efficiency, and professional polish. The design prioritizes data hierarchy, quick navigation, and form usability over visual flair.

## Typography
**Font Family:** Inter (via Google Fonts CDN)
- Headings: 600 weight
- Body: 400 weight
- Emphasis: 500 weight

**Scale:**
- Page titles: text-2xl (24px)
- Section headers: text-lg (18px)
- Body text: text-sm (14px)
- Captions/labels: text-xs (12px)

## Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12
- Component padding: p-4 or p-6
- Section gaps: gap-6 or gap-8
- Card spacing: space-y-4

**Grid Structure:**
- Sidebar: Fixed 240px width (w-60) on desktop, collapsible to icons on tablet, drawer on mobile
- Main content: max-w-7xl with px-6 py-8 padding
- Dashboard cards: 2-column grid (lg:grid-cols-2) with gap-6
- Data tables: Full-width within container

## Component Library

**Sidebar Navigation:**
- Dark variant with subtle hover states
- Icon + label for each item
- Active state: subtle accent border (left 3px indicator)
- User section at bottom with avatar, name, role
- Collapsible on tablet/mobile

**Page Structure:**
- Sticky breadcrumb navigation at top
- Page header with title + primary action button aligned right
- Content area with consistent vertical spacing

**Cards:**
- Rounded borders (rounded-lg)
- Subtle shadow (shadow-sm)
- White background with border
- Header section with title + optional action
- Body with appropriate padding (p-6)

**Tables:**
- Striped rows for readability
- Sticky headers on scroll
- Row hover state
- Action column (right-aligned) with icon buttons
- Empty states with illustration placeholder + CTA

**Forms:**
- Full-width inputs on mobile, constrained max-w-md on desktop
- Label above input (mb-2)
- Helper text below (text-xs text-muted-foreground)
- Error states with red accent and icon
- Required field indicators (asterisk)
- Submit buttons right-aligned

**Modals/Dialogs:**
- Centered overlay with backdrop blur
- Max width 500px for forms
- Header with title + close icon
- Footer with Cancel (secondary) + Confirm (primary) buttons right-aligned

**States:**
- Loading: Skeleton loaders matching content structure
- Empty: Centered icon + heading + description + CTA button
- Error: Alert component with icon, message, and retry button
- Success: Toast notifications (top-right)

**Data Display:**
- Status badges: pill shape (rounded-full) with dot indicator + text
- Metrics cards: Large number (text-3xl font-semibold) with label below and trend indicator
- JSON viewer: Monospace font, collapsible tree structure with syntax highlighting

**Navigation Tabs:**
- Underline style for sub-navigation (borderBottom on active)
- Equal width or auto-width based on content
- Smooth transition on active state change

## Key Design Principles
1. **Information Hierarchy:** Use size, weight, and spacing to guide the eye through dense data
2. **Consistent Spacing:** Maintain rhythm with the 2-4-6-8-12 spacing system
3. **Functional Aesthetics:** Every element serves a purpose; beauty through clarity
4. **Mobile Responsiveness:** Stack columns, collapse sidebar, enlarge touch targets
5. **Feedback & Validation:** Immediate visual feedback for all user actions (loading, success, error)

## Dashboard Specifics
- 4-card overview grid (2x2): User info, Wallet balance, Recent tickets count, Service center status
- Each card: Icon top-left, primary metric large and centered, secondary info below
- Quick actions section below cards with prominent CTAs (Create Ticket, View Vehicles, etc.)

## Animations
**Minimal and purposeful only:**
- Sidebar expand/collapse: 200ms ease
- Modal enter/exit: fade + scale (150ms)
- Toast notifications: slide-in from top-right
- No scroll animations or unnecessary motion