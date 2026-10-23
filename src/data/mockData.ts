import {
  User,
  DonorProfile,
  Organization,
  BloodDrive,
  DonationRequest,
  NotificationItem,
  VerificationItem,
  ModerationReport,
  BloodGroup,
  PatientStory
} from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_donorconnect_medical_1790320812439.jpg';
export const DR_SARAH_AVATAR = '/src/assets/images/avatar_dr_sarah_chen_1790320832653.jpg';
export const DONOR_MARCUS_AVATAR = '/src/assets/images/avatar_donor_marcus_1790320845008.jpg';

export const CURRENT_USER_MOCK: User = {
  id: 'usr_sarah_chen',
  name: 'Dr. Sarah Chen, MD',
  email: 's.chen@hyderabadblood.org',
  phone: '+91 98490 12345',
  role: 'hospital',
  avatarUrl: DR_SARAH_AVATAR,
  city: 'Hyderabad',
  state: 'Telangana',
  isVerified: true,
  hospitalAffiliation: 'Hyderabad Blood Centre & Transfusion Hospital',
  organizationId: 'org_metro_univ',
  createdDate: '2024-01-15'
};

export const DEMO_USERS: Record<string, User> = {
  hospital: CURRENT_USER_MOCK,
  donor: {
    id: 'usr_marcus_vance',
    name: 'Marcus Vance',
    email: 'marcus.v@donormail.net',
    phone: '+91 98491 54321',
    role: 'donor',
    avatarUrl: DONOR_MARCUS_AVATAR,
    city: 'Hyderabad',
    state: 'Telangana',
    isVerified: true,
    createdDate: '2024-03-10'
  },
  user: {
    id: 'usr_general_user',
    name: 'General User',
    email: 'user@dofi.org',
    phone: '+91 98491 00000',
    role: 'user',
    city: 'Hyderabad',
    state: 'Telangana',
    isVerified: true,
    createdDate: '2024-05-02'
  },
  admin: {
    id: 'usr_admin_governance',
    name: 'Platform Administrator',
    email: 'admin@dofi.org',
    phone: '+91 98490 00000',
    role: 'admin',
    city: 'Hyderabad',
    state: 'Telangana',
    isVerified: true,
    createdDate: '2023-11-01'
  }
};

export const ORGANIZATIONS_MOCK: Organization[] = [
  {
    id: 'org_metro_univ',
    name: 'Hyderabad Blood Centre & Transfusion Hospital',
    type: 'blood_bank',
    licenseNumber: 'TS-BB-994821',
    regulatoryBody: 'State Blood Transfusion Council & CDSCO Licensed',
    address: 'Banjara Hills, Road No. 2',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 2.4,
    traumaLevel: 'Regional Blood Centre & 24/7 Transfusion Facility',
    openRequisitionsCount: 4,
    phone: '+91 40 2345 6789',
    email: 'bloodcentre.coord@hyderabadblood.org',
    isVerified: true,
    activeCoordinators: ['Dr. Sarah Chen, MD', 'Nurse Patricia Ramos, BSN'],
    coordinates: { x: 50, y: 48 }
  },
  {
    id: 'org_red_cross_greatlakes',
    name: 'Great Lakes Regional Blood Center',
    type: 'blood_bank',
    licenseNumber: 'FDA-BB-48902',
    regulatoryBody: 'FDA Registered & AABB Certified Blood Center',
    address: '2200 W Harrison St',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 4.1,
    traumaLevel: 'Central Blood Bank & Apheresis Depot',
    openRequisitionsCount: 6,
    phone: '+1 (312) 555-0240',
    email: 'intake@greatlakesblood.org',
    isVerified: true,
    activeCoordinators: ['David Miller, MT(ASCP)'],
    coordinates: { x: 38, y: 44 }
  },
  {
    id: 'org_midwest_tissue_bank',
    name: 'Midwest Bone & Tissue Repository',
    type: 'tissue_repository',
    licenseNumber: 'AATB-TISS-7721',
    regulatoryBody: 'American Association of Tissue Banks (AATB) Accredited',
    address: '1301 W 22nd St',
    city: 'Oak Brook',
    state: 'IL',
    distanceKm: 18.5,
    traumaLevel: 'HLA Allograft & Stem Cell Cryobank',
    openRequisitionsCount: 2,
    phone: '+1 (630) 555-9812',
    email: 'allografts@midwesttissue.org',
    isVerified: true,
    activeCoordinators: ['Karen Lindqvist, PA-C'],
    coordinates: { x: 22, y: 56 }
  },
  {
    id: 'org_crowns_of_courage',
    name: 'Crowns of Courage - Pediatric Hair & Cranial Prosthetics',
    type: 'cancer_wig_ngo',
    licenseNumber: '501C3-NGO-66231',
    regulatoryBody: 'Registered 501(c)(3) Pediatric Oncology Support Charity',
    address: '410 N Michigan Ave',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 3.8,
    traumaLevel: 'Pediatric Cranial Prosthetic Workshop',
    openRequisitionsCount: 3,
    phone: '+1 (312) 555-7760',
    email: 'director@crownsofcourage.org',
    isVerified: true,
    activeCoordinators: ['Maya Lin, Founder & Master Wigmaker'],
    coordinates: { x: 62, y: 35 }
  },
  {
    id: 'org_lakeside_childrens',
    name: 'Lakeside Children\'s Specialty Hospital',
    type: 'hospital_transplant_center',
    licenseNumber: 'IL-PED-11204',
    regulatoryBody: 'Children\'s Hospital Association & UNOS Pediatric Division',
    address: '225 E Chicago Ave',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 5.6,
    traumaLevel: 'Pediatric Level 1 Specialty Center',
    openRequisitionsCount: 3,
    phone: '+1 (312) 555-4300',
    email: 'pediatric.hema@lakesidekids.org',
    isVerified: true,
    activeCoordinators: ['Dr. Arthur Vance, MD'],
    coordinates: { x: 56, y: 30 }
  },
  {
    id: 'org_northwestern_memorial',
    name: 'Northwestern Memorial Clinical Institute',
    type: 'hospital_transplant_center',
    licenseNumber: 'IL-HOSP-331092',
    regulatoryBody: 'UNOS Member & Comprehensive Cancer Center',
    address: '251 E Huron St',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 3.2,
    traumaLevel: 'Level 1 Academic Medical Center',
    openRequisitionsCount: 5,
    phone: '+1 (312) 555-2000',
    email: 'clinical.trials@nmcare.org',
    isVerified: true,
    activeCoordinators: ['Dr. Elena Rossi, MD'],
    coordinates: { x: 54, y: 36 }
  }
];

