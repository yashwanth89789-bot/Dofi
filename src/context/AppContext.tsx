import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  DonationCategory,
  DonationRequest,
  DonorProfile,
  Organization,
  NotificationItem,
  VerificationItem,
  ModerationReport,
  RequestStatus,
  ImpactStats,
  BloodGroup,
  ScheduledSlot,
  BloodDrive,
  PatientStory,
  DonorResponse
} from '../types';
import {
  CURRENT_USER_MOCK,
  DEMO_USERS,
  ORGANIZATIONS_MOCK,
  VERIFICATION_QUEUE_MOCK,
  MODERATION_REPORTS_MOCK,
  BLOOD_COMPATIBILITY_MAP,
  BLOOD_DRIVES_MOCK,
  PATIENT_STORIES_MOCK
} from '../data/mockData';
import { CancerHospital, WORLD_CANCER_HOSPITALS } from '../data/cancerHospitalsData';
import {
  auth,
  db,
  signInWithGoogle,
  signOutFirebaseUser,
  syncUserToFirestore,
  saveDonationRegistrationToFirestore,
  RegisteredAppUser,
  FirebaseDonationRegistration
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, setDoc, doc, updateDoc, where } from 'firebase/firestore';

interface AppContextType {
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
  requests: DonationRequest[];
  donors: DonorProfile[];
  organizations: Organization[];
  bloodDrives: BloodDrive[];
  patientStories: PatientStory[];
  notifications: NotificationItem[];
  verificationQueue: VerificationItem[];
  reports: ModerationReport[];
  impactStats: ImpactStats;
  
  // UI state
  activeTab: 'dashboard' | 'find-donors' | 'requests' | 'hospital' | 'admin' | 'ethics' | 'ai-suite' | 'registrations' | 'ai-clinical-tools';
  setActiveTab: (tab: 'dashboard' | 'find-donors' | 'requests' | 'hospital' | 'admin' | 'ethics' | 'ai-suite' | 'registrations' | 'ai-clinical-tools') => void;
  activeFilterCategory: 'all' | DonationCategory;
  setActiveFilterCategory: (cat: 'all' | DonationCategory) => void;
  selectedRequest: DonationRequest | null;
  setSelectedRequest: (req: DonationRequest | null) => void;
  selectedDonor: DonorProfile | null;
  setSelectedDonor: (donor: DonorProfile | null) => void;
  isCreateRequestModalOpen: boolean;
  setIsCreateRequestModalOpen: (open: boolean) => void;
  isRegisterDonorModalOpen: boolean;
  setIsRegisterDonorModalOpen: (open: boolean) => void;
  isEthicsModalOpen: boolean;
  setIsEthicsModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportingTarget: { id: string; name: string; type: 'donor' | 'request' | 'user' } | null;
  setReportingTarget: (target: { id: string; name: string; type: 'donor' | 'request' | 'user' } | null) => void;

  // AI Suite specific state & shortcuts
  aiPreselectedRequest: DonationRequest | null;
  setAiPreselectedRequest: (req: DonationRequest | null) => void;
  aiPreselectedDonor: DonorProfile | null;
  setAiPreselectedDonor: (donor: DonorProfile | null) => void;
  aiActiveModule: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude';
  setAiActiveModule: (module: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude') => void;
  openAiWithRequest: (req: DonationRequest) => void;
  openAiWithDonor: (donor: DonorProfile) => void;
  openAiModule: (module: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude') => void;

  // Cancer Hospital & Portal state
  selectedCancerHospital: CancerHospital | null;
  setSelectedCancerHospital: (hospital: CancerHospital | null) => void;
  cancerHospitalSearchQuery: string;
  setCancerHospitalSearchQuery: (query: string) => void;
  openHospitalPortalForCancerHospital: (hospital: CancerHospital) => void;

  // Firebase Auth & Live Database state
  firebaseUser: FirebaseUser | null;
  registeredAppUser: RegisteredAppUser | null;
  registeredAppUsersList: RegisteredAppUser[];
  firebaseDonationsList: FirebaseDonationRegistration[];
  isFirebaseLoading: boolean;
  isAuthReady: boolean;
  firestoreRequests: any[];
  firestoreRequestsCount: number;
  // Live Firestore-backed dashboard counts (exclude demo data)
  liveActiveRequests: number;
  liveCriticalEmergencies: number;
  liveBloodRequests: number;
  liveOrganRequests: number;
  liveAvailableDonors: number;
  liveRegisteredDonors: number;
  liveRegisteredUsers: number;
  loginWithGoogle: (intendedRole?: UserRole) => Promise<void>;
  logoutFirebase: () => Promise<void>;
  registerDonationToFirebase: (data: Partial<FirebaseDonationRegistration>) => Promise<FirebaseDonationRegistration>;

  // Actions
  createRequest: (newReq: Partial<DonationRequest>) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, note?: string) => void;
  registerDonor: (donorData: Partial<DonorProfile>) => void;
  approveVerification: (id: string, notes?: string) => void;
  rejectVerification: (id: string, notes?: string) => void;
  submitModerationReport: (report: { reportedItemId: string; itemType: 'donor' | 'request' | 'user'; reason: ModerationReport['reason']; details: string }) => void;
  resolveReport: (id: string) => void;
  dismissReport: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  computeMatchScore: (request: DonationRequest, donor: DonorProfile) => number;
  addDonorScheduledSlot: (donorId: string, slot: Omit<ScheduledSlot, 'id'>) => void;
  removeDonorScheduledSlot: (donorId: string, slotId: string) => void;
  registerForBloodDrive: (driveId: string) => boolean;
  likePatientStory: (storyId: string) => void;
  submitPatientStory: (story: Omit<PatientStory, 'id' | 'heartsCount' | 'isVerified'>) => void;

  // Donor response workflow (Phase 5)
  donorResponses: DonorResponse[];
  respondToRequest: (requestId: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  updateDonorResponseStatus: (responseId: string, status: DonorResponse['status']) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dc4c_current_user');
    return saved ? JSON.parse(saved) : CURRENT_USER_MOCK;
  });

  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [donors, setDonors] = useState<DonorProfile[]>([]);

