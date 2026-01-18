# Firebase Integration Architecture

CureBird utilizes Firebase as its primary Backend-as-a-Service (BaaS) for secure authentication, real-time database capabilities, and file storage.

## 1. Configuration
**File Reference**: `src/firebase.js`

| Config Key | Value (Public Reference) | Purpose |
| :--- | :--- | :--- |
| `authDomain` | `curebird-535e5.firebaseapp.com` | Authentication handler domain. |
| `projectId` | `curebird-535e5` | Unique identifier for the Google Cloud project. |
| `storageBucket` | `curebird-535e5.firebasestorage.app` | Default bucket for file uploads. |

## 2. Services Used

### A. Authentication (`auth`)
*   **Provider**: **GoogleAuthProvider**
*   **Method**: `signInWithPopup`
*   **Usage**: Streamlines user onboarding for both Patients and Doctors.
*   **Security**: Manages session tokens and secure sign-out flows.

### B. Cloud Firestore (`db`)
*   **Type**: NoSQL Document Database.
*   **Structure**: Collections -> Documents -> Data Fields.
*   **Core Collections**:
    *   `users`: Stores profile metadata, roles (Doctor/Patient), and preferences.
    *   `appointments`: Tracks scheduling data.
    *   `medical_records`: References to stored report metadata.

### C. Cloud Storage (`storage`)
*   **Purpose**: Storing large binary objects (BLOBs).
*   **Content**: User uploaded medical reports (PDF, JPG, PNG).
*   **Flow**:
    1.  Frontend uploads file to Storage Bucket.
    2.  Storage returns a download URL.
    3.  Frontend saves the download URL + Metadata to Firestore.

## 3. Security Best Practices
*   **Client-Side Initialization**: Firebase is initialized only once in `firebase.js` and exported as a singleton.
*   **Environment Variables**: Sensitive keys (API Key) should ideally be stored in environment variables (`.env`) for production safety, though currently visible in client code (common for Firebase public keys, but restricted via Console rules).
