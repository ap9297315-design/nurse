import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy initialize Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Always-On AI Clinical Preceptor Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, context, topic } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
        reply:
          "AI Assistant is currently running in offline mode. Please configure GEMINI_API_KEY in the Settings > Secrets panel to unlock live generative responses.",
      });
    }

    const systemInstruction = `You are "Sister Florence / Dr. Preceptor", an expert, encouraging Clinical Nursing Educator and Preceptor specializing in the Indian Nursing Council (INC) B.Sc Nursing curriculum (Midwifery & OBG Nursing, Child Health / Pediatric Nursing, Community Health Nursing, and Nursing Research & Statistics).

Guidelines:
- Provide clear, evidence-based, clinical explanations adhering to WHO, GoI (Government of India Ministry of Health & Family Welfare), and standard nursing textbooks (DC Dutta, Ghai Pediatrics, Polit & Beck, Park's PSM).
- Structure clinical answers with:
  1. Core Concept / Pathology
  2. Clinical Signs & Symptoms
  3. Priority Nursing Interventions (Independent vs Collaborative)
  4. Medication / Dosage / Monitoring Pearls
  5. Patient/Family Education & Documentation
- When asked about drugs (e.g. Oxytocin, MgSO4, Terbutaline), always state standard dosing, antidote (e.g. Calcium Gluconate for MgSO4 toxicity), and critical assessment points (respiratory rate >12, knee-jerk reflex, urine output >30mL/hr).
- Maintain an encouraging, academic, yet practical bedside mentorship tone. Keep explanations structured with markdown bullet points.`;

    const contents = [];
    if (context) {
      contents.push({
        role: "user",
        parts: [{ text: `Clinical Context / Current Subject or Unit: ${context} - Topic: ${topic || "General"}` }],
      });
      contents.push({
        role: "model",
        parts: [{ text: "Understood. I am ready to guide you on this nursing unit and clinical case." }],
      });
    }

    if (Array.isArray(messages)) {
      for (const m of messages) {
        contents.push({
          role: m.role === "assistant" || m.role === "model" ? "model" : "user",
          parts: [{ text: m.content || m.text || "" }],
        });
      }
    } else if (req.body.prompt) {
      contents.push({
        role: "user",
        parts: [{ text: req.body.prompt }],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No response generated.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI response",
    });
  }
});

// Dynamic Quiz Question Generator (Always new, adapts to book & syllabus)
app.post("/api/gemini/generate-quiz", async (req, res) => {
  try {
    const { subject, unit, topic, difficulty = "Medium", count = 5 } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const prompt = `Generate ${count} high-yield multiple-choice NCLEX / AIIMS NORCET / INC style nursing exam questions.
Subject: ${subject || "Midwifery & Obstetrical Nursing"}
Unit / Chapter: ${unit || "High-Risk Pregnancy & Labor Complications"}
Specific Topic: ${topic || "Postpartum Hemorrhage & Eclampsia"}
Difficulty Level: ${difficulty}

Ensure each question tests critical clinical judgment (assessment, priority action, pharmacology, or pathophysiology). Provide 4 distinct options, the zero-based index of the correct option, a comprehensive rationale explaining why the correct choice is right and why the distractors are wrong, and reference citation (e.g. DC Dutta, Ghai, Park).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Nursing Board Examination and NCLEX question writer. Always respond with strict JSON adhering to the provided schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              rationale: { type: Type.STRING },
              clinicalTip: { type: Type.STRING },
              reference: { type: Type.STRING },
            },
            required: ["question", "options", "correctIndex", "rationale"],
          },
        },
      },
    });

    const questions = JSON.parse(response.text || "[]");
    return res.json({ questions });
  } catch (error: any) {
    console.error("Gemini quiz generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate dynamic quiz",
    });
  }
});

// Presentation Slide Deck Maker
app.post("/api/gemini/generate-presentation", async (req, res) => {
  try {
    const { topic, subject, audience = "Nursing Students & Clinical Instructors", slideCount = 6 } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const prompt = `Create a professional clinical nursing presentation slide deck for a seminar or journal club.
Subject: ${subject || "Midwifery & Obstetric Nursing"}
Topic: ${topic || "Active Management of Third Stage of Labor & PPH Protocol"}
Target Audience: ${audience}
Number of Slides: ${slideCount}

Include:
- Slide 1: Title Slide (Topic, Subtitle, Presenter guidelines)
- Slide 2: Introduction & Epidemiology / Burden in India
- Slide 3: Etiology & Clinical Pathophysiology / Risk Factors
- Slide 4: Clinical Presentation & Diagnostic Evaluation / Algorithms
- Slide 5: Nursing Management & Evidence-Based Interventions
- Slide 6: Summary, Key Takeaways & Discussion Questions

For each slide, supply slide title, subtitle, 3-5 bullet points, a key clinical highlight/stat box, and comprehensive speaker notes for the presenter.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an academic nursing professor creating presentation decks. Return valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  calloutBox: { type: Type.STRING },
                  speakerNotes: { type: Type.STRING },
                },
                required: ["slideNumber", "title", "bullets", "speakerNotes"],
              },
            },
          },
          required: ["title", "slides"],
        },
      },
    });

    const presentation = JSON.parse(response.text || "{}");
    return res.json({ presentation });
  } catch (error: any) {
    console.error("Gemini presentation generator error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate presentation",
    });
  }
});