export const BLOOD_DRIVES_MOCK: BloodDrive[] = [
  {
    id: 'drv_001',
    name: 'Downtown Civic Center Emergency Blood Drive',
    organizer: 'American Red Cross & City Health Dept',
    locationName: 'Richard J. Daley Plaza - Mobile Coach Bay',
    address: '50 W Washington St',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 1.8,
    date: '2026-09-25 (Today)',
    hours: '08:30 AM – 05:00 PM',
    status: 'active_today',
    targetBloodGroups: ['O-', 'O+', 'A-', 'B-'],
    availableSlots: 18,
    walkInsAllowed: true,
    coordinatorContact: '+1 (312) 555-8910',
    servicesOffered: ['whole_blood', 'platelets', 'bone_marrow_swab'],
    coordinates: { x: 48, y: 42 }
  },
  {
    id: 'drv_002',
    name: 'University Quad Autumn Marrow & Blood Drive',
    organizer: 'Student Healthcare Alliance & NMDP',
    locationName: 'University Quadrangle Pavilion',
    address: '5801 S Ellis Ave',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 4.5,
    date: '2026-09-27',
    hours: '10:00 AM – 06:00 PM',
    status: 'upcoming',
    targetBloodGroups: ['O-', 'A+', 'B+', 'AB-'],
    availableSlots: 32,
    walkInsAllowed: true,
    coordinatorContact: '+1 (312) 555-4422',
    servicesOffered: ['whole_blood', 'bone_marrow_swab'],
    coordinates: { x: 44, y: 64 }
  },
  {
    id: 'drv_003',
    name: 'Millennium Park Wellness & Hair Donation Camp',
    organizer: 'Crowns of Courage & Rotary Club',
    locationName: 'Chase Promenade North Tent',
    address: '201 E Randolph St',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 2.1,
    date: '2026-09-28',
    hours: '09:00 AM – 04:30 PM',
    status: 'upcoming',
    targetBloodGroups: ['O-', 'O+', 'A-'],
    availableSlots: 24,
    walkInsAllowed: true,
    coordinatorContact: '+1 (312) 555-3390',
    servicesOffered: ['whole_blood', 'hair_donation'],
    coordinates: { x: 53, y: 44 }
  },
  {
    id: 'drv_004',
    name: 'West Loop Tech Corridor STAT Platelet Drive',
    organizer: 'Great Lakes Regional Blood Center',
    locationName: 'Fulton Market Innovation Pavilion',
    address: '1000 W Fulton Market',
    city: 'Chicago',
    state: 'IL',
    distanceKm: 3.5,
    date: '2026-09-26 (Tomorrow)',
    hours: '07:30 AM – 03:00 PM',
    status: 'urgent_shortage',
    targetBloodGroups: ['O-', 'A-', 'B-', 'AB+'],
    availableSlots: 12,
    walkInsAllowed: false,
    coordinatorContact: '+1 (312) 555-7102',
    servicesOffered: ['platelets', 'whole_blood'],
    coordinates: { x: 35, y: 38 }
  },
  {
    id: 'drv_005',
    name: 'Evanston Community Center Mobile Blood Drive',
    organizer: 'NorthShore Health & Lifesource',
    locationName: 'Evanston Public Library Community Hall',
    address: '1703 Orrington Ave',
    city: 'Evanston',
    state: 'IL',
    distanceKm: 14.2,
    date: '2026-09-30',
    hours: '09:30 AM – 03:30 PM',
    status: 'upcoming',
    targetBloodGroups: ['O-', 'O+', 'B+'],
    availableSlots: 28,
    walkInsAllowed: true,
    coordinatorContact: '+1 (847) 555-9031',
    servicesOffered: ['whole_blood', 'bone_marrow_swab'],
    coordinates: { x: 58, y: 16 }
  }
];

