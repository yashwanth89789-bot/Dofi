export type DonationCategory = 'blood' | 'organ' | 'bone_tissue' | 'hair';

export type UserRole = 'user' | 'donor' | 'hospital' | 'admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent = 'whole_blood' | 'platelets' | 'plasma' | 'red_blood_cells';

export type OrganType = 'kidney' | 'liver_lobe' | 'cornea' | 'heart' | 'lung' | 'pancreas';

export type BoneTissueType = 'bone_marrow' | 'stem_cells' | 'bone_graft' | 'cornea_tissue' | 'skin_graft' | 'heart_valve';

export type HairLength = '8_inch' | '10_inch' | '12_inch' | '14_inch_plus';
export type HairCondition = 'virgin_untreated' | 'color_treated_safe' | 'gray_permitted';
export type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily';

export type UrgencyLevel = 'emergency' | 'urgent' | 'standard';

export type RequestStatus = 'pending' | 'verified' | 'matched' | 'in_progress' | 'completed' | 'cancelled';

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  donorUserId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  city?: string;
  status: 'available' | 'confirmed' | 'fulfilled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  note?: string;
  hospitalId?: string;
  requesterId?: string;
}

export interface ScheduledSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '12:00'
  procedureType: DonationCategory;
  hospitalPreference?: string;
  notes?: string;
  status: 'available' | 'confirmed' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  city: string;
  state: string;
  isVerified: boolean;
  hospitalAffiliation?: string;
  organizationId?: string;
  createdDate: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  donorName: string;
  avatarUrl?: string;
  city: string;
  state: string;
  distanceKm: number; // Simulated distance from user's current city
  categories: DonationCategory[];
  isVerified: boolean;
  verificationBadge: string;
  availabilityStatus: 'available_now' | 'available_24h' | 'cooldown' | 'on_call';
  cooldownUntil?: string;
  lastDonationDate?: string;
  totalDonationsCount: number;
  phone: string;
  email: string;
  privacySetting: 'hospital_mediated' | 'direct_authorized' | 'anonymous_until_match';
  scheduledSlots?: ScheduledSlot[];
  
  // Specific category metadata
  bloodDetails?: {
    bloodGroup: BloodGroup;
    components: BloodComponent[];
    rhFactor: '+' | '-';
    hemoglobinLevel?: string;
  };
  organDetails?: {
    organsPledged: OrganType[];
    donationType: 'living_altruistic' | 'deceased_registry';
    transplantCenterRegistryId?: string;
    consentingNextOfKin?: boolean;
  };
  boneTissueDetails?: {
    tissueTypes: BoneTissueType[];
    hlaTypingAvailable: boolean;
    marrowRegistryId?: string;
    swabKitStatus: 'completed' | 'in_transit' | 'not_requested';
  };
  hairDetails?: {
    lengthInches: number;
    condition: HairCondition;
    texture: HairTexture;
    color: string;
    packagedMethod: 'braided_ziplock' | 'ponytail_cut';
    willingToMail: boolean;
  };
  clinicalScreening?: {
    status: 'passed' | 'pending' | 'flagged';
    screeningDate: string;
    expiresDate: string;
    labName: string;
    cliaNumber: string;
    panelType: string;
    hipaaComplianceId: string;
    clearedTests: string[];
    medicalReviewer?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  type: 'hospital_transplant_center' | 'blood_bank' | 'tissue_repository' | 'cancer_wig_ngo';
  licenseNumber: string;
  regulatoryBody: string; // e.g., UNOS Certified, FDA Regulated, Red Cross Affiliate, Certified 501(c)(3)
  city: string;
  state: string;
  phone: string;
  email: string;
  isVerified: boolean;
  activeCoordinators: string[];
  address?: string;
  distanceKm?: number;
  traumaLevel?: string;
  openRequisitionsCount?: number;
  coordinates?: { x: number; y: number };
}

export interface BloodDrive {
  id: string;
  name: string;
  organizer: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  date: string;
  hours: string;
  status: 'active_today' | 'upcoming' | 'urgent_shortage';
  targetBloodGroups: BloodGroup[];
  availableSlots: number;
  walkInsAllowed: boolean;
  coordinatorContact: string;
  servicesOffered: ('whole_blood' | 'platelets' | 'bone_marrow_swab' | 'hair_donation')[];
  coordinates: { x: number; y: number };
}

export interface RequestTimelineEvent {
  status: RequestStatus;
  timestamp: string;
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
}

export interface DonationRequest {
  id: string;
  category: DonationCategory;
  title: string;
  patientAlias: string;
  patientAge: number;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  hospitalId: string;
  hospitalName: string;
  city: string;
  state: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  deadlineHoursRemaining: number;
  deadlineDate: string;
  createdAt: string;
  unitsNeeded?: number;
  unitsFulfilled?: number;
  matchedDonorIds: string[];
  medicalNotes: string;
  timeline: RequestTimelineEvent[];
  
