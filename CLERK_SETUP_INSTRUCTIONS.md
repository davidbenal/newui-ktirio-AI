# 🔐 Clerk Setup Instructions

## Step 1: Create Clerk Account

1. Go to: https://dashboard.clerk.com/sign-up
2. Sign up with email or GitHub
3. Verify your email

## Step 2: Create Application

1. Click **"Create application"**
2. Application name: **Ktirio AI**
3. Enable sign-in methods:
   - ✅ **Email** (Email address + Password)
   - ✅ **Google** (OAuth)
4. Click **"Create application"**

## Step 3: Get API Keys

After creating the application, you'll see the API keys:

### Publishable Key (starts with `pk_test_`)
```
Example: pk_test_YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkw
```

### Secret Key (starts with `sk_test_`)
```
Example: sk_test_YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkw
```

## Step 4: Configure Redirect URLs

In the Clerk Dashboard, go to **Paths** section and configure:

### Development URLs:
- **Sign-in URL**: `http://localhost:5173/sign-in`
- **Sign-up URL**: `http://localhost:5173/sign-up`
- **After sign-in URL**: `http://localhost:5173/`
- **After sign-up URL**: `http://localhost:5173/welcome`

## Step 5: Copy Your Keys

Once you have both keys:

1. **Publishable Key** (starts with `pk_test_`)
2. **Secret Key** (starts with `sk_test_`)

**Please provide these keys so I can update .env.local**

---

## What I'll Do Next

Once you provide the keys, I'll:
1. ✅ Update `.env.local` with your Clerk keys
2. ✅ Add `ClerkProvider` to [src/main.tsx](src/main.tsx)
3. ✅ Create sign-in and sign-up pages
4. ✅ Update [src/hooks/useFirebaseUser.ts](src/hooks/useFirebaseUser.ts) to work with Clerk
5. ✅ Test authentication flow

---

## 📌 Quick Reference

**Dashboard:** https://dashboard.clerk.com/

**Documentation:** https://clerk.com/docs/quickstarts/react

**Need Help?**
- Check that you enabled both Email and Google sign-in methods
- Make sure you're in "Test mode" (development)
- Keep both keys secure (don't commit to GitHub)