export const BLOOD_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export const DONOR_PROFILES_MOCK: DonorProfile[] = [
  {
    id: 'dnr_001',
    userId: 'usr_marcus_vance',
    donorName: 'Marcus Vance',
    avatarUrl: DONOR_MARCUS_AVATAR,
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 3.2,
    categories: ['blood'],
    isVerified: true,
    verificationBadge: 'Verified Blood Donor (ID & Serology Cleared)',
    availabilityStatus: 'available_now',
    lastDonationDate: '2024-05-18',
    totalDonationsCount: 14,
    phone: '+91 98491 54321',
    email: 'marcus.v@donormail.net',
    privacySetting: 'direct_authorized',
    scheduledSlots: [
      {
        id: 'slot_001',
        date: '2026-09-28',
        startTime: '08:30',
        endTime: '11:30',
        procedureType: 'blood',
        hospitalPreference: 'Hyderabad Blood Centre & Transfusion Hospital',
        notes: 'Whole blood donation slot confirmed.',
        status: 'available'
      },
      {
        id: 'slot_002',
        date: '2026-10-02',
        startTime: '14:00',
        endTime: '17:00',
        procedureType: 'blood',
        hospitalPreference: 'Hyderabad Blood Centre & Transfusion Hospital',
        notes: 'Secondary whole blood / apheresis donation slot confirmed.',
        status: 'available'
      }
    ],
    bloodDetails: {
      bloodGroup: 'O+',
      components: ['whole_blood', 'red_blood_cells'],
      rhFactor: '+',
      hemoglobinLevel: '15.4 g/dL'
    },
    clinicalScreening: {
      status: 'passed',
      screeningDate: '2026-08-20',
      expiresDate: '2026-11-20',
      labName: 'Hyderabad Blood Centre Clinical Pathology Lab',
      cliaNumber: 'NABL #MC-2490',
      panelType: 'Infectious Disease NAT & Whole Blood Serology Panel',
      hipaaComplianceId: 'MED-SEROLOGY-ENC-9942B',
      clearedTests: [
        'HIV-1/2 Antigen & Antibody Screen (Non-reactive)',
        'Hepatitis B Surface Ag & Anti-HBc (Negative)',
        'Hepatitis C Virus RNA by NAT (Undetectable)',
        'Treponema pallidum / Syphilis Screen (Negative)',
        'ABO Grouping & Rh Factor (O Positive Confirmed)',
        'Hemoglobin & Iron Screen (15.4 g/dL Cleared)'
      ],
      medicalReviewer: 'Dr. Sarah Chen, MD (Clinical Director)'
    }
  },
  {
    id: 'dnr_002',
    userId: 'usr_ananya_sharma',
    donorName: 'Ananya Sharma, RN',
    avatarUrl: '',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 4.8,
    categories: ['blood'],
    isVerified: true,
    verificationBadge: 'Healthcare Worker Donor (Active Serology Cleared)',
    availabilityStatus: 'available_now',
    lastDonationDate: '2024-06-01',
    totalDonationsCount: 8,
    phone: '+91 98492 33445',
    email: 'ananya.sharma@healthmail.com',
    privacySetting: 'direct_authorized',
    scheduledSlots: [
      {
        id: 'slot_003',
        date: '2026-09-29',
        startTime: '09:00',
        endTime: '12:00',
        procedureType: 'blood',
        hospitalPreference: 'Hyderabad Blood Centre & Transfusion Hospital',
        notes: 'Scheduled apheresis platelet procedure confirmed.',
        status: 'available'
      }
    ],
    bloodDetails: {
      bloodGroup: 'B+',
      components: ['platelets', 'plasma'],
      rhFactor: '+',
      hemoglobinLevel: '14.1 g/dL'
    },
    clinicalScreening: {
      status: 'passed',
      screeningDate: '2026-09-02',
      expiresDate: '2026-12-02',
      labName: 'Hyderabad Blood Centre Clinical Pathology Lab',
      cliaNumber: 'NABL #MC-2491',
      panelType: 'Apheresis Platelet Serology & Coagulation Profile',
      hipaaComplianceId: 'MED-SEROLOGY-ENC-8831A',
      clearedTests: [
        'HIV-1/2 & HTLV-I/II Screening (Non-reactive)',
        'Hepatitis B Core & Surface Screen (Non-reactive)',
        'Hepatitis C NAT Screen (Undetectable)',
        'Platelet Count Baseline (265,000 / μL Optimal)',
        'Treponema pallidum / Syphilis Screen (Negative)'
      ],
      medicalReviewer: 'Dr. Sarah Chen, MD'
    }
  },
  {
    id: 'dnr_003',
    userId: 'usr_robert_hayes',
    donorName: 'Robert Hayes',
    avatarUrl: '',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 5.8,
    categories: ['organ', 'bone_tissue'],
    isVerified: true,
    verificationBadge: 'State Organ Registry Pledged & Tissue Cleared',
    availabilityStatus: 'on_call',
    totalDonationsCount: 2,
    phone: '+91 98493 11223',
    email: 'r.hayes@contractornet.com',
    privacySetting: 'hospital_mediated',
    organDetails: {
      organsPledged: ['kidney', 'liver_lobe', 'cornea'],
      donationType: 'living_altruistic',
      transplantCenterRegistryId: 'TG-DOR-2024-88712',
      consentingNextOfKin: true
    },
    boneTissueDetails: {
      tissueTypes: ['bone_marrow', 'bone_graft', 'skin_graft'],
      hlaTypingAvailable: true,
      marrowRegistryId: 'DATRI-MDR-44109',
      swabKitStatus: 'completed'
    },
    clinicalScreening: {
      status: 'passed',
      screeningDate: '2026-07-15',
      expiresDate: '2026-10-15',
      labName: 'Hyderabad Blood Centre Clinical Pathology Lab',
      cliaNumber: 'NABL #MC-2490',
      panelType: 'HLA High-Resolution Typing & Viral Clearance Profile',
      hipaaComplianceId: 'MED-SEROLOGY-ENC-7704C',
      clearedTests: [
        'High-Resolution HLA-A, B, C, DRB1, DQB1 Typing',
        'Crossmatch T & B Cell Flow Cytometry (Compatible)',
        'Epstein-Barr & Cytomegalovirus Viral Panels (Cleared)',
        'Renal Function & GFR Biomarker Panel (Normal)',
        'Full Infectious Disease Serology Screen (Passed)'
      ],
      medicalReviewer: 'Dr. Sarah Chen, MD'
    }
  },
  {
    id: 'dnr_004',
    userId: 'usr_chloe_dupuis',
    donorName: 'Chloe Dupuis',
    avatarUrl: '',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 4.8,
    categories: ['hair'],
    isVerified: true,
    verificationBadge: 'Verified Hair Donor (3x Contributor)',
    availabilityStatus: 'available_now',
    totalDonationsCount: 3,
    phone: '+91 98494 22334',
    email: 'chloe.dupuis@artstudio.com',
    privacySetting: 'direct_authorized',
    scheduledSlots: [
      {
        id: 'slot_004',
        date: '2026-09-30',
        startTime: '13:00',
        endTime: '15:30',
        procedureType: 'hair',
        hospitalPreference: 'Hyderabad Blood Centre & Transfusion Hospital',
        notes: '16-inch untreated ponytail ready for collection/donation.',
        status: 'available'
      }
    ],
    hairDetails: {
      lengthInches: 16,
      condition: 'virgin_untreated',
      texture: 'straight',
      color: 'Chestnut Auburn',
      packagedMethod: 'braided_ziplock',
      willingToMail: true
    }
  },
  {
    id: 'dnr_005',
    userId: 'usr_carlos_mendoza',
    donorName: 'Carlos Mendoza',
    avatarUrl: '',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 5.4,
    categories: ['blood'],
    isVerified: true,
    verificationBadge: 'Certified Apheresis Platelet Donor',
    availabilityStatus: 'available_24h',
    lastDonationDate: '2024-04-12',
    totalDonationsCount: 22,
    phone: '+91 98495 44556',
    email: 'carlos.mendoza@logistics.com',
    privacySetting: 'direct_authorized',
    bloodDetails: {
      bloodGroup: 'A+',
      components: ['platelets', 'whole_blood'],
      rhFactor: '+',
      hemoglobinLevel: '16.0 g/dL'
    }
  },
  {
    id: 'dnr_006',
    userId: 'usr_claire_zhao',
    donorName: 'Dr. Claire Zhao, PhD',
    avatarUrl: '',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 6.1,
    categories: ['blood'],
    isVerified: true,
    verificationBadge: 'Comprehensive Donor Registry (Serology Certified)',
    availabilityStatus: 'on_call',
    totalDonationsCount: 5,
    phone: '+91 98496 66778',
    email: 'claire.zhao@bioresearch.org',
    privacySetting: 'hospital_mediated',
    bloodDetails: {
      bloodGroup: 'AB+',
      components: ['plasma', 'platelets'],
      rhFactor: '+',
      hemoglobinLevel: '13.8 g/dL'
    }
  },
  {
    id: 'dnr_007',
    userId: 'usr_jordan_taylor',
    donorName: 'Jordan Taylor',
    avatarUrl: '',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 7.2,
    categories: ['blood'],
    isVerified: true,
    verificationBadge: 'Rare Blood Group Registrant',
    availabilityStatus: 'cooldown',
    cooldownUntil: '2026-10-15',
    lastDonationDate: '2026-08-20',
    totalDonationsCount: 9,
    phone: '+91 98497 88990',
    email: 'jordan.t@techsol.com',
    privacySetting: 'hospital_mediated',
    bloodDetails: {
      bloodGroup: 'AB-',
      components: ['plasma', 'whole_blood'],
      rhFactor: '-',
      hemoglobinLevel: '14.9 g/dL'
    }
  }
];