// Explain or generate flowcharts/diagrams for any uploaded topic
app.post("/api/gemini/analyze-topic", async (req, res) => {
  try {
    const { topicName, notes, rawData } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const prompt = `Analyze this nursing syllabus topic/excel data entry:
Topic: ${topicName}
Notes/Content: ${notes || "No additional notes provided"}
Data: ${rawData ? JSON.stringify(rawData) : "None"}

Generate:
1. Executive Clinical Summary (3-4 sentences)
2. Step-by-Step Clinical Algorithm / Flowchart Steps (5 to 8 sequential steps with decision branches)
3. Must-Know Nursing Interventions (Top 5 actions)
4. Red Flag Symptoms / Contraindications
5. Landmark Exam Question with Answer and Rationale`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a clinical nursing educator. Provide rigorous, practical guidance in JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            flowchartTitle: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  action: { type: Type.STRING },
                  decisionBranch: { type: Type.STRING },
                  priorityLevel: { type: Type.STRING },
                },
                required: ["stepNumber", "action"],
              },
            },
            nursingInterventions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            redFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sampleQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ["question", "answer", "rationale"],
            },
          },
          required: ["summary", "steps", "nursingInterventions", "redFlags"],
        },
      },
    });

    const analysis = JSON.parse(response.text || "{}");
    return res.json({ analysis });
  } catch (error: any) {
    console.error("Topic analysis error:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze topic",
    });
  }
});

