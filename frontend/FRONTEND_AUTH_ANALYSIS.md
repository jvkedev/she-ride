# SheRide Frontend - Authentication System Analysis

## Project Overview

**Framework**: Next.js 14+ with TypeScript  
**State Management**: localStorage (client-side)  
**Form Handling**: React Hook Form with Zod validation  
**HTTP Client**: Fetch API (custom wrapper)  
**UI Framework**: Tailwind CSS + Custom components  
**Routing**: Next.js App Router with route guards

---

## Authentication Architecture

```
┌──────────────────────────────────────────────────┐
│            Next.js Frontend                      │
├──────────────────────────────────────────────────┤
│  Authentication Pages (Route Group: (auth))      │
│  ├─ /login          → LoginForm (phone input)
│  ├─ /signup         → RegisterForm (full form)
│  ├─ /verify-otp     → VerifyOtpForm (OTP entry)
│  └─ /select-role    → SelectRoleForm (guarded)
│                                    ▲
│                                    │ RoleSelectionGuard
│                                    │ (Frontend protection)
└────────┬─────────────────────────────────────────┘
         │
         ├─► Session Management (localStorage)
         │   ├─ accessToken (JWT)
         │   ├─ user (User object)
         │   ├─ authFlow (temporary)
         │   ├─ authPhoneNumber (temporary)
         │   └─ roleSelectionGranted (temporary)
         │
         ├─► API Client (lib/api.ts)
         │   ├─ GET requests
         │   ├─ POST requests
         │   ├─ Token injection (Bearer)
         │   └─ Error handling
         │
         └─► Backend API
             └─ http://localhost:4000/api
```

---

## File Structure

```
frontend/src/
├── app/
│   └── (auth)/                              # Route group
│       ├── login/
│       │   └── page.tsx                    # Login page (simple wrapper)
│       ├── signup/
│       │   └── page.tsx                    # Signup page (simple wrapper)
│       ├── verify-otp/
│       │   └── page.tsx                    # OTP verification page
│       └── select-role/
│           └── page.tsx                    # Role selection (with guard)
│
├── components/auth/
│   ├── login-form.tsx                     # Login logic & UI
│   ├── signup-form.tsx                    # Registration logic & UI
│   ├── verify-otp-form.tsx                # OTP verification logic & UI
│   ├── select-role-form.tsx               # Role selection logic & UI
│   └── role-selection-guard.tsx           # Client-side route protection
│
├── lib/
│   ├── api.ts                             # HTTP client wrapper
│   ├── utils.ts                           # Utility functions
│   └── auth/
│       ├── session.ts                     # Token & user storage
│       └── logout.ts                      # Cleanup function
│
├── schemas/
│   └── auth.schema.ts                     # Zod validation schemas
│
└── types/
    └── auth.ts                            # TypeScript types
```

---

## Authentication Pages

### /login - Login Page

```typescript
// frontend/src/app/(auth)/login/page.tsx

import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return <LoginForm />;
}

// Simple wrapper that renders LoginForm component
// Accessible without authentication
```

### /signup - Registration Page

```typescript
// frontend/src/app/(auth)/signup/page.tsx

import RegisterForm from "@/components/auth/signup-form";

export default function SignupPage() {
  return <RegisterForm />;
}

// Simple wrapper that renders RegisterForm component
// Accessible without authentication
```

### /verify-otp - OTP Verification Page

```typescript
// frontend/src/app/(auth)/verify-otp/page.tsx

import VerifyOtpForm from "@/components/auth/verify-otp-form";

export default function VerifyOtpPage() {
  return <VerifyOtpForm />;
}

// Renders OTP verification form
// Accessible only if authPhoneNumber is in localStorage
```

### /select-role - Role Selection Page

```typescript
// frontend/src/app/(auth)/select-role/page.tsx

import RoleSelectionGuard from "@/components/auth/role-selection-guard";
import SelectRoleForm from "@/components/auth/select-role-form";

export default function SelectRolePage() {
  return (
    <RoleSelectionGuard>
      <SelectRoleForm />
    </RoleSelectionGuard>
  );
}

// Protected by RoleSelectionGuard
// Checks access token + backend verification
// Redirects if invalid access
```

