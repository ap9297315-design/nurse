export type ThemeMode = 'clinical' | 'night' | 'surgical' | 'warm';

export type ActiveTab =
  | 'syllabus'
  | 'textbook'
  | 'virtual-ot'
  | 'games'
  | 'quiz'
  | 'diagrams-excel'
  | 'presentation'
  | 'pdf-notes'
  | 'anime-squad'
  | 'owner';

export interface OwnerSettings {
  portalTitle: string;
  portalSubtitle: string;
  announcementBanner: string;
  isAnnouncementActive: boolean;
  instituteName: string;
  contactEmail: string;
  allowGuestSubmissions: boolean;
  showAnimeSquad: boolean;
  customLogoText: string;
  ownerPin: string;
}

export interface PdfDocumentNote {
  id: string;
  fileName: string;
  fileSize?: string;
  mode: 'study-notes' | 'exam-qa' | 'flashcards' | 'algorithm' | 'custom';
  content: string;
  summary?: string;
  createdAt: string;
  tags: string[];
}

export interface Competency {
  id: string;
  text: string;
  completed?: boolean;
}

export interface SyllabusUnit {
  id: string;
  unitNumber: string;
  title: string;
  theoryHours: number;
  practicalHours?: number;
  learningOutcomes: string[];
  contentOutline: string[];
  teachingActivities: string[];
  assessmentMethods: string[];
  keyTextbookReferences: string[];
}

export interface SyllabusSubject {
  id: string;
  title: string;
  code: string;
  semester: string;
  credits: {
    theory: number;
    practicalLab?: number;
    clinical?: number;
  };
  totalHours: {
    theory: number;
    lab?: number;
    clinical?: number;
  };
  description: string;
  competencies: Competency[];
  units: SyllabusUnit[];
  clinicalRequirements?: string[];
  textbooks: string[];
}

export interface NursingCarePlan {
  nursingDiagnosis: string;
  goals: string[];
  interventions: {
    action: string;
    rationale: string;
    priority: 'High' | 'Medium' | 'Collaborative';
  }[];
  evaluation: string;
}

export interface TextbookChapter {
  id: string;
  subjectId: string;
  unitId: string;
  title: string;
  subtitle: string;
  authorReference: string;
  definition: string;
  etiologyAndRiskFactors: string[];
  pathophysiology: string;
  clinicalManifestations: string[];
  diagnosticEvaluation: string[];
  medicalManagement: string[];
  surgicalInterventions?: string[];
  nursingCarePlan: NursingCarePlan;
  emergencyDrugs?: {
    name: string;
    dose: string;
    route: string;
    action: string;
    criticalPrecautions: string;
    antidote?: string;
  }[];
  clinicalPearls: string[];
  flowchartRefId?: string;
}

export interface QuizQuestion {
  id: string;
  subjectId?: string;
  unitId?: string;
  topic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  clinicalTip?: string;
  reference?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'NCLEX';
}

export interface OTInstrument {
  id: string;
  name: string;
  category: 'Cutting' | 'Grasping' | 'Retracting' | 'Suction/Clamping' | 'Suturing';
  description: string;
  clinicalUse: string;
  iconName: string;
}

export interface OTSurgicalStep {
  stepIndex: number;
  title: string;
  instruction: string;
  requiredInstrumentId: string;
  targetArea: string; // e.g. 'incision-line', 'uterine-wall', 'infant-mouth', 'cord', 'perineum'
  clinicalTip: string;
  correctChoiceText: string;
  distractorChoices: string[];
  vitalsImpact?: {
    hrDelta?: number;
    bpDelta?: string;
    spo2Delta?: number;
  };
  complicationRisk?: string;
}

export interface OTProcedure {
  id: string;
  title: string;
  category: 'Obstetrics' | 'Emergency' | 'Labor Room' | 'Neonatal Care';
  durationMinutes: number;
  indication: string;
  patientProfile: {
    name: string;
    age: number;
    gravidaPara: string;
    gestationalAge: string;
    initialVitals: {
      hr: number;
      bp: string;
      spo2: number;
      fhr?: number; // Fetal heart rate
      temp: string;
    };
  };
  availableInstruments: string[];
  steps: OTSurgicalStep[];
  criticalComplications: {
    triggerAtStep: number;
    alertTitle: string;
    description: string;
    immediateAction: string;
  }[];
}

export interface FlowchartStep {
  id: string;
  title: string;
  description: string;
  actionRequired: string;
  branchOptions?: {
    condition: string;
    nextStepTitle: string;
  }[];
  criticalNote?: string;
}

export interface ClinicalAlgorithm {
  id: string;
  title: string;
  subject: string;
  sourceGuideline: string;
  category: string;
  summary: string;
  steps: FlowchartStep[];
  diagramSvgType: 'pph' | 'nrp' | 'apgar' | 'research' | 'imnci' | 'waste' | 'uip' | 'amtsl';
}

export interface UploadedTopicRow {
  id: string;
  topicName: string;
  subject?: string;
  unit?: string;
  notes?: string;
  answers?: string;
  keyPoints?: string[];
  diagramType?: string;
  parsedDate: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp?: string;
}

export type Slide = SlideData;

export interface SlideData {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  contentBullets?: string[];
  calloutBox?: string;
  speakerNotes: string;
  diagramType?: string;
}

export interface PresentationDeck {
  id: string;
  title?: string;
  subtitle?: string;
  subject?: string;
  topic?: string;
  targetAudience?: string;
  estimatedMinutes?: number;
  slides: SlideData[];
  createdAt?: string;
}
