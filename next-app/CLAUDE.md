# Modern Web App - Claude Context

## 🚀 Tech Stack (DO NOT CHANGE)

### Core Framework
- **Next.js 15.4.5** - Latest version with Turbopack support
- **React 19.1.0** - Latest React version
- **TypeScript 5.x** - Full type safety

### UI Framework
- **Tailwind CSS 4.x** - Utility-first CSS framework (pure Tailwind, no component library)
- **Custom SVG Icons** - Inline SVG icons for performance

### Backend & Database
- **Supabase** - Full-stack backend solution
- **@supabase/ssr** - Server-side rendering support
- **@supabase/supabase-js** - Client library

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage with pure Tailwind CSS
│   └── globals.css         # Global styles (only Tailwind import)
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── middleware.ts   # Auth middleware
└── middleware.ts           # Next.js middleware
```

## 🔧 Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS config
- `next.config.ts` - Next.js configuration
- `.env.local` - Environment variables (Supabase keys)

## 🎯 Key Features Implemented

1. **Modern Next.js Setup**
   - App Router architecture
   - Turbopack for fast development
   - Server Components ready

2. **Pure Tailwind CSS Design**
   - No component library dependencies
   - Custom-built UI components
   - Inline SVG icons for performance
   - Beautiful responsive design

3. **Supabase SSR Ready**
   - Client and server configurations
   - Middleware for auth handling
   - Environment variables setup

4. **Development Ready**
   - TypeScript strict mode
   - ESLint configuration
   - Hot reloading with Turbopack

## 🚦 Development Commands

```bash
npm run dev          # Start development server (with Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📝 Important Notes

- **NEVER** change the core tech stack (Next.js 15.4, Supabase SSR, Tailwind CSS)
- Always use the latest versions when adding new packages
- Keep Tailwind CSS as the only UI framework (no component libraries)
- Supabase is configured for SSR - use appropriate client/server imports
- Environment variables are in `.env.local` - update with real Supabase credentials
- Build custom components with pure Tailwind CSS classes

## 🔄 Next Steps

1. Complete Supabase project setup (see `supabase-setup.md`)
2. Add authentication pages
3. Create database tables
4. Implement user management
5. Add real-time features

## 🎨 UI Philosophy

- Use pure Tailwind CSS classes for all styling
- Build custom components without external dependencies
- Inline SVG icons for better performance and control
- Mobile-first responsive design approach
- Semantic HTML with Tailwind styling
- Focus on simplicity and maintainability

## 🎯 Tailwind-Only Approach Benefits

- **Zero Dependencies:** No component library bloat
- **Full Control:** Complete customization freedom
- **Better Performance:** No extra JavaScript bundles
- **Easier Maintenance:** Pure CSS with utility classes
- **Smaller Bundle:** Only includes used Tailwind classes

This context ensures continuity and prevents accidental changes to the core technology stack.