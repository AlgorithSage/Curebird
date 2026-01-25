/**
 * Chat-to-Note Heuristic Engine
 * 
 * Analyzes a list of chat messages and generates a structured clinical summary.
 * In a production environment, this would be an LLM call.
 * 
 * @param {Array} messages - List of message objects { text, sender, type }
 * @param {String} patientName - Name of the patient
 * @returns {Object} { title, description, diagnosis, vitals, subjective, objective }
 */
/**
 * Chat-to-Note Heuristic Engine
 * 
 * Analyzes a list of chat messages and generates a structured clinical summary.
 * STRICT MODE: Only uses what is actually in the chat.
 * 
 * @param {Array} messages - List of message objects { text, sender, type }
 * @param {String} patientName - Name of the patient
 * @returns {Object} { title, description, diagnosis, vitals, subjective, objective }
 */
export const analyzeChatContext = (messages, patientName) => {
    if (!messages || messages.length === 0) return null;

    // Filter relevant text messages
    const textMessages = messages
        .filter(m => m.text && (m.type === 'text' || !m.type))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)); // Ensure chronological order

    // 1. Subjective (What the PATIENT said)
    const patientQuotes = [];
    const symptomsFound = [];
    const symptomKeywords = ['pain', 'ache', 'fever', 'cough', 'swelling', 'dizzy', 'tired', 'fatigue', 'vomit', 'nausea', 'rash', 'headache', 'stomach', 'feeling', 'hurt'];

    textMessages.forEach(msg => {
        if (msg.sender !== 'doctor') {
            // It's the patient
            patientQuotes.push(msg.text); // Capture everything
            
            symptomKeywords.forEach(k => {
                if (msg.text.toLowerCase().includes(k)) symptomsFound.push(k);
            });
        }
    });

    const uniqueSymptoms = [...new Set(symptomsFound)];

    // 2. Objective (Vitals Extraction - Strict)
    const vitals = {};
    const fullText = textMessages.map(m => m.text).join(' '); // Scan whole text block
    const lowerText = fullText.toLowerCase();

    // BP
    const bpMatch = fullText.match(/\b(\d{2,3}\/\d{2,3})\b/);
    if (bpMatch) vitals.bp = bpMatch[1];
    
    // Temp
    const tempMatch = lowerText.match(/\b(\d{2,3}(?:\.\d+)?)\s*(?:f|c|deg|degrees)\b/i);
    if (tempMatch) vitals.temp = tempMatch[1];

    // HR
    const hrMatch = lowerText.match(/\b(\d{2,3})\s*(?:bpm|heart|pulse)\b/i);
    if (hrMatch) vitals.heartRate = hrMatch[1];
    
    // SpO2
    const spo2Match = lowerText.match(/\b(\d{2,3})\s*%/);
    if (spo2Match) vitals.spo2 = spo2Match[1];

    // 3. Assessment (Diagnosis Guess)
    let diagnosis = 'Consultation';
    if (uniqueSymptoms.length > 0) {
        if (uniqueSymptoms.includes('fever') && uniqueSymptoms.includes('cough')) diagnosis = 'Viral URI (Suspected)';
        else if (uniqueSymptoms.includes('headache')) diagnosis = 'Cephalalgia / Headache';
        else diagnosis = `Observation: ${uniqueSymptoms[0]}`;
    }

    // 4. Plan (What the DOCTOR said)
    const doctorAdvice = [];
    textMessages.forEach(msg => {
        if (msg.sender === 'doctor') {
            doctorAdvice.push(msg.text);
        }
    });

    // --- FORMULATION ---
    // If conversation is just "Hi", we shouldn't hallucinate a headache.
    
    const submittedSubjective = patientQuotes.length > 0 
        ? patientQuotes.map(q => `• "${q}"`).join('\n')
        : "Patient provided no input.";

    const submittedPlan = doctorAdvice.length > 0
        ? doctorAdvice.map(q => `• ${q}`).join('\n')
        : "No specific medical advice recorded in chat.";

    // Objective Section Construction
    let objectiveText = "Vitals extracted from chat:";
    let hasVitals = false;
    if (vitals.bp) { objectiveText += `\n- BP: ${vitals.bp}`; hasVitals = true; }
    if (vitals.temp) { objectiveText += `\n- Temp: ${vitals.temp}`; hasVitals = true; }
    if (vitals.heartRate) { objectiveText += `\n- HR: ${vitals.heartRate}`; hasVitals = true; }
    if (!hasVitals) objectiveText = "No vitals shared in conversation.";

    const description = `
**SUBJECTIVE:**
Patient conversation log:
${submittedSubjective}

**OBJECTIVE:**
${objectiveText}

**ASSESSMENT:**
${diagnosis}

**PLAN:**
Doctor's instructions:
${submittedPlan}
    `.trim();

    return {
        title: `Consultation Note: ${patientName}`,
        type: 'consultation_note',
        description: description,
        diagnosis: diagnosis,
        vitals: vitals.bp ? vitals.bp : (vitals.heartRate ? `${vitals.heartRate} bpm` : ''),
    };
};
