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
export const analyzeChatContext = (messages, patientName) => {
    if (!messages || messages.length === 0) return null;

    // Filter relevant text messages
    const textMessages = messages
        .filter(m => m.text && (m.type === 'text' || !m.type))
        .map(m => `[${m.sender === 'doctor' ? 'Dr.' : 'Pt.'}]: ${m.text}`)
        .join('\n');

    // 1. Subjective (Patient Complaints)
    const symptoms = [];
    const symptomKeywords = ['pain', 'ache', 'fever', 'cough', 'swelling', 'dizzy', 'tired', 'fatigue', 'vomit', 'nausea', 'rash', 'headache', 'stomach'];
    
    messages.forEach(msg => {
        if (msg.sender !== 'doctor') {
            symptomKeywords.forEach(k => {
                if (msg.text.toLowerCase().includes(k)) {
                    // Extract the sentence containing the keyword
                    const sentence = msg.text.match(new RegExp(`[^.!]*${k}[^.!]*`, 'i'));
                    if (sentence) symptoms.push(sentence[0].trim());
                }
            });
        }
    });

    const uniqueSymptoms = [...new Set(symptomKeywords.filter(k => textMessages.toLowerCase().includes(k)))];
    
    // 2. Objective (Vitals Extraction)
    const vitals = {};
    const lowerText = textMessages.toLowerCase();

    // BP
    const bpMatch = textMessages.match(/\b(\d{2,3}\/\d{2,3})\b/);
    if (bpMatch) vitals.bp = bpMatch[1];
    
    // Temp
    const tempMatch = lowerText.match(/\b(\d{2,3}(?:\.\d+)?)\s*(?:f|c|deg|degrees)\b/i);
    if (tempMatch) vitals.temp = tempMatch[1];

    // HR
    const hrMatch = lowerText.match(/\b(\d{2,3})\s*(?:bpm|heart|pulse)\b/i);
    if (hrMatch) vitals.heartRate = hrMatch[1];

    // 3. Assessment (Diagnosis Guess)
    let diagnosis = 'Undiagnosed';
    if (uniqueSymptoms.includes('fever') && uniqueSymptoms.includes('cough')) diagnosis = 'Viral Upper Respiratory Infection';
    else if (uniqueSymptoms.includes('headache') && uniqueSymptoms.includes('nausea')) diagnosis = 'Migraine';
    else if (uniqueSymptoms.includes('chest') && uniqueSymptoms.includes('pain')) diagnosis = 'Chest Pain (Requires Rule-Out)';
    else if (uniqueSymptoms.length > 0) diagnosis = `Symptomatic: ${uniqueSymptoms[0]}`;

    // 4. Plan (Doctor Instructions)
    const planItems = [];
    const planKeywords = ['take', 'prescribe', 'rest', 'drink', 'monitor', 'refer', 'follow up'];
    messages.forEach(msg => {
        if (msg.sender === 'doctor') {
            planKeywords.forEach(k => {
                if (msg.text.toLowerCase().includes(k)) {
                     const sentence = msg.text.match(new RegExp(`[^.!]*${k}[^.!]*`, 'i'));
                     if (sentence) planItems.push(sentence[0].trim());
                }
            });
        }
    });

    // formatted description (SOAP style)
    const description = `
**SUBJECTIVE:**
Patient ${patientName} presents with: ${uniqueSymptoms.join(', ') || 'general concerns'}.
Patient reports: "${symptoms.slice(0, 2).join('"; "')}"

**OBJECTIVE:**
Review of systems via chat.
${vitals.bp ? `- BP: ${vitals.bp}` : ''}
${vitals.temp ? `- Temp: ${vitals.temp}` : ''}
${vitals.heartRate ? `- HR: ${vitals.heartRate}` : ''}

**ASSESSMENT:**
Possible ${diagnosis}.

**PLAN:**
${planItems.map(p => `- ${p}`).join('\n') || '- Monitor symptoms\n- Follow up if regular'}
    `.trim();

    return {
        title: `Consultation Note: ${patientName}`,
        type: 'consultation_note', // Fixed type
        description: description,
        diagnosis: diagnosis,
        vitals: vitals.bp ? vitals.bp : (vitals.heartRate ? `${vitals.heartRate} bpm` : ''),
        // pass raw vitals object if needed by modal, but usually modal takes text 'vitals' field or separate
    };
};
