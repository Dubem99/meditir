// Generated from official NHIA Professional FFS price list (April 2025 rates)
// Source: https://www.nhia.gov.ng/professional-ffs-price-list/
// Codes use the NHIS- prefix (legacy from pre-2022 scheme name).

export interface NhiaTariffEntry {
  code: string;
  description: string;
  tariffNgn: number | null;
  section: string;
}

// Section codes (middle three digits of NHIS-XXX-XXX):
//   010 = Consultations
//   021-023 = ENT
//   030-033 = Obstetrics & Gynaecology
//   040 = Dermatology
//   051-054 = Orthopaedics
//   061-063 = General Surgery
//   071 = Gynaecological surgery
//   081-093 = Eye care
//   101 = Psychiatry
//   111-112 = Anaesthesia / GI
//   121 = Dental
//   131-134 = Internal Medicine
//   140 = Endo procedures
//   151-153 = Neurosurgery
//   171-177 = Plain X-rays
//   178-179 = Cross-sectional imaging & Ultrasound
//   180-181 = Laboratory tests

export const NHIA_TARIFF_FULL: ReadonlyArray<NhiaTariffEntry> = [
  {
    "code": "NHIS-101-001",
    "description": "Electroconvulsive Therapy (Course of 6 sessions) Price per session",
    "tariffNgn": 5000,
    "section": "101"
  },
  {
    "code": "NHIS-101-002",
    "description": "Electro-Narcosis (Course of 10 sessions) per session",
    "tariffNgn": 5000,
    "section": "101"
  },
  {
    "code": "NHIS-101-003",
    "description": "Abreaction (Diagnostic and Forensic)",
    "tariffNgn": 4000,
    "section": "101"
  },
  {
    "code": "NHIS-101-004",
    "description": "Comprehensive Psychiatric Assessment",
    "tariffNgn": 5000,
    "section": "101"
  },
  {
    "code": "NHIS-101-005",
    "description": "Psychometric Assessment, Scoring & Interpretation",
    "tariffNgn": 4000,
    "section": "101"
  },
  {
    "code": "NHIS-101-006",
    "description": "Psychotherapies (Brief and others - Max: 10 sessions)",
    "tariffNgn": 4000,
    "section": "101"
  },
  {
    "code": "NHIS-101-007",
    "description": "Behaviour Modifications",
    "tariffNgn": 4000,
    "section": "101"
  },
  {
    "code": "NHIS-101-008",
    "description": "Sleep (REM) Deprivation Therapy",
    "tariffNgn": 5000,
    "section": "101"
  },
  {
    "code": "NHIS-101-009",
    "description": "Electroencephalography",
    "tariffNgn": 15000,
    "section": "101"
  },
  {
    "code": "NHIS-111-002",
    "description": "Bed fee (per day)",
    "tariffNgn": 2000,
    "section": "111"
  },
  {
    "code": "NHIS-111-003",
    "description": "Nursing care (per day)",
    "tariffNgn": 1250,
    "section": "111"
  },
  {
    "code": "NHIS-111-004",
    "description": "Mechanical Ventilation (per day)",
    "tariffNgn": 2500,
    "section": "111"
  },
  {
    "code": "NHIS-111-005",
    "description": "Oxygen therapy (per day)",
    "tariffNgn": 7500,
    "section": "111"
  },
  {
    "code": "NHIS-111-006",
    "description": "Central venous cannulation (per session)",
    "tariffNgn": 5000,
    "section": "111"
  },
  {
    "code": "NHIS-111-007",
    "description": "Endotracheal Intubation (per session)",
    "tariffNgn": 2500,
    "section": "111"
  },
  {
    "code": "NHIS-111-008",
    "description": "Oxygen Therapy (per hour)",
    "tariffNgn": 500,
    "section": "111"
  },
  {
    "code": "NHIS-111-009",
    "description": "Nebulistation per session",
    "tariffNgn": 750,
    "section": "111"
  },
  {
    "code": "NHIS-111-010",
    "description": "Gastric Lavage",
    "tariffNgn": 1000,
    "section": "111"
  },
  {
    "code": "NHIS-111-012",
    "description": "Aspiration",
    "tariffNgn": 1500,
    "section": "111"
  },
  {
    "code": "NHIS-111-013",
    "description": "Aspiration (USS guided)",
    "tariffNgn": 2500,
    "section": "111"
  },
  {
    "code": "NHIS-111-014",
    "description": "Diagnostic paracentesis",
    "tariffNgn": 1500,
    "section": "111"
  },
  {
    "code": "NHIS-111-015",
    "description": "Therapeutic paracentesis",
    "tariffNgn": 5000,
    "section": "111"
  },
  {
    "code": "NHIS-111-016",
    "description": "Tissue Biopsies",
    "tariffNgn": 10000,
    "section": "111"
  },
  {
    "code": "NHIS-111-017",
    "description": "Lumbar Puncture",
    "tariffNgn": 1500,
    "section": "111"
  },
  {
    "code": "NHIS-111-018",
    "description": "Phototherapy per day",
    "tariffNgn": 1500,
    "section": "111"
  },
  {
    "code": "NHIS-111-019",
    "description": "Incubator Care per day",
    "tariffNgn": 2000,
    "section": "111"
  },
  {
    "code": "NHIS-111-020",
    "description": "Exchange Blood Transfusion",
    "tariffNgn": 15000,
    "section": "111"
  },
  {
    "code": "NHIS-111-021",
    "description": "Subdural Tap",
    "tariffNgn": 4000,
    "section": "111"
  },
  {
    "code": "NHIS-111-022",
    "description": "Continous Postive airway pressure",
    "tariffNgn": 2500,
    "section": "111"
  },
  {
    "code": "NHIS-112-001",
    "description": "Anal Dilatation",
    "tariffNgn": 15000,
    "section": "112"
  },
  {
    "code": "NHIS-112-002",
    "description": "Rectal Polyp",
    "tariffNgn": 15000,
    "section": "112"
  },
  {
    "code": "NHIS-112-003",
    "description": "Anal Transposition for Ectopic Anus",
    "tariffNgn": 30000,
    "section": "112"
  },
  {
    "code": "NHIS-112-004",
    "description": "Hernia - Epigastric",
    "tariffNgn": 25000,
    "section": "112"
  },
  {
    "code": "NHIS-112-005",
    "description": "Hernia - Umbilical",
    "tariffNgn": 30000,
    "section": "112"
  },
  {
    "code": "NHIS-112-006",
    "description": "Hernia-Inguinal - Bilateral",
    "tariffNgn": 25000,
    "section": "112"
  },
  {
    "code": "NHIS-112-007",
    "description": "Hernia-Inguirial -Unilateral",
    "tariffNgn": 25000,
    "section": "112"
  },
  {
    "code": "NHIS-112-008",
    "description": "Orchidopexy - Unilateral)",
    "tariffNgn": 30000,
    "section": "112"
  },
  {
    "code": "NHIS-112-009",
    "description": "Abdomino Perioneal (Exomphalos)",
    "tariffNgn": 50000,
    "section": "112"
  },
  {
    "code": "NHIS-112-010",
    "description": "Chordee Correction",
    "tariffNgn": 50000,
    "section": "112"
  },
  {
    "code": "NHIS-112-011",
    "description": "Closure Colostomy",
    "tariffNgn": 50000,
    "section": "112"
  },
  {
    "code": "NHIS-112-012",
    "description": "Colectomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-013",
    "description": "Colon Transplant",
    "tariffNgn": 65000,
    "section": "112"
  },
  {
    "code": "NHIS-112-014",
    "description": "Cystolithotomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-015",
    "description": "Oesophageal Atresia (Fistula)",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-016",
    "description": "Gastrostomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-017",
    "description": "Hernia - Diaphragmatic",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-018",
    "description": "Meckels Diverticulectomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-019",
    "description": "Meniscectomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-020",
    "description": "Nephrolithotomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-021",
    "description": "Orchidopexy - Bilateral",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-022",
    "description": "Pyelolithotomy",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-023",
    "description": "Pyeloplasty",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-024",
    "description": "Pyloric Stenosis (Ramsted OP)",
    "tariffNgn": 60000,
    "section": "112"
  },
  {
    "code": "NHIS-112-025",
    "description": "Rectal Biopsy",
    "tariffNgn": 15000,
    "section": "112"
  },
  {
    "code": "NHIS-112-026",
    "description": "Clostomy",
    "tariffNgn": 50000,
    "section": "112"
  },
  {
    "code": "NHIS-112-027",
    "description": "Pull Through for Hirshprung's Disease (for all stages of surgery)",
    "tariffNgn": 100000,
    "section": "112"
  },
  {
    "code": "NHIS-112-028",
    "description": "Excision Biopsy",
    "tariffNgn": 20000,
    "section": "112"
  },
  {
    "code": "NHIS-112-029",
    "description": "Posterior Saggital Anorectoplasty (for all stages of surgery)",
    "tariffNgn": 100000,
    "section": "112"
  },
  {
    "code": "NHIS-112-030",
    "description": "Appendectomy",
    "tariffNgn": 35000,
    "section": "112"
  },
  {
    "code": "NHIS-112-031",
    "description": "Hypospadias Repair",
    "tariffNgn": 50000,
    "section": "112"
  },
  {
    "code": "NHIS-112-032",
    "description": "Meatotomy/Meatoplasty",
    "tariffNgn": 20000,
    "section": "112"
  },
  {
    "code": "NHIS-112-033",
    "description": "*** Circumcision",
    "tariffNgn": 5000,
    "section": "112"
  },
  {
    "code": "NHIS-112-034",
    "description": "Laparascopy",
    "tariffNgn": 35000,
    "section": "112"
  },
  {
    "code": "NHIS-112-035",
    "description": "Excision of Sacrococcygeal Teratoma",
    "tariffNgn": 35000,
    "section": "112"
  },
  {
    "code": "NHIS-112-037",
    "description": "Uretheral catherisation",
    "tariffNgn": 1500,
    "section": "112"
  },
  {
    "code": "NHIS-121-001",
    "description": "-Periapical",
    "tariffNgn": 1500,
    "section": "121"
  },
  {
    "code": "NHIS-121-002",
    "description": "-Bitewings",
    "tariffNgn": 2000,
    "section": "121"
  },
  {
    "code": "NHIS-121-003",
    "description": "-Panoramic View",
    "tariffNgn": 2500,
    "section": "121"
  },
  {
    "code": "NHIS-121-004",
    "description": "Scaling & Polishing - heavy (therapeutic)",
    "tariffNgn": 3500,
    "section": "121"
  },
  {
    "code": "NHIS-121-005",
    "description": "Scaling & Polishing - light (therapeutic)",
    "tariffNgn": 3000,
    "section": "121"
  },
  {
    "code": "NHIS-121-006",
    "description": "Curretage",
    "tariffNgn": 1000,
    "section": "121"
  },
  {
    "code": "NHIS-121-007",
    "description": "Amalgam Restoration",
    "tariffNgn": 3500,
    "section": "121"
  },
  {
    "code": "NHIS-121-008",
    "description": "Amalgam Restoration (Class II)",
    "tariffNgn": 4000,
    "section": "121"
  },
  {
    "code": "NHIS-121-009",
    "description": "Composite Restoration",
    "tariffNgn": 4000,
    "section": "121"
  },
  {
    "code": "NHIS-121-010",
    "description": "Pulpal Treatment For Children",
    "tariffNgn": 3500,
    "section": "121"
  },
  {
    "code": "NHIS-121-011",
    "description": "Periodontal Gum Treatment",
    "tariffNgn": 3000,
    "section": "121"
  },
  {
    "code": "NHIS-121-012",
    "description": "Fissure Selant",
    "tariffNgn": 2000,
    "section": "121"
  },
  {
    "code": "NHIS-121-013",
    "description": "Fistulectomy",
    "tariffNgn": 25000,
    "section": "121"
  },
  {
    "code": "NHIS-121-014",
    "description": "Squestrectomy",
    "tariffNgn": 10000,
    "section": "121"
  },
  {
    "code": "NHIS-121-015",
    "description": "Root Canal Therapy Anterior",
    "tariffNgn": 10000,
    "section": "121"
  },
  {
    "code": "NHIS-121-016",
    "description": "Root Canal Therapy Posterior",
    "tariffNgn": 15000,
    "section": "121"
  },
  {
    "code": "NHIS-121-017",
    "description": "Dentures",
    "tariffNgn": 5000,
    "section": "121"
  },
  {
    "code": "NHIS-121-018",
    "description": "Denture (relining/repair/mpression}",
    "tariffNgn": 3000,
    "section": "121"
  },
  {
    "code": "NHIS-131-001",
    "description": "Cerebro-vascular Accident",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-002",
    "description": "Chest Conditions (per session)",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-003",
    "description": "Diabetic Neuropathy",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-004",
    "description": "Facial/Bell's Palsy",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-005",
    "description": "Spinal Cord Lesion",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-006",
    "description": "Parkinsonism",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-007",
    "description": "Peripheral Nerve Injuries",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-008",
    "description": "Sciatica",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-009",
    "description": "Incontinence",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-010",
    "description": "nerve root compression",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-132-001",
    "description": "Delayed Developmental Milestone",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-002",
    "description": "Cerebral Palsy",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-003",
    "description": "Erbs Palsy (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-004",
    "description": "Talipes Manupulation (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-005",
    "description": "Injection trauma/palsy (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-006",
    "description": "congenital hip dislocation (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-007",
    "description": "Fractures (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-008",
    "description": "Polio deformities (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-133-001",
    "description": "Arthritis per visit",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-002",
    "description": "Slipped disc/Low back pain per visit",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-003",
    "description": "Mouth Fracture",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-004",
    "description": "Burns",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-005",
    "description": "chest physiotherapy",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-006",
    "description": "post surgical rehabilitation",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-007",
    "description": "Fractures/dislocations/subluxation",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-008",
    "description": "Spondylosis/scoliosis",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-134-001",
    "description": "P.I.D.",
    "tariffNgn": 1500,
    "section": "134"
  },
  {
    "code": "NHIS-134-002",
    "description": "Obstetrics trauma/paresis/paralysis",
    "tariffNgn": 1500,
    "section": "134"
  },
  {
    "code": "NHIS-134-003",
    "description": "Uterine Prolapse",
    "tariffNgn": 1500,
    "section": "134"
  },
  {
    "code": "NHIS-140-001",
    "description": "Ablation of Endometrium",
    "tariffNgn": 4000,
    "section": "140"
  },
  {
    "code": "NHIS-140-002",
    "description": "Hysteroscopic Tubal Cannulation",
    "tariffNgn": 35000,
    "section": "140"
  },
  {
    "code": "NHIS-140-003",
    "description": "Polypectomy",
    "tariffNgn": 35000,
    "section": "140"
  },
  {
    "code": "NHIS-140-004",
    "description": "Uterine Synechia - Cutting",
    "tariffNgn": 35000,
    "section": "140"
  },
  {
    "code": "NHIS-151-001",
    "description": "Repair & Transposition Nerve",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-002",
    "description": "Skull Traction",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-003",
    "description": "Subdural aspiration",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-004",
    "description": "Ventricular Puncture",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-005",
    "description": "Carpal Tunnel Release",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-006",
    "description": "Cervical Ribs",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-007",
    "description": "Cranio Ventrical",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-008",
    "description": "Cranioplasty",
    "tariffNgn": 70000,
    "section": "151"
  },
  {
    "code": "NHIS-151-009",
    "description": "Cerebrospinal Fluid (CSF) Rhinorrohea",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-010",
    "description": "Duroplasty",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-011",
    "description": "Local Neurectomy",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-012",
    "description": "Lumbar Disc",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-013",
    "description": "Microdiscectomy - Cervical/Lumbar",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-014",
    "description": "Neurolysis",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-015",
    "description": "Peripheral Nerve Surgery",
    "tariffNgn": 80000,
    "section": "151"
  },
  {
    "code": "NHIS-151-016",
    "description": "Shunt",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-017",
    "description": "Spine - Canal Stenosis",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-018",
    "description": "Spine - Disc Cervical/Lumber",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-019",
    "description": "Spine - Extradural Tumour",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-020",
    "description": "Spine - Intradural Tumour",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-021",
    "description": "Spine - Intramedullar Tumour",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-022",
    "description": "Temporal Rhizotomy",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-023",
    "description": "Trans Sphenoidal surgery",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-024",
    "description": "Vagotomy - Selective",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-025",
    "description": "Vagotomy with Gastrojejunostomy",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-026",
    "description": "Vagotomy with Pyeloroplasty",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-151-027",
    "description": "Vagotomy - Highly Selective",
    "tariffNgn": 85000,
    "section": "151"
  },
  {
    "code": "NHIS-152-001",
    "description": "Burr hole",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-002",
    "description": "Carotid Endartrectomy",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-003",
    "description": "Craniostenosis",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-004",
    "description": "Haematoma - Brain (head injuries)",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-005",
    "description": "Haematoma - Brain (hypertensive)",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-006",
    "description": "Haematoma (Child irritable subdural)",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-007",
    "description": "Laminectomy with Fusion",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-008",
    "description": "Meningocele - Anterior",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-009",
    "description": "Posterior Fossa - Decompression",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-010",
    "description": "Brachial Plexus - Repair",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-011",
    "description": "Spina Bifida - Large - Repair",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-012",
    "description": "Spina Bifida - Small - Repair",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-013",
    "description": "Spine - Anterior Decompression",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-014",
    "description": "Spine - Decompression & Fusion",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-015",
    "description": "Tumours - Supratentorial",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-016",
    "description": "Tumours Meninges - Gocussa",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-152-017",
    "description": "Tumours Meninges - Posterior",
    "tariffNgn": 100000,
    "section": "152"
  },
  {
    "code": "NHIS-153-001",
    "description": "Anneurysm",
    "tariffNgn": 120000,
    "section": "153"
  },
  {
    "code": "NHIS-153-002",
    "description": "Anterior Encephalocele",
    "tariffNgn": 100000,
    "section": "153"
  },
  {
    "code": "NHIS-153-003",
    "description": "Meningocele - Lumbar",
    "tariffNgn": 100000,
    "section": "153"
  },
  {
    "code": "NHIS-171-001",
    "description": "Hand/Finger (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-002",
    "description": "Wrist (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-003",
    "description": "Forearm (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-004",
    "description": "Elbow (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-005",
    "description": "Humerus (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-006",
    "description": "Shoulder (Adult)",
    "tariffNgn": 1800,
    "section": "171"
  },
  {
    "code": "NHIS-171-007",
    "description": "Clavicle",
    "tariffNgn": 1800,
    "section": "171"
  },
  {
    "code": "NHIS-171-008",
    "description": "Scaphoid series",
    "tariffNgn": 1800,
    "section": "171"
  },
  {
    "code": "NHIS-172-001",
    "description": "Foot/Toe (Adult)",
    "tariffNgn": 1200,
    "section": "172"
  },
  {
    "code": "NHIS-172-002",
    "description": "Ankle (Adult)",
    "tariffNgn": 1200,
    "section": "172"
  },
  {
    "code": "NHIS-172-003",
    "description": "Leg (Tibia/Fibula) (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-004",
    "description": "Knee (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-005",
    "description": "Hip (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-006",
    "description": "Femur Or Thigh (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-007",
    "description": "Pelvic (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-173-001",
    "description": "Chest (PA/AP) (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-173-002",
    "description": "Chest (PA/Lateral) (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-173-003",
    "description": "Chest For Ribs (Oblique) (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-173-004",
    "description": "Apical/Lordotic",
    "tariffNgn": 1500,
    "section": "173"
  },
  {
    "code": "NHIS-173-005",
    "description": "Sternum",
    "tariffNgn": 1500,
    "section": "173"
  },
  {
    "code": "NHIS-173-006",
    "description": "Thoracic Inlet (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-174-001",
    "description": "Cervical Spine (Adult)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-002",
    "description": "Lateral Neck (Soft Tissue)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-003",
    "description": "Thoracic Spine",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-004",
    "description": "Thoraco Lumber Spine (Adult)",
    "tariffNgn": 2800,
    "section": "174"
  },
  {
    "code": "NHIS-174-005",
    "description": "Lumbar Spine",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-006",
    "description": "Lumbo Sacral Spine (Adult)",
    "tariffNgn": 2800,
    "section": "174"
  },
  {
    "code": "NHIS-174-007",
    "description": "Sacrum",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-008",
    "description": "Sacro Iliac Joint (S.I.J.)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-009",
    "description": "Cervical Spine (Oblique)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-010",
    "description": "Sacro-Coccyx",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-175-001",
    "description": "Abdomen (Plain)",
    "tariffNgn": 1800,
    "section": "175"
  },
  {
    "code": "NHIS-175-002",
    "description": "Abdomen (Erect/Supine)",
    "tariffNgn": 1800,
    "section": "175"
  },
  {
    "code": "NHIS-175-003",
    "description": "Abdomen (Pregnancy)",
    "tariffNgn": 1800,
    "section": "175"
  },
  {
    "code": "NHIS-176-001",
    "description": "Skull (AP/Lat)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-002",
    "description": "Skull (Pa/Lat/Townes)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-003",
    "description": "Mastoids (Owens/ Townes)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-004",
    "description": "Sinuses AP/LNT/OM",
    "tariffNgn": 3000,
    "section": "176"
  },
  {
    "code": "NHIS-176-005",
    "description": "Mandibles (Jaw)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-006",
    "description": "Temporo-Mandibular Joints (TMJ)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-007",
    "description": "Sella Turcica",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-008",
    "description": "Tagential",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-009",
    "description": "Occipito-Mental (OM)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-010",
    "description": "Cranio-cordial",
    "tariffNgn": 3250,
    "section": "176"
  },
  {
    "code": "NHIS-176-011",
    "description": "Nasopharynx",
    "tariffNgn": 1850,
    "section": "176"
  },
  {
    "code": "NHIS-176-012",
    "description": "Paranasal sinuses",
    "tariffNgn": 2150,
    "section": "176"
  },
  {
    "code": "NHIS-177-001",
    "description": "Periapical",
    "tariffNgn": 1500,
    "section": "177"
  },
  {
    "code": "NHIS-177-002",
    "description": "Bitewings",
    "tariffNgn": 2000,
    "section": "177"
  },
  {
    "code": "NHIS-177-003",
    "description": "Panoramic View",
    "tariffNgn": 2500,
    "section": "177"
  },
  {
    "code": "NHIS-178-001",
    "description": "Barium Swallow",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-002",
    "description": "Barium Meal/Follow Through",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-003",
    "description": "Barium Enema",
    "tariffNgn": 14000,
    "section": "178"
  },
  {
    "code": "NHIS-178-004",
    "description": "Intravenous Urography (IVU)",
    "tariffNgn": 15250,
    "section": "178"
  },
  {
    "code": "NHIS-178-005",
    "description": "Hysterosalpingogram (HSG)",
    "tariffNgn": 12250,
    "section": "178"
  },
  {
    "code": "NHIS-178-006",
    "description": "Cysto-Urethrogram",
    "tariffNgn": 12250,
    "section": "178"
  },
  {
    "code": "NHIS-178-007",
    "description": "Fistulogram",
    "tariffNgn": 9850,
    "section": "178"
  },
  {
    "code": "NHIS-178-008",
    "description": "Myelogram",
    "tariffNgn": 40000,
    "section": "178"
  },
  {
    "code": "NHIS-178-009",
    "description": "Skeletal Survey (Adult)",
    "tariffNgn": 6250,
    "section": "178"
  },
  {
    "code": "NHIS-178-010",
    "description": "Electrocardiography (E C G)",
    "tariffNgn": 5000,
    "section": "178"
  },
  {
    "code": "NHIS-178-011",
    "description": "Echocardiography",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-012",
    "description": "Electroencephalography",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-013",
    "description": "Micturating Cyto-Urethrogram",
    "tariffNgn": 8850,
    "section": "178"
  },
  {
    "code": "NHIS-178-014",
    "description": "Retrograde Urethrogram",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-015",
    "description": "Intravenous cholangiogram (IVC)",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-016",
    "description": "Phlebogram-One Leg",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-017",
    "description": "Venogram-One Leg",
    "tariffNgn": 12000,
    "section": "178"
  },
  {
    "code": "NHIS-178-018",
    "description": "Arthrogram",
    "tariffNgn": 9650,
    "section": "178"
  },
  {
    "code": "NHIS-178-019",
    "description": "Sialogram",
    "tariffNgn": 7150,
    "section": "178"
  },
  {
    "code": "NHIS-178-020",
    "description": "Sinogram",
    "tariffNgn": 7150,
    "section": "178"
  },
  {
    "code": "NHIS-178-021",
    "description": "MRI Scan (Adult)",
    "tariffNgn": 70000,
    "section": "178"
  },
  {
    "code": "NHIS-178-022",
    "description": "MRI Scan (Children)",
    "tariffNgn": 35000,
    "section": "178"
  },
  {
    "code": "NHIS-178-023",
    "description": "CT Scan (Adult)",
    "tariffNgn": 60000,
    "section": "178"
  },
  {
    "code": "NHIS-178-024",
    "description": "CT Scan (Children)",
    "tariffNgn": 30000,
    "section": "178"
  },
  {
    "code": "NHIS-178-025",
    "description": "Mammogram",
    "tariffNgn": 8850,
    "section": "178"
  },
  {
    "code": "NHIS-178-026",
    "description": "Radiotherapy - radical treatment (per session) - Partial Coverage (50%)",
    "tariffNgn": 25000,
    "section": "178"
  },
  {
    "code": "NHIS-178-027",
    "description": "Radiotherapy - palliative (per session) - Partial Coverage (50%)",
    "tariffNgn": 25000,
    "section": "178"
  },
  {
    "code": "NHIS-178-028",
    "description": "Bone scan",
    "tariffNgn": 20000,
    "section": "178"
  },
  {
    "code": "NHIS-178-029",
    "description": "Renal scan (DTPA, DMSA)",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-030",
    "description": "GIT: Hepatobillary scan; Mackel scan",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-031",
    "description": "Perfusion lung scan",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-032",
    "description": "CNS: Cisternography; celebral perfusion",
    "tariffNgn": 20000,
    "section": "178"
  },
  {
    "code": "NHIS-178-033",
    "description": "Lymphoscintography",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-034",
    "description": "Muga scan",
    "tariffNgn": 20000,
    "section": "178"
  },
  {
    "code": "NHIS-179-001",
    "description": "Obstetric Scan",
    "tariffNgn": 3550,
    "section": "179"
  },
  {
    "code": "NHIS-179-002",
    "description": "Abdominal Scan",
    "tariffNgn": 3550,
    "section": "179"
  },
  {
    "code": "NHIS-179-003",
    "description": "Pelvic Scan",
    "tariffNgn": 3550,
    "section": "179"
  },
  {
    "code": "NHIS-179-004",
    "description": "Breast Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-005",
    "description": "Bladder Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-006",
    "description": "Abdominal Pelvic Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-007",
    "description": "Prostate Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-008",
    "description": "Thyroid Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-009",
    "description": "Testes/Scrotal Scan (Each)",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-010",
    "description": "Ovulometry/Transvaginal Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-011",
    "description": "Trans-Fontanelle (Children)",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-012",
    "description": "Doppler Scan",
    "tariffNgn": 5000,
    "section": "179"
  },
  {
    "code": "NHIS-179-013",
    "description": "Ocular scan",
    "tariffNgn": 5000,
    "section": "179"
  },
  {
    "code": "NHIS-180-012",
    "description": "Urinalysis",
    "tariffNgn": 400,
    "section": "180"
  },
  {
    "code": "NHIS-180-013",
    "description": "Pregnancy Test (Urine)",
    "tariffNgn": 400,
    "section": "180"
  },
  {
    "code": "NHIS-180-014",
    "description": "Stool Analysis (R/E Only)",
    "tariffNgn": 400,
    "section": "180"
  },
  {
    "code": "NHIS-180-015",
    "description": "Blood Sugar (FBS/ RBS)",
    "tariffNgn": 650,
    "section": "180"
  },
  {
    "code": "NHIS-180-016",
    "description": "HB Genotype",
    "tariffNgn": 850,
    "section": "180"
  },
  {
    "code": "NHIS-180-017",
    "description": "Blood film comments",
    "tariffNgn": 550,
    "section": "180"
  },
  {
    "code": "NHIS-181-002",
    "description": "a) Sodium",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-003",
    "description": "b) Potassium",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-004",
    "description": "c) Chloride",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-005",
    "description": "d) Bicarbonate",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-006",
    "description": "Urea",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-007",
    "description": "Creatinine",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-009",
    "description": "a) Unconjugated Bilirubin",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-010",
    "description": "b) Conjugated Bilirubin",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-011",
    "description": "c) Alkaline Phosphatase",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-012",
    "description": "d) Alanine Aminotransferase (SGPT)",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-013",
    "description": "e) Aspartate Aminotransferase (SGOT)",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-014",
    "description": "Total Protein",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-015",
    "description": "Albumin",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-016",
    "description": "Globulin",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-017",
    "description": "Acid Phosphatase (Total & Prostatic) Each",
    "tariffNgn": 1100,
    "section": "181"
  },
  {
    "code": "NHIS-181-018",
    "description": "Total Cholesterol",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-019",
    "description": "Gamma-GT",
    "tariffNgn": 1150,
    "section": "181"
  },
  {
    "code": "NHIS-181-021",
    "description": "a) Total Cholesterol",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-022",
    "description": "b) Triglyceride",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-023",
    "description": "c)Low- density lipoprotein (LDL)",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-024",
    "description": "d)High -density lipoprotein (HDL)",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-025",
    "description": "Amylase",
    "tariffNgn": 750,
    "section": "181"
  },
  {
    "code": "NHIS-181-026",
    "description": "Fasting Blood Sugar (FBS)",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-027",
    "description": "Random Blood Sugar (RBS)",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-028",
    "description": "2-Hr Post Prandial Blood Sugar",
    "tariffNgn": 800,
    "section": "181"
  },
  {
    "code": "NHIS-181-029",
    "description": "24 HR- Urine Protein",
    "tariffNgn": 900,
    "section": "181"
  },
  {
    "code": "NHIS-181-030",
    "description": "Oral Glucose Tolerance Test (OGTT)",
    "tariffNgn": 1800,
    "section": "181"
  },
  {
    "code": "NHIS-181-031",
    "description": "Uric Acid",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-032",
    "description": "Iron",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-033",
    "description": "Magnesium",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-034",
    "description": "Creatine Phosphokinase (CPK)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-035",
    "description": "Phosphate",
    "tariffNgn": 530,
    "section": "181"
  },
  {
    "code": "NHIS-181-036",
    "description": "Lactate Dehydrogenase (LDH)",
    "tariffNgn": 820,
    "section": "181"
  },
  {
    "code": "NHIS-181-037",
    "description": "CSF: Chloride",
    "tariffNgn": 530,
    "section": "181"
  },
  {
    "code": "NHIS-181-038",
    "description": "CSF: Protein (Total)",
    "tariffNgn": 530,
    "section": "181"
  },
  {
    "code": "NHIS-181-039",
    "description": "CSF: Glucose",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-040",
    "description": "Urinalysis",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-041",
    "description": "Urea Clearance",
    "tariffNgn": 830,
    "section": "181"
  },
  {
    "code": "NHIS-181-043",
    "description": "Urea/Creatinine ratio",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-044",
    "description": "Inorganic Phosphorus",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-045",
    "description": "Creatinine Clearance",
    "tariffNgn": 900,
    "section": "181"
  },
  {
    "code": "NHIS-181-046",
    "description": "Glycocylated Heamoglobin (HBA1C)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-048",
    "description": "a) Urine",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-049",
    "description": "b) Blood",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-050",
    "description": "Calcium",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-052",
    "description": "CK",
    "tariffNgn": 900,
    "section": "181"
  },
  {
    "code": "NHIS-181-053",
    "description": "CK-MB Mass",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-054",
    "description": "Troponin T.",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-056",
    "description": "a) Follicle Stimulating Hormone (FSH)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-057",
    "description": "b) Luteinizing Hormone (LH)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-058",
    "description": "c) Prolactin",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-059",
    "description": "d) Progesterone",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-060",
    "description": "e) Testosterone",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-061",
    "description": "f) Oestradiol (E2)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-062",
    "description": "Oestriol (E3)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-063",
    "description": "Cortisol",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-064",
    "description": "Insulin",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-065",
    "description": "DHEA-Sulphate (17 ketosteroids)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-066",
    "description": "Thyroid Screening (a-f)",
    "tariffNgn": 33950,
    "section": "181"
  },
  {
    "code": "NHIS-181-067",
    "description": "a) Triiodothyronine (T3)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-068",
    "description": "b) Thyroid globulin",
    "tariffNgn": 9200,
    "section": "181"
  },
  {
    "code": "NHIS-181-069",
    "description": "c)Free Triiodothyronine (T3)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-070",
    "description": "d)Free Thyroxine (T4)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-071",
    "description": "e) Thyroxine (T4)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-072",
    "description": "f) Thyroid Stimulating Hormones (TSH)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-073",
    "description": "Carcinoembryonic Antigen (CEA)",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-074",
    "description": "Breast Cancer Antigen/ CA 15-3",
    "tariffNgn": 5250,
    "section": "181"
  },
  {
    "code": "NHIS-181-075",
    "description": "Ovarian Cancer Antigen /CA 125",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-076",
    "description": "Pancreatic/Gut Cancer Antigen / CA19-9",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-077",
    "description": "Alpha-Feto Protein (AFP)",
    "tariffNgn": 3950,
    "section": "181"
  },
  {
    "code": "NHIS-181-079",
    "description": "a) Total",
    "tariffNgn": 9250,
    "section": "181"
  },
  {
    "code": "NHIS-181-080",
    "description": "b) Free",
    "tariffNgn": 5550,
    "section": "181"
  },
  {
    "code": "NHIS-181-081",
    "description": "Vanilyl Mandellic Acid (VMA)",
    "tariffNgn": 3250,
    "section": "181"
  },
  {
    "code": "NHIS-181-082",
    "description": "Molar Pregnancy (HCG-B)",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-101",
    "description": "Full Blood Count (FBC) (All Parameters)",
    "tariffNgn": 2600,
    "section": "181"
  },
  {
    "code": "NHIS-181-102",
    "description": "Haemoglobin (HB)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-103",
    "description": "Packed Cell Volume (PCV)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-113",
    "description": "Erythrocyte Sedimentation Rate (ESR)",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-114",
    "description": "Bleeding Time",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-115",
    "description": "Clotting Time",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-116",
    "description": "Prothrombin Time (PT)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-117",
    "description": "Kaolin-Cephalin Clotting Time",
    "tariffNgn": 1420,
    "section": "181"
  },
  {
    "code": "NHIS-181-118",
    "description": "Partial Prothrombin Time (PTT)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-119",
    "description": "HB Genotype",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-120",
    "description": "Blood Grouping (ABO & RH)",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-121",
    "description": "Sickling Test",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-124",
    "description": "Screening of Donor Blood",
    "tariffNgn": 3540,
    "section": "181"
  },
  {
    "code": "NHIS-181-125",
    "description": "Cross Match",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-126",
    "description": "Le Cells",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-127",
    "description": "G-6-PD Screening",
    "tariffNgn": 2350,
    "section": "181"
  },
  {
    "code": "NHIS-181-128",
    "description": "Osmotic Fragility",
    "tariffNgn": 950,
    "section": "181"
  },
  {
    "code": "NHIS-181-129",
    "description": "Coagulation Profile",
    "tariffNgn": 5950,
    "section": "181"
  },
  {
    "code": "NHIS-181-130",
    "description": "Bone Marrow Examination",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-131",
    "description": "Fibrinogen",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-132",
    "description": "Fresh Frozen plasma",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-133",
    "description": "Blood gas Analysis",
    "tariffNgn": 5950,
    "section": "181"
  },
  {
    "code": "NHIS-181-134",
    "description": "D-Dimer",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-135",
    "description": "Ferritin",
    "tariffNgn": 1850,
    "section": "181"
  },
  {
    "code": "NHIS-181-136",
    "description": "Homocysteine",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-137",
    "description": "Vitamin D",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-138",
    "description": "Vitamin B12",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-139",
    "description": "Folate",
    "tariffNgn": 950,
    "section": "181"
  },
  {
    "code": "NHIS-181-201",
    "description": "a) Microscopy",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-202",
    "description": "b) Urinalysis",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-203",
    "description": "c) Microscopy, Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-205",
    "description": "a) Microscopy R/E only",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-206",
    "description": "b) Microscopy, Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-207",
    "description": "c) Faecal Occult Blood",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-208",
    "description": "d) H. pylori",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-209",
    "description": "a) Culture & Sensitivity",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-210",
    "description": "b) Malaria Parasites",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-211",
    "description": "c) Microfilaria",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-212",
    "description": "d) Trypanosomes",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-213",
    "description": "a) Semen Analysis",
    "tariffNgn": 1250,
    "section": "181"
  },
  {
    "code": "NHIS-181-214",
    "description": "b) Microscopy, Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-215",
    "description": "a) Gram Stain",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-216",
    "description": "b) Z.N stain for AFB x 3",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-217",
    "description": "c) Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-218",
    "description": "a) Cell Count + Microscopy",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-219",
    "description": "c) Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-220",
    "description": "a) Microscopy",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-221",
    "description": "b) Gram stain (where applicable)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-222",
    "description": "c) Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-223",
    "description": "a) Snip (microfilaria)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-224",
    "description": "b) Microscopy (KOH mount)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-225",
    "description": "c) Scraping For Fungal Element (Culture)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-226",
    "description": "c) Mantoux test",
    "tariffNgn": 950,
    "section": "181"
  },
  {
    "code": "NHIS-181-301",
    "description": "Widal Test",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-302",
    "description": "VDRL",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-303",
    "description": "Rheumatiod Factor",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-304",
    "description": "Anti-Streptolysin O Titre (ASO Titre)",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-305",
    "description": "Hepatitis B Surface Antigen (HbsAg)",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-306",
    "description": "Hepatitis B Confirmatory Test (Core Antigen)",
    "tariffNgn": 3000,
    "section": "181"
  },
  {
    "code": "NHIS-181-307",
    "description": "Hepatitis A (IgM)",
    "tariffNgn": 3000,
    "section": "181"
  },
  {
    "code": "NHIS-181-308",
    "description": "HbcAg/ HbeAg",
    "tariffNgn": 3000,
    "section": "181"
  },
  {
    "code": "NHIS-181-309",
    "description": "Hepatitis B DNA Viral Load",
    "tariffNgn": 20000,
    "section": "181"
  },
  {
    "code": "NHIS-181-310",
    "description": "HIV Screening",
    "tariffNgn": 1750,
    "section": "181"
  },
  {
    "code": "NHIS-181-311",
    "description": "HIV Confirmatory Test",
    "tariffNgn": 4850,
    "section": "181"
  },
  {
    "code": "NHIS-181-312",
    "description": "a) CD4 Count",
    "tariffNgn": 4150,
    "section": "181"
  },
  {
    "code": "NHIS-181-313",
    "description": "b) HIV Viral load",
    "tariffNgn": 5550,
    "section": "181"
  },
  {
    "code": "NHIS-181-314",
    "description": "Hepatitis C Antigen (HCV)",
    "tariffNgn": 3500,
    "section": "181"
  },
  {
    "code": "NHIS-181-315",
    "description": "Hepatitis C RNA Viral Load*",
    "tariffNgn": 11500,
    "section": "181"
  },
  {
    "code": "NHIS-181-316",
    "description": "Hepatitis C RNA Viral Load (GeneXpert PCR) *",
    "tariffNgn": 10000,
    "section": "181"
  },
  {
    "code": "NHIS-181-318",
    "description": "Serum Tuberculosis Antigen",
    "tariffNgn": 2500,
    "section": "181"
  },
  {
    "code": "NHIS-181-319",
    "description": "Chlamydia Antigen",
    "tariffNgn": 2500,
    "section": "181"
  },
  {
    "code": "NHIS-181-320",
    "description": "Herpes Simplex 1 & 11 Antigen",
    "tariffNgn": 3250,
    "section": "181"
  },
  {
    "code": "NHIS-181-321",
    "description": "Toxoplasma Gondii",
    "tariffNgn": 2950,
    "section": "181"
  },
  {
    "code": "NHIS-181-322",
    "description": "Rubella",
    "tariffNgn": 2500,
    "section": "181"
  },
  {
    "code": "NHIS-181-323",
    "description": "Helicobacter Pylori",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-324",
    "description": "Infectious Mononucleosis",
    "tariffNgn": 2950,
    "section": "181"
  },
  {
    "code": "NHIS-181-325",
    "description": "C-Reactive Protein",
    "tariffNgn": 2650,
    "section": "181"
  },
  {
    "code": "NHIS-181-326",
    "description": "Antibody screening",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-327",
    "description": "Cytomegalovirus (CMV) (Qualitative)",
    "tariffNgn": 3250,
    "section": "181"
  },
  {
    "code": "NHIS-181-401",
    "description": "a) Small",
    "tariffNgn": 5250,
    "section": "181"
  },
  {
    "code": "NHIS-181-402",
    "description": "b) Multiple",
    "tariffNgn": 7150,
    "section": "181"
  },
  {
    "code": "NHIS-181-403",
    "description": "Bone Tissues (Special stains)",
    "tariffNgn": 7150,
    "section": "181"
  },
  {
    "code": "NHIS-181-404",
    "description": "Lymph Nodes Biopsy",
    "tariffNgn": 5250,
    "section": "181"
  },
  {
    "code": "NHIS-181-405",
    "description": "Pap Smear",
    "tariffNgn": 4000,
    "section": "181"
  },
  {
    "code": "NHIS-181-406",
    "description": "Fine Needle Aspiration (FNA)",
    "tariffNgn": 4200,
    "section": "181"
  },
  {
    "code": "NHIS-010-001",
    "description": "Specialist Initial Consultation",
    "tariffNgn": 2000,
    "section": "010"
  },
  {
    "code": "NHIS-010-002",
    "description": "Specialist Review (Per visit)",
    "tariffNgn": 1200,
    "section": "010"
  },
  {
    "code": "NHIS-010-003",
    "description": "Nursing Care (per day)",
    "tariffNgn": 1000,
    "section": "010"
  },
  {
    "code": "NHIS-010-004",
    "description": "Special Nursing Care (e.g., Intensive care, SCBU, Paediatric Emergency etc)",
    "tariffNgn": 1200,
    "section": "010"
  },
  {
    "code": "NHIS-010-005",
    "description": "Hospital Bed Occupancy",
    "tariffNgn": 1000,
    "section": "010"
  },
  {
    "code": "NHIS-010-006",
    "description": "ICU Nursing Care/ Day",
    "tariffNgn": 2000,
    "section": "010"
  },
  {
    "code": "NHIS-021-001",
    "description": "Antral Washout",
    "tariffNgn": 20000,
    "section": "021"
  },
  {
    "code": "NHIS-021-002",
    "description": "Aseptic Destruction of Labyrinth for Meniere's Disease",
    "tariffNgn": 24000,
    "section": "021"
  },
  {
    "code": "NHIS-021-003",
    "description": "Audiometry",
    "tariffNgn": 10000,
    "section": "021"
  },
  {
    "code": "NHIS-021-004",
    "description": "Electrocautery of Nose",
    "tariffNgn": 20000,
    "section": "021"
  },
  {
    "code": "NHIS-021-005",
    "description": "Foreign Body Removal from Ear",
    "tariffNgn": 5000,
    "section": "021"
  },
  {
    "code": "NHIS-021-006",
    "description": "Ingestion Airway",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-007",
    "description": "Oesophagus",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-008",
    "description": "Ordinary",
    "tariffNgn": 5000,
    "section": "021"
  },
  {
    "code": "NHIS-021-010",
    "description": "Foreign Body Removal from Nose (Ordinary)",
    "tariffNgn": 5000,
    "section": "021"
  },
  {
    "code": "NHIS-021-011",
    "description": "Foreign Body Removal from Nose (Under GA)",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-012",
    "description": "Foreign Body Removal from Throat",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-013",
    "description": "I&D of quinsy/retropharyngeal abscess/Ludwig angina",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-014",
    "description": "Indirect Laryngoscopy",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-015",
    "description": "Myringoplasty",
    "tariffNgn": 30000,
    "section": "021"
  },
  {
    "code": "NHIS-021-016",
    "description": "Myringotomy; bilateral, unilateral, with grommet",
    "tariffNgn": 20000,
    "section": "021"
  },
  {
    "code": "NHIS-021-017",
    "description": "Preauricular Sinus repair",
    "tariffNgn": 18000,
    "section": "021"
  },
  {
    "code": "NHIS-021-018",
    "description": "Release of tongue tie",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-019",
    "description": "Sinus Antroscopy",
    "tariffNgn": 15000,
    "section": "021"
  },
  {
    "code": "NHIS-021-020",
    "description": "Staples Mobilisation",
    "tariffNgn": 18000,
    "section": "021"
  },
  {
    "code": "NHIS-021-021",
    "description": "Tympanometry",
    "tariffNgn": 10000,
    "section": "021"
  },
  {
    "code": "NHIS-021-022",
    "description": "Ear Syringing per ear",
    "tariffNgn": 2500,
    "section": "021"
  },
  {
    "code": "NHIS-021-023",
    "description": "Simple Extraction",
    "tariffNgn": 5000,
    "section": "021"
  },
  {
    "code": "NHIS-021-024",
    "description": "Surgical Extraction",
    "tariffNgn": 10000,
    "section": "021"
  },
  {
    "code": "NHIS-022-001",
    "description": "Adenoidectomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-002",
    "description": "Antrostomy - Nasal Sinus Surgery (e.g., middle/inferior meatal/ Caldwell Luc)",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-003",
    "description": "Aural Polypectomy = Clinic + Biopsy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-004",
    "description": "Cleft Lip Repairs.",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-005",
    "description": "cortical mastoidectomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-006",
    "description": "Cryosurgery",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-007",
    "description": "Direct Laryngoscopy (Under GA)",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-008",
    "description": "EUA Nasopharynx + biopsy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-009",
    "description": "EUA Oropharynx/Hypopharynx, Larynx + biopsy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-010",
    "description": "Excision of Nasomaxillary mass",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-011",
    "description": "Lateral rhinotomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-012",
    "description": "Meatoplasty (for Traumatic Meatus Atresia)",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-013",
    "description": "Nasal Polypectomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-014",
    "description": "Oesophagoscopy",
    "tariffNgn": 25000,
    "section": "022"
  },
  {
    "code": "NHIS-022-015",
    "description": "Emergency Oesophagoscopy + FB Removal",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-016",
    "description": "Partial Amputation of the pinna",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-017",
    "description": "Septoplasty",
    "tariffNgn": 25000,
    "section": "022"
  },
  {
    "code": "NHIS-022-018",
    "description": "Submandibular gland excision",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-019",
    "description": "superficial parotidectomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-020",
    "description": "Thyroglossal cyst/fistula excision",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-021",
    "description": "Tonsillectomy/Adenotonsilectomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-022",
    "description": "Tracheostomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-023",
    "description": "Turbinectomy",
    "tariffNgn": 30000,
    "section": "022"
  },
  {
    "code": "NHIS-022-024",
    "description": "Young's Operation",
    "tariffNgn": 25000,
    "section": "022"
  },
  {
    "code": "NHIS-023-001",
    "description": "Ant Ethmoidal Artery ligation",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-002",
    "description": "Aryteniodectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-003",
    "description": "Autogenous Bone Graft To Mastoid Cavity",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-004",
    "description": "Cleft Palate Repairs.",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-005",
    "description": "Dacryocystorhinostomy (DCR)",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-006",
    "description": "Ethmoidectomy; Fronto, External",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-007",
    "description": "Fenestration",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-008",
    "description": "Fracture Reduction of the Nose",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-009",
    "description": "Internal Auditory Meatus Surgery",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-010",
    "description": "Intranasal ethmoidectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-011",
    "description": "Labyrinthectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-012",
    "description": "Laryngeal Stenosis, Laryngocele, Abductor Paralysis, Laryngo-Fissure",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-013",
    "description": "Laryngectomy (All types)",
    "tariffNgn": 150000,
    "section": "023"
  },
  {
    "code": "NHIS-023-014",
    "description": "Laryngoplasty",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-015",
    "description": "Mastoid Surgery/Mastoidectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-016",
    "description": "Maxillectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-017",
    "description": "Muscle Grafting to Mastoid Cavity",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-018",
    "description": "Neck exploration for penetrating neck Injury",
    "tariffNgn": 150000,
    "section": "023"
  },
  {
    "code": "NHIS-023-019",
    "description": "Parapharyngeal Excision/I&D/Tumour excision",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-020",
    "description": "Pharyngoplasty",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-021",
    "description": "Posterior Canal Reconstruction After Radical Mastoidectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-022",
    "description": "Reduction and fixation of Jaw fractures",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-023",
    "description": "Reduction and fixation of maxillary fractures",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-024",
    "description": "Rhinoplasty",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-025",
    "description": "Sequestrectomy (Under GA)",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-026",
    "description": "Sequestrectomy (Under LA)",
    "tariffNgn": 25000,
    "section": "023"
  },
  {
    "code": "NHIS-023-027",
    "description": "Stapedial Surgery for Otosclerosis/Stapedectomy",
    "tariffNgn": 65000,
    "section": "023"
  },
  {
    "code": "NHIS-023-028",
    "description": "Styloidectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-029",
    "description": "Total parotidectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-030",
    "description": "Tympanoplasty",
    "tariffNgn": 62500,
    "section": "023"
  },
  {
    "code": "NHIS-023-031",
    "description": "Vidian Neurectomy",
    "tariffNgn": 60000,
    "section": "023"
  },
  {
    "code": "NHIS-023-032",
    "description": "Fixation of fracture of the jaw",
    "tariffNgn": 45000,
    "section": "023"
  },
  {
    "code": "NHIS-030-001",
    "description": "Antenatal care",
    "tariffNgn": 10000,
    "section": "030"
  },
  {
    "code": "NHIS-030-002",
    "description": "Normal Delivery",
    "tariffNgn": 10000,
    "section": "030"
  },
  {
    "code": "NHIS-030-003",
    "description": "Delivery of Multiple Pregnancy",
    "tariffNgn": 15000,
    "section": "030"
  },
  {
    "code": "NHIS-031-001",
    "description": "Cervical Polypectomy",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-002",
    "description": "Cervical Cone Biopsy",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-003",
    "description": "Colposcopy",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-004",
    "description": "D&C / Evacuation of Retained Products of Conception",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-005",
    "description": "Destructive delivery (cranioembrayotomy)",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-006",
    "description": "Excision / Diathermy of Warts",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-007",
    "description": "Excision of Vaginal Septum",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-008",
    "description": "Hysteroscopy",
    "tariffNgn": 25000,
    "section": "031"
  },
  {
    "code": "NHIS-031-009",
    "description": "Labial Cyst",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-010",
    "description": "Laparoscopy + Dye Test",
    "tariffNgn": 25000,
    "section": "031"
  },
  {
    "code": "NHIS-031-012",
    "description": "Pap Smear Procedure",
    "tariffNgn": 5000,
    "section": "031"
  },
  {
    "code": "NHIS-031-013",
    "description": "Perineal Warts",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-014",
    "description": "Repair of Episiotomy",
    "tariffNgn": 10000,
    "section": "031"
  },
  {
    "code": "NHIS-031-015",
    "description": "Uterine Evacuation",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-016",
    "description": "Vaginal Cyst Enucleation (Under LA)",
    "tariffNgn": 20000,
    "section": "031"
  },
  {
    "code": "NHIS-031-017",
    "description": "Vaginal Cyst Enucleation (Under GA)",
    "tariffNgn": 50000,
    "section": "031"
  },
  {
    "code": "NHIS-032-001",
    "description": "Cervical Circlage/Shirodkar Suture",
    "tariffNgn": 40000,
    "section": "032"
  },
  {
    "code": "NHIS-032-002",
    "description": "Colporrhaphy - Vaginal wall repair/Colpoperineorrhaphy",
    "tariffNgn": 35000,
    "section": "032"
  },
  {
    "code": "NHIS-032-003",
    "description": "Diagnostic Laparoscopy",
    "tariffNgn": 35000,
    "section": "032"
  },
  {
    "code": "NHIS-032-004",
    "description": "Laparoscopy (therapeutic)",
    "tariffNgn": 50000,
    "section": "032"
  },
  {
    "code": "NHIS-032-005",
    "description": "Hydrotubation",
    "tariffNgn": 30000,
    "section": "032"
  },
  {
    "code": "NHIS-032-006",
    "description": "Hymenectomy and repair of Hymen",
    "tariffNgn": 30000,
    "section": "032"
  },
  {
    "code": "NHIS-032-007",
    "description": "Instrumental Delivery (Forceps, Vacuum Extraction)",
    "tariffNgn": 30000,
    "section": "032"
  },
  {
    "code": "NHIS-032-008",
    "description": "Mini Laparotomy",
    "tariffNgn": 40000,
    "section": "032"
  },
  {
    "code": "NHIS-032-009",
    "description": "Repair of Third Degree Tear",
    "tariffNgn": 20000,
    "section": "032"
  },
  {
    "code": "NHIS-033-001",
    "description": "Amputation of the Cervix",
    "tariffNgn": 55000,
    "section": "033"
  },
  {
    "code": "NHIS-033-002",
    "description": "Bilateral tubal ligation",
    "tariffNgn": 55000,
    "section": "033"
  },
  {
    "code": "NHIS-033-003",
    "description": "Broad ligament Haematoma",
    "tariffNgn": 55000,
    "section": "033"
  },
  {
    "code": "NHIS-033-004",
    "description": "Caesarean Section, elective, emergency, single live born, twin etc",
    "tariffNgn": 70000,
    "section": "033"
  },
  {
    "code": "NHIS-033-005",
    "description": "Caesarean Section with BTL",
    "tariffNgn": 80000,
    "section": "033"
  },
  {
    "code": "NHIS-033-006",
    "description": "Caesarean Section with Hysterectomy",
    "tariffNgn": 90000,
    "section": "033"
  },
  {
    "code": "NHIS-033-007",
    "description": "Cervical Cautery",
    "tariffNgn": 55000,
    "section": "033"
  },
  {
    "code": "NHIS-033-008",
    "description": "Wedge Resection of The Ovary",
    "tariffNgn": 70000,
    "section": "033"
  },
  {
    "code": "NHIS-033-009",
    "description": "Examination Under Anaesthesia",
    "tariffNgn": 55000,
    "section": "033"
  },
  {
    "code": "NHIS-033-010",
    "description": "Hysterectomy And Bilateral Salpingo-Oophorectomy (Abdominal/Vaginal))",
    "tariffNgn": 100000,
    "section": "033"
  },
  {
    "code": "NHIS-033-011",
    "description": "Hysterectomy/Manchester Repair (all types)",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-012",
    "description": "Laparotomy Diagnostic / Therapeutic , Inter- Sex",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-013",
    "description": "Myomectomy (Abdominal)",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-014",
    "description": "Ovarian Biopsy",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-015",
    "description": "Ovarectomy/Oophrectomy",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-016",
    "description": "Pelvic Haematocoele",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-017",
    "description": "Pelvic/Abdominal Abscess Drainage",
    "tariffNgn": 60000,
    "section": "033"
  },
  {
    "code": "NHIS-033-018",
    "description": "Reconstruction of Vagina (e.g. Secondary to vaginal Atresia)",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-019",
    "description": "Reconstruction Surgery E.G Straussman Operation",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-020",
    "description": "Rectovaginal Fistula Repair",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-021",
    "description": "Repair of Inverted Uterus",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-022",
    "description": "Repair of Perforated Uterus",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-023",
    "description": "Repair of Ruptured Uterus",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-024",
    "description": "Salpingectomy ( e.g for Ectopic Pregnancy)",
    "tariffNgn": 65000,
    "section": "033"
  },
  {
    "code": "NHIS-033-025",
    "description": "Salpingo-Oophoreictomy",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-026",
    "description": "Tubal Reconstruction",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-027",
    "description": "Ureterovaginal Fistula Repair",
    "tariffNgn": 70000,
    "section": "033"
  },
  {
    "code": "NHIS-033-028",
    "description": "Uterovesical Fistula Repair",
    "tariffNgn": 70000,
    "section": "033"
  },
  {
    "code": "NHIS-033-029",
    "description": "Vaginoclesis",
    "tariffNgn": 70000,
    "section": "033"
  },
  {
    "code": "NHIS-033-030",
    "description": "Ventrosuspension of The Bladder",
    "tariffNgn": 75000,
    "section": "033"
  },
  {
    "code": "NHIS-033-031",
    "description": "Ventrosuspension Procedures of Correction of Uterine Prolapse",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-033-032",
    "description": "Vesicovaginal Fistula Repair",
    "tariffNgn": 55000,
    "section": "033"
  },
  {
    "code": "NHIS-033-033",
    "description": "Vulvectomy",
    "tariffNgn": 68000,
    "section": "033"
  },
  {
    "code": "NHIS-040-001",
    "description": "Aspiration",
    "tariffNgn": 2500,
    "section": "040"
  },
  {
    "code": "NHIS-040-002",
    "description": "Aspirations (USS guided)",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-003",
    "description": "Diagnostic Paracentesis",
    "tariffNgn": 2500,
    "section": "040"
  },
  {
    "code": "NHIS-040-004",
    "description": "Haemodialysis (50:50 partial coverage; up to 6 sessions)",
    "tariffNgn": 26000,
    "section": "040"
  },
  {
    "code": "NHIS-040-005",
    "description": "Therapeutic Paracentesis",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-040-006",
    "description": "Critical Care In I.C.U (per day)",
    "tariffNgn": 7500,
    "section": "040"
  },
  {
    "code": "NHIS-040-007",
    "description": "Bed Fee (per day)",
    "tariffNgn": 1000,
    "section": "040"
  },
  {
    "code": "NHIS-040-008",
    "description": "Nursing Care (per day)",
    "tariffNgn": 1000,
    "section": "040"
  },
  {
    "code": "NHIS-040-009",
    "description": "Mechanical ventilation (per day)",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-010",
    "description": "Oxygen Therapy (per day)",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-040-011",
    "description": "Central Venous Cannulation (per session)",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-040-012",
    "description": "Endotracheal Intubation (per session)",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-013",
    "description": "Echocardiography",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-040-014",
    "description": "Electrocardiography ( ECG)",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-015",
    "description": "Electro-Encephalography (EEG)",
    "tariffNgn": 15000,
    "section": "040"
  },
  {
    "code": "NHIS-040-016",
    "description": "24 Hour ECG (Holter ECG)",
    "tariffNgn": 15000,
    "section": "040"
  },
  {
    "code": "NHIS-040-017",
    "description": "Exercise ECG",
    "tariffNgn": 7500,
    "section": "040"
  },
  {
    "code": "NHIS-040-018",
    "description": "Ambulatory BP Monitoring",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-019",
    "description": "Gastric Lavage",
    "tariffNgn": 2500,
    "section": "040"
  },
  {
    "code": "NHIS-040-020",
    "description": "Lumbar Puncture",
    "tariffNgn": 2500,
    "section": "040"
  },
  {
    "code": "NHIS-040-021",
    "description": "Lung Function Test",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-022",
    "description": "Nebulisation (per session)",
    "tariffNgn": 2000,
    "section": "040"
  },
  {
    "code": "NHIS-040-023",
    "description": "Oxygen Therapy (per day)",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-040-024",
    "description": "Oxygen Therapy (per hour)",
    "tariffNgn": 500,
    "section": "040"
  },
  {
    "code": "NHIS-040-025",
    "description": "Tissue Biopsy (e.g. Liver, Kidney etc)",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-040-026",
    "description": "Skin Biopsy",
    "tariffNgn": 5000,
    "section": "040"
  },
  {
    "code": "NHIS-040-027",
    "description": "Bone Marrow Biopsy",
    "tariffNgn": 10000,
    "section": "040"
  },
  {
    "code": "NHIS-051-001",
    "description": "Above Knee Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-002",
    "description": "Cylinder Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-003",
    "description": "Below Knee Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-004",
    "description": "Boot Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-005",
    "description": "Above Knee Back Slab",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-006",
    "description": "Below Knee Back Slab",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-007",
    "description": "Above Elbow Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-008",
    "description": "Below Elbow Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-009",
    "description": "U- Shaped Pop Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-010",
    "description": "U- Shaped Pop Back Slap",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-011",
    "description": "Hanging Cast",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-012",
    "description": "Hip Spica Pop Cast",
    "tariffNgn": 15000,
    "section": "051"
  },
  {
    "code": "NHIS-051-013",
    "description": "Mineaur Jacket Pop Cast",
    "tariffNgn": 15000,
    "section": "051"
  },
  {
    "code": "NHIS-051-014",
    "description": "Thoracolumbar Pop Cast",
    "tariffNgn": 15000,
    "section": "051"
  },
  {
    "code": "NHIS-051-015",
    "description": "Lumber Pop Cast",
    "tariffNgn": 15000,
    "section": "051"
  },
  {
    "code": "NHIS-051-016",
    "description": "Full Arm Casts",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-017",
    "description": "Full Leg Casts",
    "tariffNgn": 10000,
    "section": "051"
  },
  {
    "code": "NHIS-051-018",
    "description": "Scotch Cast",
    "tariffNgn": 15000,
    "section": "051"
  },
  {
    "code": "NHIS-051-019",
    "description": "Removal of POP",
    "tariffNgn": 2500,
    "section": "051"
  },
  {
    "code": "NHIS-052-001",
    "description": "Amputation - Fingers",
    "tariffNgn": 18000,
    "section": "052"
  },
  {
    "code": "NHIS-052-002",
    "description": "Amputation - Toes",
    "tariffNgn": 18000,
    "section": "052"
  },
  {
    "code": "NHIS-052-003",
    "description": "Excision biopsy",
    "tariffNgn": 15000,
    "section": "052"
  },
  {
    "code": "NHIS-052-004",
    "description": "Knee Effusion Tap",
    "tariffNgn": 15000,
    "section": "052"
  },
  {
    "code": "NHIS-052-005",
    "description": "Release of Chordae",
    "tariffNgn": 15000,
    "section": "052"
  },
  {
    "code": "NHIS-052-006",
    "description": "Surgical Release In Stenosing Tenosynovitis",
    "tariffNgn": 18000,
    "section": "052"
  },
  {
    "code": "NHIS-052-007",
    "description": "Synovectomy",
    "tariffNgn": 18000,
    "section": "052"
  },
  {
    "code": "NHIS-052-008",
    "description": "Grafting of minor amputation",
    "tariffNgn": 25000,
    "section": "052"
  },
  {
    "code": "NHIS-053-001",
    "description": "Closed Reduction of Fracture",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-053-002",
    "description": "Drainage of Septic Arthritis",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-053-003",
    "description": "Exostectomy",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-053-004",
    "description": "Saucerisation of Chronically Infected Bone",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-053-005",
    "description": "Sequestrectomy",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-053-006",
    "description": "Simple Congenital Talipes Repair",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-053-007",
    "description": "Skin Traction (Application)",
    "tariffNgn": 3000,
    "section": "053"
  },
  {
    "code": "NHIS-053-008",
    "description": "Subperiosteal Drainage of Acute Osteomyelitis",
    "tariffNgn": 25000,
    "section": "053"
  },
  {
    "code": "NHIS-053-009",
    "description": "Surgical Correction of Dupuytren's Contracture",
    "tariffNgn": 25000,
    "section": "053"
  },
  {
    "code": "NHIS-053-010",
    "description": "Syndactlysis",
    "tariffNgn": 15000,
    "section": "053"
  },
  {
    "code": "NHIS-053-011",
    "description": "Pollicisation of The Index Finger",
    "tariffNgn": 30000,
    "section": "053"
  },
  {
    "code": "NHIS-054-001",
    "description": "Amputation and Disarticulation of Joints",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-002",
    "description": "Amputation and Limb Substitution",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-003",
    "description": "Anterior and posterior spine fixation",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-004",
    "description": "Arthrodesis",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-005",
    "description": "Arthroplasty",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-006",
    "description": "Arthrotomy (+synovectomy)",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-007",
    "description": "Bone Grafting",
    "tariffNgn": 25000,
    "section": "054"
  },
  {
    "code": "NHIS-054-008",
    "description": "Foot",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-009",
    "description": "Fore- Arm",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-010",
    "description": "Hand",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-011",
    "description": "Leg",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-012",
    "description": "Pectoral Girdle",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-013",
    "description": "Pelvic Girdle",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-014",
    "description": "Ribs",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-015",
    "description": "Thigh",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-016",
    "description": "Upper Arm",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-017",
    "description": "Spinal Column",
    "tariffNgn": 150000,
    "section": "054"
  },
  {
    "code": "NHIS-054-018",
    "description": "Osteoclasis, Internal Fixation of Mal-union",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-019",
    "description": "Reconstruction Surgeries: Acromium, head of femur etc",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-020",
    "description": "Surgical Repair of Congenital Talipes Equanovarus/ Valgus",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-021",
    "description": "Tendon Grafting",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-022",
    "description": "Tendon Transplant",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-023",
    "description": "Decompression of carpal tunnel syndrome",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-054-024",
    "description": "Tenoplasty",
    "tariffNgn": 100000,
    "section": "054"
  },
  {
    "code": "NHIS-061-001",
    "description": "Adventious Bursae - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-002",
    "description": "Bakers Cyst - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-003",
    "description": "Biopsy of Oesophageal Mass",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-004",
    "description": "Biopsy of Prostate",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-005",
    "description": "Biopsy of Tumour of Abdominal Wall",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-006",
    "description": "Bursa - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-007",
    "description": "Catheterization of Urinary Bladder per session (up to three sessions annually)",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-008",
    "description": "Cervical Lymph nodes - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-009",
    "description": "Circumcision of the Grown Up",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-010",
    "description": "Debridement And Toilet of Wounds",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-011",
    "description": "Dermoid Cyst Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-012",
    "description": "Dissection of Inguinal Nodes",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-013",
    "description": "Dorsal Slit and Reduction of Paraphimosis",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-014",
    "description": "Electrofulguration of Condylomata Acuminata",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-015",
    "description": "Excision of Breast Lump",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-016",
    "description": "Excision of Intrascrostal Mass",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-017",
    "description": "Excision of Neurofibroma",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-018",
    "description": "Excision of Tophi",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-019",
    "description": "Fibroadenoma - Unilateral",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-020",
    "description": "Ganglion - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-021",
    "description": "Ganglion - Small - Excision D,",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-022",
    "description": "Ganglion (Dorsum of Both Wrist) - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-023",
    "description": "Ganglionectectomy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-024",
    "description": "Gastroduodenoscopy/ Endoscopies",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-025",
    "description": "Granuloma - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-026",
    "description": "Granuloma Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-027",
    "description": "Herniotomy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-028",
    "description": "Incision And Drainage of Abscess",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-029",
    "description": "Infected Bunion Foot - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-030",
    "description": "In-growing Toenail (Excision)",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-031",
    "description": "Intercostals Drainage Insertion",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-032",
    "description": "Lipectomy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-033",
    "description": "Liver/ Kidney/ Bone Marrow Biopsy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-034",
    "description": "Lords Procedure (haemorrhoids)",
    "tariffNgn": 25000,
    "section": "061"
  },
  {
    "code": "NHIS-061-036",
    "description": "Oesophagoscopy for foreign body removal",
    "tariffNgn": 25000,
    "section": "061"
  },
  {
    "code": "NHIS-061-037",
    "description": "Paracentesis (A/C Wash Out )",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-038",
    "description": "Pericardiocentesis",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-039",
    "description": "Priapism, Shunt Procedure All Types",
    "tariffNgn": 23000,
    "section": "061"
  },
  {
    "code": "NHIS-061-040",
    "description": "Proctoscopy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-041",
    "description": "Punch Biopsy",
    "tariffNgn": 10000,
    "section": "061"
  },
  {
    "code": "NHIS-061-042",
    "description": "Rectal Dilation",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-043",
    "description": "Sebaceous Cyst - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-044",
    "description": "Sigmoidoscopy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-045",
    "description": "Sinus - Excision",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-046",
    "description": "Surgical Drainage In Haematoma of Rectus Abdominis",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-047",
    "description": "Surgical Drainage of Anal Abscess",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-048",
    "description": "Surgical Drainage of Galactocoele",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-049",
    "description": "Surgical release of Stenosing tenosinovitis",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-050",
    "description": "Suture of Major Wounds",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-051",
    "description": "Syndactylus",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-052",
    "description": "Testicular Biopsy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-061-053",
    "description": "Varicocoelectomy",
    "tariffNgn": 20000,
    "section": "061"
  },
  {
    "code": "NHIS-062-001",
    "description": "Adenoidectomy",
    "tariffNgn": 40000,
    "section": "062"
  },
  {
    "code": "NHIS-062-002",
    "description": "Anal Fistulectomy Repair",
    "tariffNgn": 40000,
    "section": "062"
  },
  {
    "code": "NHIS-062-003",
    "description": "Anal Sphincteroplasty",
    "tariffNgn": 40000,
    "section": "062"
  },
  {
    "code": "NHIS-062-004",
    "description": "Anorectoplasty",
    "tariffNgn": 40000,
    "section": "062"
  },
  {
    "code": "NHIS-062-005",
    "description": "Appendicetomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-006",
    "description": "Bilateral Cutaneous Ureterostomy",
    "tariffNgn": 40000,
    "section": "062"
  },
  {
    "code": "NHIS-062-007",
    "description": "Bilateral Ureteoenterostomy",
    "tariffNgn": 40000,
    "section": "062"
  },
  {
    "code": "NHIS-062-008",
    "description": "Branchial Fistula",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-009",
    "description": "Bronchial Cyst",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-010",
    "description": "Bronchoscopy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-011",
    "description": "Cystic Hygroma Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-012",
    "description": "Cystourethroscopy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-013",
    "description": "Dissection of Femoral Triangle",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-014",
    "description": "Drainage of Ischio Rectal Abscess",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-015",
    "description": "Drainage of Psoas Abscess",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-016",
    "description": "Enterocele Or Vault Prolapse Repair",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-017",
    "description": "Epidedectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-018",
    "description": "Evacuation of Scrotal Hematoma",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-019",
    "description": "Excision Bronchial Sinus",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-020",
    "description": "Excision Mammary Fistula",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-021",
    "description": "Excision of Urethral Carbuncle",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-022",
    "description": "Excision Pilonidal Sinus",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-023",
    "description": "Excission of Haemangiomas",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-024",
    "description": "Facial Decompression",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-025",
    "description": "Fibroadenoma - Bilateral",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-026",
    "description": "Fibroma - Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-027",
    "description": "Fissurectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-028",
    "description": "Fistula In - Ano Repair",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-029",
    "description": "Fistula Repair",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-030",
    "description": "Fistulectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-031",
    "description": "Fulguration",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-032",
    "description": "Haemangioma - Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-033",
    "description": "Haemorhoidectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-034",
    "description": "Herniorhaphies (all types)",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-035",
    "description": "Hiatus Herniorrphaphy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-036",
    "description": "Hydrocoelectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-037",
    "description": "Inguinal Node (bulk dissection) axial",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-038",
    "description": "Injection Sclerotherapy of Varicose Veins (minor)",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-039",
    "description": "Low Fistulectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-040",
    "description": "Macindoe Procedure",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-041",
    "description": "Oesophagoscopy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-042",
    "description": "Orchidectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-043",
    "description": "Orchidopexy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-044",
    "description": "Papilloma Rectum - Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-045",
    "description": "Polypectomy (Cervical )",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-046",
    "description": "Rectal polyp",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-047",
    "description": "Scrotal Swelling (Multiple) - Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-048",
    "description": "Skin Grafting",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-049",
    "description": "Submandibular Lymphs - Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-050",
    "description": "Suprapubic Cystostomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-051",
    "description": "Surgery of Torsion of Spermatic Cord",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-052",
    "description": "Surgical corrections of Duputytren's contracture",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-053",
    "description": "Umbilical Sinus - Excision",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-062-054",
    "description": "Vasectomy",
    "tariffNgn": 35000,
    "section": "062"
  },
  {
    "code": "NHIS-063-001",
    "description": "Abdominal Rectopexy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-002",
    "description": "Abdomino Perineal Resection",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-003",
    "description": "Abdominoperineal Rectum Resection",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-004",
    "description": "Abdomino-Perineal Resection",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-005",
    "description": "Adrenalectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-006",
    "description": "Anal Pull Through",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-007",
    "description": "Appendicular Abscess - Drainage",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-008",
    "description": "Appendicular Perforation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-009",
    "description": "Axillary Dissection of Breast",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-010",
    "description": "Biopsy of Retroperitoneal Tumor",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-011",
    "description": "Broad Ligament Haematoma",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-012",
    "description": "Burst Abdomen Obstruction",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-013",
    "description": "Caecopexy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-014",
    "description": "Cavernospongiosum Shunt",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-015",
    "description": "Cholecystectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-016",
    "description": "Cholecystectomy & exploration",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-017",
    "description": "Choledochal Cystojejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-018",
    "description": "Choledocho Jejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-019",
    "description": "Choledochostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-020",
    "description": "Closure of Hollow Viscus Perforation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-021",
    "description": "Colectomy-Partial Or Total",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-022",
    "description": "Colon Reconstruction After Hartmann's Procedure",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-023",
    "description": "Colostomy Construction/Closure",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-024",
    "description": "Commando Operation",
    "tariffNgn": 100000,
    "section": "063"
  },
  {
    "code": "NHIS-063-025",
    "description": "Condilectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-026",
    "description": "Continent Ileostomy Pouch",
    "tariffNgn": 90000,
    "section": "063"
  },
  {
    "code": "NHIS-063-027",
    "description": "Corporosavenous Shunt",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-028",
    "description": "Craniotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-029",
    "description": "Cricopharyngeal Myotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-030",
    "description": "Cystectomy Partial/Total",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-031",
    "description": "Cystic/Fibrous Dysplasia",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-032",
    "description": "Cystolithotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-033",
    "description": "Decortication",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-034",
    "description": "Diaphragmatic Hernia Repair",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-035",
    "description": "Dissection of The Mediastinium",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-036",
    "description": "Diverticulectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-037",
    "description": "Drainage of Gastric Abscess",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-038",
    "description": "Drainage of Hepatic Abscess",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-039",
    "description": "Drainage of Subdiaphramatic Abscess",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-040",
    "description": "Drainage pericardial effusion",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-041",
    "description": "Duodenal Diverticulum",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-042",
    "description": "DuodenalJejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-043",
    "description": "Duodenectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-044",
    "description": "Ectopic Parathyroidectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-045",
    "description": "Encephalocoele Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-046",
    "description": "Enterostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-047",
    "description": "Enterostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-049",
    "description": "Excision of liver Abscess",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-050",
    "description": "Excision of Lymphoedematous Lymph Tissues",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-051",
    "description": "Excision of Pelvi-Rectal Fistula",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-052",
    "description": "Exploratory Laparatomy/Lysis of Adhesions",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-053",
    "description": "Extensive (Small and Large) Bowel Resection and Anastomoses",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-054",
    "description": "Fissurectomy and Haemorrhoidectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-055",
    "description": "Fissurectomy with Eversion of Sac -",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-056",
    "description": "Foreign Body Removal in Deep Region",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-057",
    "description": "Fundoplication",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-058",
    "description": "Gastrectomy- Partial/Total",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-059",
    "description": "Gastroenterostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-060",
    "description": "Gastrojejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-061",
    "description": "Gastrotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-062",
    "description": "Glossectomy-Partial/Total",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-063",
    "description": "Grahams Operation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-064",
    "description": "Haemorrage of Small Intestine",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-065",
    "description": "Haemorroidectomy+ Fistulectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-066",
    "description": "Heler's Procedure",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-067",
    "description": "Hemi Glossectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-068",
    "description": "Hemi Mandibulectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-069",
    "description": "Hemicolectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-070",
    "description": "Heminephrectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-071",
    "description": "Hemithyroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-072",
    "description": "Hepatic Resection (lobectomy)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-073",
    "description": "Hepatic Segmentectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-074",
    "description": "Herniorraphy and Hydrocelectomy Sac Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-075",
    "description": "Hydatid Cyst of Liver",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-076",
    "description": "Hydrocelectomy + Orchidectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-077",
    "description": "Hydrocelectomy+Hernioplasty - Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-078",
    "description": "Hypospadiacs Repair",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-079",
    "description": "Ileostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-080",
    "description": "Ileostomy Pouch Revison",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-081",
    "description": "Ilieo Sigmoidostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-082",
    "description": "Instestinal perforation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-083",
    "description": "Intestinal Obstruction",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-084",
    "description": "Intestinal Perforation (Resection Anastomosis)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-085",
    "description": "Intussusception Operation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-086",
    "description": "Jejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-087",
    "description": "Laparascopic Cholecystectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-088",
    "description": "Laparotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-089",
    "description": "Laryngectomy & Pharyngeal Diverticulum",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-090",
    "description": "Laryngectomy with Block Dissection (Throat)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-091",
    "description": "Laryngo Fissure (Throat)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-092",
    "description": "Laryngopharyngectomy (Throat)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-093",
    "description": "Ligation of Hepatic/Left Gastric Splenic Artery",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-094",
    "description": "Local Resection of Pelvic Tumour",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-095",
    "description": "Longitudinal Pancreaticojejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-096",
    "description": "Lymphatic Channel Transplantation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-097",
    "description": "Mastectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-098",
    "description": "Meckel's Diverticulectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-099",
    "description": "Mesenteric Caval Anastomosis",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-100",
    "description": "Mesenteric Cyst - Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-101",
    "description": "Microlaryngoscopic Surgery (microlaryngoscopy)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-102",
    "description": "Nephrectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-103",
    "description": "Nephrolithotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-104",
    "description": "Oddis Sphincteroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-105",
    "description": "Oesophageal , 2 & 3 Stage, Thoraco-Abdominal, Fistula Repair",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-106",
    "description": "Oesophageal Atresia And Tracheo-Oesophageal Fistula Repair",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-107",
    "description": "Oesophageal Substitution, Diverticulum Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-108",
    "description": "Oesophageal Transection",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-109",
    "description": "Oesophagectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-110",
    "description": "Oesophagogastrectomy With Interposition of Colonic/Jejunal Segment",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-111",
    "description": "Oesophagostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-112",
    "description": "Oophorectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-113",
    "description": "Orchidectomy + Herniorraphy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-114",
    "description": "Orchidopexy, with Circumsion, With Eversion of Sac, with Herniotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-115",
    "description": "Pancreatic Cystectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-116",
    "description": "Pancreaticoduodenectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-117",
    "description": "Pancreaticojejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-118",
    "description": "Parathyroidectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-119",
    "description": "Parodectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-120",
    "description": "Partial Pancreatectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-121",
    "description": "Pelvic Abscess - Open Drainage",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-122",
    "description": "Pelvic Evisceration",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-123",
    "description": "Penectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-124",
    "description": "Penoplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-125",
    "description": "Pericardiectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-126",
    "description": "Pharyngectomy & Reconstruction - Total",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-127",
    "description": "Phytomatous Growth in the Scalp - Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-128",
    "description": "Plastic Repair of Bladder Neck",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-129",
    "description": "Pleurectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-130",
    "description": "Pleuropneumonectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-131",
    "description": "Pneumonectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-132",
    "description": "Portocaval Shunt/Anastomosis",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-133",
    "description": "Proctocolectomy , Ileostomy & Ileosttomy Pouch",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-134",
    "description": "Prolapsed Rectum Repair",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-135",
    "description": "Prostatectomy (all types incl TURP)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-136",
    "description": "Pulmonary Embolectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-137",
    "description": "Pulmonary Resection",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-138",
    "description": "Pyelolithotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-139",
    "description": "Pyeloromyotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-140",
    "description": "Pyeloroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-141",
    "description": "Pyelotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-142",
    "description": "Pyloroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-143",
    "description": "Radical Cystectomy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-144",
    "description": "Radical Mastectomy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-145",
    "description": "Radical Mastectomy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-146",
    "description": "Radical Neck Dissection - Excision",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-147",
    "description": "Radical Pancreatectomy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-148",
    "description": "Radical Prostatectomy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-149",
    "description": "Reconstruction of The Ureter",
    "tariffNgn": 90000,
    "section": "063"
  },
  {
    "code": "NHIS-063-150",
    "description": "Rectopexy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-151",
    "description": "Recto-Urethral Fistula Closure",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-152",
    "description": "Rectovesical Fistula Closure",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-153",
    "description": "Renal Aneurysmectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-154",
    "description": "Renal Cystectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-155",
    "description": "Renal Decapsulation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-156",
    "description": "Renopelvic Lymphatectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-157",
    "description": "Repair of Bochidalek Diaphragmatic Congenital Defect",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-158",
    "description": "Repair of Bowel Perforations",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-159",
    "description": "Repair of Common Bile Duct",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-160",
    "description": "Repair of Gastric Lacerations",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-161",
    "description": "Repair of Oesophageal Lacerations",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-162",
    "description": "Repair of Splenic Laceration",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-163",
    "description": "Resection Anastomosis (Large Intestine)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-164",
    "description": "Resection Anastomosis (Small Intestine)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-165",
    "description": "Resection of Median Bar Obstruction",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-166",
    "description": "Retroperitoneal Drainage of Perinephric Abscess",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-167",
    "description": "Retroperitoneal Tumor - Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-168",
    "description": "Roux-En-Y Pancreatic Jejunostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-169",
    "description": "Salivary Gland - Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-170",
    "description": "Segmental Resection of Bladder Lesion",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-171",
    "description": "Selective Vagotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-172",
    "description": "Sigmoid Diverticulum",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-173",
    "description": "Simple closure - Peptic perforation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-174",
    "description": "Splenectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-175",
    "description": "Splenic Artery Aneurysmectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-176",
    "description": "Splenorhaphy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-177",
    "description": "Stripping And Ligation of Veins",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-178",
    "description": "Subcutaneous Venous Omphalo Saphenous Shunt",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-179",
    "description": "Submandibular Mass Excision + Reconstruction",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-180",
    "description": "Submandibular Sialoadenectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-181",
    "description": "Subtotal Thyroidectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-182",
    "description": "Super Selective Vagotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-183",
    "description": "Surgery of Acute Intra Abdominal Vascular Disease",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-184",
    "description": "Surgery of Complications of Diverticular Disease",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-185",
    "description": "Surgery of Complications of Pancreatitis",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-186",
    "description": "Surgery of Hepatic Trauma",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-187",
    "description": "Surgery of Intestinal Obstruction",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-188",
    "description": "Surgery of Seminal Vessicle",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-189",
    "description": "Surgery ofcomplications of Appendicitis",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-190",
    "description": "Surgical Exploration For Anorchism",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-191",
    "description": "Sympathectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-192",
    "description": "Thoracectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-193",
    "description": "Thoracoplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-194",
    "description": "Thoracotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-195",
    "description": "Thrombectomy By Forarty's Catheterisation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-196",
    "description": "Thyroglossal Cysts And Fistula Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-197",
    "description": "Thyroid Lobectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-198",
    "description": "Thyroidectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-199",
    "description": "Thyroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-200",
    "description": "Total Pancreatectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-201",
    "description": "Total Proctocolectomy & Ileostomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-202",
    "description": "Tracheal Resection",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-203",
    "description": "Tracheal Stenosis (End to end Anastamosis) (Throat)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-204",
    "description": "Tracheoplasty (Throat)",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-205",
    "description": "Transcystotomy Excision",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-206",
    "description": "Transcystotomy Fulgaration",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-207",
    "description": "Transcystotomy Lithotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-208",
    "description": "Transduodenal Choledochal Cystectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-209",
    "description": "Transduodenal Sphincteroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-210",
    "description": "Transoesophageal Variceligation",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-211",
    "description": "Transurethral Dessication of Congenital Meatal Stenoses",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-212",
    "description": "Transurethral Excision of Bladder Lesion",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-213",
    "description": "Transurethral Fulguration of Bladder Lesion",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-214",
    "description": "Urerthra-Reconstruction/ Repair of Prostatic/Membraneous Urethra",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-215",
    "description": "Ureteral Reinplantation Into The Bladder",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-216",
    "description": "Ureterolithotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-217",
    "description": "Ureterosigmoidostomy With Rectal Bladder/Colostomy",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-218",
    "description": "Uretherectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-219",
    "description": "Urethroplasty",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-220",
    "description": "Urethrotomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-221",
    "description": "Urethro-Vesicopexy, Combined Abdominal And Vaginal Approach",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-222",
    "description": "Uretro Vaginal Fistula Repair",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-223",
    "description": "Uretro Vesical Fistula Repair",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-224",
    "description": "Vagoplasty",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-225",
    "description": "Vagotomy/Pyloroplasty",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-226",
    "description": "Vasoplasty",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-227",
    "description": "Vein Patch Angioplasty",
    "tariffNgn": 85000,
    "section": "063"
  },
  {
    "code": "NHIS-063-228",
    "description": "Vesical Diverticulectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-229",
    "description": "Vesicovaginal Fistula Repair",
    "tariffNgn": 55000,
    "section": "063"
  },
  {
    "code": "NHIS-063-230",
    "description": "Volvous of Large Bowel",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-231",
    "description": "Vulvectomy",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-232",
    "description": "Warrens Shunt",
    "tariffNgn": 75000,
    "section": "063"
  },
  {
    "code": "NHIS-063-233",
    "description": "Wound Debridement ( Under GA )",
    "tariffNgn": 50000,
    "section": "063"
  },
  {
    "code": "NHIS-071-001",
    "description": "Ablation of Endometriotic Spot",
    "tariffNgn": 30000,
    "section": "071"
  },
  {
    "code": "NHIS-071-002",
    "description": "Adhesolysis",
    "tariffNgn": 100000,
    "section": "071"
  },
  {
    "code": "NHIS-071-003",
    "description": "Appendectomy",
    "tariffNgn": 55000,
    "section": "071"
  },
  {
    "code": "NHIS-071-004",
    "description": "Cholecystectomy",
    "tariffNgn": 60000,
    "section": "071"
  },
  {
    "code": "NHIS-071-005",
    "description": "Cholecystectomy and Drainage of Liver abscess",
    "tariffNgn": 60000,
    "section": "071"
  },
  {
    "code": "NHIS-071-006",
    "description": "Cholecystectomy with Excision of TO Mass",
    "tariffNgn": 55000,
    "section": "071"
  },
  {
    "code": "NHIS-071-007",
    "description": "Cyst Aspiration",
    "tariffNgn": 15000,
    "section": "071"
  },
  {
    "code": "NHIS-071-008",
    "description": "Endometria to Endometria Anastomosis",
    "tariffNgn": 30000,
    "section": "071"
  },
  {
    "code": "NHIS-071-009",
    "description": "Fimbriolysis",
    "tariffNgn": 30000,
    "section": "071"
  },
  {
    "code": "NHIS-071-010",
    "description": "Hemicolectomy",
    "tariffNgn": 60000,
    "section": "071"
  },
  {
    "code": "NHIS-071-011",
    "description": "Hysterectomy with bilateral SalpingoOperectomy",
    "tariffNgn": 75000,
    "section": "071"
  },
  {
    "code": "NHIS-071-012",
    "description": "Incisional Hernia - Repair",
    "tariffNgn": 75000,
    "section": "071"
  },
  {
    "code": "NHIS-071-013",
    "description": "Inguinal Hernia - Bilateral",
    "tariffNgn": 75000,
    "section": "071"
  },
  {
    "code": "NHIS-071-014",
    "description": "Inguinal hernia - Unilateral",
    "tariffNgn": 75000,
    "section": "071"
  },
  {
    "code": "NHIS-071-015",
    "description": "Intestinal resection",
    "tariffNgn": 75000,
    "section": "071"
  },
  {
    "code": "NHIS-071-016",
    "description": "Myomectomy",
    "tariffNgn": 75000,
    "section": "071"
  },
  {
    "code": "NHIS-071-017",
    "description": "Oophrectomy",
    "tariffNgn": 45000,
    "section": "071"
  },
  {
    "code": "NHIS-071-018",
    "description": "Ovarian Cystectomy",
    "tariffNgn": 45000,
    "section": "071"
  },
  {
    "code": "NHIS-071-019",
    "description": "Perotionities",
    "tariffNgn": 45000,
    "section": "071"
  },
  {
    "code": "NHIS-071-020",
    "description": "Repair of Ureterocele",
    "tariffNgn": 60000,
    "section": "071"
  },
  {
    "code": "NHIS-071-021",
    "description": "Salpingo Ophrectomy",
    "tariffNgn": 45000,
    "section": "071"
  },
  {
    "code": "NHIS-071-022",
    "description": "Salpingostomy",
    "tariffNgn": 45000,
    "section": "071"
  },
  {
    "code": "NHIS-071-023",
    "description": "Uterine septum",
    "tariffNgn": 45000,
    "section": "071"
  },
  {
    "code": "NHIS-071-024",
    "description": "Varicocele - Bilateral",
    "tariffNgn": 60000,
    "section": "071"
  },
  {
    "code": "NHIS-071-025",
    "description": "Varicocele - Unilateral",
    "tariffNgn": 60000,
    "section": "071"
  },
  {
    "code": "NHIS-071-026",
    "description": "Bronchoscopy",
    "tariffNgn": 35000,
    "section": "071"
  },
  {
    "code": "NHIS-071-027",
    "description": "Cystourethroscopy",
    "tariffNgn": 35000,
    "section": "071"
  },
  {
    "code": "NHIS-071-028",
    "description": "Oesophagoscopy",
    "tariffNgn": 35000,
    "section": "071"
  },
  {
    "code": "NHIS-071-029",
    "description": "Upper GI Endoscopy",
    "tariffNgn": 35000,
    "section": "071"
  },
  {
    "code": "NHIS-071-030",
    "description": "Lower GI Endoscopy",
    "tariffNgn": 50000,
    "section": "071"
  },
  {
    "code": "NHIS-081-001",
    "description": "Manual Refraction",
    "tariffNgn": 1500,
    "section": "081"
  },
  {
    "code": "NHIS-081-002",
    "description": "Auto Refraction",
    "tariffNgn": 2500,
    "section": "081"
  },
  {
    "code": "NHIS-081-003",
    "description": "Tonometry (Pulsair/Goldmann Applanation)",
    "tariffNgn": 4000,
    "section": "081"
  },
  {
    "code": "NHIS-081-004",
    "description": "Pupilary Dilation Unilateral",
    "tariffNgn": 1500,
    "section": "081"
  },
  {
    "code": "NHIS-081-005",
    "description": "Pupillary Dilation Bilateral",
    "tariffNgn": 2500,
    "section": "081"
  },
  {
    "code": "NHIS-081-006",
    "description": "Indirect Ophthalmoscopy",
    "tariffNgn": 5000,
    "section": "081"
  },
  {
    "code": "NHIS-081-007",
    "description": "Direct Ophthalmoscopy",
    "tariffNgn": 2000,
    "section": "081"
  },
  {
    "code": "NHIS-081-008",
    "description": "Visual Field Assessment",
    "tariffNgn": 5000,
    "section": "081"
  },
  {
    "code": "NHIS-081-009",
    "description": "Slit lamp examination",
    "tariffNgn": 3000,
    "section": "081"
  },
  {
    "code": "NHIS-081-010",
    "description": "Cycloplegic refraction",
    "tariffNgn": 3000,
    "section": "081"
  },
  {
    "code": "NHIS-081-011",
    "description": "foreign body removal (per eye)",
    "tariffNgn": 5000,
    "section": "081"
  },
  {
    "code": "NHIS-081-012",
    "description": "Corneal Pachymetry",
    "tariffNgn": 3000,
    "section": "081"
  },
  {
    "code": "NHIS-081-013",
    "description": "Keratometry",
    "tariffNgn": 4000,
    "section": "081"
  },
  {
    "code": "NHIS-081-014",
    "description": "Gonioscopy",
    "tariffNgn": 3000,
    "section": "081"
  },
  {
    "code": "NHIS-081-015",
    "description": "Low priced spectacles - frame and lens (1 in not less than18 months)",
    "tariffNgn": 10000,
    "section": "081"
  },
  {
    "code": "NHIS-081-016",
    "description": "Fundus photography",
    "tariffNgn": 15000,
    "section": "081"
  },
  {
    "code": "NHIS-081-017",
    "description": "Low vision assessment",
    "tariffNgn": 10000,
    "section": "081"
  },
  {
    "code": "NHIS-081-018",
    "description": "Color vision test",
    "tariffNgn": 1500,
    "section": "081"
  },
  {
    "code": "NHIS-081-019",
    "description": "Dry eye assessment (Schirmer's test)",
    "tariffNgn": 2000,
    "section": "081"
  },
  {
    "code": "NHIS-081-020",
    "description": "Binocular Vision Testing",
    "tariffNgn": 2000,
    "section": "081"
  },
  {
    "code": "NHIS-081-021",
    "description": "Visual rehabilitation therapy (per session)",
    "tariffNgn": 10000,
    "section": "081"
  },
  {
    "code": "NHIS-081-022",
    "description": "flourescien staining",
    "tariffNgn": 500,
    "section": "081"
  },
  {
    "code": "NHIS-081-023",
    "description": "Eye dressing",
    "tariffNgn": 500,
    "section": "081"
  },
  {
    "code": "NHIS-081-024",
    "description": "Visual acuity testing",
    "tariffNgn": 500,
    "section": "081"
  },
  {
    "code": "NHIS-091-001",
    "description": "Abscess Drainage of Lid",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-002",
    "description": "Anterior Chamber Reconstruction",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-003",
    "description": "Paracentesis (A/C Washout)",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-004",
    "description": "Bowman's Cautery",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-005",
    "description": "Buckle Removal",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-006",
    "description": "Canaliculo Dacryocysto Rhinostomy",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-007",
    "description": "Capsulotomy",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-008",
    "description": "Cataract + Pterygium",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-009",
    "description": "Cataract Removal - Bilateral",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-010",
    "description": "Cataract Removal - Unilateral",
    "tariffNgn": 50000,
    "section": "091"
  },
  {
    "code": "NHIS-091-011",
    "description": "Chalazion Excision",
    "tariffNgn": 20000,
    "section": "091"
  },
  {
    "code": "NHIS-091-012",
    "description": "Combined Cataract Extraction with Trabeculectomy",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-013",
    "description": "Conjuctival Laceration Repair",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-014",
    "description": "Conjuctivectomy And Cryoapplication",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-015",
    "description": "Corneal Grafting",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-016",
    "description": "Cryoretinopexy - Closed",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-017",
    "description": "Cxyoretinopexy - Open",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-018",
    "description": "Cyclocryoablation/Cyclocryotherapy",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-019",
    "description": "Dacrocystectomy With Pterygium - Excision",
    "tariffNgn": 50000,
    "section": "091"
  },
  {
    "code": "NHIS-091-020",
    "description": "Dacrocystorhinostomy",
    "tariffNgn": 75000,
    "section": "091"
  },
  {
    "code": "NHIS-091-021",
    "description": "Dacryocystectomy",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-022",
    "description": "Diode Laser Cycloablation",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-023",
    "description": "Diode Laser Panretinal Photocoagulation",
    "tariffNgn": 40000,
    "section": "091"
  },
  {
    "code": "NHIS-091-024",
    "description": "Ectropion Correction",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-025",
    "description": "Endoscopic Optic Nerve Decompression",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-026",
    "description": "Endoscopic Optic Orbital Decompression",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-027",
    "description": "Entropion And Ectropion Repairs",
    "tariffNgn": 35000,
    "section": "091"
  },
  {
    "code": "NHIS-091-028",
    "description": "Evisceration/Enucleation/Extenteration",
    "tariffNgn": 70000,
    "section": "091"
  },
  {
    "code": "NHIS-091-029",
    "description": "Extracapsular Cataract Extraction",
    "tariffNgn": 45000,
    "section": "091"
  },
  {
    "code": "NHIS-091-030",
    "description": "Granuloma Excision (the eye)",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-031",
    "description": "Intraocular Foreign Body Removal",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-032",
    "description": "Iridectomy",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-033",
    "description": "IRIS Prolapse - Repair",
    "tariffNgn": 30000,
    "section": "091"
  },
  {
    "code": "NHIS-091-034",
    "description": "Keratoplasty",
    "tariffNgn": 80000,
    "section": "091"
  },
  {
    "code": "NHIS-091-035",
    "description": "Lacrimal probing and Syringing",
    "tariffNgn": 15000,
    "section": "091"
  },
  {
    "code": "NHIS-091-036",
    "description": "Lensectomy",
    "tariffNgn": 50000,
    "section": "091"
  },
  {
    "code": "NHIS-091-037",
    "description": "Limbal Dermoid Removal",
    "tariffNgn": 20000,
    "section": "091"
  },
  {
    "code": "NHIS-092-001",
    "description": "Membranectomy",
    "tariffNgn": 30000,
    "section": "092"
  },
  {
    "code": "NHIS-092-002",
    "description": "Paracentesis (A/C Washout)",
    "tariffNgn": 50000,
    "section": "092"
  },
  {
    "code": "NHIS-092-003",
    "description": "Penetrating Keratoplasty",
    "tariffNgn": 75000,
    "section": "092"
  },
  {
    "code": "NHIS-092-004",
    "description": "Perforating corneo - Scleral Injury",
    "tariffNgn": 75000,
    "section": "092"
  },
  {
    "code": "NHIS-092-005",
    "description": "Pterigium + Conjunctival Autograft",
    "tariffNgn": 35000,
    "section": "092"
  },
  {
    "code": "NHIS-092-006",
    "description": "Pterygium Excision",
    "tariffNgn": 20000,
    "section": "092"
  },
  {
    "code": "NHIS-092-007",
    "description": "Ptosis Repair",
    "tariffNgn": 75000,
    "section": "092"
  },
  {
    "code": "NHIS-092-008",
    "description": "Radial Keratotomy",
    "tariffNgn": 75000,
    "section": "092"
  },
  {
    "code": "NHIS-092-009",
    "description": "Removal of Foreign Bodies From Conjuctiva And Cornea",
    "tariffNgn": 5000,
    "section": "092"
  },
  {
    "code": "NHIS-092-010",
    "description": "Retinal Detachment Surgery (Partial Coverage)",
    "tariffNgn": 150000,
    "section": "092"
  },
  {
    "code": "NHIS-092-011",
    "description": "Scleral Buckling Procedures",
    "tariffNgn": 80000,
    "section": "092"
  },
  {
    "code": "NHIS-092-012",
    "description": "Socket Reconstruction",
    "tariffNgn": 75000,
    "section": "092"
  },
  {
    "code": "NHIS-092-013",
    "description": "Squint Surgery",
    "tariffNgn": 50000,
    "section": "092"
  },
  {
    "code": "NHIS-092-014",
    "description": "Syringing And Probing",
    "tariffNgn": 15000,
    "section": "092"
  },
  {
    "code": "NHIS-092-015",
    "description": "Trabeculectomy With Antimetabolites",
    "tariffNgn": 75000,
    "section": "092"
  },
  {
    "code": "NHIS-092-016",
    "description": "Traumatic Cannalicular Repair",
    "tariffNgn": 50000,
    "section": "092"
  },
  {
    "code": "NHIS-092-017",
    "description": "Traumatic Corneal and/Or Limbal/Scleral Laceration Repair",
    "tariffNgn": 55000,
    "section": "092"
  },
  {
    "code": "NHIS-092-018",
    "description": "Traumatic Lid Laceration Repair",
    "tariffNgn": 20000,
    "section": "092"
  },
  {
    "code": "NHIS-092-019",
    "description": "Tumor Excision from Lid",
    "tariffNgn": 30000,
    "section": "092"
  },
  {
    "code": "NHIS-092-020",
    "description": "Tumours of IRIS",
    "tariffNgn": 30000,
    "section": "092"
  },
  {
    "code": "NHIS-092-021",
    "description": "Vitrectomy",
    "tariffNgn": 35000,
    "section": "092"
  },
  {
    "code": "NHIS-092-022",
    "description": "Vitrectomy + Retinal Detachment (Partial Coverage)",
    "tariffNgn": 180000,
    "section": "092"
  },
  {
    "code": "NHIS-093-001",
    "description": "Fundus Imaging",
    "tariffNgn": 15000,
    "section": "093"
  },
  {
    "code": "NHIS-093-002",
    "description": "Optical Coherence Tomography OCT per eye (Partial coverage)",
    "tariffNgn": 30000,
    "section": "093"
  },
  {
    "code": "NHIS-093-003",
    "description": "Exenteration",
    "tariffNgn": 50000,
    "section": "093"
  },
  {
    "code": "NHIS-093-004",
    "description": "Enucleation",
    "tariffNgn": 20000,
    "section": "093"
  },
  {
    "code": "NHIS-093-005",
    "description": "Evisceration",
    "tariffNgn": 20000,
    "section": "093"
  },
  {
    "code": "NHIS-093-006",
    "description": "Gonioscopy",
    "tariffNgn": 3000,
    "section": "093"
  },
  {
    "code": "NHIS-093-007",
    "description": "Flourescein Angiography",
    "tariffNgn": 30000,
    "section": "093"
  },
  {
    "code": "NHIS-093-008",
    "description": "Subconj. Injection",
    "tariffNgn": 1000,
    "section": "093"
  },
  {
    "code": "NHIS-093-009",
    "description": "Biometry",
    "tariffNgn": 5000,
    "section": "093"
  },
  {
    "code": "NHIS-093-010",
    "description": "Flourescein staining",
    "tariffNgn": 500,
    "section": "093"
  },
  {
    "code": "NHIS-093-011",
    "description": "Excisional Biopsy (Conjunctival)",
    "tariffNgn": 25000,
    "section": "093"
  },
  {
    "code": "NHIS-093-012",
    "description": "Excisional Biopsy",
    "tariffNgn": 25000,
    "section": "093"
  },
  {
    "code": "NHIS-093-013",
    "description": "Chalazion Incision & Curretage",
    "tariffNgn": 25000,
    "section": "093"
  },
  {
    "code": "NHIS-093-014",
    "description": "Lacrimal Probing & Syringing",
    "tariffNgn": 15000,
    "section": "093"
  },
  {
    "code": "NHIS-093-015",
    "description": "Subconj. Injection",
    "tariffNgn": 1500,
    "section": "093"
  },
  {
    "code": "NHIS-093-016",
    "description": "Tonometry",
    "tariffNgn": 1000,
    "section": "093"
  },
  {
    "code": "NHIS-093-017",
    "description": "CVF",
    "tariffNgn": 5000,
    "section": "093"
  },
  {
    "code": "NHIS-093-018",
    "description": "Refraction",
    "tariffNgn": 3000,
    "section": "093"
  },
  {
    "code": "NHIS-093-019",
    "description": "Pachymetry",
    "tariffNgn": 3000,
    "section": "093"
  },
  {
    "code": "NHIS-093-020",
    "description": "Dilatation",
    "tariffNgn": 2000,
    "section": "093"
  },
  {
    "code": "NHIS-093-021",
    "description": "Corneal F.B. Removal",
    "tariffNgn": 5000,
    "section": "093"
  },
  {
    "code": "NHIS-093-022",
    "description": "Conj F. B. Removal",
    "tariffNgn": 3000,
    "section": "093"
  },
  {
    "code": "NHIS-093-023",
    "description": "Epilation",
    "tariffNgn": 2000,
    "section": "093"
  },
  {
    "code": "NHIS-093-024",
    "description": "Gonioscopy",
    "tariffNgn": 3000,
    "section": "093"
  },
  {
    "code": "NHIS-093-025",
    "description": "Cornea staining",
    "tariffNgn": 500,
    "section": "093"
  },
  {
    "code": "NHIS-093-026",
    "description": "Ptergium Excision",
    "tariffNgn": 20000,
    "section": "093"
  },
  {
    "code": "NHIS-093-027",
    "description": "Lid Repair (All Patients) - unilateral",
    "tariffNgn": 12000,
    "section": "093"
  },
  {
    "code": "NHIS-093-028",
    "description": "Lid Repair (All Patients) - bilateral",
    "tariffNgn": 20000,
    "section": "093"
  },
  {
    "code": "NHIS-093-028",
    "description": "Phaco",
    "tariffNgn": 100000,
    "section": "093"
  },
  {
    "code": "NHIS-093-030",
    "description": "Small incision cataract surgery (SICS)",
    "tariffNgn": 60000,
    "section": "093"
  },
  {
    "code": "NHIS-093-031",
    "description": "Extracapsular cataract extraction (ECCE)",
    "tariffNgn": 50000,
    "section": "093"
  },
  {
    "code": "NHIS-093-032",
    "description": "Intracapsular cataract extraction (ICCE)",
    "tariffNgn": 40000,
    "section": "093"
  },
  {
    "code": "NHIS-093-033",
    "description": "Trabeculectomy",
    "tariffNgn": 50000,
    "section": "093"
  },
  {
    "code": "NHIS-093-035",
    "description": "Peripheral Iridectomy",
    "tariffNgn": 38000,
    "section": "093"
  },
  {
    "code": "NHIS-093-036",
    "description": "Squint Surgery",
    "tariffNgn": 50000,
    "section": "093"
  },
  {
    "code": "NHIS-093-037",
    "description": "Exenteration",
    "tariffNgn": 50000,
    "section": "093"
  },
  {
    "code": "NHIS-093-038",
    "description": "Enucleation",
    "tariffNgn": 40000,
    "section": "093"
  },
  {
    "code": "NHIS-093-039",
    "description": "Evisceration",
    "tariffNgn": 40000,
    "section": "093"
  }
] as const;