  const [organizations] = useState<Organization[]>(ORGANIZATIONS_MOCK);

  const [bloodDrives, setBloodDrives] = useState<BloodDrive[]>(() => {
    const saved = localStorage.getItem('dc4c_blood_drives');
    return saved ? JSON.parse(saved) : BLOOD_DRIVES_MOCK;
  });

  const [patientStories, setPatientStories] = useState<PatientStory[]>(() => {
    const saved = localStorage.getItem('dc4c_patient_stories');
    return saved ? JSON.parse(saved) : PATIENT_STORIES_MOCK;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('dc4c_notifications');
    if (!saved) return [];
    try {
      const list: NotificationItem[] = JSON.parse(saved);
      return list.filter(n => !n.id.startsWith('notif_login_'));
    } catch {
      return [];
    }
  });

  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>(() => {
    const saved = localStorage.getItem('dc4c_verifications');
    return saved ? JSON.parse(saved) : VERIFICATION_QUEUE_MOCK;
  });

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem('dc4c_reports');
    return saved ? JSON.parse(saved) : MODERATION_REPORTS_MOCK;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'find-donors' | 'requests' | 'hospital' | 'admin' | 'ethics' | 'ai-suite' | 'registrations' | 'ai-clinical-tools'>('dashboard');
  const [activeFilterCategory, setActiveFilterCategory] = useState<'all' | DonationCategory>('all');
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [isRegisterDonorModalOpen, setIsRegisterDonorModalOpen] = useState(false);
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{ id: string; name: string; type: 'donor' | 'request' | 'user' } | null>(null);

