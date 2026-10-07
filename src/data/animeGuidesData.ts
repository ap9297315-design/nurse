export interface AnimeGuide {
  id: 'doraemon' | 'nobita' | 'shizuka' | 'shinchan';
  name: string;
  role: string;
  tagline: string;
  avatar: string;
  badgeColor: string;
  primaryTips: {
    context: 'ot' | 'quiz' | 'syllabus' | 'games' | 'general';
    dialogue: string;
    mnemonic?: string;
  }[];
}

export const CLINICAL_IMAGE_ASSETS = {
  squadBanner: '/assets/images/anime_nursing_squad_1789184687758.jpg',
  virtualOtSuite: '/assets/images/virtual_ot_suite_1789184703233.jpg',
  neonatalCareNrp: '/assets/images/neonatal_care_nrp_1789184716414.jpg',
  pphDiagram: '/assets/images/pph_clinical_diagram_1789184728761.jpg',
  biomedicalWasteBins: '/assets/images/biomedical_waste_bins_1789184741057.jpg',
  doraemonAvatar: '/assets/images/doraemon_guide_avatar_1789184754452.jpg',
  shinchanAvatar: '/assets/images/shinchan_guide_avatar_1789184768138.jpg',
  shizukaAvatar: '/assets/images/shizuka_guide_avatar_1789184779447.jpg',
  nobitaAvatar: '/assets/images/nobita_guide_avatar_1789184793633.jpg',
};