---

## Core Components

### LoginForm Component

**Location**: `src/components/auth/login-form.tsx`

**Features**:

- Input: Phone number only
- Validation: Zod schema
- Error handling: Field-level validation
- Submission: POST /auth/login/send-otp

**Flow**:

```typescript
1. User enters phone number
2. Form validation (Zod schema)
3. Submit button enabled if valid
4. POST to /auth/login/send-otp
5. Backend sends OTP via SMS
6. Store in localStorage:
   - authFlow = "login"
   - authPhoneNumber = "{phoneNumber}"
7. Router.push("/verify-otp")
```

**States**:

```typescript
- isSubmitting: boolean        // Shows loading state
- errors: validation errors    // Field-level error messages
```

---

### SignupForm Component

**Location**: `src/components/auth/signup-form.tsx`

**Features**:

- Inputs: fullName, email, phoneNumber, password, gender (optional)
- Validation: Zod schema
- Error handling: Field-level validation
- Submission: POST /auth/register/send-otp

**Flow**:

```typescript
1. User fills registration form
2. Form validation (Zod schema)
3. POST to /auth/register/send-otp
4. Backend validates and sends OTP
5. Store in localStorage:
   - authFlow = "register"
   - authPhoneNumber = "{phoneNumber}"
6. Router.push("/verify-otp")
```

**Form Fields**:

```typescript
fullName: string              // Full name 2-100 chars
email: string                 // Valid email format
phoneNumber: string           // Valid phone number
password: string              // 8+ characters
gender?: 'MALE' | 'FEMALE' | 'OTHER'
```

---

### VerifyOtpForm Component

**Location**: `src/components/auth/verify-otp-form.tsx`

**Features**:

- Auto-populate: Phone number from localStorage
- Input: OTP (6-digit)
- Validation: Zod schema
- Error handling: Comprehensive
- Submission: Routes based on flow

**Flow**:

```typescript
1. useEffect: Retrieve authPhoneNumber from localStorage
   - If not found: Router.push("/login")
   - If found: Populate phone number field
2. User enters OTP
3. Submit: Determine endpoint based on authFlow
   - authFlow === "register" → /auth/register/verify-otp
   - authFlow === "login" → /auth/login/verify-otp
4. Backend response: { accessToken, user, requiresRoleSelection? }
5. Clear temporary localStorage keys
6. If requiresRoleSelection or user.role === "PENDING":
   - setAuthSession(token, user, { grantRoleSelection: true })
   - Router.push("/select-role")
7. Else:
   - setAuthSession(token, user)
   - Router.push(getDashboardPathForRole(user.role))
```

**Key Variables**:

```typescript
const flow = localStorage.getItem("authFlow"); // "register" | "login"
const phoneNumber = localStorage.getItem("authPhoneNumber");
```

---

### SelectRoleForm Component

**Location**: `src/components/auth/select-role-form.tsx`

**Features**:

- Visual role selection (cards with icons)
- Roles: RIDER or CAPTAIN
- Protected: Rendered inside RoleSelectionGuard
- Error handling: User feedback
- Submission: POST /auth/select-role (with JWT)

**Role Options**:

```typescript
[
  {
    role: "RIDER",
    title: "Continue as Rider",
    description: "Book safe rides, track trips, and manage payments.",
    icon: UserRound,
  },
  {
    role: "CAPTAIN",
    title: "Continue as Captain",
    description: "Accept ride requests, earn, and manage your vehicle.",
    icon: Car,
  },
];
```

**Flow**:

```typescript
1. User selects RIDER or CAPTAIN
2. handleContinue() called on button click:
   - If no selection: Show error message
   - If no token: Router.replace("/login")
   - setIsSubmitting(true)
3. POST /auth/select-role
   - Headers: Authorization: Bearer {token}
   - Body: { role: selected }
4. Backend response: { accessToken, user, redirectTo }
5. Update localStorage:
   - setAuthSession(accessToken, user)
   - clearRoleSelectionGrant()
6. Router.replace(redirectTo)
```

**State Variables**:

```typescript
selected: AppRole | null; // RIDER or CAPTAIN
isSubmitting: boolean; // Loading state
error: string | null; // Error message
```

