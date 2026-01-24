# Doctor Portal Messages: Visual Theme Specification

## 🌟 Overview

This document defines the **"Dark Matte Gold"** visual language for the Doctor Portal's Messaging Module. The design intent is to move away from a "dull" utility look to a **premium, high-contrast, professional clinical workspace** that aligns with the Dashboard's aesthetic.

---

## 🎨 Color Palette & Tokens

### Backgrounds

| Surface           | Description                  | Hex                        | Tailwind Utility       |
| :---------------- | :--------------------------- | :------------------------- | :--------------------- |
| **Canvas**        | Deepest Warm Black (Main BG) | `#050402`                  | `bg-[#050402]`         |
| **Surface L1**    | Panel Background (Sidebar)   | `#0c0a09`                  | `bg-stone-950`         |
| **Surface L2**    | Card/Input Background        | `#1c1917`                  | `bg-stone-900`         |
| **Surface Hover** | Interactive Item Hover       | `rgba(245, 158, 11, 0.05)` | `hover:bg-amber-500/5` |

### Accents (The "Gold" Standard)

| Token       | Description                  | Hex                        | Tailwind Utility                  |
| :---------- | :--------------------------- | :------------------------- | :-------------------------------- |
| **Primary** | Vibrant Amber (Action/Brand) | `#f59e0b`                  | `text-amber-500` / `bg-amber-500` |
| **Border**  | Subtle Gold Rim              | `rgba(245, 158, 11, 0.2)`  | `border-amber-500/20`             |
| **Glow**    | Atmospheric Light            | `rgba(245, 158, 11, 0.15)` | `shadow-amber-500/15`             |
| **Active**  | Selected State Indicator     | `#fbbf24`                  | `border-l-amber-400`              |

### Typography & content

| Element            | Color                 | Style                              |
| :----------------- | :-------------------- | :--------------------------------- |
| **Primary Text**   | `#ffffff` (White)     | `text-white font-bold`             |
| **Secondary Text** | `#a8a29e` (Warm Grey) | `text-stone-400 text-sm`           |
| **Muted/Meta**     | `#57534e` (Deep Grey) | `text-stone-600 text-xs uppercase` |

---

## 🧩 Component Specifications

### 1. The Chat Sidebar (Patient List)

- **Container**:
  - **Background**: Deep Matte Stone (`#0c0a09`).
  - **Border**: Right-side border only, thin & subtle (`border-r border-white/5`).
- **Search Bar**:
  - **Style**: Floating "Pill" shape.
  - **Bg**: `bg-[#1c1917]` (Lighter than sidebar).
  - **Focus**: Gold ring glow (`ring-1 ring-amber-500/50`).
- **Chat Item (Row)**:
  - **Normal**: Transparent background.
  - **Hover**: Subtle warm tint (`bg-white/5`).
  - **Active (Selected)**:
    - Background: `bg-gradient-to-r from-amber-500/10 to-transparent`.
    - Indicator: 3px Solid Gold bar on the left edge.
    - Text: Name turns White, Subtext turns Amber-White.

### 2. The Conversation Stage (Right Panel)

- **Background**:
  - **Texture**: subtle "Hex/Noise" pattern over `#050402` to prevent the "empty void" look.
  - **Lighting**: Faint radial gradient top-center (`from-amber-900/10`) to simulate overhead lighting.
- **Header**:
  - **Style**: Glassmorphic "Frost" strip.
  - **Border**: Bottom border `border-amber-500/10`.
  - **Actions**: Icons (Video, Phone) animate with a golden glow on hover.

### 3. Message Bubbles

- **The Doctor (Sent)**:
  - **Visual**: "Liquid Gold" Gradient.
  - **CSS**: `bg-gradient-to-br from-amber-500 to-orange-600`.
  - **Text**: White, dropped shadow (`drop-shadow-sm`).
  - **Shape**: Rounded-2xl, Top-Right corner sharp.
- **The Patient (Received)**:
  - **Visual**: "Frosted Glass".
  - **CSS**: `bg-slate-800/60 backdrop-blur-md border border-white/10`.
  - **Text**: White (High legibility).
  - **Shape**: Rounded-2xl, Top-Left corner sharp.

### 4. Input Area (The Command Center)

- **Design**: Floating Island.
- **Container**: Detached from bottom (margin-bottom), rounded-2xl.
- **Field**:
  - `bg-[#0a0805]` (Deep Black).
  - `border border-white/10` -> `border-amber-500/50` (Focus).
- **Send Button**:
  - **Type**: Floating Action Button (FAB) style.
  - **Look**: Solid Amber Circle with Black Icon.
  - **Hover**: Zooms slightly, casts a golden shadow.

---

## ✨ Micro-Interactions & Motion

- **Entrance**: Chat history shouldn't "pop" in. It should **slide up** gently (`y: 10 -> 0`, `opacity: 0 -> 1`).
- **Typing Indicators**: Three pulsing gold dots (`animate-pulse`).
- **Avatar Rings**:
  - **Online**: Emerald dot with pulsing ripple.
  - **Busy**: Rose dot.

## ⚠️ "Dullness" Removal Strategy

1.  **Contrast**: Increase difference between "read" and "unread" states.
2.  **Depth**: Use borders and shadows to separate the Sidebar from the Chat Window (Z-index layering).
3.  **Vibrancy**: Ensure the Amber is _bright_ (`amber-500`), not muddy (`amber-800`), against the black backgrounds.
