# Email Service Architecture

Curebird uses **EmailJS** to handle transactional emails and contact form submissions directly from the client side, removing the need for a dedicated SMTP backend server.

## 1. Overview

| Feature | Details |
| :--- | :--- |
| **Provider** | **EmailJS** (`@emailjs/browser`) |
| **Package Version** | `^4.4.1` |
| **Primary Use Case** | Contact Form Submissions (`Contact.js`) |

## 2. Implementation Details

### Configuration
The service connects using three key parameters (typically stored or hardcoded in the component):
1.  **Service ID**: Identifies the EmailJS service (e.g., GMail service).
2.  **Template ID**: Determines the visual format and dynamic variables of the email.
3.  **Public Key**: Authenticates the client request.

### Code Workflow (`Contact.js`)
1.  **Form Capture**: A reference (`useRef`) attaches to the HTML form element.
2.  **Submission Trigger**: `emailjs.sendForm()` is called on submit.
3.  **Data Transmission**: The function automatically scrapes `name` attributes from inputs (`user_name`, `user_email`, `message`) and sends them to the template.
4.  **Feedback**: `then()` blocks handle success (Toast notification) or failure (Error alert).

## 3. Advantages
*   **Serverless**: No backend code required to send simple notifications.
*   **Security**: Credentials are public-key based; secrets remain on the EmailJS dashboard.
*   **Reliability**: Decoupled from the main Flask backend; emails work even if the backend is down.
