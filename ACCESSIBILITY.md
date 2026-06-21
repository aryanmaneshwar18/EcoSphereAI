# Accessibility Standards (WCAG 2.2 AA)

EcoSphere AI is committed to being universally accessible. We adhere to the **WCAG 2.2 Level AA** standards.

## 1. Color Contrast
- All text and interactive elements maintain a minimum contrast ratio of 4.5:1 against their backgrounds.
- The dark mode palette is specifically tuned to reduce eye strain while remaining legible.

## 2. Keyboard Navigation
- The entire application is fully navigable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc`).
- A visible focus indicator (`focus-visible:ring`) is present on all interactive elements.
- "Skip to Content" links are provided for screen reader users.

## 3. Screen Readers & WAI-ARIA
- Semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<section>`) are used throughout.
- Appropriate ARIA roles and attributes (`aria-label`, `aria-hidden`, `aria-expanded`, `aria-describedby`) are implemented on custom components like modals, accordions, and dropdowns.

## 4. Reduced Motion
- We respect the user's OS-level reduced motion preferences. Framer Motion animations are configured to disable or minimize automatically when `prefers-reduced-motion` is active.

## 5. Forms & Error Handling
- All inputs have associated `<label>` elements or `aria-label` attributes.
- Error states are communicated clearly using text and color, and focus is programmatically managed to alert the user of validation errors.

## Automated Auditing
- We use `@axe-core/react` in development to catch accessibility issues early.
- Playwright tests include `axe` assertions to prevent regressions in accessibility.