// PDF & Document Analysis: Extract Structured Study Notes, Solved Answers, and Flashcards
app.post("/api/gemini/analyze-pdf", async (req, res) => {
  try {
    const {
      pdfBase64,
      mimeType = "application/pdf",
      textExtraction,
      fileName = "Nursing Document.pdf",
      mode = "study-notes",
      customQuery,
    } = req.body;

    const ai = getGenAI();

    // Mode-specific prompts
    let taskPrompt = "";
    if (mode === "exam-qa") {
      taskPrompt = `Extract and generate high-scoring, INC University & NCLEX examination questions and comprehensive model answers from this document:
1. Long Answer Question (10 Marks): Define condition, etiology, clinical features, and detailed 5-step nursing care plan with rationales.
2. Short Notes (5 Marks each, 3 questions): Focused pathological mechanisms, priority nursing interventions, and emergency drug protocols.
3. Very Short / Viva Questions (2 Marks each, 5 questions): Critical clinical definitions, normal lab thresholds, and antidote pearls.`;
    } else if (mode === "flashcards") {
      taskPrompt = `Convert this document into rapid-recall high-yield clinical flashcards:
Create 10 to 15 flashcards formatted with Question/Term on front and Crisp Answer/Normal Values/Priority Nursing Action on back. Focus on drug dosages, diagnostic criteria, vital signs red-flags, and clinical contraindications.`;
    } else if (mode === "algorithm") {
      taskPrompt = `Extract a sequential, decision-tree clinical algorithm from this document:
Provide step-by-step priority interventions from Initial Assessment -> Triage -> Emergency Bedside Actions -> Pharmacological Resuscitation -> Post-Procedure Monitoring.`;
    } else {
      // Default: Comprehensive Study Notes
      taskPrompt = `Analyze this clinical nursing document and create comprehensive, high-yield study notes for B.Sc & M.Sc Nursing students:
1. Document Overview & Key Competencies (INC Curriculum aligned)
2. Core Pathophysiology, Classifications, & Risk Factors
3. Diagnostic Workup & Lab Interpretation
4. Comprehensive Nursing Management (Independent Nursing Actions, Collaborative Interventions, Emergency Resuscitation)
5. Pharmacology & Drug Safety Pearls (Standard Doses, Dilutions, Antidotes, Nursing Considerations)
6. Clinical Red-Flag Warnings & Contraindications
7. High-Yield Exam Summary & Quick Mnemonics`;
    }

    if (customQuery) {
      taskPrompt += `\n\nSpecific Student Request: "${customQuery}". Address this thoroughly in the analysis.`;
    }

    if (ai && (pdfBase64 || textExtraction)) {
      const parts: any[] = [];

      if (pdfBase64) {
        // Strip data prefix if present (e.g. data:application/pdf;base64,...)
        const cleanedBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: mimeType || "application/pdf",
            data: cleanedBase64,
          },
        });
      } else if (textExtraction) {
        parts.push({
          text: `DOCUMENT CONTENT EXTRACTED FROM ${fileName}:\n\n${textExtraction}`,
        });
      }

      parts.push({
        text: `You are an expert Professor of Clinical Nursing (Indian Nursing Council & NCLEX specialist).
Target Document: "${fileName}"
Task: ${taskPrompt}

Format your response in crisp, highly readable markdown with bold headers, bullet points, callout boxes for "CLINICAL PEARL" and "EMERGENCY ALERT", and formatted tables where applicable.`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction:
            "You are an expert Nursing Education AI. You extract structured, high-yield study notes, model university exam answers, and clinical action plans from nursing textbooks and uploaded PDF documents.",
          temperature: 0.3,
        },
      });

      const generatedContent = response.text || "No notes generated from document.";
      return res.json({
        success: true,
        fileName,
        mode,
        notes: generatedContent,
        generatedAt: new Date().toISOString(),
      });
    }

    // High-yield fallback when offline or API key is not configured
    const mockNotes = generateOfflinePdfNotes(fileName, mode, textExtraction, customQuery);
    return res.json({
      success: true,
      fileName,
      mode,
      notes: mockNotes,
      offlineNotice: !ai
        ? "Generated with NurseSphere Built-in Clinical Knowledge Engine. Add GEMINI_API_KEY for live multi-modal Gemini PDF vision extraction."
        : undefined,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("PDF analysis error:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze PDF document",
    });
  }
});

