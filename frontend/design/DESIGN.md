---
name: Artisan Commerce Engine
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#553300'
  on-tertiary: '#ffffff'
  tertiary-container: '#744800'
  on-tertiary-container: '#ffb759'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-tabular-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  data-tabular-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  sidebar-collapsed: 4.5rem
  sidebar-expanded: 16rem
---

## Brand & Style

This design system powers a high-velocity digital catalog and storefront management platform built for independent boutique artisans, specialized makers, and modern retail entrepreneurs. The brand balances professional enterprise utility with boutique craftsmanship. The interface must inspire operational confidence, pride of ownership, and speed, stripping away traditional e-commerce complexity in favor of frictionless catalog publishing and live inventory control.

The visual direction follows **Corporate / Modern** precision combined with subtle tactile luxury. It is utilitarian yet polished: clean surfaces, tight visual cadences, crisp data presentation, and high functional density. Subtle micro-interactions and violet-fuchsia luminescence denote automated AI cataloging and copy-generation tools without undermining the restrained, grounded retail workspace.

## Colors

The palette establishes an authoritative, reliable workspace anchored by deep indigo and balanced with purposeful retail status indicators.

- **Primary (`#4338CA` / Deep Indigo)**: Drives primary navigation, master actions, primary buttons, active state indicators, and focal metric cards. An electric indigo (`#4F46E5`) serves as the hover and focus illumination layer.
- **Secondary (`#10B981` / Emerald Green)**: Communicates vitality, live storefront statuses, active synchronization, healthy stock reserves, and positive revenue trajectories.
- **Tertiary (`#F59E0B` / Amber)**: Used exclusively for operational warnings—low stock thresholds, pending payments, or incomplete product variant configurations.
- **Neutral (`#0F172A` / Slate 900)**: Serves as the high-contrast text anchor and dark chrome element base. Paired with Slate 50 (`#F8FAFC`) for the foundation canvas, White (`#FFFFFF`) for elevated card surfaces, and Slate 200 (`#E2E8F0`) for structural dividers.
- **AI Assist Accent**: A dynamic linear gradient running from `#6366F1` to `#D946EF` reserved exclusively for generative catalog tools, AI product descriptions, smart tagging, and automated visual cleanups.

## Typography

Inter serves across all hierarchy roles to maintain maximum legibility at high data densities. All pricing columns, stock counts, SKU identifiers, and analytic figures must enforce `font-feature-settings: 'tnum' on, 'cv05' on, 'cv11' on` (tabular lining numbers and alternate contextual glyphs). This prevents layout shifts across dynamic catalog rows and streamlines visual scanning across dense financial tables.

## Layout & Spacing

The layout is built on a 12-column responsive fluid grid pinned within an application shell featuring an adaptive left-hand navigation rail.

- **Desktop (1280px+)**: 12 columns, 24px gutters, fixed 256px sidebar, dynamic central catalog canvas with an optional 384px slide-over preview inspector for live storefront auditing.
- **Tablet (768px - 1279px)**: 8 columns, 16px gutters, collapsed 72px icon sidebar. Modal drawers replace persistent right-hand inspectors.
- **Mobile (<768px)**: 4 columns, 16px outer margin, sticky top action bar, persistent bottom drawer for rapid batch updates, and stacked tabular items into interactive mobile cards.

Horizontal spacing inside data tables adopts an ultra-dense baseline (8px vertical row padding, 12px cell padding) to minimize scrolling during inventory intake.

## Elevation & Depth

Visual hierarchy uses **ambient shadows** anchored with slate tinting paired with **low-contrast outlines** (`#E2E8F0` / 1px solid) to produce a crisp, architectural boundary.

- **Level 0 (Canvas Base)**: `#F8FAFC`, flat.
- **Level 1 (Card & Content Blocks)**: Surface `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hovered Records & Floating Toolbars)**: Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals & Storefront Quick Viewers)**: Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
- **AI Highlight Elevation**: Surface `#FFFFFF`, dual outline using an inner border of `#E2E8F0` and an outer gradient aura `0 0 0 1px rgba(217, 70, 239, 0.25), 0 4px 12px -2px rgba(99, 102, 241, 0.12)`.

## Shapes

The design system employs a **Soft** shape language (`roundedness: 1`). Elements are shaped with restrained, geometric precision that looks modern without appearing playful:

- Base controls (inputs, secondary buttons, badges): `0.25rem` (4px).
- Cards, containers, product image wrappers, and table envelopes: `rounded-lg` / `0.5rem` (8px).
- Large floating drawers, dialog overlays, and storefront preview mockups: `rounded-xl` / `0.75rem` (12px).
- Pill roundings are strictly prohibited with the sole exception of the "Live / Offline" status indicator light.

## Components

### Buttons
- **Primary**: Background `#4338CA`, text `#FFFFFF`, border `1px solid #3730A3`. Hover: `#3730A3`. Active: `#312E81`.
- **Secondary**: Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC` and border `#CBD5E1`.
- **Destructive**: Background `#FEF2F2`, text `#DC2626`, border `1px solid #FEE2E2`. Hover: `#FEE2E2`.
- **AI Assist Button**: Background linear gradient `(135deg, #4F46E5, #9333EA)`, text `#FFFFFF`, subtle sparkle icon prefix. Hover: brightness `1.08`.

### Input Fields & Controls
- Height: 36px (compact density). Border: `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`, border-radius: 4px.
- Focus: `border-color: #4F46E5`, outline: `2px solid rgba(79, 70, 229, 0.2)`.
- Price & Quantity inputs must right-align content and render in `data-tabular-md`.

### Status Badges & Chips
- **Live / Active**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`, dot indicator `#10B981`.
- **Low Stock / Warning**: Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`, dot indicator `#F59E0B`.
- **Draft / Inactive**: Background `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`, dot indicator `#94A3B8`.

### Data Tables & Product Row Items
- Outer wrapper enclosed in 1px `#E2E8F0` with `rounded-lg` corners.
- Header row styled with uppercase `label-sm` in `#64748B`, height 36px, background `#F8FAFC`.
- Body rows feature hover state `#F8FAFC`, transition 120ms ease. Checkbox, 40px thumbnail, product title, SKU, category tag, tabular inventory count, price, and actions menu.

### AI Magic Bar
- A contextual banner or inline field adornment styled with a subtle `1px` border gradient running from `#818CF8` to `#E879F9`. Contains a 12px gradient spark icon, offering instant single-click product titles, image background removal, and multi-channel SEO tagging.