// Curated subset for primary-care extraction prompts: consultations,
// internal medicine, common imaging, plain X-rays, basic + specialist labs,
// and primary obs/gyn. Keeps the prompt focused without losing coverage.
export const NHIA_TARIFF_PRIMARY_CARE: ReadonlyArray<NhiaTariffEntry> = [
  {
    "code": "NHIS-131-001",
    "description": "Cerebro-vascular Accident",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-002",
    "description": "Chest Conditions (per session)",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-003",
    "description": "Diabetic Neuropathy",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-004",
    "description": "Facial/Bell's Palsy",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-005",
    "description": "Spinal Cord Lesion",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-006",
    "description": "Parkinsonism",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-007",
    "description": "Peripheral Nerve Injuries",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-008",
    "description": "Sciatica",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-009",
    "description": "Incontinence",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-131-010",
    "description": "nerve root compression",
    "tariffNgn": 1500,
    "section": "131"
  },
  {
    "code": "NHIS-132-001",
    "description": "Delayed Developmental Milestone",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-002",
    "description": "Cerebral Palsy",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-003",
    "description": "Erbs Palsy (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-004",
    "description": "Talipes Manupulation (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-005",
    "description": "Injection trauma/palsy (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-006",
    "description": "congenital hip dislocation (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-007",
    "description": "Fractures (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-132-008",
    "description": "Polio deformities (per session)",
    "tariffNgn": 1500,
    "section": "132"
  },
  {
    "code": "NHIS-133-001",
    "description": "Arthritis per visit",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-002",
    "description": "Slipped disc/Low back pain per visit",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-003",
    "description": "Mouth Fracture",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-004",
    "description": "Burns",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-005",
    "description": "chest physiotherapy",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-006",
    "description": "post surgical rehabilitation",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-007",
    "description": "Fractures/dislocations/subluxation",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-133-008",
    "description": "Spondylosis/scoliosis",
    "tariffNgn": 1500,
    "section": "133"
  },
  {
    "code": "NHIS-134-001",
    "description": "P.I.D.",
    "tariffNgn": 1500,
    "section": "134"
  },
  {
    "code": "NHIS-134-002",
    "description": "Obstetrics trauma/paresis/paralysis",
    "tariffNgn": 1500,
    "section": "134"
  },
  {
    "code": "NHIS-134-003",
    "description": "Uterine Prolapse",
    "tariffNgn": 1500,
    "section": "134"
  },
  {
    "code": "NHIS-171-001",
    "description": "Hand/Finger (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-002",
    "description": "Wrist (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-003",
    "description": "Forearm (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-004",
    "description": "Elbow (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-005",
    "description": "Humerus (Adult)",
    "tariffNgn": 1200,
    "section": "171"
  },
  {
    "code": "NHIS-171-006",
    "description": "Shoulder (Adult)",
    "tariffNgn": 1800,
    "section": "171"
  },
  {
    "code": "NHIS-171-007",
    "description": "Clavicle",
    "tariffNgn": 1800,
    "section": "171"
  },
  {
    "code": "NHIS-171-008",
    "description": "Scaphoid series",
    "tariffNgn": 1800,
    "section": "171"
  },
  {
    "code": "NHIS-172-001",
    "description": "Foot/Toe (Adult)",
    "tariffNgn": 1200,
    "section": "172"
  },
  {
    "code": "NHIS-172-002",
    "description": "Ankle (Adult)",
    "tariffNgn": 1200,
    "section": "172"
  },
  {
    "code": "NHIS-172-003",
    "description": "Leg (Tibia/Fibula) (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-004",
    "description": "Knee (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-005",
    "description": "Hip (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-006",
    "description": "Femur Or Thigh (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-172-007",
    "description": "Pelvic (Adult)",
    "tariffNgn": 1800,
    "section": "172"
  },
  {
    "code": "NHIS-173-001",
    "description": "Chest (PA/AP) (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-173-002",
    "description": "Chest (PA/Lateral) (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-173-003",
    "description": "Chest For Ribs (Oblique) (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-173-004",
    "description": "Apical/Lordotic",
    "tariffNgn": 1500,
    "section": "173"
  },
  {
    "code": "NHIS-173-005",
    "description": "Sternum",
    "tariffNgn": 1500,
    "section": "173"
  },
  {
    "code": "NHIS-173-006",
    "description": "Thoracic Inlet (Adult)",
    "tariffNgn": 1800,
    "section": "173"
  },
  {
    "code": "NHIS-174-001",
    "description": "Cervical Spine (Adult)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-002",
    "description": "Lateral Neck (Soft Tissue)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-003",
    "description": "Thoracic Spine",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-004",
    "description": "Thoraco Lumber Spine (Adult)",
    "tariffNgn": 2800,
    "section": "174"
  },
  {
    "code": "NHIS-174-005",
    "description": "Lumbar Spine",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-006",
    "description": "Lumbo Sacral Spine (Adult)",
    "tariffNgn": 2800,
    "section": "174"
  },
  {
    "code": "NHIS-174-007",
    "description": "Sacrum",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-008",
    "description": "Sacro Iliac Joint (S.I.J.)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-009",
    "description": "Cervical Spine (Oblique)",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-174-010",
    "description": "Sacro-Coccyx",
    "tariffNgn": 2400,
    "section": "174"
  },
  {
    "code": "NHIS-175-001",
    "description": "Abdomen (Plain)",
    "tariffNgn": 1800,
    "section": "175"
  },
  {
    "code": "NHIS-175-002",
    "description": "Abdomen (Erect/Supine)",
    "tariffNgn": 1800,
    "section": "175"
  },
  {
    "code": "NHIS-175-003",
    "description": "Abdomen (Pregnancy)",
    "tariffNgn": 1800,
    "section": "175"
  },
  {
    "code": "NHIS-176-001",
    "description": "Skull (AP/Lat)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-002",
    "description": "Skull (Pa/Lat/Townes)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-003",
    "description": "Mastoids (Owens/ Townes)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-004",
    "description": "Sinuses AP/LNT/OM",
    "tariffNgn": 3000,
    "section": "176"
  },
  {
    "code": "NHIS-176-005",
    "description": "Mandibles (Jaw)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-006",
    "description": "Temporo-Mandibular Joints (TMJ)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-007",
    "description": "Sella Turcica",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-008",
    "description": "Tagential",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-009",
    "description": "Occipito-Mental (OM)",
    "tariffNgn": 2400,
    "section": "176"
  },
  {
    "code": "NHIS-176-010",
    "description": "Cranio-cordial",
    "tariffNgn": 3250,
    "section": "176"
  },
  {
    "code": "NHIS-176-011",
    "description": "Nasopharynx",
    "tariffNgn": 1850,
    "section": "176"
  },
  {
    "code": "NHIS-176-012",
    "description": "Paranasal sinuses",
    "tariffNgn": 2150,
    "section": "176"
  },
  {
    "code": "NHIS-178-001",
    "description": "Barium Swallow",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-002",
    "description": "Barium Meal/Follow Through",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-003",
    "description": "Barium Enema",
    "tariffNgn": 14000,
    "section": "178"
  },
  {
    "code": "NHIS-178-004",
    "description": "Intravenous Urography (IVU)",
    "tariffNgn": 15250,
    "section": "178"
  },
  {
    "code": "NHIS-178-005",
    "description": "Hysterosalpingogram (HSG)",
    "tariffNgn": 12250,
    "section": "178"
  },
  {
    "code": "NHIS-178-006",
    "description": "Cysto-Urethrogram",
    "tariffNgn": 12250,
    "section": "178"
  },
  {
    "code": "NHIS-178-007",
    "description": "Fistulogram",
    "tariffNgn": 9850,
    "section": "178"
  },
  {
    "code": "NHIS-178-008",
    "description": "Myelogram",
    "tariffNgn": 40000,
    "section": "178"
  },
  {
    "code": "NHIS-178-009",
    "description": "Skeletal Survey (Adult)",
    "tariffNgn": 6250,
    "section": "178"
  },
  {
    "code": "NHIS-178-010",
    "description": "Electrocardiography (E C G)",
    "tariffNgn": 5000,
    "section": "178"
  },
  {
    "code": "NHIS-178-011",
    "description": "Echocardiography",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-012",
    "description": "Electroencephalography",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-013",
    "description": "Micturating Cyto-Urethrogram",
    "tariffNgn": 8850,
    "section": "178"
  },
  {
    "code": "NHIS-178-014",
    "description": "Retrograde Urethrogram",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-015",
    "description": "Intravenous cholangiogram (IVC)",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-016",
    "description": "Phlebogram-One Leg",
    "tariffNgn": 10000,
    "section": "178"
  },
  {
    "code": "NHIS-178-017",
    "description": "Venogram-One Leg",
    "tariffNgn": 12000,
    "section": "178"
  },
  {
    "code": "NHIS-178-018",
    "description": "Arthrogram",
    "tariffNgn": 9650,
    "section": "178"
  },
  {
    "code": "NHIS-178-019",
    "description": "Sialogram",
    "tariffNgn": 7150,
    "section": "178"
  },
  {
    "code": "NHIS-178-020",
    "description": "Sinogram",
    "tariffNgn": 7150,
    "section": "178"
  },
  {
    "code": "NHIS-178-021",
    "description": "MRI Scan (Adult)",
    "tariffNgn": 70000,
    "section": "178"
  },
  {
    "code": "NHIS-178-022",
    "description": "MRI Scan (Children)",
    "tariffNgn": 35000,
    "section": "178"
  },
  {
    "code": "NHIS-178-023",
    "description": "CT Scan (Adult)",
    "tariffNgn": 60000,
    "section": "178"
  },
  {
    "code": "NHIS-178-024",
    "description": "CT Scan (Children)",
    "tariffNgn": 30000,
    "section": "178"
  },
  {
    "code": "NHIS-178-025",
    "description": "Mammogram",
    "tariffNgn": 8850,
    "section": "178"
  },
  {
    "code": "NHIS-178-026",
    "description": "Radiotherapy - radical treatment (per session) - Partial Coverage (50%)",
    "tariffNgn": 25000,
    "section": "178"
  },
  {
    "code": "NHIS-178-027",
    "description": "Radiotherapy - palliative (per session) - Partial Coverage (50%)",
    "tariffNgn": 25000,
    "section": "178"
  },
  {
    "code": "NHIS-178-028",
    "description": "Bone scan",
    "tariffNgn": 20000,
    "section": "178"
  },
  {
    "code": "NHIS-178-029",
    "description": "Renal scan (DTPA, DMSA)",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-030",
    "description": "GIT: Hepatobillary scan; Mackel scan",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-031",
    "description": "Perfusion lung scan",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-032",
    "description": "CNS: Cisternography; celebral perfusion",
    "tariffNgn": 20000,
    "section": "178"
  },
  {
    "code": "NHIS-178-033",
    "description": "Lymphoscintography",
    "tariffNgn": 15000,
    "section": "178"
  },
  {
    "code": "NHIS-178-034",
    "description": "Muga scan",
    "tariffNgn": 20000,
    "section": "178"
  },
  {
    "code": "NHIS-179-001",
    "description": "Obstetric Scan",
    "tariffNgn": 3550,
    "section": "179"
  },
  {
    "code": "NHIS-179-002",
    "description": "Abdominal Scan",
    "tariffNgn": 3550,
    "section": "179"
  },
  {
    "code": "NHIS-179-003",
    "description": "Pelvic Scan",
    "tariffNgn": 3550,
    "section": "179"
  },
  {
    "code": "NHIS-179-004",
    "description": "Breast Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-005",
    "description": "Bladder Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-006",
    "description": "Abdominal Pelvic Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-007",
    "description": "Prostate Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-008",
    "description": "Thyroid Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-009",
    "description": "Testes/Scrotal Scan (Each)",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-010",
    "description": "Ovulometry/Transvaginal Scan",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-011",
    "description": "Trans-Fontanelle (Children)",
    "tariffNgn": 3950,
    "section": "179"
  },
  {
    "code": "NHIS-179-012",
    "description": "Doppler Scan",
    "tariffNgn": 5000,
    "section": "179"
  },
  {
    "code": "NHIS-179-013",
    "description": "Ocular scan",
    "tariffNgn": 5000,
    "section": "179"
  },
  {
    "code": "NHIS-180-012",
    "description": "Urinalysis",
    "tariffNgn": 400,
    "section": "180"
  },
  {
    "code": "NHIS-180-013",
    "description": "Pregnancy Test (Urine)",
    "tariffNgn": 400,
    "section": "180"
  },
  {
    "code": "NHIS-180-014",
    "description": "Stool Analysis (R/E Only)",
    "tariffNgn": 400,
    "section": "180"
  },
  {
    "code": "NHIS-180-015",
    "description": "Blood Sugar (FBS/ RBS)",
    "tariffNgn": 650,
    "section": "180"
  },
  {
    "code": "NHIS-180-016",
    "description": "HB Genotype",
    "tariffNgn": 850,
    "section": "180"
  },
  {
    "code": "NHIS-180-017",
    "description": "Blood film comments",
    "tariffNgn": 550,
    "section": "180"
  },
  {
    "code": "NHIS-181-002",
    "description": "a) Sodium",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-003",
    "description": "b) Potassium",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-004",
    "description": "c) Chloride",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-005",
    "description": "d) Bicarbonate",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-006",
    "description": "Urea",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-007",
    "description": "Creatinine",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-009",
    "description": "a) Unconjugated Bilirubin",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-010",
    "description": "b) Conjugated Bilirubin",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-011",
    "description": "c) Alkaline Phosphatase",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-012",
    "description": "d) Alanine Aminotransferase (SGPT)",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-013",
    "description": "e) Aspartate Aminotransferase (SGOT)",
    "tariffNgn": 550,
    "section": "181"
  },
  {
    "code": "NHIS-181-014",
    "description": "Total Protein",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-015",
    "description": "Albumin",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-016",
    "description": "Globulin",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-017",
    "description": "Acid Phosphatase (Total & Prostatic) Each",
    "tariffNgn": 1100,
    "section": "181"
  },
  {
    "code": "NHIS-181-018",
    "description": "Total Cholesterol",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-019",
    "description": "Gamma-GT",
    "tariffNgn": 1150,
    "section": "181"
  },
  {
    "code": "NHIS-181-021",
    "description": "a) Total Cholesterol",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-022",
    "description": "b) Triglyceride",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-023",
    "description": "c)Low- density lipoprotein (LDL)",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-024",
    "description": "d)High -density lipoprotein (HDL)",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-025",
    "description": "Amylase",
    "tariffNgn": 750,
    "section": "181"
  },
  {
    "code": "NHIS-181-026",
    "description": "Fasting Blood Sugar (FBS)",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-027",
    "description": "Random Blood Sugar (RBS)",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-028",
    "description": "2-Hr Post Prandial Blood Sugar",
    "tariffNgn": 800,
    "section": "181"
  },
  {
    "code": "NHIS-181-029",
    "description": "24 HR- Urine Protein",
    "tariffNgn": 900,
    "section": "181"
  },
  {
    "code": "NHIS-181-030",
    "description": "Oral Glucose Tolerance Test (OGTT)",
    "tariffNgn": 1800,
    "section": "181"
  },
  {
    "code": "NHIS-181-031",
    "description": "Uric Acid",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-032",
    "description": "Iron",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-033",
    "description": "Magnesium",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-034",
    "description": "Creatine Phosphokinase (CPK)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-035",
    "description": "Phosphate",
    "tariffNgn": 530,
    "section": "181"
  },
  {
    "code": "NHIS-181-036",
    "description": "Lactate Dehydrogenase (LDH)",
    "tariffNgn": 820,
    "section": "181"
  },
  {
    "code": "NHIS-181-037",
    "description": "CSF: Chloride",
    "tariffNgn": 530,
    "section": "181"
  },
  {
    "code": "NHIS-181-038",
    "description": "CSF: Protein (Total)",
    "tariffNgn": 530,
    "section": "181"
  },
  {
    "code": "NHIS-181-039",
    "description": "CSF: Glucose",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-040",
    "description": "Urinalysis",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-041",
    "description": "Urea Clearance",
    "tariffNgn": 830,
    "section": "181"
  },
  {
    "code": "NHIS-181-043",
    "description": "Urea/Creatinine ratio",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-044",
    "description": "Inorganic Phosphorus",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-045",
    "description": "Creatinine Clearance",
    "tariffNgn": 900,
    "section": "181"
  },
  {
    "code": "NHIS-181-046",
    "description": "Glycocylated Heamoglobin (HBA1C)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-048",
    "description": "a) Urine",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-049",
    "description": "b) Blood",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-050",
    "description": "Calcium",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-052",
    "description": "CK",
    "tariffNgn": 900,
    "section": "181"
  },
  {
    "code": "NHIS-181-053",
    "description": "CK-MB Mass",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-054",
    "description": "Troponin T.",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-056",
    "description": "a) Follicle Stimulating Hormone (FSH)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-057",
    "description": "b) Luteinizing Hormone (LH)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-058",
    "description": "c) Prolactin",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-059",
    "description": "d) Progesterone",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-060",
    "description": "e) Testosterone",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-061",
    "description": "f) Oestradiol (E2)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-062",
    "description": "Oestriol (E3)",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-063",
    "description": "Cortisol",
    "tariffNgn": 4700,
    "section": "181"
  },
  {
    "code": "NHIS-181-064",
    "description": "Insulin",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-065",
    "description": "DHEA-Sulphate (17 ketosteroids)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-066",
    "description": "Thyroid Screening (a-f)",
    "tariffNgn": 33950,
    "section": "181"
  },
  {
    "code": "NHIS-181-067",
    "description": "a) Triiodothyronine (T3)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-068",
    "description": "b) Thyroid globulin",
    "tariffNgn": 9200,
    "section": "181"
  },
  {
    "code": "NHIS-181-069",
    "description": "c)Free Triiodothyronine (T3)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-070",
    "description": "d)Free Thyroxine (T4)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-071",
    "description": "e) Thyroxine (T4)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-072",
    "description": "f) Thyroid Stimulating Hormones (TSH)",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-073",
    "description": "Carcinoembryonic Antigen (CEA)",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-074",
    "description": "Breast Cancer Antigen/ CA 15-3",
    "tariffNgn": 5250,
    "section": "181"
  },
  {
    "code": "NHIS-181-075",
    "description": "Ovarian Cancer Antigen /CA 125",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-076",
    "description": "Pancreatic/Gut Cancer Antigen / CA19-9",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-077",
    "description": "Alpha-Feto Protein (AFP)",
    "tariffNgn": 3950,
    "section": "181"
  },
  {
    "code": "NHIS-181-079",
    "description": "a) Total",
    "tariffNgn": 9250,
    "section": "181"
  },
  {
    "code": "NHIS-181-080",
    "description": "b) Free",
    "tariffNgn": 5550,
    "section": "181"
  },
  {
    "code": "NHIS-181-081",
    "description": "Vanilyl Mandellic Acid (VMA)",
    "tariffNgn": 3250,
    "section": "181"
  },
  {
    "code": "NHIS-181-082",
    "description": "Molar Pregnancy (HCG-B)",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-101",
    "description": "Full Blood Count (FBC) (All Parameters)",
    "tariffNgn": 2600,
    "section": "181"
  },
  {
    "code": "NHIS-181-102",
    "description": "Haemoglobin (HB)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-103",
    "description": "Packed Cell Volume (PCV)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-113",
    "description": "Erythrocyte Sedimentation Rate (ESR)",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-114",
    "description": "Bleeding Time",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-115",
    "description": "Clotting Time",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-116",
    "description": "Prothrombin Time (PT)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-117",
    "description": "Kaolin-Cephalin Clotting Time",
    "tariffNgn": 1420,
    "section": "181"
  },
  {
    "code": "NHIS-181-118",
    "description": "Partial Prothrombin Time (PTT)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-119",
    "description": "HB Genotype",
    "tariffNgn": 850,
    "section": "181"
  },
  {
    "code": "NHIS-181-120",
    "description": "Blood Grouping (ABO & RH)",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-121",
    "description": "Sickling Test",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-124",
    "description": "Screening of Donor Blood",
    "tariffNgn": 3540,
    "section": "181"
  },
  {
    "code": "NHIS-181-125",
    "description": "Cross Match",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-126",
    "description": "Le Cells",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-127",
    "description": "G-6-PD Screening",
    "tariffNgn": 2350,
    "section": "181"
  },
  {
    "code": "NHIS-181-128",
    "description": "Osmotic Fragility",
    "tariffNgn": 950,
    "section": "181"
  },
  {
    "code": "NHIS-181-129",
    "description": "Coagulation Profile",
    "tariffNgn": 5950,
    "section": "181"
  },
  {
    "code": "NHIS-181-130",
    "description": "Bone Marrow Examination",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-131",
    "description": "Fibrinogen",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-132",
    "description": "Fresh Frozen plasma",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-133",
    "description": "Blood gas Analysis",
    "tariffNgn": 5950,
    "section": "181"
  },
  {
    "code": "NHIS-181-134",
    "description": "D-Dimer",
    "tariffNgn": 4950,
    "section": "181"
  },
  {
    "code": "NHIS-181-135",
    "description": "Ferritin",
    "tariffNgn": 1850,
    "section": "181"
  },
  {
    "code": "NHIS-181-136",
    "description": "Homocysteine",
    "tariffNgn": 5000,
    "section": "181"
  },
  {
    "code": "NHIS-181-137",
    "description": "Vitamin D",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-138",
    "description": "Vitamin B12",
    "tariffNgn": 3850,
    "section": "181"
  },
  {
    "code": "NHIS-181-139",
    "description": "Folate",
    "tariffNgn": 950,
    "section": "181"
  },
  {
    "code": "NHIS-181-201",
    "description": "a) Microscopy",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-202",
    "description": "b) Urinalysis",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-203",
    "description": "c) Microscopy, Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-205",
    "description": "a) Microscopy R/E only",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-206",
    "description": "b) Microscopy, Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-207",
    "description": "c) Faecal Occult Blood",
    "tariffNgn": 650,
    "section": "181"
  },
  {
    "code": "NHIS-181-208",
    "description": "d) H. pylori",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-209",
    "description": "a) Culture & Sensitivity",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-210",
    "description": "b) Malaria Parasites",
    "tariffNgn": 450,
    "section": "181"
  },
  {
    "code": "NHIS-181-211",
    "description": "c) Microfilaria",
    "tariffNgn": 400,
    "section": "181"
  },
  {
    "code": "NHIS-181-212",
    "description": "d) Trypanosomes",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-213",
    "description": "a) Semen Analysis",
    "tariffNgn": 1250,
    "section": "181"
  },
  {
    "code": "NHIS-181-214",
    "description": "b) Microscopy, Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-215",
    "description": "a) Gram Stain",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-216",
    "description": "b) Z.N stain for AFB x 3",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-217",
    "description": "c) Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-218",
    "description": "a) Cell Count + Microscopy",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-219",
    "description": "c) Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-220",
    "description": "a) Microscopy",
    "tariffNgn": 500,
    "section": "181"
  },
  {
    "code": "NHIS-181-221",
    "description": "b) Gram stain (where applicable)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-222",
    "description": "c) Culture & Sensitivity",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-223",
    "description": "a) Snip (microfilaria)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-224",
    "description": "b) Microscopy (KOH mount)",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-225",
    "description": "c) Scraping For Fungal Element (Culture)",
    "tariffNgn": 1200,
    "section": "181"
  },
  {
    "code": "NHIS-181-226",
    "description": "c) Mantoux test",
    "tariffNgn": 950,
    "section": "181"
  },
  {
    "code": "NHIS-181-301",
    "description": "Widal Test",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-302",
    "description": "VDRL",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-303",
    "description": "Rheumatiod Factor",
    "tariffNgn": 600,
    "section": "181"
  },
  {
    "code": "NHIS-181-304",
    "description": "Anti-Streptolysin O Titre (ASO Titre)",
    "tariffNgn": 700,
    "section": "181"
  },
  {
    "code": "NHIS-181-305",
    "description": "Hepatitis B Surface Antigen (HbsAg)",
    "tariffNgn": 1000,
    "section": "181"
  },
  {
    "code": "NHIS-181-306",
    "description": "Hepatitis B Confirmatory Test (Core Antigen)",
    "tariffNgn": 3000,
    "section": "181"
  },
  {
    "code": "NHIS-181-307",
    "description": "Hepatitis A (IgM)",
    "tariffNgn": 3000,
    "section": "181"
  },
  {
    "code": "NHIS-181-308",
    "description": "HbcAg/ HbeAg",
    "tariffNgn": 3000,
    "section": "181"
  },
  {
    "code": "NHIS-181-309",
    "description": "Hepatitis B DNA Viral Load",
    "tariffNgn": 20000,
    "section": "181"
  },
  {
    "code": "NHIS-181-310",
    "description": "HIV Screening",
    "tariffNgn": 1750,
    "section": "181"
  },
  {
    "code": "NHIS-181-311",
    "description": "HIV Confirmatory Test",
    "tariffNgn": 4850,
    "section": "181"
  },
  {
    "code": "NHIS-181-312",
    "description": "a) CD4 Count",
    "tariffNgn": 4150,
    "section": "181"
  },
  {
    "code": "NHIS-181-313",
    "description": "b) HIV Viral load",
    "tariffNgn": 5550,
    "section": "181"
  },
  {
    "code": "NHIS-181-314",
    "description": "Hepatitis C Antigen (HCV)",
    "tariffNgn": 3500,
    "section": "181"
  },
  {
    "code": "NHIS-181-315",
    "description": "Hepatitis C RNA Viral Load*",
    "tariffNgn": 11500,
    "section": "181"
  },
  {
    "code": "NHIS-181-316",
    "description": "Hepatitis C RNA Viral Load (GeneXpert PCR) *",
    "tariffNgn": 10000,
    "section": "181"
  },
  {
    "code": "NHIS-181-318",
    "description": "Serum Tuberculosis Antigen",
    "tariffNgn": 2500,
    "section": "181"
  },
  {
    "code": "NHIS-181-319",
    "description": "Chlamydia Antigen",
    "tariffNgn": 2500,
    "section": "181"
  },
  {
    "code": "NHIS-181-320",
    "description": "Herpes Simplex 1 & 11 Antigen",
    "tariffNgn": 3250,
    "section": "181"
  },
  {
    "code": "NHIS-181-321",
    "description": "Toxoplasma Gondii",
    "tariffNgn": 2950,
    "section": "181"
  },
  {
    "code": "NHIS-181-322",
    "description": "Rubella",
    "tariffNgn": 2500,
    "section": "181"
  },
  {
    "code": "NHIS-181-323",
    "description": "Helicobacter Pylori",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-324",
    "description": "Infectious Mononucleosis",
    "tariffNgn": 2950,
    "section": "181"
  },
  {
    "code": "NHIS-181-325",
    "description": "C-Reactive Protein",
    "tariffNgn": 2650,
    "section": "181"
  },
  {
    "code": "NHIS-181-326",
    "description": "Antibody screening",
    "tariffNgn": 2000,
    "section": "181"
  },
  {
    "code": "NHIS-181-327",
    "description": "Cytomegalovirus (CMV) (Qualitative)",
    "tariffNgn": 3250,
    "section": "181"
  },
  {
    "code": "NHIS-181-401",
    "description": "a) Small",
    "tariffNgn": 5250,
    "section": "181"
  },
  {
    "code": "NHIS-181-402",
    "description": "b) Multiple",
    "tariffNgn": 7150,
    "section": "181"
  },
  {
    "code": "NHIS-181-403",
    "description": "Bone Tissues (Special stains)",
    "tariffNgn": 7150,
    "section": "181"
  },
  {
    "code": "NHIS-181-404",
    "description": "Lymph Nodes Biopsy",
    "tariffNgn": 5250,
    "section": "181"
  },
  {
    "code": "NHIS-181-405",
    "description": "Pap Smear",
    "tariffNgn": 4000,
    "section": "181"
  },
  {
    "code": "NHIS-181-406",
    "description": "Fine Needle Aspiration (FNA)",
    "tariffNgn": 4200,
    "section": "181"
  },
  {
    "code": "NHIS-010-001",
    "description": "Specialist Initial Consultation",
    "tariffNgn": 2000,
    "section": "010"
  },
  {
    "code": "NHIS-010-002",
    "description": "Specialist Review (Per visit)",
    "tariffNgn": 1200,
    "section": "010"
  },
  {
    "code": "NHIS-010-003",
    "description": "Nursing Care (per day)",
    "tariffNgn": 1000,
    "section": "010"
  },
  {
    "code": "NHIS-010-004",
    "description": "Special Nursing Care (e.g., Intensive care, SCBU, Paediatric Emergency etc)",
    "tariffNgn": 1200,
    "section": "010"
  },
  {
    "code": "NHIS-010-005",
    "description": "Hospital Bed Occupancy",
    "tariffNgn": 1000,
    "section": "010"
  },
  {
    "code": "NHIS-010-006",
    "description": "ICU Nursing Care/ Day",
    "tariffNgn": 2000,
    "section": "010"
  },
  {
    "code": "NHIS-030-001",
    "description": "Antenatal care",
    "tariffNgn": 10000,
    "section": "030"
  },
  {
    "code": "NHIS-030-002",
    "description": "Normal Delivery",
    "tariffNgn": 10000,
    "section": "030"
  },
  {
    "code": "NHIS-030-003",
    "description": "Delivery of Multiple Pregnancy",
    "tariffNgn": 15000,
    "section": "030"
  }
] as const;
