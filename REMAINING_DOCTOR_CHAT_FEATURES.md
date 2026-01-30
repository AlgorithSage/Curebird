# Remaining Doctor Portal Message Features

Per our previous roadmap, here are the **three remaining features** prioritized for the Doctor Chat interface:

## 1. Contextual "Patient Snapshot" Panel (Sidebar)

**Objective:** Provide medical context without leaving the chat.

- **Functionality:** A collapsible right-sidebar toggleable via the header.
- **Content:**
  - **Key Vitals:** Real-time display of last recorded BP, Pulse, Temp, SpO2.
  - **Critical Alerts:** Active allergies, blocked medications.
  - **Engagement History:** Last appointment date, adherence score.
- **Why:** Eliminates "tab switching fatigue" and ensures safety checks happens _during_ communication.

## 2. "Slash Commands" for Quick Responses

**Objective:** Rapid, standardized clinician replies.

- **Functionality:** Typing `/` in the message input triggers a popup menu.
- **Commands:**
  - `/book [date]` -> Sends appointment booking link.
  - `/vitals` -> Requests patient to update vitals log.
  - `/fasting` -> Sends standard fasting instructions.
  - `/obs` -> "Please monitor your symptoms for 24h and report back."
- **Why:** Reduces typing time for repetitive clinical instructions by 80%.

## 3. Secure Image Annotation (Tele-Dermatology)

**Objective:** Precise visual communication for remote diagnosis.

- **Functionality:**
  - Doctor clicks on a patient-uploaded image (e.g., rash, wound).
  - Opens a "Markup Mode" overlay.
  - Doctor draws (Circle area, Arrow to concern).
  - Sends the **annotated image** back to the chat.
- **Why:** Text descriptions ("the red spot on the left") are often ambiguous. Visual markup provides clarity and reduces liability.