export const DONATION_REQUESTS_MOCK: DonationRequest[] = [
  {
    id: 'req_emergency_001',
    category: 'blood',
    title: 'CRITICAL STAT: O- Negative Whole Blood Required for Pediatric Trauma Surgery',
    patientAlias: 'Patient C.K. (Trauma Bay 2)',
    patientAge: 6,
    requesterId: 'usr_sarah_chen',
    requesterName: 'Dr. Sarah Chen, MD (Transfusion Services)',
    requesterRole: 'hospital',
    hospitalId: 'org_metro_univ',
    hospitalName: 'Hyderabad Blood Centre & Transfusion Hospital',
    city: 'Hyderabad',
    state: 'Telangana',
    urgency: 'emergency',
    status: 'in_progress',
    deadlineHoursRemaining: 4,
    deadlineDate: 'Today, 4:00 PM IST',
    createdAt: '2026-09-25T07:15:00Z',
    unitsNeeded: 3,
    unitsFulfilled: 1,
    matchedDonorIds: [],
    medicalNotes: 'Severe internal hemorrhage post MVC. Crossmatch protocol initiated. Immediate apheresis unit dispatched, urgent back-up donors requested within 15-mile radius.',
    bloodRequirements: {
      targetBloodGroup: 'O-',
      compatibleBloodGroups: ['O-'],
      component: 'whole_blood',
      isStatCrossmatchRequired: true
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-25T07:15:00Z',
        title: 'Emergency Trauma Requisition Filed',
        description: 'Attending trauma surgeon submitted STAT red blood cell requirement.',
        actorName: 'Dr. Sarah Chen, MD',
        actorRole: 'Attending Physician'
      },
      {
        status: 'verified',
        timestamp: '2026-09-25T07:22:00Z',
        title: 'Hospital Blood Bank Authorized',
        description: 'Blood bank verified urgency and queried city donor registry.',
        actorName: 'David Miller, MT',
        actorRole: 'Blood Bank Officer'
      },
      {
        status: 'matched',
        timestamp: '2026-09-25T07:35:00Z',
        title: 'Emergency Blood Requisition Matched',
        description: 'Serology lab verified priority requisition and queried local donor network.',
        actorName: 'Automated Match Engine',
        actorRole: 'System'
      },
      {
        status: 'in_progress',
        timestamp: '2026-09-25T08:10:00Z',
        title: 'Donor In Transit & 1 Unit Secured',
        description: 'First unit transfused; additional donor screening underway in Donor Lounge.',
        actorName: 'Nurse Patricia Ramos',
        actorRole: 'Trauma Coordinator'
      }
    ]
  },
  {
    id: 'req_urgent_002',
    category: 'bone_tissue',
    title: 'URGENT: HLA-Matched Bone Marrow Donor for 8yo Acute Lymphoblastic Leukemia',
    patientAlias: 'Leo R.',
    patientAge: 8,
    requesterId: 'usr_elena_rostova',
    requesterName: 'Elena Rostova (Mother / Caregiver)',
    requesterRole: 'user',
    hospitalId: 'org_lakeside_childrens',
    hospitalName: 'Lakeside Children\'s Specialty Hospital',
    city: 'Chicago',
    state: 'IL',
    urgency: 'urgent',
    status: 'verified',
    deadlineHoursRemaining: 18,
    deadlineDate: 'Tomorrow, 10:00 AM CST',
    createdAt: '2026-09-24T14:30:00Z',
    unitsNeeded: 1,
    unitsFulfilled: 0,
    matchedDonorIds: ['dnr_001', 'dnr_003'],
    medicalNotes: 'ALL Relapse in remission post consolidation. Needs 10/10 or 9/10 high-resolution HLA allogeneic stem cell match. Verified by Pediatric Oncology Board Ref #PED-BMT-2026-904.',
    boneTissueRequirements: {
      tissueType: 'bone_marrow',
      requiredHlaLoci: ['HLA-A*02:01', 'HLA-B*44:02', 'HLA-C*05:01', 'DRB1*04:01'],
      transplantProtocol: 'Standard Myeloablative Allogeneic Conditioning'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-24T14:30:00Z',
        title: 'Requisition Submitted by Family',
        description: 'Caregiver submitted BMT request with supporting oncology documentation.',
        actorName: 'Elena Rostova',
        actorRole: 'Family Caregiver'
      },
      {
        status: 'verified',
        timestamp: '2026-09-24T18:00:00Z',
        title: 'Oncology Board Verified & Approved',
        description: 'Dr. Arthur Vance verified HLA typing requirements with Lakeside Children\'s Hospital.',
        actorName: 'Dr. Arthur Vance, MD',
        actorRole: 'Pediatric Oncologist'
      }
    ]
  },
  {
    id: 'req_standard_003',
    category: 'organ',
    title: 'Verified Transplant Center Living Kidney Donor Matching (ESRD Candidate)',
    patientAlias: 'Marcus H. (52yo Father of 3)',
    patientAge: 52,
    requesterId: 'usr_sarah_chen',
    requesterName: 'Dr. Sarah Chen, MD (Transplant Service)',
    requesterRole: 'hospital',
    hospitalId: 'org_metro_univ',
    hospitalName: 'Hyderabad Blood Centre & Transfusion Hospital',
    city: 'Hyderabad',
    state: 'Telangana',
    urgency: 'standard',
    status: 'verified',
    deadlineHoursRemaining: 72,
    deadlineDate: 'In 3 Days (Screening Cycle)',
    createdAt: '2026-09-23T11:00:00Z',
    unitsNeeded: 1,
    unitsFulfilled: 0,
    matchedDonorIds: ['dnr_003'],
    medicalNotes: 'End-Stage Renal Disease on peritoneal dialysis. UNOS waiting list patient active. Strictly non-commercial hospital altruistic/paired exchange pathway compliant with NOTA 1984.',
    organRequirements: {
      organ: 'kidney',
      transplantSurgeonName: 'Prof. Jonathan Wei, FACS',
      clinicalBoardApprovalRef: 'UNOS-METRO-TX-88301',
      praScore: '0% (Non-sensitized)'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-23T11:00:00Z',
        title: 'Living Donor Protocol Registered',
        description: 'Transplant clinic registered candidate for living donor altruistic matching.',
        actorName: 'Dr. Sarah Chen, MD',
        actorRole: 'Transplant Coordinator'
      },
      {
        status: 'verified',
        timestamp: '2026-09-23T16:30:00Z',
        title: 'Ethics Committee & Legal Clearance',
        description: 'Hospital ethics committee verified compliance and cross-matched non-directed pledges.',
        actorName: 'Hospital Ethics Board',
        actorRole: 'Clinical Governance'
      }
    ]
  },
  {
    id: 'req_standard_004',
    category: 'hair',
    title: '14" Virgin Hair Donation for Pediatric Cranial Prosthetic (Post-Chemotherapy)',
    patientAlias: 'Mia K. (11yo Oncology Patient)',
    patientAge: 11,
    requesterId: 'org_crowns_of_courage',
    requesterName: 'Crowns of Courage NGO',
    requesterRole: 'hospital',
    hospitalId: 'org_crowns_of_courage',
    hospitalName: 'Crowns of Courage - Pediatric Hair & Cranial Prosthetics',
    city: 'Chicago',
    state: 'IL',
    urgency: 'standard',
    status: 'matched',
    deadlineHoursRemaining: 48,
    deadlineDate: 'In 2 Days',
    createdAt: '2026-09-22T09:00:00Z',
    unitsNeeded: 2,
    unitsFulfilled: 1,
    matchedDonorIds: ['dnr_002', 'dnr_004'],
    medicalNotes: 'Mia completed 12 rounds of chemotherapy for Ewing sarcoma. Partner salon will craft custom vacuum-fit cranial hairpiece free of charge.',
    hairRequirements: {
      minInches: 12,
      conditionAccepted: ['virgin_untreated'],
      recipientType: 'pediatric_cancer',
      wigMakerPartner: 'Artisan Hair Guild of Illinois'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-22T09:00:00Z',
        title: 'Wig Requirement Created',
        description: 'Crowns of Courage intake coordinator logged patient specifications.',
        actorName: 'Maya Lin',
        actorRole: 'NGO Director'
      },
      {
        status: 'verified',
        timestamp: '2026-09-22T11:15:00Z',
        title: 'Medical Need Verified',
        description: 'Pediatric oncology social worker verified patient status.',
        actorName: 'Crowns of Courage Board',
        actorRole: 'Verification'
      },
      {
        status: 'matched',
        timestamp: '2026-09-23T14:00:00Z',
        title: 'Donors Matched (Chloe D. & Ananya S.)',
        description: 'Donors received packaging guidelines and prepaid medical mailers.',
        actorName: 'Donor Matching Engine',
        actorRole: 'System'
      }
    ]
  },
  {
    id: 'req_emergency_005',
    category: 'blood',
    title: 'EMERGENCY: STAT O+ Whole Blood Units Required for Acute Surgery',
    patientAlias: 'Patient D.W. (Surgical Unit 4B)',
    patientAge: 34,
    requesterId: 'usr_sarah_chen',
    requesterName: 'Dr. Sarah Chen, MD (Transfusion Services)',
    requesterRole: 'hospital',
    hospitalId: 'org_metro_univ',
    hospitalName: 'Hyderabad Blood Centre & Transfusion Hospital',
    city: 'Hyderabad',
    state: 'Telangana',
    urgency: 'emergency',
    status: 'verified',
    deadlineHoursRemaining: 6,
    deadlineDate: 'Today, 6:00 PM IST',
    createdAt: '2026-09-25T08:00:00Z',
    unitsNeeded: 2,
    unitsFulfilled: 0,
    matchedDonorIds: ['dnr_001'],
    medicalNotes: 'Acute blood loss during emergency surgery. STAT O+ whole blood transfusion requested within Hyderabad donor network.',
    bloodRequirements: {
      targetBloodGroup: 'O+',
      compatibleBloodGroups: ['O+', 'O-'],
      component: 'whole_blood',
      isStatCrossmatchRequired: true
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-25T08:00:00Z',
        title: 'Emergency Blood Requisition Filed',
        description: 'Requisition entered into hospital system with emergency priority.',
        actorName: 'Dr. Sarah Chen, MD',
        actorRole: 'Attending Physician'
      },
      {
        status: 'verified',
        timestamp: '2026-09-25T08:15:00Z',
        title: 'Blood Bank Clearance Granted',
        description: 'Priority match broadcast queued to registered O+ blood donors.',
        actorName: 'Hyderabad Blood Centre Lab',
        actorRole: 'Clinical Lab'
      }
    ]
  },
  {
    id: 'req_completed_001',
    category: 'blood',
    title: 'COMPLETED: Emergency O+ Red Blood Cell Transfusion for Acute Trauma Care',
    patientAlias: 'Patient Julian V. (Trauma Bay 1)',
    patientAge: 29,
    requesterId: 'usr_sarah_chen',
    requesterName: 'Dr. Sarah Chen, MD (Transfusion Services)',
    requesterRole: 'hospital',
    hospitalId: 'org_metro_univ',
    hospitalName: 'Hyderabad Blood Centre & Transfusion Hospital',
    city: 'Hyderabad',
    state: 'Telangana',
    urgency: 'emergency',
    status: 'completed',
    deadlineHoursRemaining: 0,
    deadlineDate: 'Completed & Verified',
    createdAt: '2026-09-24T06:00:00Z',
    unitsNeeded: 2,
    unitsFulfilled: 2,
    matchedDonorIds: ['dnr_001'],
    medicalNotes: 'Acute hemodynamic stabilization post surgical intervention. Both 2 units successfully cross-matched, transfused, and verified in hospital blood banking audit logs.',
    bloodRequirements: {
      targetBloodGroup: 'O+',
      compatibleBloodGroups: ['O+', 'O-'],
      component: 'whole_blood',
      isStatCrossmatchRequired: true
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-24T06:00:00Z',
        title: 'Emergency Trauma Requisition Filed',
        description: 'Attending trauma surgeon submitted STAT blood requirement.',
        actorName: 'Dr. Sarah Chen, MD',
        actorRole: 'Attending Physician'
      },
      {
        status: 'verified',
        timestamp: '2026-09-24T06:10:00Z',
        title: 'Hospital Blood Bank Authorized',
        description: 'Serology and crossmatch compatibility passed.',
        actorName: 'David Miller, MT',
        actorRole: 'Blood Bank Officer'
      },
      {
        status: 'matched',
        timestamp: '2026-09-24T06:25:00Z',
        title: 'Universal O- Donor Matched',
        description: 'Donor Marcus Vance arrived for rapid collection.',
        actorName: 'Automated Match Engine',
        actorRole: 'System'
      },
      {
        status: 'in_progress',
        timestamp: '2026-09-24T07:15:00Z',
        title: 'Apheresis & Transfusion In Progress',
        description: 'Units verified under dual RN double-check protocol.',
        actorName: 'Nurse Patricia Ramos',
        actorRole: 'Trauma Coordinator'
      },
      {
        status: 'completed',
        timestamp: '2026-09-24T09:30:00Z',
        title: 'Donation Completed & Logged',
        description: 'All 2 units transfused successfully. Patient vital signs stabilized.',
        actorName: 'Dr. Sarah Chen, MD',
        actorRole: 'Attending Physician'
      }
    ]
  },
  {
    id: 'req_completed_002',
    category: 'hair',
    title: 'COMPLETED: 14" Natural Hair Donation for Pediatric Cranial Prosthetic',
    patientAlias: 'Mia K. (Pediatric Ward)',
    patientAge: 7,
    requesterId: 'usr_elena_rostova',
    requesterName: 'Elena Rostova (Caregiver)',
    requesterRole: 'user',
    hospitalId: 'org_lakeside_childrens',
    hospitalName: 'Lakeside Children\'s Specialty Hospital',
    city: 'Chicago',
    state: 'IL',
    urgency: 'standard',
    status: 'completed',
    deadlineHoursRemaining: 0,
    deadlineDate: 'Completed & Delivered',
    createdAt: '2026-09-20T10:00:00Z',
    unitsNeeded: 1,
    unitsFulfilled: 1,
    matchedDonorIds: ['dnr_002'],
    medicalNotes: 'Mia completed oncology chemotherapy cycles. Custom vacuum-fit cranial hairpiece hand-tied, fitted, and delivered to patient with hospital care team celebration.',
    hairRequirements: {
      minInches: 14,
      conditionAccepted: ['virgin_untreated'],
      recipientType: 'pediatric_cancer',
      wigMakerPartner: 'Little Princess Trust & Cancer Hair Guild'
    },
    timeline: [
      {
        status: 'pending',
        timestamp: '2026-09-20T10:00:00Z',
        title: 'Prosthetic Requisition Submitted',
        description: 'Cranial hairpiece requisition created with wig maker specifications.',
        actorName: 'Elena Rostova',
        actorRole: 'Caregiver'
      },
      {
        status: 'verified',
        timestamp: '2026-09-21T09:00:00Z',
        title: 'Oncology Board Verified',
        description: 'Pediatric oncology social worker verified eligibility and measurements.',
        actorName: 'Lakeside Social Services',
        actorRole: 'Hospital Coordinator'
      },
      {
        status: 'matched',
        timestamp: '2026-09-21T14:30:00Z',
        title: '14" Virgin Hair Donor Matched',
        description: 'Donor Elena Vasquez hair bundle received and inspected.',
        actorName: 'Match Coordinator',
        actorRole: 'System'
      },
      {
        status: 'in_progress',
        timestamp: '2026-09-22T11:00:00Z',
        title: 'Custom Cap Fitting & Hand-Tying',
        description: 'Certified medical wig maker crafted custom scalp cap.',
        actorName: 'Master Wig Guild Specialist',
        actorRole: 'Partner Technician'
      },
      {
        status: 'completed',
        timestamp: '2026-09-24T16:00:00Z',
        title: 'Donation Completed & Wig Gifted',
        description: 'Custom cranial hairpiece gifted to Mia. Full rehabilitation milestone reached.',
        actorName: 'Hospital Pediatric Liaison',
        actorRole: 'Coordinator'
      }
    ]
  }
];

