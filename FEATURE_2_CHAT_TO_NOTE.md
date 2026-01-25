# Feature 2: AI-Powered "Chat-to-Note"

## 1. Overview

The **Chat-to-Note** feature is an advanced AI-driven workflow designated to streamline clinical documentation. It allows doctors to instantly convert a loose, unstructured chat conversation with a patient into a formal, structured clinical note (SOAP format: Subjective, Objective, Assessment, Plan).

## 2. User Experience (UX)

1.  **Trigger**: While in an active chat, the doctor sees a ✨ **"Summarize"** (Sparkles) button in the chat header.
2.  **Action**: Clicking the button triggers an analysis of the last **20 messages** in the conversation context.
3.  **Result**:
    - A "Generating Clinical Note..." loader appears briefly.
    - The **Add Clinical Record Modal** opens automatically.
    - **Pre-filled Fields**: The modal is already populated with:
      - **Title**: "Consultation Summary - [Date]"
      - **Type**: "Consultation Note"
      - **Description**: A structured summary derived from the chat (e.g., "Patient reports headache since yesterday...").
      - **Vitals**: Extracted from chat if mentioned (e.g., "My BP was 120/80").
      - **Diagnosis**: Suggested based on symptoms discussed.
4.  **Finalize**: The doctor reviews the AI-generated draft, makes minor edits if necessary, and clicks **"Save Record"** to finalize it into the patient's permanent medical history.

## 3. Technical Architecture

### A. Data Source

- **Input**: Firestore Collection `chats/{chatId}/messages`.
- **Filtering**:
  - Filter out system messages (e.g., "Call started").
  - Sort by `createdAt` (Ascending).
  - Limit to recent context (e.g., last 20-30 messages) to ensure relevance.

### B. AI Simulation (Phase 1)

Since we are prototyping, we will use a **Smart Regex & Heuristic Engine** to simulate the AI.

- **Symptom Extraction**: Look for keywords like "pain", "fever", "swelling", "ache".
- **Vitals Extraction**: Regex patterns for BP (`120/80`), Temp (`99F`), HR (`72 bpm`).
- **Medication Extraction**: Look for "taking", "prescribed", "dosage".

_(Note: In Phase 2, this will be replaced by a call to the backend `POST /api/generate-summary` using an LLM)._

### C. Component Integration

- **`DoctorChat.jsx`**:
  - New State: `isGeneratingNote` (Boolean).
  - New Button: Placed in the chat header near the Video Call button.
  - Logic: `handleGenerateNote()` function to fetch messages and run the extraction logic.
- **`AddClinicalRecordModal.jsx`**:
  - Update strict mode to accept `initialData` prop.
  - `useEffect` hook to populate `formData` when `initialData` changes.

## 4. Implementation Steps

1.  **Utility Logic**: Create `src/utils/chatToNote.js`
    - Function: `analyzeChatContext(messages, patientName)`
    - Returns: `{ title, description, diagnosis, vitals }`
2.  **UI Update (DoctorChat)**:
    - Import `Sparkles` icon.
    - Add button to Header.
3.  **Modal Wiring**:
    - Pass `generatedNoteData` state from `DoctorChat` to `AddClinicalRecordModal`.
4.  **Testing**:
    - Simulate a chat conversation about "Flu symptoms".
    - Click "Summarize".
    - Verify the Modal opens with "Influenza" as a suggested diagnosis and symptoms listed in the description.

## 5. Future Roadmap

- **LLM Integration**: Replace regex with Gemini/GPT-4 for analyzing complex medical nuance.
- **Voice Transcript Support**: Include audio transcripts from Voice Notes in the analysis context.
- **Auto-Coding**: Automatically suggest ICD-10 codes based on the generated note.
