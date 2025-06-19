# How the client is structured

client/
├── public/
│   └── (static assets like index.html, favicons, etc. - usually not directly manipulated)
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/
│   │   └── (other static media like videos, PDFs)
│   │
│   ├── api/
│   │   ├── auth.ts              // API calls related to authentication
│   │   ├── studyPlans.ts        // API calls related to study plans
│   │   └── index.ts             // Centralized API client instance/configuration
│   │
│   ├── components/              // Reusable UI components (pure, presentational)
│   │   ├── common/              // Very generic, app-agnostic components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.module.css (or .styles.ts if using CSS-in-JS)
│   │   │   ├── Card/
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Card.module.css
│   │   │   └── Modal/
│   │   │       ├── Modal.tsx
│   │   │       └── Modal.module.css
│   │   │
│   │   ├── layout/              // Layout-specific components (e.g., Navbar, Sidebar, Footer)
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Navbar.module.css
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Sidebar.module.css
│   │   │   └── PageLayout.tsx   // Generic layout wrapper
│   │   │
│   │   └── (other shared UI components specific to your app but not tied to a page)
│   │       ├── CourseItem/
│   │       │   ├── CourseItem.tsx
│   │       │   └── CourseItem.module.css
│   │       ├── ProgressBar/
│   │       │   ├── ProgressBar.tsx
│   │       │   └── ProgressBar.module.css
│   │       └── CreditDoughnutChart/
│   │           ├── CreditDoughnutChart.tsx
│   │           └── CreditDoughnutChart.module.css
│   │
│   ├── contexts/                // React Context APIs for global state
│   │   ├── AuthContext.tsx      // Your authentication context
│   │   ├── StudyPlanContext.tsx // Context for study plan data
│   │   └── ThemeContext.tsx     // Example: Theme management
│   │
│   ├── hooks/                   // Custom React Hooks
│   │   ├── useAuth.ts           // Hook to access auth context or perform auth actions
│   │   ├── useStudyPlan.ts      // Hook to interact with study plan data
│   │   ├── useDebounce.ts       // Generic utility hook
│   │   └── (other reusable logic encapsulated in hooks)
│   │
│   ├── pages/                   // Top-level views/routes of your application
│   │   ├── Auth/                // Grouping authentication-related pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   │
│   │   ├── Dashboard/           // Example: A main dashboard page
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── StudyPlans/          // Your study plans section (as shown in screenshots)
│   │   │   ├── StudyPlansPage.tsx  // The main page displaying study plans
│   │   │   ├── components/         // Components specific ONLY to the StudyPlansPage
│   │   │   │   ├── SemesterSection.tsx
│   │   │   │   └── OverallProgress.tsx
│   │   │   └── hooks/              // Hooks specific ONLY to the StudyPlansPage
│   │   │       └── useStudyPlanData.ts
│   │   │
│   │   ├── Profile/
│   │   │   └── UserProfilePage.tsx
│   │   │
│   │   ├── ProtectedRoute.tsx   // Component for route protection
│   │   └── NotFoundPage.tsx     // 404 page
│   │
│   ├── services/                // Business logic not directly tied to React components
│   │   ├── authService.ts       // Functions for login, logout, token management
│   │   ├── userService.ts       // Functions for user profile management
│   │   └── (other services like analytics, utility functions)
│   │
│   ├── styles/                  // Global styles and themes
│   │   ├── global.css           // CSS reset, base typography, variables
│   │   ├── variables.css        // CSS variables for colors, spacing, etc.
│   │   └── theme.ts             // If using CSS-in-JS for theme objects
│   │
│   ├── types/                   // TypeScript type definitions
│   │   ├── auth.d.ts
│   │   ├── studyPlan.d.ts
│   │   ├── common.d.ts
│   │   └── index.d.ts           // Re-export all types from here
│   │
│   ├── utils/                   // Small, pure utility functions
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── helpers.ts
│   │
│   ├── App.tsx                  // Main application component, usually handles routing
│   ├── main.tsx                 // Entry point (ReactDOM.render)
│   └── vite-env.d.ts            // Vite specific type definitions
│
├── .gitignore
├── Dockerfile
├── eslintrc.cjs
├── index.html
├── nginx-conf
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts




# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
