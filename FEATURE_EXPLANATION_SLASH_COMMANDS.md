# Feature Deep Dive: Clinical Slash Commands

## 1. Concept Overview

**Slash Commands** are a power-user feature widely used in platforms like Slack and Discord, now adapted for **CureBird's Clinical Interface**.

By simply typing the forward slash character (`/`) in the chat input box, a standardized menu of "Macro Actions" appears. This allows doctors to perform complex actions or send robust pre-written instructions without taking their hands off the keyboard.

---

## 2. Why is this critical?

In a high-volume Telehealth environment, doctors repeat the same 5-10 instructions constantly.

- "Please check your blood pressure and let me know."
- "I am booking you a follow-up for next week."
- "Go to the ER immediately."
- "Here is the diet plan for diabetes."

**Slash Commands reduce these 30-second typing tasks to 2-second keystrokes.**

---

## 3. The Commands Library (Proposed)

We will implement the following initial command set:

| Command    | Action / Output                                                                       | Use Case                                              |
| :--------- | :------------------------------------------------------------------------------------ | :---------------------------------------------------- |
| `/vitals`  | Sends a formatted **"Vitals Request Card"** to the patient.                           | Patient clicks "Enter Vitals" to log BP/HR instantly. |
| `/book`    | Opens the **Appointment Calendar** modal for the doctor.                              | Quickly scheduling follow-ups.                        |
| `/fasting` | Inserts: _"Please ensure you fast for 12 hours before this test (water is okay)."_    | Pre-lab instructions.                                 |
| `/obs`     | Inserts: _"Please monitor your symptoms for 24 hours. If they worsen, go to the ER."_ | Safety netting.                                       |
| `/refer`   | Generates a standard **Referral Letter** template.                                    | Sending patient to a specialist.                      |
| `/note`    | Triggers the **"Chat-to-Note"** AI summarization workflow.                            | Documentation shortcut.                               |

---

## 4. User Interaction Flow

1.  **Trigger**: Doctor types `/` in the message input.
2.  **Menu**: A small pop-up list appears above the cursor, showing available commands (filtered as they type, e.g., `/b` -> suggests `/book`).
3.  **Selection**:
    - Doctor presses `Enter` or `Tab`.
    - The command is executed immediately (e.g., text inserted or modal opened).
4.  **Completion**: The menu disappears, and the doctor sends the message.

---

## 5. Technical Implementation Strategy

- **Listener**: The `activeChat` input field listens for the `/` key event.
- **State**: `showCommandMenu` (Boolean) toggles the UI overlay.
- **Filtering**: A local search against a JSON list of commands based on characters typed after `/`.
- **Execution**: A switch statement handles the selection:
  - `type: 'text'` -> Appends string to `messageInput`.
  - `type: 'action'` -> Calls a function (e.g., `setShowCalendar(true)`).
