# Future Feature Suggestions: Doctor Portal Messages

To elevate the **Curebird Doctor Messaging Portal** to a professional, high-utility clinical tool without inducing clutter, consider implementing the following features. These focus on **workflow efficiency**, **clinical accuracy**, and **time management**.

---

## 1. 🤖 AI Clinical Scribe & "Smart Replies"

- **Concept**: Use LLMs to analyze the incoming patient text and suggest one-tap clinical responses or follow-up questions.
- **Utility**: Drastically reduces typing time for routine inquiries (e.g., "Yes, you can take Tylenol with that").
- **Feature**: **"Convert to Note" button**: One click to summarize the current chat session and save it as a "Consultation Note" in the patient's record.

## 2. 📅 In-Chat Appointment Scheduling

- **Concept**: Instead of typing "Can you come in Tuesday?", send an interactive **"Appointment Slot" Card**.
- **Utility**: The doctor selects 2-3 available slots; the patient simply taps one to book. It syncs instantly with the main calendar.
- **Why**: eliminating the "back-and-forth" negotiation of times.

## 3. ⚡ Slash Commands for Templates (/macros)

- **Concept**: Type `/` to bring up a menu of pre-saved text snippets.
- **Examples**:
  - `/fasting` -> inserts pre-op fasting instructions.
  - `/location` -> sends clinic map pin and parking info.
  - `/followup` -> sends standard 2-week follow-up text.
- **Utility**: Standardizes care instructions and ensures no details are missed in typing.

## 4. 📂 Structured "File Requests"

- **Concept**: Instead of just asking "Please send your lab report," click **Request File**.
- **Utility**: This creates a specific "Pending Upload" slot in the chat. When the patient uploads, it automatically tags the file as "Lab Report" and sorts it into their medical records, rather than just getting lost in the chat media gallery.

## 5. ⭐️ "Star" or "Flag" Specific Messages

- **Concept**: Allow the doctor to right-click/long-press a specific message bubble to "Pin" or "Flag" it.
- **Utility**: If a patient mentions a symptom ("I felt dizzy yesterday") that the doctor wants to investigate during the newly scheduled visit, flagging it puts it on a "To-Discuss" list for that appointment.

## 6. 🗣️ Live Transcription for Voice Notes

- **Concept**: When a patient sends a voice note (often long and rambling), automatically display a **text transcript** below it.
- **Utility**: Doctors can "read" the voice note in 2 seconds instead of listening to a 2-minute audio file, scanning for keywords like "pain" or "fever".

## 7. 🔒 "End Consultation" Session Wrapper

- **Concept**: A button to formally "Close" a chat session.
- **Utility**:
  - Generates a billing code for the telehealth session.
  - Archives the thread so it doesn't sit in "Active".
  - Sends a summary receipt to the patient.

---

### 🎨 Design Philosophy for these Features

To keep the UI **non-redundant**:

- Hide these features behind a **"+" menu** or **Slash command** (like Slack/Discord).
- Do not add more permanently visible buttons to the screen.
- Use **Context Menus** (right-click on message) for things like Flagging or converting to notes.