export const NOTIFICATIONS_MOCK: NotificationItem[] = [
  {
    id: 'notif_001',
    userId: 'usr_sarah_chen',
    title: 'STAT Emergency Donor Match Found',
    message: 'Donor Marcus Vance (O+ Whole Blood) accepted the emergency transit call for Patient C.K.',
    category: 'blood',
    urgency: 'emergency',
    timestamp: '15 mins ago',
    isRead: false
  },
  {
    id: 'notif_001b',
    userId: 'usr_sarah_chen',
    title: 'Blood Center Clearance Granted',
    message: 'Hyderabad Blood Centre verified serology and cleared emergency blood supply for surgical care.',
    category: 'blood',
    urgency: 'urgent',
    timestamp: '45 mins ago',
    isRead: false
  },
  {
    id: 'notif_002',
    userId: 'usr_sarah_chen',
    title: 'New HLA Bone Marrow Registry Match',
    message: 'A prospective 10/10 HLA donor completed cheek-swab confirmation for patient Leo R.',
    category: 'bone_tissue',
    urgency: 'urgent',
    timestamp: '1 hour ago',
    isRead: false
  },
  {
    id: 'notif_003',
    userId: 'usr_sarah_chen',
    title: 'Hospital Requisition Verified',
    message: 'Crowns of Courage accepted hair donor package for pediatric patient Mia K.',
    category: 'hair',
    urgency: 'standard',
    timestamp: '3 hours ago',
    isRead: true
  },
  {
    id: 'notif_004',
    userId: 'usr_sarah_chen',
    title: 'Annual Organ Pledge Re-Certification',
    message: 'State Organ Registry sync completed. 142 new living & deceased pledges registered this week.',
    category: 'organ',
    urgency: 'standard',
    timestamp: 'Yesterday',
    isRead: true
  }
];