  // Category specific requirements
  bloodRequirements?: {
    targetBloodGroup: BloodGroup;
    compatibleBloodGroups: BloodGroup[];
    component: BloodComponent;
    isStatCrossmatchRequired: boolean;
  };
  organRequirements?: {
    organ: OrganType;
    transplantSurgeonName: string;
    clinicalBoardApprovalRef: string;
    praScore?: string;
  };
  boneTissueRequirements?: {
    tissueType: BoneTissueType;
    requiredHlaLoci?: string[];
    transplantProtocol: string;
  };
  hairRequirements?: {
    minInches: number;
    conditionAccepted: HairCondition[];
    recipientType: 'pediatric_cancer' | 'adult_oncology' | 'alopecia_support';
    wigMakerPartner: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: DonationCategory;
  urgency: UrgencyLevel;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface VerificationItem {
  id: string;
  type: 'donor_identity' | 'hospital_credentials' | 'medical_requisition';
  entityId: string;
  entityName: string;
  submittedAt: string;
  documentType: string;
  documentRef: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  notes?: string;
}

export interface ModerationReport {
  id: string;
  reportedItemId: string;
  itemType: 'donor' | 'request' | 'user';
  reporterName: string;
  reason: 'commercial_trade_attempt' | 'suspicious_activity' | 'inaccurate_medical_info' | 'harassment' | 'other';
  details: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface PatientStory {
  id: string;
  recipientName: string;
  age: number;
  city: string;
  state: string;
  category: DonationCategory;
  condition: string;
  receivedItem: string;
  hospitalName: string;
  matchDate: string;
  recoveryMilestone: string;
  quote: string;
  detailedJourney: string;
  verifiedBy: string;
  verificationRegistryId: string;
  donorRelation: string;
  donorNameAnonymous: string;
  avatarInitial: string;
  avatarColor: string;
  heartsCount: number;
  isVerified: boolean;
}

export interface ImpactStats {
  activeRequests: number;
  availableDonors: number;
  criticalEmergencies: number;
  verifiedHospitals: number;
  livesTouchedCount: number;
  bloodUnitsCollected: number;
  hairWigsGifted: number;
  organTransplantsFacilitated: number;
  marrowPledgesRegistered: number;
}

// -------------------------------------------------------------
// AI Clinical Suite Types
// -------------------------------------------------------------

export interface AICrossmatchResult {
  compatibilityScore: number;
  riskLevel: 'OPTIMAL' | 'ACCEPTABLE' | 'ELEVATED_RISK' | 'HIGH_RISK_INCOMPATIBLE';
  riskBadge: string;
  clinicalHeadline: string;
  clinicalSummary: string;
  patientExplanation: string;
  parametersAnalysis: {
    parameter: string;
    status: 'pass' | 'warning' | 'fail' | 'info';
    donorValue: string;
    recipientRequirement: string;
    clinicalImplication: string;
  }[];
  hlaBreakdown?: {
    applicable: boolean;
    totalMatchScore: string;
    gvhdRisk: 'Low' | 'Moderate' | 'High';
    locusMatches: {
      locus: string;
      donorAllele: string;
      recipientAllele: string;
      matchStatus: 'exact_match' | 'acceptable_mismatch' | 'high_risk_mismatch';
    }[];
  };
  coldIschemiaAnalysis: {
    safeWindowHours: number;
    transitRiskTier: 'Low' | 'Moderate' | 'Critical';
    preservationProtocol: string;
  };
  clinicalBoardRecommendations: string[];
  ethicalComplianceNote: string;
}

export interface AIEligibilityResult {
  eligibilityStatus: 'FULLY_ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'TEMPORARILY_DEFERRED' | 'PERMANENTLY_INELIGIBLE';
  statusBadge: string;
  headline: string;
  deferralDurationDays: number;
  deferralUntilDate: string | null;
  clinicalReasoning: string;
  evaluatedRules: {
    ruleName: string;
    passed: boolean;
    detail: string;
    standard: 'FDA' | 'AABB' | 'UNOS' | 'NMDP' | 'WIG_GUILD';
  }[];
  preparationSteps: string[];
  safeAlternatives: string[];
  medicalDisclaimer: string;
}

export interface AIEmergencyDispatchResult {
  urgencyIndex: number;
  priorityLevel: 'STAT_CRITICAL' | 'URGENT_SURGE' | 'ELEVATED_WATCH';
  priorityAssessment: string;
  optimalDispatchRadiusKm: number;
  coldChainProtocol: {
    transportMethod: string;
    maxAllowableTransitMinutes: number;
    temperatureControlSpecs: string;
    preservationRequirement: string;
  };
  recommendedDonorsToAlert: {
    donorName: string;
    category: string;
    bloodGroup: string;
    distanceKm: number;
    priorityRank: number;
    matchReason: string;
  }[];
  generatedAlerts: {
    smsCopy: string;
    pushNotificationTitle: string;
    pushNotificationBody: string;
    hospitalStatDispatchMemo: string;
  };
  inventoryRebalancingPlan: {
    sourceFacility: string;
    destinationFacility: string;
    unitType: string;
    quantity: number;
    urgency: string;
  }[];
  ethicalCommandGuidance: string;
}

export interface AILabInterpretationResult {
  testPanelTitle: string;
  overallStatus: 'NORMAL_ELIGIBLE' | 'REVIEW_RECOMMENDED' | 'CRITICAL_INELIGIBLE';
  statusHeadline: string;
  patientFriendlySummary: string;
  analyzedBiomarkers: {
    markerName: string;
    userValue: string;
    standardReferenceRange: string;
    status: 'normal' | 'low' | 'high' | 'critical' | 'negative_clear';
    clinicalMeaning: string;
    donationImpact: string;
  }[];
  doctorConsultationQuestions: string[];
  recommendedRetestInterval: string;
  medicalDisclaimer: string;
}

export interface AIGratitudeLetterResult {
  letterTitle: string;
  letterContent: string;
  emotionalTone: string;
  ethicalComplianceAudit: {
    isFullyCompliant: boolean;
    notaEthicsPassed: boolean;
    redactedEntitiesCount: number;
    auditNotes: string;
    redactionsApplied: {
      originalText: string;
      anonymizedAs: string;
      reason: string;
    }[];
  };
  reflectionPrompt: string;
  sharingSafeguardNotice: string;
}

export interface BioMatchMLResult {
  overallEngraftmentProbability: number;
  medianNeutrophilEngraftmentDay: number;
  medianPlateletEngraftmentDay: number;
  gvhdRiskScore: number;
  gvhdRiskTier: 'Low' | 'Moderate' | 'High';
  survivalProbabilities: {
    oneYearOS: number;
    threeYearOS: number;
    fiveYearOS: number;
    oneYearPFS: number;
  };
  kaplanMeierCurve: {
    day: number;
    overallSurvival: number;
    progressionFreeSurvival: number;
    gvhdFreeSurvival: number;
  }[];
  featureAttributions: {
    featureName: string;
    category: 'HLA' | 'Immunology' | 'Biometrics' | 'Logistics' | 'CellDose';
    impactScore: number;
    direction: 'positive' | 'negative' | 'neutral';
    description: string;
    relativeWeight: number;
  }[];
  modelMetrics: {
    algorithmName: string;
    cIndexHarrell: number;
    rocAuc: number;
    brierScore: number;
    trainingCohortSize: string;
    validationProtocol: string;
  };
  clinicalInterventions: string[];
  conditioningRecommendation: string;
}

export interface AIVisionAnalysisResult {
  specimenType: 'hair_specimen' | 'blood_vial' | 'lab_report' | 'cell_viability';
  suitabilityScore: number;
  qualityTier: 'PREMIUM_OPTIMAL' | 'ACCEPTABLE' | 'SUBOPTIMAL' | 'REJECTED';
  detectedAttributes: {
    name: string;
    value: string;
    confidence: number;
    isPass: boolean;
    clinicalNote: string;
  }[];
  visionConfidence: number;
  detectedDefectsOrAnomalies: string[];
  recommendations: string[];
  processingCertification: string;
}

export interface AIOncologyTrialResult {
  matchedHospitals: {
    hospitalName: string;
    country: string;
    city: string;
    matchScore: number;
    trialId: string;
    trialPhase: string;
    protocolName: string;
    targetedBiomarkers: string[];
    eligibilityRationale: string;
    contactUnit: string;
    internationalPatientOffice: string;
  }[];
  molecularTargetSummary: string;
  cellularTherapySuitability: {
    carT: boolean;
    allogeneicBMT: boolean;
    haploidenticalTransplant: boolean;
    cordBloodTransplant: boolean;
    notes: string;
  };
  urgencyWindowDays: number;
  referralChecklist: string[];
}

export interface AISemanticVectorResult {
  recipientEmbedding: {
    x: number;
    y: number;
    cluster: string;
    dimensions: Record<string, number>;
  };
  donorEmbeddings: {
    id: string;
    name: string;
    x: number;
    y: number;
    cosineSimilarity: number;
    cluster: string;
  }[];
  dimensionWeights: {
    dimension: string;
    weight: number;
  }[];
}

export interface DonorEligibilityScreeningResult {
  status: 'eligible_for_review' | 'temporarily_deferred' | 'needs_manual_review';
  statusLabel?: string;
  summary: string;
  parameters: {
    name: string;
    value: string;
    status: 'pass' | 'review' | 'flag';
    reason: string;
  }[];
  recommendation: string;
  disclaimer: string;
  reportId?: string;
  generatedAt?: string;
  consentStatus?: {
    screeningAcknowledged: boolean;
    privacyConsented: boolean;
    timestamp?: string;
  };
}