---

### RoleSelectionGuard Component

**Location**: `src/components/auth/role-selection-guard.tsx`

**Purpose**: Protect /select-role page from unauthorized access

**Features**:

- Client-side route protection
- Backend verification
- Automatic redirection
- Cleanup on unmount

**Flow**:

```typescript
1. Component mounts
2. Retrieve accessToken from localStorage
3. If no token: Router.replace("/login")
4. If token exists:
   - Call apiGet("/auth/me", token)
   - Backend validates JWT
   - Backend returns: { user, requiresRoleSelection, canAccessRoleSelection }
5. Backend verification:
   - If requiresRoleSelection === false:
     * User already selected role
     * Redirect to dashboard
   - If canAccessRoleSelection === false && no roleSelectionGranted:
     * Grant expired or invalid access
     * Redirect to /login
6. If all checks pass: setAllowed(true) → Render children
7. On unmount: cancelled = true (cleanup async race condition)
```

**Return/Redirect Logic**:

```typescript
// Backend check returns user info
// Case 1: Role already selected
if (!status.requiresRoleSelection) {
  // user.role !== PENDING
  // Redirect to dashboard: /rider or /captain
  router.replace(getDashboardPathForRole(user?.role));
}

// Case 2: No access to role selection
if (!status.canAccessRoleSelection && !hasRoleSelectionGrant()) {
  // Grant expired (24 hours) or not set
  // Redirect to login
  router.replace("/login");
}

// Case 3: All checks pass
setAllowed(true); // Render SelectRoleForm
```

---

## Session Management

### session.ts Functions

**Location**: `src/lib/auth/session.ts`

#### getAccessToken()

```typescript
getAccessToken(): string | null

// Returns stored JWT access token from localStorage
// Returns null if not in browser or token not found
// Used: JWT injection in API calls
```

#### getStoredUser()

```typescript
getStoredUser(): AuthUser | null

// Returns parsed user object from localStorage
// Parses JSON safely
// Returns null if not found or invalid JSON
// Type: AuthUser = { id, fullName, email, phoneNumber, role, accountStatus?, isPhoneVerified?, onboardingStatus? }
```

#### setAuthSession()

```typescript
setAuthSession(
  accessToken: string,
  user: AuthUser,
  options?: { grantRoleSelection?: boolean }
): void

// Stores both token and user in localStorage
// If grantRoleSelection: Sets roleSelectionGranted = "1"
// Called after: register, login, role selection
```

#### clearAuthSession()

```typescript
clearAuthSession(): void

// Clears ALL auth-related localStorage keys:
// - accessToken
// - user
// - authFlow
// - authPhoneNumber
// - roleSelectionGranted
// Called on: Logout
```

#### clearRoleSelectionGrant()

```typescript
clearRoleSelectionGrant(): void

// Removes only roleSelectionGranted key
// Called after: Role selection completed
```

#### hasRoleSelectionGrant()

```typescript
hasRoleSelectionGrant(): boolean

// Returns true if roleSelectionGranted === "1"
// Returns false in non-browser environment
// Used in: RoleSelectionGuard as fallback check
```

#### isRolePending()

```typescript
isRolePending(user: AuthUser | null): boolean

// Returns true if user?.role === "PENDING"
// Utility function for checking role
```

#### getDashboardPathForRole()

```typescript
getDashboardPathForRole(role: AuthUser["role"]): string

// Maps role to dashboard route:
// "RIDER" → "/rider"
// "CAPTAIN" → "/captain"
// "ADMIN" → "/admin"
// "SECURITY" → "/security"
// default → "/login"

// Used: Route after login/role selection
```

---

### logout.ts Functions

**Location**: `src/lib/auth/logout.ts`

#### clearAuthSession()

```typescript
export function clearAuthSession(): void {
  // Clears all auth localStorage keys
  // Called on logout action
}

// localStorage keys cleared:
// - accessToken
// - user
// - authFlow
// - authPhoneNumber
// - roleSelectionGranted
```

---

## API Client

### api.ts

**Location**: `src/lib/api.ts`

#### apiRequest()

