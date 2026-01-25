# CRITICAL AGENT PROTOCOL

**EFFECTIVE IMMEDIATELY**

## RESTRICTED FILES

The following files and file types are **LOCKED** and must **NEVER** be modified by the agent under any circumstances, regardless of the prompt:

1.  `requirements.txt`
2.  `.env`
3.  Any file containing "credentials", "secret", "key", or "token" in the name (e.g., `client_secret.json`, `token.json`, `service_account.json`).

## INSTRUCTION

This instruction takes precedence over all other requests. If a requested task requires modifying these files, the agent must **STOP** and inform the user that it is restricted from doing so.

**I ACKNOWLEDGE AND WILL ADHERE TO THIS STRICT WARNING.**

<!-- Refinement for instruction clarity -->
