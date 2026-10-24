---
name: react-native-pro
description: Expert guidance, architecture patterns, performance optimization, and best practices for building cross-platform mobile apps with React Native (Expo and Bare CLI), TypeScript, and native bridges.
---

# React Native Expert Skill

## Goal

To guide the AI agent in writing performant, scalable, type-safe, and production-ready React Native applications adhering to modern ecosystem standards (React Native 0.74+, Expo SDK 51+, Reanimated 3, Zustand/TanStack Query, and StyleSheet/Tailwind via NativeWind).

---

## Instructions & Best Practices

### 1. Architecture & Project Structure

- **Directory Layout:** Enforce a feature-based or clean architecture layout:
  ```text
  src/
  ├── api/          # Network layer (TanStack Query hooks, Axios/Fetch config)
  ├── components/   # Reusable UI primitives (Buttons, Inputs, Cards)
  ├── hooks/        # Global custom hooks
  ├── navigation/   # React Navigation configuration
  ├── screens/[pageName] # Specific screens like LoginScreen
  ├── screens/[pageName]/components   # components specific to a page
  └── utils/        # Helper functions and formatters
  ```
- use reusable components wherever
- use react-hook-form for forms
- use colors from utils/colors.tsx if not create if needed
