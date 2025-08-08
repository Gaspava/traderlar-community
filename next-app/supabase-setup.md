# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in or create an account
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - Name: "modern-web-app" (or your preferred name)
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
7. Click "Create new project"

## 2. Get Project Credentials

Once your project is created:

1. Go to Project Settings → API
2. Copy the following values:
   - Project URL
   - Anon/Public key

## 3. Update Environment Variables

Replace the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Install Supabase CLI (Optional)

For local development and migrations:

```bash
npm install -g supabase
```

## 5. Initialize Supabase (If using CLI)

```bash
supabase login
supabase init
supabase link --project-ref your-project-ref
```

## Next Steps

After completing the Supabase setup:
1. Configure authentication
2. Set up database tables
3. Implement user management
4. Add real-time features