# Apply "Echelon UI" Design System (The Digital Curator)

This plan details the steps to overhaul the frontend application with the premium "Quiet Premium" design system extracted from the Stitch project. The goal is to move from a standard template look to a high-end SaaS aesthetic.

## User Review Required

> [!IMPORTANT]
> The Stitch design is primarily built around a unified **Dark Mode** experience ("deep indigos"). While the tokens support light mode technically, the provided `designMd` heavily emphasizes the dark tonal architecture.
> **Question:** Should we default the app globally to this dark premium theme (Echelon UI Dark), effectively replacing the current light/dark toggle, or do you want to maintain a light mode variant that attempts to mirror these rules?

> [!TIP]
> The prompt mentioned "Focus specifically on the [Screen Name]". I plan to update the global UI Base (Buttons, Inputs) and the three main pages: `Home`, `PollDetails`, and `CreatePoll`. Please let me know if there's one you want me to prioritize first!

## Proposed Changes

---
### 1. Global Styles & Theme Configuration
Updating the Tailwind v4 CSS configuration to include the "Echelon UI" colors, typography, and utility classes based on the `designMd`.

#### [MODIFY] [index.css](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/index.css)
- **Colors:** Inject all `namedColors` from the Stitch tokens as CSS custom properties into `:root` and `@theme`.
- **Typography:** Set `Inter` as the default sans font. Add font-weight and letter-spacing rules for Display, Headings, and Labels.
- **Base Layering:** Apply the "No-Line" rule globally. Set `body` background to `surface` (`#0b1326`) and default text to `on_surface` (`#dae2fd`).
- **Custom Utilities:** Add custom classes for the signature gradient (135deg `primary` to `primary-container`) and ambient shadows using the background tint.

---
### 2. Core UI Components
Refactoring the base components to adhere to the strict guidelines provided in the design system.

#### [MODIFY] [Button.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/components/ui/Button.jsx)
- **Primary Variant:** Remove plain backgrounds. Use the signature linear gradient, `md` border-radius, and `on_primary` text. Add hover/focus intensity boosts.
- **Secondary Variant:** Ghost style. No background, `outline_variant` at 20% opacity border.
- **Animations:** Wrap with Framer Motion `motion.button` for snappy scale/hover interactions.

#### [MODIFY] [Input.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/components/ui/Input.jsx)
- **Styling:** Remove borders completely. Use `surface_container_lowest` as the background.
- **Focus:** Transition background to `surface_bright`.
- **RTL:** Ensure padding flips semantically. 

#### [MODIFY] [Skeleton.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/components/ui/Skeleton.jsx)
- Update base pulse color to `surface_container_high` and highlight to `surface_bright` to match the dark indigo tonality.

---
### 3. Layout and Navigation
Updating the app shell to use glassmorphism and depth.

#### [MODIFY] [Navbar.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/layouts/Navbar.jsx)
- Change background to overlapping glassmorphism: semi-transparent `surface_bright` with `backdrop-blur-md` or `backdrop-blur-xl`.
- Remove any lingering bottom borders. Use shadow or pure elevation.

> [!NOTE]
> If `Navbar.jsx` doesn't exist under `layouts`, I will locate it under `components` or wherever it resides.

---
### 4. Application Pages (The "Screens")
Bringing the specific pages to life using the asymmetrical, high-contrast layouts.

#### [MODIFY] [Home.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/features/polls/Home.jsx)
- **List Items:** Format poll cards as physical stacks of "fine paper" using `surface_container` tiers instead of borders.
- **Animations:** Use `framer-motion` to stagger the entrance of the poll cards.

#### [MODIFY] [PollDetails.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/features/polls/PollDetails.jsx)
- **Progress Bars:** Implement the "Glow & Gradient" rule. Track using `surface_container_highest`, and indicator using vibrant transition with a glow effect.
- **Typography:** Apply high-contrast `on_surface` vs `on_surface_variant` for question vs. metadata. Emphasize asymmetric data placement.

#### [MODIFY] [CreatePoll.jsx](file:///d:/Documents/Next/NestJs-PJ/Newfolder/ITI-NodeJs-Polling-Data-Aggregation-API/frontend/src/features/polls/CreatePoll.jsx)
- Focus heavily on the "Breathing Room" principle. Enlarge paddings, arrange input fields seamlessly within `surface_container` wrappers. Adding micro-animations on adding/removing options.

---
## Verification Plan

### Automated/Build Tests
- Run `npm run lint` and `npm run build` to ensure no Tailwind or JSX syntax errors were introduced.

### Manual Verification
- Start the Vite development server (`npm run dev`).
- Visual check on Home, Poll Details, and Create Poll pages across Mobile, Tablet, and Desktop viewport sizes to guarantee the "Mobile-First" criteria is met.
- Verify Framer Motion interactions (clicks, hovers, list entrances) feel snappy and premium.