export const ANIME_STUDY_GUIDES: AnimeGuide[] = [
  {
    id: 'doraemon',
    name: 'Doraemon',
    role: 'Gadget Nurse & 4D Clinical Pocket Preceptor',
    tagline: 'Take out the "Memory Bread" for pharmacologic dosages and the "Anywhere Door" into the OT!',
    avatar: CLINICAL_IMAGE_ASSETS.doraemonAvatar,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    primaryTips: [
      {
        context: 'general',
        dialogue:
          'Kon’nichiwa future Sister In-Charge! In my 4D medical pouch, I keep the WHO Safe Childbirth Checklist and emergency calcium gluconate for magnesium toxicity. Always verify patient identity before administering any uterotonic!',
        mnemonic: 'Doraemon’s Golden Rule: Check the 5 Rights of Drug Administration before every push!',
      },
      {
        context: 'ot',
        dialogue:
          'Attention in the OT! The surgical count must be verified twice—before peritoneum closure and before skin closure. Keep the Mayo stand sterile and check the Green Armytage clamps!',
        mnemonic: 'Instrument Count: Sponges, needles, and instruments tallied by circulating nurse & scrub nurse!',
      },
      {
        context: 'quiz',
        dialogue:
          'When reading NCLEX vignette questions, eliminate options that delay treatment or lack priority! Airway and breathing always come before documentation.',
        mnemonic: 'ABC First: Airway -> Breathing -> Circulation, always!',
      },
      {
        context: 'syllabus',
        dialogue:
          'Mastering DC Dutta Obstetrics requires visualizing labor stages. Stage 1 is cervical dilation (0-10cm), Stage 2 is expulsion, Stage 3 is placental delivery, and Stage 4 is the crucial 1-hour observation for PPH!',
      },
    ],
  },
  {
    id: 'nobita',
    name: 'Nobita Nobi',
    role: 'Diligent Student Intern & Stress-Free Study Buddy',
    tagline: 'If I can pass the High-Risk Pregnancy viva with Doremon’s help, you will definitely top your university exam!',
    avatar: CLINICAL_IMAGE_ASSETS.nobitaAvatar,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    primaryTips: [
      {
        context: 'general',
        dialogue:
          'I used to panic during clinical postings when the telemetry monitor started beeping! But Shizuka taught me to look at the patient first, not just the monitor. Check pulse, breathing, and skin color!',
        mnemonic: 'Treat the patient, not just the alarm monitor!',
      },
      {
        context: 'ot',
        dialogue:
          'Whew, in the Virtual OT, remember to hold the Scalpel #20 with a pencil grip or fiddle-bow grip, not like a dagger! And never touch anything unsterile once you scrub in!',
        mnemonic: 'Hands up between nipple and waistline to maintain sterile field!',
      },
      {
        context: 'games',
        dialogue:
          'In the IV Drip Sprint, the formula is: (Total Volume in mL × Drop Factor) ÷ (Time in Minutes). For microdrip sets, 1 mL = 60 drops. Don’t rush like I do on math tests!',
      },
      {
        context: 'quiz',
        dialogue:
          'For eclampsia questions: If knee-jerk reflex is absent, STOP the Magnesium Sulfate immediately and give 10% Calcium Gluconate IV slowly over 10 mins!',
      },
    ],
  },
  {
    id: 'shizuka',
    name: 'Shizuka Minamoto',
    role: 'Gold-Medalist Head Nurse & Empathy Mentor',
    tagline: 'Compassion, strict surgical asepsis, and respectful maternal care make a truly exemplary nurse.',
    avatar: CLINICAL_IMAGE_ASSETS.shizukaAvatar,
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    primaryTips: [
      {
        context: 'general',
        dialogue:
          'Remember the emotional well-being of our patients. During painful labor or high-risk newborn care, therapeutic touch, soothing voice, and respectful maternity care significantly lower maternal cortisol and distress.',
        mnemonic: 'RMC: Respectful Maternity Care is every mother’s fundamental right.',
      },
      {
        context: 'ot',
        dialogue:
          'Surgical scrub must strictly follow the Ayliffe 6-step technique for 3 to 5 minutes from fingernails up to elbows. Keep hands elevated above elbows so water drips away from clean hands!',
        mnemonic: 'Elbows lower than hands at all times in scrub area!',
      },
      {
        context: 'syllabus',
        dialogue:
          'In Neonatal Care (Ghai Pediatrics), Kangaroo Mother Care (KMC) has 3 components: continuous Skin-to-Skin contact, exclusive breastfeeding, and early discharge with close follow-up. It prevents hypothermia and promotes brain growth!',
      },
      {
        context: 'quiz',
        dialogue:
          'Always look for cardinal danger signs in pediatric cases: unable to drink/breastfeed, vomiting everything, convulsions, or lethargy/unconsciousness (IMNCI pink row)!',
      },
    ],
  },
  {
    id: 'shinchan',
    name: 'Shinchan (Shinnosuke)',
    role: 'Action Kamen Mnemonic Master & Energy Booster',
    tagline: 'Ohohoho! Action Kamen says: Never forget the 4 Ts of PPH or I’ll do my funny dance in the ward!',
    avatar: CLINICAL_IMAGE_ASSETS.shinchanAvatar,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    primaryTips: [
      {
        context: 'general',
        dialogue:
          'Hey there gorgeous Sister! Tired of cramming? Time for an Action Bastard boost! Remember: Yellow bin = Anatomy and placenta, Red bin = Rubber tubings and catheters. Don’t mix them or Matron will scold you!',
        mnemonic: 'Yellow = Yummy biological organs/placenta; Red = Rubber & plastic recycling!',
      },
      {
        context: 'ot',
        dialogue:
          'Oho! In the OT, when the uterus is bleeding like a sprinkler, don’t faint! Remember the 4 Ts: Tone, Trauma, Tissue, and Thrombin! Squeeze that fundus like you mean it!',
        mnemonic: 'The 4 Ts: Tone (70%), Trauma (20%), Tissue (10%), Thrombin (1%)!',
      },
      {
        context: 'games',
        dialogue:
          'In START Triage: Can they walk? Yes -> Green (Walking wounded)! Can’t breathe after opening airway? -> Black (Morgue)! Resp rate > 30 or no radial pulse? -> Red (Immediate)! Easy peasy!',
        mnemonic: 'RPM: Respiration (>30), Perfusion (Cap refill >2s), Mental status (Cannot follow commands) = RED!',
      },
      {
        context: 'quiz',
        dialogue:
          'For APGAR score: Appearance (Pink vs Blue), Pulse (0 vs <100 vs >100), Grimace (Cry), Activity (Tone), Respiration (Vigorous cry). 7 to 10 is super baby!',
      },
    ],
  },
];
