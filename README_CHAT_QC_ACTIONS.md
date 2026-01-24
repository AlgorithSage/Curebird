# Doctor Chat: Quick Action Chips Specification

The following three buttons located above the chat input are designed to streamline clinical workflows directly from the messaging interface.

## 1. ⚠️ URGENT ALERT

- **Purpose**: Immediate risk escalation.
- **Functionality**:
  - **Visual**: Sends a specialized message bubble with a **Red Flashing Border** to the patient.
  - **System Action**: Flags the patient's status as "Critical" in the main dashboard.
  - **Notification**: Triggers a high-priority push notification to the patient's device saying "Dr. [Name] has flagged an urgent concern. Please respond immediately."

## 2. ⚡ REQUEST VITALS

- **Purpose**: Real-time health monitoring.
- **Functionality**:
  - **Interactive Card**: Sends a "Vitals Input Form" directly into the chat stream.
  - **Patient View**: Patient sees a form to enter Blood Pressure, Heart Rate, and SpO2.
  - **Data Sync**: Once submitted by the patient, the data is automatically saved to their `Clinical Records` and plotted on the doctor's monitoring chart.

## 3. 💊 WRITE RX (Prescription)

- **Purpose**: Tele-health prescribing.
- **Functionality**:
  - **Workflow**: Opens a "Mini-Prescription Modal" overlaying the chat.
  - **Output**: Generates a **Digital Prescription PDF** card in the chat.
  - **Details**: Allows the doctor to quickly select medication, dosage, and instructions (e.g., "Amoxicillin 500mg - 2x daily").

---

_These actions are currently UI placeholders. The next step is to wire them up to their respective logic handlers._