export const VERIFICATION_QUEUE_MOCK: VerificationItem[] = [
  {
    id: 'verif_001',
    type: 'hospital_credentials',
    entityId: 'org_chicago_mercy',
    entityName: 'Chicago Mercy Regional Medical Center',
    submittedAt: '2026-09-24T18:20:00Z',
    documentType: 'State Department of Public Health Hospital Operating License',
    documentRef: 'DOC-IL-HOSP-LIC-2026-092.PDF',
    status: 'pending',
    notes: 'Submitted verification for emergency blood drive authorization & trauma center tier.'
  },
  {
    id: 'verif_002',
    type: 'donor_identity',
    entityId: 'dnr_008_new',
    entityName: 'Tariq Al-Mansoor',
    submittedAt: '2026-09-25T02:10:00Z',
    documentType: 'Government Issued Real-ID & Blood Type Lab Certification',
    documentRef: 'ID-VERIF-IL-884102.JPG',
    status: 'pending',
    notes: 'O- Negative whole blood donor applicant with recent antibody screening certificate.'
  },
  {
    id: 'verif_003',
    type: 'medical_requisition',
    entityId: 'req_new_cornea',
    entityName: 'Dr. Gregory House (St. Jude Eye Clinic)',
    submittedAt: '2026-09-25T05:40:00Z',
    documentType: 'Corneal Graft Clinical Board Requisition',
    documentRef: 'REQUISITION-EAA-8812.PDF',
    status: 'pending',
    notes: 'Keratoconus patient requiring endothelial keratoplasty tissue allograft.'
  }
];