  // Firebase Auth & Firestore live state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [registeredAppUser, setRegisteredAppUser] = useState<RegisteredAppUser | null>(null);
  const [registeredAppUsersList, setRegisteredAppUsersList] = useState<RegisteredAppUser[]>([]);
  const [firebaseDonationsList, setFirebaseDonationsList] = useState<FirebaseDonationRegistration[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [firestoreRequests, setFirestoreRequests] = useState<any[]>([]);
  const [firestoreRequestsCount, setFirestoreRequestsCount] = useState(0);

  // Firebase Auth State Listener — source of truth for auth state
  // This runs automatically whenever auth state changes (sign-in, sign-out, page reload)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('[AppContext] onAuthStateChanged fired. User:', fbUser?.uid ?? 'null');
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Update the demo currentUser fields to reflect the real Firebase user
        // This does NOT override the demo role switcher — it just syncs displayName/email/photo
        setCurrentUser(prev => ({
          ...prev,
          id: fbUser.uid,
          name: fbUser.displayName || prev.name,
          email: fbUser.email || prev.email,
          avatarUrl: fbUser.photoURL || prev.avatarUrl
        }));

        // Sync/create Firestore user record (decoupled from popup — errors won't break auth display)
        try {
          const appUser = await syncUserToFirestore(fbUser);
          setRegisteredAppUser(appUser);
          console.log('[AppContext] registeredAppUser set:', appUser.id, appUser.role);
          
          const isAdmin = fbUser.email === 'mohammedayaan9683@gmail.com' || appUser.role === 'admin';
          if (isAdmin) {
            setCurrentUser(prev => ({
              ...prev,
              role: 'admin',
              isVerified: true
            }));
            sessionStorage.setItem('dofi_role_chosen', '1');
            localStorage.setItem('dofi_user_role', 'admin');
            setActiveTab('admin');
          } else {
            const savedRole = localStorage.getItem('dofi_user_role') as UserRole | null;
            const effectiveRole: UserRole | null = (savedRole as string) === 'recipient' ? 'user' : savedRole;
            if (effectiveRole && (effectiveRole === 'donor' || effectiveRole === 'hospital' || effectiveRole === 'user')) {
              setCurrentUser(prev => ({
                ...prev,
                role: effectiveRole
              }));
              sessionStorage.setItem('dofi_role_chosen', '1');
              if (effectiveRole === 'hospital') {
                setActiveTab('hospital');
              }
            } else if (appUser.role === 'donor') {
              setCurrentUser(prev => ({
                ...prev,
                role: 'donor'
              }));
              sessionStorage.setItem('dofi_role_chosen', '1');
              localStorage.setItem('dofi_user_role', 'donor');
            } else if (appUser.role === 'hospital_staff') {
              setCurrentUser(prev => ({
                ...prev,
                role: 'hospital'
              }));
              sessionStorage.setItem('dofi_role_chosen', '1');
              localStorage.setItem('dofi_user_role', 'hospital');
              setActiveTab('hospital');
            }
          }
        } catch (err) {
          console.warn('[AppContext] Firestore user sync failed — auth state still updated:', err);
        } finally {
          setIsAuthReady(true);
        }
      } else {
        // Signed out
        setRegisteredAppUser(null);
        sessionStorage.removeItem('dofi_role_chosen');
        localStorage.removeItem('dofi_user_role');
        setIsAuthReady(true);
        console.log('[AppContext] User signed out — registeredAppUser cleared.');
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore users listener — only real signed-in users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(d => d.data() as RegisteredAppUser);
      setRegisteredAppUsersList(users);
    }, (error) => {
      console.warn('[Firestore] users snapshot error:', error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore donation registrations listener — only real user-submitted registrations
  useEffect(() => {
    const q = query(collection(db, 'donation_registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donations = snapshot.docs.map(d => d.data() as FirebaseDonationRegistration);
      setFirebaseDonationsList(donations);
      const liveDonors: DonorProfile[] = donations.map(reg => ({
        id: reg.id,
        userId: reg.registeredByUserId,
        donorName: reg.donorName,
        bloodGroup: (reg.bloodGroup as BloodGroup) || 'O+',
        city: reg.city || 'Hyderabad',
        state: reg.state || 'Telangana',
        distanceKm: 5,
        availabilityStatus: (['available_now', 'available_24h', 'cooldown', 'on_call'].includes(reg.availabilityStatus) ? reg.availabilityStatus : 'available_now') as any,
        isVerified: true,
        verificationBadge: reg.verificationBadge || 'Registered Blood Donor',
        categories: (reg.categories as DonationCategory[]) || ['blood'],
        totalDonationsCount: 1,
        privacySetting: 'direct_authorized',
        bloodDetails: {
          bloodGroup: (reg.bloodGroup as BloodGroup) || 'O+',
          components: ['whole_blood', 'platelets'],
          rhFactor: reg.bloodGroup?.includes('-') ? '-' : '+',
          hemoglobinLevel: '14.2 g/dL',
          lastDonationDate: '',
          donationCount: 1,
          eligibleForWholeBlood: true,
          eligibleForPlatelets: true,
          eligibleForPlasma: true
        },
        phone: reg.phone,
        email: reg.email,
        scheduledSlots: []
      }));
      setDonors(liveDonors);
    }, (error) => {
      console.warn('[Firestore] donation_registrations snapshot error:', error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore donation_requests listener
  useEffect(() => {
    const q = query(collection(db, 'donation_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allItems = snapshot.docs.map(d => {
        const data = d.data();
        const requestId = data.id || d.id;
        const item: DonationRequest = {
          ...data,
          id: requestId
        } as DonationRequest;
        const cleanedHospital = (item.hospitalName && (item.hospitalName.includes('Metro University') || item.hospitalName.includes('Organ Transplant')))
          ? 'Hyderabad Blood Centre & Transfusion Hospital'
          : item.hospitalName;
        const isHyderabad = cleanedHospital?.includes('Hyderabad') || item.city?.toLowerCase() === 'chicago';
        return {
          ...item,
          id: requestId,
          hospitalName: cleanedHospital,
          city: isHyderabad ? 'Hyderabad' : item.city,
          state: isHyderabad ? 'Telangana' : item.state,
          deadlineDate: item.deadlineDate ? item.deadlineDate.replace(/\bCST\b/g, 'IST').replace(/\bEST\b/g, 'IST').replace(/\bPST\b/g, 'IST') : item.deadlineDate
        };
      });

      // Deduplicate Firestore requests strictly by unique request ID
      const uniqueFirestore = new Map<string, DonationRequest>();
      allItems.forEach(item => {
        if (item.id && !uniqueFirestore.has(item.id)) {
          uniqueFirestore.set(item.id, item);
        }
      });
      const uniqueItems = Array.from(uniqueFirestore.values());

      setFirestoreRequests(uniqueItems);
      setRequests(uniqueItems);
      const realCount = uniqueItems.filter(d => (d as any)._isDemoData === false).length;
      setFirestoreRequestsCount(realCount);
    }, (error) => {
      console.warn('[Firestore] donation_requests snapshot error:', error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore donor_responses listener (Phase 5)
  const [donorResponses, setDonorResponses] = useState<DonorResponse[]>(() => {
    const saved = localStorage.getItem('dofi_donor_responses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dofi_donor_responses', JSON.stringify(donorResponses));
  }, [donorResponses]);

  useEffect(() => {
    // If not signed in to Firebase, rely on local state & localStorage for demo operation
    if (!firebaseUser) return;

    // Determine authorization scope:
    // 1. Admin: Platform-wide visibility
    // 2. Hospital: Responses belonging to blood requests for this hospital facility
    // 3. Donor: Responses created by this authenticated donor only
    const isAdmin = firebaseUser.email === 'mohammedayaan9683@gmail.com' || registeredAppUser?.role === 'admin';
    const isHospitalStaff = registeredAppUser?.role === 'hospital_staff' || currentUser.role === 'hospital';

    let q;
    if (isAdmin) {
      q = query(collection(db, 'donor_responses'), orderBy('createdAt', 'desc'));
    } else if (isHospitalStaff) {
      const orgId = registeredAppUser?.organizationId;
      if (orgId) {
        q = query(collection(db, 'donor_responses'), where('hospitalId', '==', orgId));
      } else {
        q = query(collection(db, 'donor_responses'), where('requesterId', '==', firebaseUser.uid));
      }
    } else {
      q = query(collection(db, 'donor_responses'), where('donorUserId', '==', firebaseUser.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => d.data() as DonorResponse);
      setDonorResponses(prev => {
        // Merge Firestore records while preserving local responses created during session
        const firestoreMap = new Map(list.map(item => [item.id, item]));
        const merged = [...list];
        for (const localItem of prev) {
          if (!firestoreMap.has(localItem.id)) {
            merged.push(localItem);
          }
        }
        return merged;
      });
    }, (error) => {
      console.warn('[Firestore] donor_responses scoped snapshot error:', error);
    });
    return () => unsubscribe();
  }, [firebaseUser, registeredAppUser?.role, registeredAppUser?.organizationId, currentUser.role, currentUser.organizationId]);

  const loginWithGoogle = async (intendedRole?: UserRole) => {
    setIsFirebaseLoading(true);
    console.log('[AppContext] Initiating Google Sign-In with intendedRole:', intendedRole);
    if (intendedRole) {
      localStorage.setItem('dofi_user_role', intendedRole);
      sessionStorage.setItem('dofi_role_chosen', '1');
      switchUserRole(intendedRole);
      if (intendedRole === 'hospital') {
        setActiveTab('hospital');
      } else if (intendedRole === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    }
    try {
      const fbUser = await signInWithGoogle();
      console.log('[AppContext] Google Sign-In popup completed for user:', fbUser.uid, fbUser.email);
      // The onAuthStateChanged listener handles setting firebaseUser and syncing Firestore
      const notif: NotificationItem = {
        id: `notif_login_${Date.now()}`,
        userId: fbUser.uid,
        title: 'Google Sign-In Successful',
        message: `Welcome, ${fbUser.displayName || 'Community Member'}! Your account is securely connected to Firebase Auth.`,
        category: 'blood',
        urgency: 'standard',
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [
        notif,
        ...prev.filter(n => !n.id.startsWith('notif_login_') || n.userId === fbUser.uid)
      ]);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      console.error('[AppContext] ❌ Google Sign-In failed:', errorObj?.code, errorObj?.message || err);
      // Add a helpful notification if the popup was closed vs an actual error
      if (errorObj?.code !== 'auth/popup-closed-by-user') {
        const notif: NotificationItem = {
          id: `notif_err_${Date.now()}`,
          userId: 'system',
          title: 'Sign-In Notice',
          message: errorObj?.code === 'auth/operation-not-allowed'
            ? 'Google Sign-In is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.'
            : errorObj?.code === 'auth/unauthorized-domain'
            ? 'This domain is not authorized for Google Sign-In. Add localhost to Authorized Domains in Firebase Console.'
            : `Authentication could not be completed: ${errorObj?.message || 'Unknown error'}`,
          category: 'blood',
          urgency: 'emergency',
          timestamp: 'Just now',
          isRead: false
        };
        setNotifications(prev => [notif, ...prev]);
      }
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const logoutFirebase = async () => {
    try {
      sessionStorage.removeItem('dofi_role_chosen');
      localStorage.removeItem('dofi_user_role');
      await signOutFirebaseUser();
      setFirebaseUser(null);
      setRegisteredAppUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const registerDonationToFirebase = async (data: Partial<FirebaseDonationRegistration>) => {
    const regRecord: Omit<FirebaseDonationRegistration, 'createdAt'> & { createdAt?: string } = {
      id: data.id || `reg_${Date.now()}`,
      registeredByUserId: firebaseUser ? firebaseUser.uid : currentUser.id,
      registeredByUserEmail: firebaseUser ? (firebaseUser.email || currentUser.email) : currentUser.email,
      registeredByUserName: firebaseUser ? (firebaseUser.displayName || currentUser.name) : currentUser.name,
      donorName: data.donorName || currentUser.name,
      phone: data.phone || currentUser.phone,
      email: data.email || currentUser.email,
      city: data.city || currentUser.city || 'Hyderabad',
      state: data.state || currentUser.state || 'Telangana',
      categories: data.categories || ['blood'],
      bloodGroup: data.bloodGroup || (data.categories?.includes('blood') ? 'O-' : undefined),
      availabilityStatus: data.availabilityStatus || 'available_now',
      verificationBadge: data.verificationBadge || 'Verified Platform Registrant',
      status: data.status || 'active',
      medicalNotes: data.medicalNotes || 'Donation registration submitted via verified clinical platform.',
      scheduledDate: data.scheduledDate
    };

    return await saveDonationRegistrationToFirestore(regRecord);
  };

  // AI Suite specific state
  const [aiPreselectedRequest, setAiPreselectedRequest] = useState<DonationRequest | null>(null);
  const [aiPreselectedDonor, setAiPreselectedDonor] = useState<DonorProfile | null>(null);
  const [aiActiveModule, setAiActiveModule] = useState<'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude'>('biomatch_ml');

  const openAiWithRequest = (req: DonationRequest) => {
    setAiPreselectedRequest(req);
    setAiActiveModule('biomatch_ml');
    setSelectedRequest(null);
    setActiveTab('ai-suite');
  };

  const openAiWithDonor = (donor: DonorProfile) => {
    setAiPreselectedDonor(donor);
    setAiActiveModule('biomatch_ml');
    setSelectedDonor(null);
    setActiveTab('ai-suite');
  };

  const openAiModule = (module: 'crossmatch' | 'biomatch_ml' | 'vision_lab' | 'oncology_trials' | 'screener' | 'dispatch' | 'lab' | 'gratitude') => {
    setAiActiveModule(module);
    setActiveTab('ai-suite');
  };

  // Cancer Hospital state & portal navigation
  const [selectedCancerHospital, setSelectedCancerHospital] = useState<CancerHospital | null>(() => {
    return WORLD_CANCER_HOSPITALS[0]; // Default to MD Anderson Cancer Center
  });
  const [cancerHospitalSearchQuery, setCancerHospitalSearchQuery] = useState<string>('MD Anderson');

  const openHospitalPortalForCancerHospital = (hospital: CancerHospital) => {
    setSelectedCancerHospital(hospital);
    setCancerHospitalSearchQuery(hospital.shortName || hospital.name);
    setActiveTab('hospital');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('dc4c_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dc4c_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('dc4c_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem('dc4c_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dc4c_verifications', JSON.stringify(verificationQueue));
  }, [verificationQueue]);

  useEffect(() => {
    localStorage.setItem('dc4c_reports', JSON.stringify(reports));
  }, [reports]);

  const switchUserRole = (role: UserRole) => {
    // A role chosen in the browser is only an entry preference. It must never
    // elevate an unauthorized user to administrator privileges.
    const isAuthorizedAdmin = Boolean(
      (firebaseUser && firebaseUser.email === 'mohammedayaan9683@gmail.com') ||
      registeredAppUser?.role === 'admin'
    );
    if (role === 'admin' && !isAuthorizedAdmin) {
      console.warn('[AppContext] Ignored unauthorised client-side admin role selection.');
      return;
    }

    sessionStorage.setItem('dofi_role_chosen', '1');
    localStorage.setItem('dofi_user_role', role);

    // Generic display names for demo roles
    const demoNames: Record<UserRole, string> = {
      hospital: 'Hospital / Clinical Coordinator',
      user: 'General User',
      admin: 'Platform Administrator',
      donor: 'Voluntary Blood Donor'
    };
    const targetUser = DEMO_USERS[role] || currentUser;
    // Preserve real Firebase user's ID, name, email, and photo
    setCurrentUser({
      ...targetUser,
      id: firebaseUser ? firebaseUser.uid : targetUser.id,
      role,
      name: firebaseUser?.displayName || demoNames[role],
      email: firebaseUser?.email || targetUser.email,
      avatarUrl: firebaseUser?.photoURL || targetUser.avatarUrl,
      organizationId: registeredAppUser?.organizationId || (firebaseUser ? undefined : targetUser.organizationId)
    });
  };

  const computeMatchScore = (request: DonationRequest, donor: DonorProfile): number => {
    if (!donor.categories.includes(request.category)) return 0;
    
    let score = 50; // base score if category matches
    
    // Specific match criteria
    if (request.category === 'blood' && request.bloodRequirements && donor.bloodDetails) {
      const compatibleList = BLOOD_COMPATIBILITY_MAP[request.bloodRequirements.targetBloodGroup] || [];
      if (compatibleList.includes(donor.bloodDetails.bloodGroup)) {
        score += 35;
      } else {
        return 0; // Incompatible blood type!
      }
      if (donor.bloodDetails.components.includes(request.bloodRequirements.component)) {
        score += 15;
      }
    } else if (request.category === 'organ' && request.organRequirements && donor.organDetails) {
      if (donor.organDetails.organsPledged.includes(request.organRequirements.organ)) {
        score += 40;
      } else {
        return 0;
      }
    } else if (request.category === 'bone_tissue' && request.boneTissueRequirements && donor.boneTissueDetails) {
      if (donor.boneTissueDetails.tissueTypes.includes(request.boneTissueRequirements.tissueType)) {
        score += 30;
      }
      if (donor.boneTissueDetails.hlaTypingAvailable) {
        score += 20;
      }
    } else if (request.category === 'hair' && request.hairRequirements && donor.hairDetails) {
      if (donor.hairDetails.lengthInches >= request.hairRequirements.minInches) {
        score += 30;
      } else {
        score -= 20;
      }
      if (request.hairRequirements.conditionAccepted.includes(donor.hairDetails.condition)) {
        score += 20;
      }
    }

    // Availability bonus
    if (donor.availabilityStatus === 'available_now') score += 10;
    else if (donor.availabilityStatus === 'available_24h') score += 5;
    else if (donor.availabilityStatus === 'cooldown') score -= 25;

    // Integrated Donation Scheduler matching bonus
    if (donor.scheduledSlots && donor.scheduledSlots.length > 0) {
      const matchingSlot = donor.scheduledSlots.find(
        s => s.procedureType === request.category && s.status === 'available'
      );
      if (matchingSlot) {
        score += 15; // Directly confirmed future scheduled slot for this clinical category
      } else {
        score += 5; // Has general scheduled availability
      }
    }

    // Distance factor (closer is better)
    if (donor.distanceKm <= 5) score += 10;
    else if (donor.distanceKm <= 15) score += 5;

    // Verification bonus
    if (donor.isVerified) score += 5;

    return Math.min(Math.max(score, 0), 100);
  };

  const createRequest = (newReq: Partial<DonationRequest>) => {
    const id = newReq.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullRequest: DonationRequest = {
      id,
      category: newReq.category || 'blood',
      title: newReq.title || 'New Donation Requisition',
      patientAlias: newReq.patientAlias || 'Patient Confidential',
      patientAge: newReq.patientAge || 30,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      hospitalId: newReq.hospitalId || 'org_city_blood_bank',
      hospitalName: newReq.hospitalName || 'City Blood Center & General Hospital',
      city: newReq.city || currentUser.city || 'Hyderabad',
      state: newReq.state || currentUser.state || 'Telangana',
      urgency: newReq.urgency || 'standard',
      status: 'pending',
      deadlineHoursRemaining: newReq.deadlineHoursRemaining || (newReq.urgency === 'emergency' ? 6 : 48),
      deadlineDate: newReq.deadlineDate || 'Within 48 Hours',
      createdAt: new Date().toISOString(),
      unitsNeeded: newReq.unitsNeeded || 1,
      unitsFulfilled: 0,
      matchedDonorIds: [],
      medicalNotes: newReq.medicalNotes || '',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          title: 'Requisition Submitted',
          description: `Clinical requisition submitted by ${currentUser.name} (${currentUser.role}).`,
          actorName: currentUser.name,
          actorRole: currentUser.role
        }
      ],
      bloodRequirements: newReq.bloodRequirements,
      organRequirements: newReq.organRequirements,
      boneTissueRequirements: newReq.boneTissueRequirements,
      hairRequirements: newReq.hairRequirements
    };

    // Auto find initial matching donors
    const matchedDonors = donors.filter(d => computeMatchScore(fullRequest, d) >= 70);
    fullRequest.matchedDonorIds = matchedDonors.map(d => d.id);

    setRequests(prev => [fullRequest, ...prev.filter(r => r.id !== id)]);

    // Persist new request to Firestore donation_requests collection
    setDoc(doc(db, 'donation_requests', id), {
      ...fullRequest,
      _isDemoData: false,
      _createdVia: 'dofi_app'
    }).catch(err => console.warn('[Firestore] donation_requests write failed:', err));

    // Send notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `${fullRequest.urgency.toUpperCase()}: Requisition Created`,
      message: `Your request "${fullRequest.title}" was submitted and is queued for clinical verification.`,
      category: fullRequest.category,
      urgency: fullRequest.urgency,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Add to verification queue
    const queueItem: VerificationItem = {
      id: `verif_${Date.now()}`,
      type: 'medical_requisition',
      entityId: id,
      entityName: fullRequest.title,
      submittedAt: new Date().toISOString(),
      documentType: 'Clinical Requisition & Institutional Intake Form',
      documentRef: `FORM-REQ-${id.toUpperCase()}.PDF`,
      status: 'pending',
      notes: `Submitted by ${currentUser.name}. Requires hospital coordinator approval.`
    };
    setVerificationQueue(prev => [queueItem, ...prev]);
  };

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus, note?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      const eventTitles: Record<RequestStatus, string> = {
        pending: 'Requisition Pending Review',
        verified: 'Hospital Board Clearance Verified',
        matched: 'Donors Matched & Alerted',
        in_progress: 'Procedure / Screening Scheduled',
        completed: 'Donation Completed & Logged',
        cancelled: 'Requisition Cancelled'
      };

      const newTimelineEvent = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        title: eventTitles[newStatus],
        description: note || `Status progressed to ${newStatus} by ${currentUser.name}.`,
        actorName: currentUser.name,
        actorRole: currentUser.role
      };

      const updated = {
        ...req,
        status: newStatus,
        unitsFulfilled: newStatus === 'completed' ? req.unitsNeeded : req.unitsFulfilled,
        timeline: [...req.timeline, newTimelineEvent]
      };

      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updated);
      }
      return updated;
    }));

    const firestoreUpdate: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'completed') {
      firestoreUpdate.unitsFulfilled = requests.find(request => request.id === requestId)?.unitsNeeded || 1;
    }
    updateDoc(doc(db, 'donation_requests', requestId), firestoreUpdate)
      .catch(err => console.warn('[Firestore] donation request status update failed:', err));

    // Notification
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq) {
      const statusNotif: NotificationItem = {
        id: `notif_st_${Date.now()}`,
        userId: currentUser.id,
        title: `Status Updated: ${targetReq.patientAlias}`,
        message: `Request status transitioned to "${newStatus.replace('_', ' ').toUpperCase()}".`,
        category: targetReq.category,
        urgency: targetReq.urgency,
        timestamp: 'Just now',
        isRead: false
      };
      setNotifications(prev => [statusNotif, ...prev]);
    }
  };

  const respondToRequest = async (requestId: string, notes?: string): Promise<{ success: boolean; message: string }> => {
    const targetReq = requests.find(r => r.id === requestId)
      || (firestoreRequests as DonationRequest[]).find(r => r.id === requestId);
    if (!targetReq) {
      return { success: false, message: 'Request not found.' };
    }
    if (targetReq.status === 'completed' || targetReq.status === 'cancelled') {
      return { success: false, message: 'This request is already fulfilled or cancelled.' };
    }

    const donorUserId = firebaseUser ? firebaseUser.uid : currentUser.id;
    const donorDisplayName = firebaseUser ? (firebaseUser.displayName || currentUser.name) : currentUser.name;

    // Prevent duplicate response from the same donor
    const alreadyResponded = donorResponses.some(
      r => r.requestId === requestId && (
        r.donorUserId === donorUserId ||
        (donorUserId.startsWith('usr_') && r.donorName.toLowerCase() === donorDisplayName.toLowerCase())
      )
    );
    if (alreadyResponded) {
      return { success: false, message: 'You have already responded to this blood request.' };
    }

    // Determine donor blood group
    const myDonorProfile = donors.find(d => d.userId === currentUser.id || (firebaseUser && d.userId === firebaseUser.uid))
      || (currentUser.role === 'donor' ? donors.find(d => d.id === 'dnr_001') : undefined);
    const latestReg = firebaseDonationsList.find(d => d.registeredByUserId === (firebaseUser?.uid || currentUser.id));
    const donorBloodGroup: BloodGroup = myDonorProfile?.bloodDetails?.bloodGroup || (latestReg?.bloodGroup as BloodGroup) || 'O+';

    const safeUid = donorUserId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const responseId = `resp_${requestId}_${safeUid}`;
    const nowIso = new Date().toISOString();

    const newResponse: DonorResponse = {
      id: responseId,
      requestId,
      donorId: myDonorProfile?.id || `dnr_${safeUid.slice(0, 8)}`,
      donorUserId,
      donorName: donorDisplayName,
      bloodGroup: donorBloodGroup,
      city: currentUser.city || 'Hyderabad',
      status: 'available',
      createdAt: nowIso,
      updatedAt: nowIso,
      note: notes,
      hospitalId: targetReq.hospitalId,
      requesterId: targetReq.requesterId
    };

    // 1. Update local state
    setDonorResponses(prev => [newResponse, ...prev.filter(r => r.id !== responseId)]);

    // 2. Persist to Firestore
    setDoc(doc(db, 'donor_responses', responseId), newResponse)
      .catch(err => console.warn('[Firestore] donor_responses write failed:', err));

    // 3. Update request status to 'in_progress' (DONOR RESPONDED) if pending/verified/matched
    if (['pending', 'verified', 'matched'].includes(targetReq.status)) {
      updateRequestStatus(
        requestId,
        'in_progress',
        `Donor ${donorDisplayName} (${donorBloodGroup}) responded: "I'm Available". Hospital coordination pending.`
      );
    }

    // 4. Send notification
    const responseNotif: NotificationItem = {
      id: `notif_resp_${Date.now()}`,
      userId: currentUser.id,
      title: `Response Sent: ${targetReq.hospitalName}`,
      message: `You marked yourself available for ${targetReq.bloodRequirements?.targetBloodGroup || 'blood'} request at ${targetReq.hospitalName}. Hospital has been alerted.`,
      category: 'blood',
      urgency: targetReq.urgency,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [responseNotif, ...prev]);

    return { success: true, message: 'Response sent! Hospital notified.' };
  };

  const updateDonorResponseStatus = async (responseId: string, newStatus: DonorResponse['status']): Promise<void> => {
    const nowIso = new Date().toISOString();
    setDonorResponses(prev => prev.map(r => r.id === responseId ? { ...r, status: newStatus, updatedAt: nowIso } : r));
    updateDoc(doc(db, 'donor_responses', responseId), { status: newStatus, updatedAt: nowIso })
      .catch(err => console.warn('[Firestore] updateDonorResponseStatus failed:', err));
  };

  const registerDonor = (donorData: Partial<DonorProfile>) => {
    const existingIndex = donors.findIndex(d => d.userId === currentUser.id);
    if (existingIndex >= 0) {
      // Update existing
      setDonors(prev => {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          ...donorData,
          isVerified: false,
          verificationBadge: 'Profile submitted — verification pending'
        };
        return next;
      });
    } else {
      // Create new
      const newDonor: DonorProfile = {
        id: `dnr_${Date.now()}`,
        userId: currentUser.id,
        donorName: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        city: currentUser.city || 'Hyderabad',
        state: currentUser.state || 'Telangana',
        distanceKm: 2.5,
        categories: donorData.categories || ['blood'],
        isVerified: false,
        verificationBadge: 'Profile submitted — verification pending',
        availabilityStatus: donorData.availabilityStatus || 'available_now',
        totalDonationsCount: 1,
        phone: currentUser.phone,
        email: currentUser.email,
        privacySetting: donorData.privacySetting || 'hospital_mediated',
        bloodDetails: donorData.bloodDetails,
        organDetails: donorData.organDetails,
        boneTissueDetails: donorData.boneTissueDetails,
        hairDetails: donorData.hairDetails
      };
      setDonors(prev => [newDonor, ...prev]);
    }

    // Persist donation registration to Firestore
    registerDonationToFirebase({
      donorName: currentUser.name,
      categories: donorData.categories || ['blood'],
      bloodGroup: donorData.bloodDetails?.bloodGroup,
      availabilityStatus: donorData.availabilityStatus || 'available_now',
      city: currentUser.city || 'Hyderabad',
      state: currentUser.state || 'Telangana',
      phone: currentUser.phone,
      email: currentUser.email,
      status: 'active'
    }).catch(err => console.warn('Firestore register error:', err));

    const notif: NotificationItem = {
      id: `notif_reg_${Date.now()}`,
      userId: currentUser.id,
      title: 'Donor Profile Submitted',
      message: 'Your blood donor profile and availability have been recorded. Verification is pending confirmation.',
      category: donorData.categories?.[0] || 'blood',
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => {
      const filtered = prev.filter(
        item => !(item.userId === notif.userId && item.title === notif.title && item.message === notif.message)
      );
      return [notif, ...filtered];
    });
  };

  const approveVerification = (id: string, notes?: string) => {
    setVerificationQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'approved',
          reviewedBy: currentUser.name,
          notes: notes || 'Reviewed and approved according to clinical safety protocols.'
        };
      }
      return item;
    }));

    // If it's a request, advance request to verified
    const item = verificationQueue.find(i => i.id === id);
    if (item && item.type === 'medical_requisition') {
      updateRequestStatus(item.entityId, 'verified', 'Clinical requisition verified by platform compliance.');
    }
  };

  const rejectVerification = (id: string, notes?: string) => {
    setVerificationQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'rejected',
          reviewedBy: currentUser.name,
          notes: notes || 'Documentation insufficient or non-compliant.'
        };
      }
      return item;
    }));
  };

  const submitModerationReport = (report: { reportedItemId: string; itemType: 'donor' | 'request' | 'user'; reason: ModerationReport['reason']; details: string }) => {
    const newReport: ModerationReport = {
      id: `rep_${Date.now()}`,
      reportedItemId: report.reportedItemId,
      itemType: report.itemType,
      reporterName: currentUser.name,
      reason: report.reason,
      details: report.details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);

    const notif: NotificationItem = {
      id: `notif_rep_${Date.now()}`,
      userId: currentUser.id,
      title: 'Safety Report Logged',
      message: 'Thank you for protecting our community. The compliance committee has received the flagged record for prompt review.',
      category: 'blood',
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const resolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const dismissReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addDonorScheduledSlot = (donorId: string, slotData: Omit<ScheduledSlot, 'id'>) => {
    const newSlot: ScheduledSlot = {
      ...slotData,
      id: `slot_${Date.now()}`
    };

    setDonors(prev => prev.map(d => {
      if (d.id !== donorId) return d;
      const updatedSlots = [...(d.scheduledSlots || []), newSlot];
      const updatedDonor = {
        ...d,
        scheduledSlots: updatedSlots
      };
      if (selectedDonor && selectedDonor.id === donorId) {
        setSelectedDonor(updatedDonor);
      }
      return updatedDonor;
    }));

    // Notification
    const notif: NotificationItem = {
      id: `notif_slot_${Date.now()}`,
      userId: currentUser.id,
      title: 'Donation Procedure Slot Scheduled',
      message: `New availability slot scheduled for ${slotData.date} (${slotData.startTime}-${slotData.endTime}) for ${slotData.procedureType.replace('_', ' ')} donation.`,
      category: slotData.procedureType,
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const removeDonorScheduledSlot = (donorId: string, slotId: string) => {
    setDonors(prev => prev.map(d => {
      if (d.id !== donorId) return d;
      const updatedSlots = (d.scheduledSlots || []).filter(s => s.id !== slotId);
      const updatedDonor = {
        ...d,
        scheduledSlots: updatedSlots
      };
      if (selectedDonor && selectedDonor.id === donorId) {
        setSelectedDonor(updatedDonor);
      }
      return updatedDonor;
    }));
  };

  const registerForBloodDrive = (driveId: string): boolean => {
    const drive = bloodDrives.find(d => d.id === driveId);
    if (!drive || drive.availableSlots <= 0) return false;

    setBloodDrives(prev => prev.map(d => {
      if (d.id === driveId) {
        return { ...d, availableSlots: Math.max(0, d.availableSlots - 1) };
      }
      return d;
    }));

    const newNotif: NotificationItem = {
      id: `notif_drv_${Date.now()}`,
      userId: currentUser.id,
      title: 'Blood Drive Slot Confirmed',
      message: `You are booked for ${drive.name} at ${drive.locationName} (${drive.hours}). Walk-ins also cleared.`,
      category: 'blood',
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    return true;
  };

  const likePatientStory = (storyId: string) => {
    setPatientStories(prev => {
      const updated = prev.map(s => {
        if (s.id === storyId) {
          return { ...s, heartsCount: s.heartsCount + 1 };
        }
        return s;
      });
      localStorage.setItem('dc4c_patient_stories', JSON.stringify(updated));
      return updated;
    });
  };

  const submitPatientStory = (storyData: Omit<PatientStory, 'id' | 'heartsCount' | 'isVerified'>) => {
    const newStory: PatientStory = {
      ...storyData,
      id: `story_${Date.now()}`,
      heartsCount: 1,
      isVerified: true
    };
    setPatientStories(prev => {
      const updated = [newStory, ...prev];
      localStorage.setItem('dc4c_patient_stories', JSON.stringify(updated));
      return updated;
    });

    const notif: NotificationItem = {
      id: `notif_story_${Date.now()}`,
      userId: currentUser.id,
      title: 'Success Story Submitted & Published',
      message: `Thank you, ${storyData.recipientName}! Your recipient journey is now featured to inspire the DonorConnect 4Care community.`,
      category: storyData.category,
      urgency: 'standard',
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // --- LIVE FIRESTORE-BACKED STATS ---
  // Only count real (non-demo) documents. If Firestore is empty, counts show 0.
  const liveActiveRequests = firestoreRequests.filter(
    r => r._isDemoData !== true && r.status !== 'completed' && r.status !== 'cancelled'
  ).length;
  const liveCriticalEmergencies = firestoreRequests.filter(
    r => r._isDemoData !== true && r.urgency === 'emergency' && r.status !== 'completed'
  ).length;
  const liveBloodRequests = firestoreRequests.filter(
    r => r._isDemoData !== true && r.category === 'blood' && r.status !== 'completed' && r.status !== 'cancelled'
  ).length;
  const liveOrganRequests = firestoreRequests.filter(
    r => r._isDemoData !== true && r.category === 'organ' && r.status !== 'completed' && r.status !== 'cancelled'
  ).length;
  // Available donors: real Firestore donation_registrations with available status
  const liveAvailableDonors = firebaseDonationsList.filter(
    d => d.availabilityStatus === 'available_now' || d.availabilityStatus === 'available_24h'
  ).length;
  // Registered donors: all real Firestore donation_registrations
  const liveRegisteredDonors = firebaseDonationsList.length;
  // Registered users from Firestore users collection
  const liveRegisteredUsers = registeredAppUsersList.length;

  const impactStats: ImpactStats = {
    activeRequests: liveActiveRequests,
    availableDonors: liveAvailableDonors,
    criticalEmergencies: liveCriticalEmergencies,
    verifiedHospitals: organizations.filter(o => o.isVerified).length,
    // Below are demo/placeholder lifetime stats — not derived from live Firestore data
    livesTouchedCount: 0,
    bloodUnitsCollected: 0,
    hairWigsGifted: 0,
    organTransplantsFacilitated: 0,
    marrowPledgesRegistered: 0
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUserRole,
        requests,
        donors,
        organizations,
        bloodDrives,
        notifications,
        verificationQueue,
        reports,
        impactStats,
        activeTab,
        setActiveTab,
        activeFilterCategory,
        setActiveFilterCategory,
        selectedRequest,
        setSelectedRequest,
        selectedDonor,
        setSelectedDonor,
        isCreateRequestModalOpen,
        setIsCreateRequestModalOpen,
        isRegisterDonorModalOpen,
        setIsRegisterDonorModalOpen,
        isEthicsModalOpen,
        setIsEthicsModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        reportingTarget,
        setReportingTarget,
        createRequest,
        updateRequestStatus,
        registerDonor,
        approveVerification,
        rejectVerification,
        submitModerationReport,
        resolveReport,
        dismissReport,
        markNotificationRead,
        markAllNotificationsRead,
        computeMatchScore,
        addDonorScheduledSlot,
        removeDonorScheduledSlot,
        registerForBloodDrive,
        patientStories,
        likePatientStory,
        submitPatientStory,
        aiPreselectedRequest,
        setAiPreselectedRequest,
        aiPreselectedDonor,
        setAiPreselectedDonor,
        aiActiveModule,
        setAiActiveModule,
        openAiWithRequest,
        openAiWithDonor,
        openAiModule,
        selectedCancerHospital,
        setSelectedCancerHospital,
        cancerHospitalSearchQuery,
        setCancerHospitalSearchQuery,
        openHospitalPortalForCancerHospital,
        firebaseUser,
        registeredAppUser,
        registeredAppUsersList,
        firebaseDonationsList,
        isFirebaseLoading,
        isAuthReady,
        firestoreRequests,
        firestoreRequestsCount,
        liveActiveRequests,
        liveCriticalEmergencies,
        liveBloodRequests,
        liveOrganRequests,
        liveAvailableDonors,
        liveRegisteredDonors,
        liveRegisteredUsers,
        loginWithGoogle,
        logoutFirebase,
        registerDonationToFirebase,
        donorResponses,
        respondToRequest,
        updateDonorResponseStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