function generateOfflinePdfNotes(fileName: string, mode: string, textSnippet?: string, customQuery?: string): string {
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  if (mode === "exam-qa") {
    return `# University Examination Model Q&A: ${cleanTitle}

## 1. Long Answer Question (10 Marks)
**Q: Define ${cleanTitle}. Explain its etiology, clinical manifestations, and outline the comprehensive Nursing Care Plan with rationales.**

### A. Definition & Epidemiology:
- **Definition**: A critical clinical condition characterized by deviation from physiological homeostasis, demanding rapid clinical assessment and systematic nursing intervention according to Indian Nursing Council (INC) competencies.
- **Incidence**: Significant contributor to clinical morbidity in secondary and tertiary healthcare facilities.

### B. Etiological Factors & Risk Assessment:
1. **Primary Causes**: Physiological decompensation, tissue trauma, or infectious pathways.
2. **Secondary Risk Factors**: Pre-existing medical comorbidities, delayed clinical presentation, and polypharmacy.

### C. Comprehensive Nursing Care Plan (5 Steps):
| Nursing Diagnosis | Goal | Nursing Interventions | Clinical Rationale | Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **Impaired Gas Exchange / Perfusion** secondary to altered physiology | Patient will maintain SpO2 >95% and stable vitals within 30 min | 1. Position in High-Fowler's / Left lateral tilt.\\n2. Administer high-flow humidified O2.\\n3. Establish 2 wide-bore IV lines (16/18G). | Maximizes diaphragmatic excursion and venous return; ensures rapid vascular access for resuscitation. | Patient vitals stabilized; SpO2 98% on room air. |
| **Risk for Fluid Imbalance & Hypovolemia** | Maintain MAP ≥65 mmHg and urine output ≥30 mL/hr | 1. Rapid infusion of warm crystalloids (Ringer's Lactate).\\n2. Insert Foley catheter with urometer.\\n3. Monitor Q15 min NIBP. | Prevents acute tubular necrosis and hypoperfusion of vital organ beds. | Hourly urine output 45 mL/hr; capillary refill <2 sec. |

---

## 2. Short Notes (5 Marks)
**Q1: Priority Nursing Interventions & "Golden Hour" Protocol**
- Immediate call for multidisciplinary assistance (Code Blue / Obstetric Emergency team).
- Continuous multi-parameter monitoring: Lead II ECG, continuous pulse oximetry, NIBP cycling every 5-15 min.
- Strict documentation of fluid intake and output on fluid balance charts.

**Q2: Emergency Pharmacotherapy & Nursing Considerations**
- Verify "Ten Rights of Medication Administration".
- Maintain emergency antidotes at bedside (e.g. Calcium Gluconate for MgSO4 toxicity, Naloxone for opioid depression).
- Never administer IV push without dilution and continuous cardiac monitoring when indicated.

---

## 3. High-Yield Viva / 2-Mark Definitions
1. **Normal MAP Calculation**: $\\text{MAP} = \\frac{\\text{SBP} + 2(\\text{DBP})}{3}$ (Normal: 70–105 mmHg).
2. **Minimum Adequate Renal Perfusion**: $0.5\\text{ mL/kg/hour}$ or $\\ge 30\\text{ mL/hour}$ in adults.
3. **Biomedical Waste Segregation**: Infectious tissues and placenta in **Yellow Bin**; sharps in **White Translucent Puncture-Proof Container**.`;
  }

  if (mode === "flashcards") {
    return `# High-Yield Clinical Flashcards: ${cleanTitle}

### Flashcard 1: Priority Assessment
- **Front**: What is the FIRST action when assessing acute clinical deterioration in ${cleanTitle}?
- **Back**: Verify ABCDE (Airway patency, Breathing/RR, Circulation/Pulse & BP, Disability/GCS, Exposure) and activate emergency response team.

### Flashcard 2: Critical Normal Thresholds
- **Front**: What are the target vital signs during acute resuscitation?
- **Back**: SpO2 ≥95%, SBP ≥90 mmHg, MAP ≥65 mmHg, Urine Output ≥30 mL/hr, Core Temp 36.5–37.5°C.

### Flashcard 3: Vascular Access Protocol
- **Front**: Which IV cannula gauge is prioritized for rapid fluid resuscitation?
- **Back**: 16 Gauge (Grey) or 18 Gauge (Green) in large peripheral veins (antecubital fossa).

### Flashcard 4: Emergency Medication Safeguard
- **Front**: What three bedside checks are mandatory before repeating an IV emergency dose?
- **Back**: 1. Respiratory rate (>12/min), 2. Presence of deep tendon reflexes (patellar), 3. Urine output (>30 mL/hr over previous 4 hours).

### Flashcard 5: Clinical Mnemonic
- **Front**: What mnemonic summarizes the key nursing priorities?
- **Back**: **S.T.A.B.L.E** (Sugar/Metabolism, Temperature, Airway, Blood Pressure, Lab investigations, Emotional support).`;
  }

  // Default: Comprehensive Study Notes
  return `# Comprehensive Clinical Study Notes: ${cleanTitle}

> **Document Summary**: Extracted from *"${fileName}"* for clinical nursing students and examination candidates. ${customQuery ? `\n> **Focus**: *"${customQuery}"*` : ""}

---

## 1. Core Clinical Overview & Definitions
- **Key Concept**: ${cleanTitle} represents a fundamental clinical competency requiring rapid triage, systematic head-to-toe nursing assessment, and evidence-based interventions according to Indian Nursing Council (INC) and WHO protocols.
- **Pathophysiological Cascade**: Early cellular hypoxia leads to microvascular dysfunction, inflammatory mediator release, and systemic decompensation if not interrupted within the golden hour.

---

## 2. Priority Nursing Management Algorithm
1. **Step 1: Rapid Clinical Triage (0-5 min)**
   - Position patient appropriately (Left lateral tilt or Semi-Fowler's depending on etiology).
   - Administer high-flow supplemental oxygen via non-rebreather mask (10-15 L/min) to maintain SpO2 >95%.
2. **Step 2: Hemodynamic & Vascular Stabilization (5-15 min)**
   - Establish two wide-bore peripheral IV lines (16G or 18G).
   - Draw emergency blood samples (CBC, Blood Grouping & Cross-match, Electrolytes, Coagulation profile).
   - Initiate warm crystalloid bolus (Ringer's Lactate / Normal Saline) as ordered.
3. **Step 3: Pharmacological Management & Monitoring (15-30 min)**
   - Administer prescribed primary therapeutics under continuous hemodynamic monitoring.
   - Insert indwelling urinary catheter connected to an hourly urometer.
4. **Step 4: Continuous Evaluation & Interdisciplinary Handover (30-60 min)**
   - Re-evaluate GCS, pupillary reflexes, and capillary refill time every 15 minutes.
   - Maintain SBAR (Situation, Background, Assessment, Recommendation) structured communication.

---

## 3. Emergency Pharmacotherapy & Nursing Pearls
| Medication | Standard Dosage | Route | Primary Action | Critical Precaution & Antidote |
| :--- | :--- | :--- | :--- | :--- |
| **Ringer's Lactate** | 500–1000 mL bolus | IV Rapid Infusion | Volume replacement & electrolyte balance | Warm fluids to prevent hypothermia; assess for pulmonary edema |
| **Emergency First-Line** | Standard clinical protocol dose | IV / IM | Restores hemodynamic / muscular tone | Continuous Lead II ECG and BP monitoring |
| **Emergency Antidote** | 10 mL of 10% solution | Slow IV (over 10 min) | Reverses pharmacological toxicity | Keep bedside emergency tray stocked and verified |

---

## 4. Red-Flag Warnings (Immediate Preceptor Alert)
- ⚠️ Sudden drop in Mean Arterial Pressure (MAP <65 mmHg)
- ⚠️ Oliguria (<30 mL/hr for two consecutive hours)
- ⚠️ Tachypnea (Respiratory Rate >28/min) or Bradypnea (<10/min)
- ⚠️ Altered mental status, sudden confusion, or loss of deep tendon reflexes

---

## 5. Clinical Exam Viva Pearls
- **Sponge & Instrument Count**: Must be verified 3 times (Before incision, Before cavity closure, After skin closure).
- **Communication Protocol**: Always utilize closed-loop communication in emergency resuscitation suites.`;
}

async function startServer() {
  // Static assets routes
  app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));
  app.use("/src/assets", express.static(path.join(process.cwd(), "src", "assets")));
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NurseSphere server running on http://localhost:${PORT}`);
  });
}

startServer();