export const MODERATION_REPORTS_MOCK: ModerationReport[] = [
  {
    id: 'rep_001',
    reportedItemId: 'usr_suspicious_01',
    itemType: 'user',
    reporterName: 'Anonymous Community Member',
    reason: 'commercial_trade_attempt',
    details: 'User posted a comment inquiring about monetary compensation for kidney donation. Strictly violates anti-trafficking policy.',
    timestamp: '2026-09-24T19:30:00Z',
    status: 'pending'
  },
  {
    id: 'rep_002',
    reportedItemId: 'req_unverified_hair',
    itemType: 'request',
    reporterName: 'Certified NGO Coordinator',
    reason: 'inaccurate_medical_info',
    details: 'Hair requirement submitted without affiliated cancer foundation verification or delivery address.',
    timestamp: '2026-09-23T14:10:00Z',
    status: 'resolved'
  }
];

export const PATIENT_STORIES_MOCK: PatientStory[] = [
  {
    id: 'story_001',
    recipientName: 'Elena Vasquez',
    age: 34,
    city: 'Hyderabad',
    state: 'Telangana',
    category: 'blood',
    condition: 'Emergency Postpartum Hemorrhage',
    receivedItem: '4 Units O+ Whole Blood & Apheresis Platelets',
    hospitalName: 'Hyderabad Blood Centre & Transfusion Hospital',
    matchDate: '3 months ago',
    recoveryMilestone: 'Full maternal recovery & healthy infant',
    quote: 'When every second mattered, two on-call volunteer donors responded to the emergency beacon within 40 minutes. Because of them, I get to watch my daughter grow up.',
    detailedJourney: 'During an unexpected complication following emergency cesarean delivery, Elena suffered severe acute coagulopathy requiring immediate massive transfusion protocol. Two verified O+ donors on the Dofi emergency transit network mobilized to the hospital blood depot within 40 minutes. Elena stabilized within hours and was discharged healthy one week later.',
    verifiedBy: 'Dr. Sarah Chen, MD (Clinical Lead)',
    verificationRegistryId: 'TS-EMERG-HYD-9941',
    donorRelation: 'Emergency STAT Donors #D-409 & #D-512',
    donorNameAnonymous: 'Marcus Vance & Anonymous Donor',
    avatarInitial: 'EV',
    avatarColor: 'bg-rose-500',
    heartsCount: 142,
    isVerified: true
  },
  {
    id: 'story_002',
    recipientName: 'David K. Campbell',
    age: 52,
    city: 'Evanston',
    state: 'IL',
    category: 'organ',
    condition: 'End-Stage Renal Disease (Stage 5 CKD)',
    receivedItem: 'Living Donor Left Kidney Transplant',
    hospitalName: 'Northwestern Memorial Clinical Institute',
    matchDate: '8 months ago',
    recoveryMilestone: '100% GFR renal function restored · Off hemodialysis',
    quote: 'After 3 years on grueling 4-hour dialysis sessions, DonorConnect paired me with an altruistic living donor through a multi-center UNOS chain. I can breathe, hike, and live again.',
    detailedJourney: 'David lived with failing kidney function and cardiovascular strain for years. When his family members were biologically incompatible, his nephrologist enrolled him on DonorConnect 4Care’s paired exchange network. Within 90 days, a 4-way altruistic paired chain was validated and authorized by the institutional ethics board.',
    verifiedBy: 'Dr. Arthur Vance, MD (Transplant Nephrology)',
    verificationRegistryId: 'UNOS-KIDNEY-CHAIN-7820',
    donorRelation: 'Altruistic Living Paired Match',
    donorNameAnonymous: 'Verified Donor #LDK-104',
    avatarInitial: 'DC',
    avatarColor: 'bg-teal-600',
    heartsCount: 219,
    isVerified: true
  },
  {
    id: 'story_003',
    recipientName: 'Leo Robinson',
    age: 19,
    city: 'Naperville',
    state: 'IL',
    category: 'bone_tissue',
    condition: 'Acute Myeloid Leukemia (AML)',
    receivedItem: '10/10 HLA-Matched Peripheral Blood Stem Cells (PBSC)',
    hospitalName: 'Lakeside Children\'s Specialty Hospital',
    matchDate: '1 year ago',
    recoveryMilestone: 'Complete Molecular Remission (Day +365)',
    quote: 'My cheek swab registry match was a stranger 1,200 miles away who gave up three days of work to donate stem cells. Their bone marrow literally rewrote my blood and gave me a second life.',
    detailedJourney: 'Leo faced high-risk leukemia refractory to induction chemotherapy. An urgent HLA search was initiated across DonorConnect’s registered tissue pledge community. A 10/10 high-resolution HLA match was confirmed, stem cells were harvested via non-invasive apheresis, and engraftment succeeded on Day +14. Leo celebrated his one-year anniversary in full clinical remission.',
    verifiedBy: 'Dr. Gregory House, MD (Bone Marrow Division)',
    verificationRegistryId: 'NMDP-HLA-MATCH-33019',
    donorRelation: 'National HLA Stem Cell Donor',
    donorNameAnonymous: 'Verified Registry Member #HLA-992',
    avatarInitial: 'LR',
    avatarColor: 'bg-indigo-600',
    heartsCount: 318,
    isVerified: true
  },
  {
    id: 'story_004',
    recipientName: 'Mia Kowalski',
    age: 9,
    city: 'Oak Park',
    state: 'IL',
    category: 'hair',
    condition: 'Pediatric Oncology Chemotherapy Support',
    receivedItem: '12-inch Hand-Crafted Natural Hair Cranial Prosthetic',
    hospitalName: 'Crowns of Courage Pediatric Cranial Workshop',
    matchDate: '5 months ago',
    recoveryMilestone: 'Returned to school classroom with restored joy and self-esteem',
    quote: 'My daughter looked in the mirror for the first time in 7 months and smiled her real smile again. The soft, gentle hair wig made with real donor ponytails restored her dignity.',
    detailedJourney: 'Nine-year-old Mia lost her hair during aggressive neuroblastoma chemotherapy treatments. Commercial synthetic wigs irritated her sensitive scalp. Through Crowns of Courage and DonorConnect, four certified 12-inch ponytail donations from community donors were hand-woven into a customized, breathable cranial cap matched to Mia\'s natural dark chestnut curls.',
    verifiedBy: 'Maya Lin (Founder & Master Wigmaker, 501c3)',
    verificationRegistryId: 'CROC-PED-WIG-5514',
    donorRelation: '4 Verified Hair Donors',
    donorNameAnonymous: 'Maya S., Rachel B. & 2 Anonymous Donors',
    avatarInitial: 'MK',
    avatarColor: 'bg-amber-500',
    heartsCount: 185,
    isVerified: true
  },
  {
    id: 'story_005',
    recipientName: 'Amara Patel',
    age: 28,
    city: 'Schaumburg',
    state: 'IL',
    category: 'bone_tissue',
    condition: 'Severe Keratoconus & Corneal Ectasia',
    receivedItem: 'Endothelial Keratoplasty Donor Corneal Allograft',
    hospitalName: 'Midwest Tissue Repository & Eye Institute',
    matchDate: '7 months ago',
    recoveryMilestone: 'Visual acuity restored from 20/400 legally blind to 20/25',
    quote: 'I couldn’t recognize my fiancé’s face or read a computer screen for two years. A donor family’s gift of sight let me see the sunrise and return to my career in architecture.',
    detailedJourney: 'Amara was legally blind in her left eye due to progressive corneal scarring. A certified corneal tissue graft preserved and prepared by Midwest Tissue Bank was matched to her procedure. The micro-surgical graft fully integrated within 6 weeks, restoring 20/25 vision without rejection episodes.',
    verifiedBy: 'Karen Lindqvist, PA-C (Tissue Allograft Coordinator)',
    verificationRegistryId: 'AATB-TISS-EYE-8821',
    donorRelation: 'Posthumous Eye Tissue Donor Family',
    donorNameAnonymous: 'Generous Anonymous Donor Family',
    avatarInitial: 'AP',
    avatarColor: 'bg-sky-600',
    heartsCount: 164,
    isVerified: true
  },
  {
    id: 'story_006',
    recipientName: 'Marcus & Sophia Chen (Parents of Baby Ethan)',
    age: 3,
    city: 'Chicago',
    state: 'IL',
    category: 'blood',
    condition: 'Congenital Cyanotic Heart Defect Surgery',
    receivedItem: 'Pediatric Red Cell Micro-Units & Fresh Frozen Plasma',
    hospitalName: 'Lakeside Children\'s Specialty Hospital',
    matchDate: '2 months ago',
    recoveryMilestone: 'Successful cardiac bypass repair · Active toddler play',
    quote: 'During open-heart surgery, our baby needed CMV-negative irradiated blood that had to be fresh within 48 hours. DonorConnect’s pediatric donor list matched us instantly.',
    detailedJourney: 'During complex corrective cardiopulmonary bypass surgery, toddler Ethan required rare CMV-seronegative irradiated donor blood. DonorConnect’s specialized pediatric blood registry immediately located pre-screened volunteer donors, facilitating collection and lab clearance in record time to ensure a successful surgery.',
    verifiedBy: 'Dr. Sarah Chen, MD & Nurse Patricia Ramos',
    verificationRegistryId: 'TX-PEDS-HEART-4402',
    donorRelation: 'Pre-screened CMV-Negative Blood Donor',
    donorNameAnonymous: 'Verified Pediatric Donor #P-109',
    avatarInitial: 'EC',
    avatarColor: 'bg-rose-600',
    heartsCount: 247,
    isVerified: true
  }
];

