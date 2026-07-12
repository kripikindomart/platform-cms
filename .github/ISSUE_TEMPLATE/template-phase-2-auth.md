---
name: Template System - Phase 2 (Authentication)
about: Build 8 premium authentication page templates
title: '[TEMPLATE] Phase 2: Authentication Templates'
labels: enhancement, templates, phase-2
assignees: ''
---

## 📋 Phase 2: Authentication Templates

Build 8 production-ready authentication pages with premium design quality (Linear/Stripe/Vercel standard).

### 🎯 Goal
Create complete authentication flow templates that can be used by the generator.

### 📦 Deliverables

#### 1. Login Page
- [ ] Split-screen layout with gradient hero
- [ ] Email + Password fields with validation
- [ ] Remember me checkbox
- [ ] Password visibility toggle
- [ ] Forgot password link
- [ ] Social login buttons (Google, Microsoft, GitHub)
- [ ] Loading states
- [ ] Error states
- [ ] Link to register page
- [ ] Framer Motion animations

**File**: `components/templates/auth/login.tsx`  
**Route**: `app/(templates)/dashboard/auth/login/page.tsx`

#### 2. Register Page
- [ ] Split-screen layout with different gradient
- [ ] Name, Email, Password, Confirm Password
- [ ] Password strength indicator (visual bar)
- [ ] Password requirements checklist (✓/✗ icons)
- [ ] Terms & conditions checkbox
- [ ] Social registration buttons
- [ ] Loading states
- [ ] Validation errors
- [ ] Link to login page
- [ ] Success redirect

**File**: `components/templates/auth/register.tsx`  
**Route**: `app/(templates)/dashboard/auth/register/page.tsx`

#### 3. Forgot Password Page
- [ ] Centered card layout
- [ ] Email input field
- [ ] Submit button with loading state
- [ ] Success state message
- [ ] Error handling
- [ ] Back to login link
- [ ] Email sent confirmation
- [ ] Resend email option

**File**: `components/templates/auth/forgot-password.tsx`  
**Route**: `app/(templates)/dashboard/auth/forgot-password/page.tsx`

#### 4. Reset Password Page
- [ ] Centered card layout
- [ ] New password field
- [ ] Confirm password field
- [ ] Password strength indicator
- [ ] Password match validation
- [ ] Submit button
- [ ] Success state with auto-redirect
- [ ] Token validation
- [ ] Expired token handling

**File**: `components/templates/auth/reset-password.tsx`  
**Route**: `app/(templates)/dashboard/auth/reset-password/page.tsx`

#### 5. Verify Email Page
- [ ] Centered card layout
- [ ] Email verification status
- [ ] Success icon animation
- [ ] Error icon animation
- [ ] Resend verification link
- [ ] Timer countdown (60s)
- [ ] Auto-redirect on success
- [ ] Expired link handling

**File**: `components/templates/auth/verify-email.tsx`  
**Route**: `app/(templates)/dashboard/auth/verify-email/page.tsx`

#### 6. OTP Verification Page
- [ ] Centered card layout
- [ ] 6-digit OTP input fields
- [ ] Auto-focus navigation between fields
- [ ] Auto-submit on completion
- [ ] Resend code button
- [ ] Timer countdown display
- [ ] Loading state
- [ ] Error state
- [ ] Success animation

**File**: `components/templates/auth/otp-verification.tsx`  
**Route**: `app/(templates)/dashboard/auth/otp/page.tsx`

#### 7. Lock Screen Page
- [ ] Full-screen layout
- [ ] User avatar (large)
- [ ] User name display
- [ ] Password input field
- [ ] Unlock button
- [ ] Switch user link
- [ ] Time display
- [ ] Gradient background
- [ ] Smooth animations

**File**: `components/templates/auth/lock-screen.tsx`  
**Route**: `app/(templates)/dashboard/auth/lock-screen/page.tsx`

#### 8. Session Expired Page
- [ ] Centered card layout
- [ ] Session expired icon
- [ ] Clear message
- [ ] Session duration info
- [ ] Re-login button
- [ ] Auto-redirect timer
- [ ] Gradient background
- [ ] Professional design

**File**: `components/templates/auth/session-expired.tsx`  
**Route**: `app/(templates)/dashboard/auth/session-expired/page.tsx`

---

### 🎨 Design Requirements

**Quality Standard**: Linear, Stripe, Vercel, Notion  
**Must Have**:
- ✅ Split-screen layouts for login/register
- ✅ Gradient backgrounds (animated)
- ✅ Glassmorphism effects
- ✅ Framer Motion animations
- ✅ Soft shadows with color tints
- ✅ 20-24px rounded corners
- ✅ Premium typography (Inter)
- ✅ Micro-interactions
- ✅ Loading states
- ✅ Error states
- ✅ Success states
- ✅ Form validation
- ✅ Responsive design
- ✅ WCAG AA accessibility

**Avoid**:
- ❌ Generic Bootstrap styles
- ❌ AdminLTE templates
- ❌ Harsh borders
- ❌ Cheap appearance

---

### 📁 File Structure

```
components/templates/auth/
├── login.tsx
├── register.tsx
├── forgot-password.tsx
├── reset-password.tsx
├── verify-email.tsx
├── otp-verification.tsx
├── lock-screen.tsx
└── session-expired.tsx

app/(templates)/dashboard/auth/
├── login/page.tsx
├── register/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
├── verify-email/page.tsx
├── otp/page.tsx
├── lock-screen/page.tsx
└── session-expired/page.tsx
```

---

### ✅ Acceptance Criteria

- [ ] All 8 pages implemented
- [ ] Premium design quality (Linear/Stripe standard)
- [ ] Framer Motion animations
- [ ] Form validation working
- [ ] Loading states functional
- [ ] Error handling proper
- [ ] Responsive on all devices
- [ ] Accessible (WCAG AA)
- [ ] No TypeScript errors
- [ ] Build successful
- [ ] Documentation updated
- [ ] Examples added to gallery

---

### 📚 References

- Design System Tokens: `components/templates/design-system/tokens.ts`
- Existing Auth Pages: `app/(auth)/login/page.tsx` (for reference only)
- UI Components: `components/ui/`

---

### 🔗 Related

- Docs: [TEMPLATE-SYSTEM-PLAN.md](../../docs/TEMPLATE-SYSTEM-PLAN.md)
- Previous: Phase 1 (Foundation) ✅
- Next: Phase 3 (Layout Templates)

---

**Priority**: High  
**Estimated Effort**: 2-3 hours  
**Quality Bar**: Production-ready, billion-dollar SaaS standard
