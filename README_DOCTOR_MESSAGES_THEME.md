# Doctor Portal Messages: The "Golden Hour" Theme Specification

## 🌟 Objective

Shift the design from "Black/Dark Mode" to a **"Subtle Amber Yellow"** aesthetic. This involves using **warm, deep golden-brown tones** instead of harsh blacks, creating a welcoming, premium "Golden Hour" atmosphere. We will also introduce a **Third Column (Right Sidebar)** for Patient Details to enhance UI density.

---

## 🎨 Renamed Palette: "Golden Hour"

### Backgrounds (No More Black)

| Surface      | Description       | Hex                        | Tailwind Utility                  |
| :----------- | :---------------- | :------------------------- | :-------------------------------- |
| **Canvas**   | Deep Golden Brown | `#17120a`                  | `bg-[#17120a]` (Warm Espresso)    |
| **Panel L1** | Sidebar/Card Bg   | `#261e12`                  | `bg-[#261e12]` (Deep Amber Matte) |
| **Panel L2** | Active/Hover      | `#382b18`                  | `bg-[#382b18]`                    |
| **Glass**    | Tinted Overlay    | `rgba(251, 191, 36, 0.03)` | `bg-amber-500/3`                  |

### Accents

| Token        | Description    | Style                              |
| :----------- | :------------- | :--------------------------------- |
| **Primary**  | Soft Gold      | `text-yellow-400`                  |
| **Border**   | Warm highlight | `border-yellow-500/20`             |
| **Gradient** | Header/Active  | `from-amber-900/40 to-transparent` |

---

## 🧩 New UI Components

### 1. 🗂 Left Sidebar (Chat List)

- **Theme**: Warm, deep brown (`#261e12`) with soft yellow borders.
- **Visual**: Lighter than before to differentiate from the main chat.
- **Search**: Amber-tinted input field.

### 2. 💬 Center Stage (Chat)

- **Background**: **Subtle Amber Radial Gradient** (`bg-gradient-to-b from-[#17120a] to-[#261e12]`). NOT Black.
- **Bubbles**:
  - **Doctor**: **Solid Gold** (`bg-amber-500 text-black`) -> High visibility.
  - **Patient**: **Warm Clay** (`bg-[#382b18] text-amber-50`) -> Soft contrast.

### 3. ℹ️ **NEW: Right Sidebar (Patient Context)**

- _A new third column to prevent the interface from looking "empty"._
- **Profile Card**: Mini avatar + Name + Age/Gender.
- **Shared Media**: Grid of 4 recently shared photos/docs.
- **Quick Actions**: "Start Video", "Schedule", "Profile".

### 4. ⚡ Quick Action Bar (Input Add-on)

- Placed _above_ the input field.
- Chips for: `Request Vitals`, `Send Prescription`, `Urgent Alert`.

---

## 🚀 Implementation Steps

1.  **Layout Refactor**: Change from 2-column to **3-column grid** (Sidebar | Chat | Context).
2.  **Theme Injection**: Replace all `stone-900`/`black` with `[#17120a]` and `[#261e12]`.
3.  **Component Additions**:
    - Implement `PatientInfoSidebar` component.
    - Add `QuickActions` row in the input area.
