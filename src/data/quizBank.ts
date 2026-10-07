import { QuizQuestion } from '../types';

export const COMPREHENSIVE_QUIZ_BANK: QuizQuestion[] = [
  // Midwifery & OBG-II
  {
    id: 'q-obg-1',
    subjectId: 'midwifery-2',
    unitId: 'obg-unit-2',
    topic: 'Postpartum Hemorrhage',
    question:
      'A 28-year-old multigravida delivers a 4.1 kg infant vaginally. Five minutes later, the nurse notes persistent heavy trickle of dark blood and palpates a soft, boggy fundus 3 cm above the umbilicus. What is the priority initial nursing action?',
    options: [
      'Perform vigorous fundal massage and express accumulated blood clots',
      'Administer 0.2 mg Methylergometrine IV push immediately',
      'Prepare patient for emergency uterine artery embolization',
      'Place patient in Trendelenburg position and apply ice pack to perineum',
    ],
    correctIndex: 0,
    rationale:
      'Uterine atony is responsible for >70% of primary PPH cases. Immediate fundal massage stimulates myometrial smooth muscle contraction, compressing open spiral arterioles at the placental bed. Methylergometrine should NEVER be administered via IV push due to high risk of hypertensive crisis and stroke.',
    clinicalTip: 'Never leave the patient; call for help while actively maintaining uterine massage.',
    reference: 'DC Dutta Textbook of Obstetrics, 9th Edition; WHO PPH Guidelines',
    difficulty: 'NCLEX',
  },
  {
    id: 'q-obg-2',
    subjectId: 'midwifery-2',
    unitId: 'obg-unit-1',
    topic: 'Pre-Eclampsia & Magnesium Sulfate',
    question:
      'A client with severe pre-eclampsia is receiving a continuous intravenous infusion of Magnesium Sulfate. During hourly clinical assessment, the nurse notes: Patellar reflex is absent (+0), Respiratory Rate is 10 breaths/min, and Urine Output was 22 mL in the last hour. What is the immediate nursing priority?',
    options: [
      'Stop the Magnesium Sulfate infusion immediately and notify the physician',
      'Increase the IV fluid rate to flush the kidneys',
      'Administer Naloxone 0.4 mg IV to reverse respiratory depression',
      'Recheck the deep tendon reflexes in 30 minutes before taking action',
    ],
    correctIndex: 0,
    rationale:
      'The client is manifesting classic signs of acute Magnesium Sulfate hypermagnesemia toxicity (loss of patellar reflexes, bradypnea <12/min, and oliguria <30 mL/hr). The nurse must immediately stop the infusion to prevent cardiac arrest and prepare 10% Calcium Gluconate (10 mL IV over 10 minutes) as the specific antidote.',
    clinicalTip: 'Calcium Gluconate must always remain at the bedside of any patient receiving Magnesium Sulfate.',
    reference: 'DC Dutta Obstetrics Ch. 17; High-Risk Maternity Nursing',
    difficulty: 'Hard',
  },
  {
    id: 'q-obg-3',
    subjectId: 'midwifery-2',
    unitId: 'obg-unit-2',
    topic: 'Obstetric Emergencies - Cord Prolapse',
    question:
      'During labor, a patient with spontaneous rupture of membranes suddenly exhibits prolonged fetal bradycardia (FHR 70 bpm). On sterile vaginal examination, the nurse visualizes and palpates a pulsating loop of umbilical cord in the vagina. What is the critical immediate nursing intervention?',
    options: [
      'Use a sterile gloved hand to push the presenting fetal part up and off the umbilical cord, maintaining upward pressure',
      'Attempt to push the protruding umbilical cord back into the uterine cavity',
      'Place the patient in reverse Trendelenburg position to hasten delivery',
      'Administer 20 units of Oxytocin IV to accelerate vaginal birth',
    ],
    correctIndex: 0,
    rationale:
      'Umbilical cord prolapse causes acute compression of fetal vessels between the presenting part and the maternal pelvis, leading to rapid fetal asphyxia. The nurse must immediately insert two gloved fingers into the vagina to elevate the presenting part off the cord and maintain this manual elevation until the infant is delivered via emergency Caesarean section. Never attempt to replace the cord back inside the uterus as this induces vasospasm.',
    clinicalTip: 'Position the mother in knee-chest or exaggerated Trendelenburg position to allow gravity to pull the fetus away from the pelvic inlet.',
    reference: 'WHO Midwifery Care; DC Dutta Obstetrics Ch. 26',
    difficulty: 'NCLEX',
  },
  {
    id: 'q-obg-4',
    subjectId: 'midwifery-2',
    unitId: 'obg-unit-2',
    topic: 'Active Management of Third Stage (AMTSL)',
    question:
      'Which sequence accurately represents the three evidence-based components of Active Management of the Third Stage of Labor (AMTSL) recommended by WHO to prevent PPH?',
    options: [
      'Administration of 10 IU Oxytocin IM with delivery of anterior shoulder, Controlled Cord Traction (CCT) with counter-traction, and immediate fundal massage',
      'Manual removal of placenta, IV ergometrine bolus, and ice pack application',
      'Early clamping of cord within 5 seconds, pulling the cord vigorously, and uterine compression',
      'Waiting 30 minutes for spontaneous expulsion, followed by high-dose Misoprostol',
    ],
    correctIndex: 0,
    rationale:
      'AMTSL comprises: 1. Uterotonic administration (10 IU Oxytocin IM preferred) within 1 minute of birth; 2. Controlled Cord Traction (Brandt-Andrews technique) with concurrent suprapubic counter-traction to deliver the detached placenta; 3. Uterine fundal massage immediately after delivery of placenta and every 15 minutes for 2 hours.',
    clinicalTip: 'AMTSL reduces the incidence of primary PPH by approximately 60%.',
    reference: 'WHO Recommendations on Prevention of Postpartum Hemorrhage',
    difficulty: 'Medium',
  },
  {
    id: 'q-obg-5',
    subjectId: 'midwifery-2',
    unitId: 'obg-unit-4',
    topic: 'High-Risk Newborn & KMC',
    question:
      'A low birth weight neonate weighing 1700 grams is admitted to the Special Newborn Care Unit (SNCU). Which of the following is a mandatory component of Kangaroo Mother Care (KMC)?',
    options: [
      'Continuous skin-to-skin contact in an upright prone "frog position" between maternal breasts, paired with exclusive breastfeeding',
      'Keeping the infant separated under an open phototherapy unit for 24 hours',
      'Swaddling the infant in heavy woolen blankets inside an incubator',
      'Restricting parental handling to avoid neonatal bacterial colonization',
    ],
    correctIndex: 0,
    rationale:
      'KMC has two key core components: Kangaroo Position (continuous skin-to-skin contact on mother’s bare chest in a vertical prone frog position, head turned to one side to maintain airway) and Kangaroo Nutrition (exclusive breastfeeding/EBM). KMC stabilizes thermal regulation, reduces sepsis, and promotes weight gain.',
    clinicalTip: 'KMC should be given for at least 1 hour per session to avoid disrupting infant sleep cycles.',
    reference: 'AIIMS Protocols in Neonatology; Ghai Pediatrics',
    difficulty: 'Medium',
  },

  // Child Health Nursing - II
  {
    id: 'q-ped-1',
    subjectId: 'child-health-2',
    unitId: 'ped-unit-1',
    topic: 'Tetralogy of Fallot',
    question:
      'A 14-month-old infant with Tetralogy of Fallot (TOF) begins to cry vigorously during venous blood sampling and suddenly turns deeply cyanotic, limp, and tachypneic. The nurse recognizes this as a hypercyanotic "Tet" spell. What is the immediate first action?',
    options: [
      'Place the infant in the Knee-Chest position immediately and administer 100% blow-by oxygen',
      'Administer oral digitalis elixir and place the child flat on the back',
      'Begin chest compressions at a rate of 100 beats/minute',
      'Insert a nasogastric tube and instill warm electrolyte solution',
    ],
    correctIndex: 0,
    rationale:
      'The knee-chest position bends the infant’s femoral arteries, acutely increasing systemic vascular resistance (SVR). Increased SVR reduces the right-to-left shunt through the VSD, forcing more deoxygenated blood through the stenotic pulmonary outflow tract to the lungs for oxygenation. Calming the infant and delivering 100% O2 are concurrent priorities.',
    clinicalTip: 'Older children with uncorrected TOF instinctively squat during play to achieve the same hemodynamic SVR increase.',
    reference: "Ghai's Essentials of Paediatrics Ch. 14; Wong's Nursing Care of Children",
    difficulty: 'NCLEX',
  },
  {
    id: 'q-ped-2',
    subjectId: 'child-health-2',
    unitId: 'ped-unit-1',
    topic: 'Pyloric Stenosis',
    question:
      'A 4-week-old male infant is brought to the pediatric OPD with non-bilious, forceful projectile vomiting occurring immediately after every feed. On abdominal palpation, the nurse detects a firm, movable, olive-shaped mass in the epigastrium. Which metabolic disturbance is most commonly associated with this condition?',
    options: [
      'Hypochloremic, hypokalemic metabolic alkalosis',
      'Hyperchloremic metabolic acidosis',
      'Respiratory acidosis with hyperkalemia',
      'Normochloremic metabolic acidosis',
    ],
    correctIndex: 0,
    rationale:
      'Infantile Hypertrophic Pyloric Stenosis (IHPS) causes persistent loss of gastric hydrochloric acid (HCl) through repetitive non-bilious projectile vomiting. This results in hypochloremia and metabolic alkalosis. As the kidneys attempt to preserve intravascular volume and sodium, they excrete potassium and hydrogen ions in urine (paradoxical aciduria), producing secondary hypokalemia.',
    clinicalTip: 'Electrolyte imbalance must be surgically corrected with IV fluids prior to performing Ramstedt pyloromyotomy.',
    reference: "Ghai's Essentials of Paediatrics Ch. 13",
    difficulty: 'Hard',
  },
  {
    id: 'q-ped-3',
    subjectId: 'child-health-2',
    unitId: 'ped-unit-1',
    topic: 'Hydrocephalus & VP Shunt',
    question:
      'A 3-month-old infant with hydrocephalus has undergone Ventriculoperitoneal (VP) shunt placement 2 days ago. Which clinical observation is the most critical early sign of shunt malfunction or increased intracranial pressure (ICP)?',
    options: [
      'High-pitched shrill cry, bulging tense fontanelle, and projectile vomiting',
      'Decreased head circumference by 2 cm',
      'Mild erythema at the abdominal surgical dressing',
      'Passing two soft golden yellow stools in 24 hours',
    ],
    correctIndex: 0,
    rationale:
      'In infants with unfused cranial sutures, signs of elevated ICP and VP shunt blockage include a tense, bulging anterior fontanelle, high-pitched shrill neuro-cry, vomiting, irritability, and the classic "sun-setting eyes" sign (sclera visible above the iris).',
    clinicalTip: 'Position the post-op infant on the non-operative side to prevent pressure necrosis on the shunt valve mechanism.',
    reference: "Wong's Nursing Care of Infants and Children",
    difficulty: 'Medium',
  },

  // Community Health Nursing - II
  {
    id: 'q-chn-1',
    subjectId: 'community-health-2',
    unitId: 'chn-unit-4',
    topic: 'Bio-Medical Waste Management',
    question:
      'According to the Bio-Medical Waste Management Rules (2016/2018), into which color-coded container must a human placenta, blood-soaked laparotomy sponges, and amputated tissue be discarded?',
    options: [
      'YELLOW non-chlorinated plastic bag for incineration or plasma pyrolysis',
      'RED bag for autoclaving and recycling',
      'BLUE cardboard container for chemical disinfection',
      'BLACK bin for municipal solid waste disposal',
    ],
    correctIndex: 0,
    rationale:
      'YELLOW containers are dedicated exclusively to human anatomical waste (placenta, tissues, limbs), animal anatomical waste, soiled waste (gauze, swabs soaked with blood/body fluids), expired cytotoxic drugs, and contaminated linen. These undergo thermal incineration or plasma pyrolysis.',
    clinicalTip: 'Plastic IV tubing, catheter bags, and syringes without needles go into RED; needles and blades go into WHITE puncture-proof containers.',
    reference: 'MoEFCC BMW Rules 2016/2018; Park PSM 26th Ed.',
    difficulty: 'Medium',
  },
  {
    id: 'q-chn-2',
    subjectId: 'community-health-2',
    unitId: 'chn-unit-4',
    topic: 'Disaster Triage - START System',
    question:
      'During a train collision disaster mass casualty incident, a community health nurse performs triage using the START protocol. A patient is found unconscious, with spontaneous respiration at 38 breaths/min and absent radial pulse with capillary refill > 3 seconds. Which triage color tag must be applied?',
    options: [
      'RED Tag (Immediate / Priority 1)',
      'YELLOW Tag (Delayed / Priority 2)',
      'GREEN Tag (Minor / Walking Wounded)',
      'BLACK Tag (Expectant / Deceased)',
    ],
    correctIndex: 0,
    rationale:
      'In START triage (Simple Triage and Rapid Treatment), any patient with abnormal respirations (> 30 breaths/min), absent radial pulse/capillary refill > 2 sec, or inability to follow simple commands is categorized as RED (Immediate priority, requiring life-saving emergency stabilization within 1 hour).',
    clinicalTip: 'Black is reserved for patients who do not breathe even after opening the airway.',
    reference: "Park's Textbook of Preventive and Social Medicine Ch. 20",
    difficulty: 'NCLEX',
  },

  // Nursing Research & Statistics
  {
    id: 'q-res-1',
    subjectId: 'nursing-research',
    unitId: 'res-unit-1',
    topic: 'Evidence-Based Practice & PICO',
    question:
      'A clinical research nurse is designing a study to assess whether chlorhexidine skin antisepsis reduces central line-associated bloodstream infections (CLABSI) compared to povidone-iodine in ICU patients. In the PICO framework, what represents the "C" component?',
    options: [
      'Povidone-iodine skin antisepsis (Comparison/Control intervention)',
      'Intensive care unit patients (Population)',
      'Chlorhexidine application (Intervention)',
      'Reduction in CLABSI rate (Outcome)',
    ],
    correctIndex: 0,
    rationale:
      'In PICO: P = Population (ICU patients with central lines), I = Intervention of interest (Chlorhexidine antisepsis), C = Comparison or control intervention (Povidone-iodine), O = Clinical outcome (Incidence of CLABSI).',
    clinicalTip: 'PICO format ensures sharp, answerable research questions and guides precise keyword searches in databases like CINAHL.',
    reference: 'Polit & Beck Nursing Research: Principles and Methods, 11th Edition',
    difficulty: 'Easy',
  },
  {
    id: 'q-res-2',
    subjectId: 'nursing-research',
    unitId: 'res-unit-3',
    topic: 'Sampling & Validity',
    question:
      'A nurse researcher tests a new 20-item clinical comfort questionnaire on 30 post-operative cardiac surgery patients and calculates a Cronbach’s alpha coefficient of 0.86. What does this statistical result indicate regarding the measurement tool?',
    options: [
      'The instrument demonstrates high internal consistency reliability',
      'The instrument has proven criterion construct validity',
      'The null hypothesis must be rejected at the 0.05 level',
      'The sample size was statistically insufficient for descriptive analysis',
    ],
    correctIndex: 0,
    rationale:
      'Cronbach’s alpha measures the internal consistency reliability of multi-item psychometric scales, reflecting how closely related a set of items are as a group. A value ≥ 0.70 is universally accepted as indicating adequate reliability; 0.86 reflects high internal consistency.',
    clinicalTip: 'Reliability reflects precision and consistency; validity reflects whether the instrument actually measures what it claims to measure.',
    reference: 'Polit & Beck Ch. 14; Mahajan Biostatistics',
    difficulty: 'Medium',
  },
  {
    id: 'q-res-3',
    subjectId: 'nursing-research',
    unitId: 'res-unit-4',
    topic: 'Biostatistics - Normal Distribution',
    question:
      'In a research study evaluating blood pressure in 500 healthy adult volunteers, systolic blood pressure follows a normal (Gaussian) distribution with a Mean of 120 mmHg and Standard Deviation (SD) of 10 mmHg. Approximately what percentage of the sample will have a systolic BP between 110 mmHg and 130 mmHg?',
    options: [
      'Approximately 68.2%',
      'Approximately 95.4%',
      'Approximately 99.7%',
      'Approximately 50.0%',
    ],
    correctIndex: 0,
    rationale:
      'According to the empirical rule of the Normal Probability Curve: Mean ± 1 SD encloses approximately 68.2% of all observations; Mean ± 2 SD encloses 95.4%; and Mean ± 3 SD encloses 99.7%. Here, 110 to 130 mmHg corresponds to 120 ± 10 (Mean ± 1 SD).',
    clinicalTip: 'The Normal Distribution is symmetrical, bell-shaped, and unimodal with Mean = Median = Mode.',
    reference: 'Mahajan Methods in Biostatistics; Polit & Beck Ch. 18',
    difficulty: 'Hard',
  },
];