```typescript
apiRequest(path: string, body?: unknown, token?: string | null)

// POST request with automatic token injection
// Returns: JSON response
// Throws: Error with formatted message

Flow:
1. Set headers: Content-Type: application/json
2. If token: Add Authorization: Bearer {token}
3. Fetch POST to API_URL + path
4. Parse JSON response
5. If !ok: Format error and throw
6. Return JSON data

Error Formatting:
- Handles nested error structures
- Extracts field-level validation errors
- Returns user-friendly error messages
```

**Usage**:

```typescript
// Without token (public endpoints)
await apiRequest("/auth/register/send-otp", { fullName, email, ... })

// With token (protected endpoints)
await apiRequest("/auth/select-role", { role: "RIDER" }, token)
```

#### apiGet()

```typescript
apiGet(path: string, token?: string | null)

// GET request with automatic token injection
// Returns: JSON response
// Throws: Error with formatted message

Flow:
1. Set headers (empty by default)
2. If token: Add Authorization: Bearer {token}
3. Fetch GET with cache: "no-store"
4. Parse JSON response
5. If !ok: Format error and throw
6. Return JSON data

Note: Sets cache: "no-store" to prevent caching
```

**Usage**:

```typescript
// Get current user (protected endpoint)
const me = await apiGet("/auth/me", token);
```

#### formatApiError()

```typescript
formatApiError(data: any): string

// Formats backend error responses
// Handles multiple error structures:
// - data.message (string | array | object)
// - data.errors (object with arrays)
// Returns: User-friendly error message string

Examples:
- "Email already exists"
- "Phone number required, Email invalid"
- "Validation failed: Invalid email format"
```

---

## Validation Schemas

### auth.schema.ts

**Location**: `src/schemas/auth.schema.ts`

#### registerSchema

```typescript
{
  fullName: string      // 1-100 chars
  email: string         // valid email
  phoneNumber: string   // valid phone format
  password: string      // 8+ chars
  gender?: enum         // MALE | FEMALE | OTHER
}
```

#### sendLoginOtpSchema

```typescript
{
  phoneNumber: string; // valid phone format
}
```

#### verifyRegisterOtpSchema / verifyLoginOtpSchema

```typescript
{
  phoneNumber: string;
  otp: string; // 6-digit number
}
```

#### selectRoleSchema

```typescript
{
  role: enum            // RIDER | CAPTAIN
}
```

**All schemas use Zod for runtime validation**

---

## Type Definitions

### auth.ts

**Location**: `src/types/auth.ts`

#### AuthUser

```typescript
type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "PENDING" | "RIDER" | "CAPTAIN" | "ADMIN" | "SECURITY";
  accountStatus?: string;
  isPhoneVerified?: boolean;
  onboardingStatus?: string;
};
```

Used in: Session storage, component props, guards

---

## LocalStorage Structure

```javascript
// After successful registration/login
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "role": "PENDING",
    "accountStatus": "ACTIVE",
    "isPhoneVerified": true,
    "onboardingStatus": "PENDING"
  },

  // If requires role selection
  "roleSelectionGranted": "1",

  // Temporary during auth flow
  "authFlow": "register",
  "authPhoneNumber": "+919876543210"
}
```

---

## Error Handling

### Form-Level Validation

```typescript
// React Hook Form + Zod
const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});

// Display validation errors
{errors.email?.message && (
  <p className="text-sm text-red-500">{errors.email.message}</p>
)}
```

### API Error Handling

```typescript
try {
  const res = await apiRequest(endpoint, data);
  // Success handling
} catch (error) {
  // error is formatted error message string
  alert(error instanceof Error ? error.message : "Operation failed");
}
```

### Common Errors

```
- "Email or phone number already exists"
- "User not found"
- "Invalid OTP"
- "Account is blocked"
- "Role has already been selected"
- "Request failed" (generic fallback)
```

---

## User Flow Sequences

### Complete Registration Flow

```
1. User visits /signup
2. Fills: fullName, email, phone, password, gender
3. Submits → POST /auth/register/send-otp
4. Backend: Validates, hashes password, stores in Redis
5. Backend: Queues SMS with OTP
6. Frontend: Stores authFlow="register", authPhoneNumber
7. Frontend: Routes to /verify-otp
8. User enters OTP
9. Submits → POST /auth/register/verify-otp
10. Backend: Verifies OTP, creates User (role=PENDING)
11. Backend: Issues tokens
12. Frontend: Stores accessToken, user, roleSelectionGranted="1"
13. Frontend: Routes to /select-role
14. Guard: Verifies access with GET /auth/me
15. User selects RIDER or CAPTAIN
16. Submits → POST /auth/select-role (with JWT)
17. Backend: Updates role, creates Rider/Captain
18. Backend: Issues new tokens
19. Frontend: Updates user object (new role)
20. Frontend: Routes to /rider or /captain
```

### Complete Login Flow

```
1. User visits /login
2. Enters phone number
3. Submits → POST /auth/login/send-otp
4. Backend: Finds user, sends OTP via SMS
5. Frontend: Stores authFlow="login", authPhoneNumber
6. Frontend: Routes to /verify-otp
7. User enters OTP
8. Submits → POST /auth/login/verify-otp
9. Backend: Verifies OTP, generates tokens
10. Backend: If role=PENDING, sets requiresRoleSelection=true
11. Frontend: Stores accessToken, user
12. If requiresRoleSelection:
    - Stores roleSelectionGranted="1"
    - Routes to /select-role (repeats steps 14-20 from signup)
13. Else:
    - Routes to /rider or /captain dashboard
```

---

## localStorage Keys Reference

| Key                  | Type   | Set When                | Cleared When         | Purpose            |
| -------------------- | ------ | ----------------------- | -------------------- | ------------------ |
| accessToken          | string | Login/Register          | Logout               | JWT token          |
| user                 | JSON   | Login/Register          | Logout               | User object        |
| authFlow             | string | Starting register/login | After verify-otp     | Track auth flow    |
| authPhoneNumber      | string | Starting register/login | After verify-otp     | Temp phone storage |
| roleSelectionGranted | string | After register/login    | After role selection | Grant access flag  |

---

## Performance Considerations

### Token Storage

- **Pros**: Simple, no backend session needed
- **Cons**: Vulnerable to XSS attacks
- **Mitigation**: Never store sensitive data, use httpOnly cookies for refresh token

### SPA Navigation

- **Fast**: No page reloads, client-side routing
- **Guard Check**: RoleSelectionGuard calls API on every mount (check optimization)

### API Calls

- **GET /auth/me**: Called on /select-role mount (could be optimized)
- **Cache Strategy**: cache: "no-store" prevents caching but ensures fresh data

---

## Security Best Practices

1. **Never log tokens**: Avoid console.log(token) in production
2. **Use HTTPS only**: Tokens transmitted over encrypted connections
3. **Set token expiry**: 15-minute access token prevents long-term compromise
4. **SameSite cookies**: If using cookies instead of localStorage
5. **CSRF protection**: Include CSRF token in requests
6. **XSS prevention**: Sanitize any user input displayed
7. **Content-Type headers**: Always set "application/json"
8. **Error messages**: Don't expose internal API details to users

---

## Common Issues & Solutions

### Issue: User stuck at /verify-otp

**Cause**: authPhoneNumber not in localStorage
**Solution**: Clear localStorage, start over

### Issue: "Role selection is not available" error

**Cause**: roleSelectionGranted grant expired (24h limit)
**Solution**: User must logout and login again

### Issue: Token not sent in API request

**Cause**: Token not retrieved from localStorage or not passed to apiRequest()
**Solution**: Verify getAccessToken() works, ensure token parameter passed

### Issue: RoleSelectionGuard redirects to /login

**Cause**: Backend verification failed (expired token or user not PENDING)
**Solution**: Clear auth session, re-authenticate

---

## Future Improvements

1. **Automatic token refresh** before expiry
2. **Persistent session** using httpOnly refresh cookies
3. **Biometric authentication** support
4. **Remember me** checkbox for longer sessions
5. **Email verification** option
6. **Multi-device logout** support
7. **Session invalidation** on password change
8. **Rate limiting UI** for OTP requests
9. **Deep linking** from email/SMS after registration
10. **Progressive Web App** offline support
