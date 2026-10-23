/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Configurable demonstration reference criteria for preliminary blood donor screening.
 * 
 * DISCLAIMER: These values are provided as a demonstration reference based on typical
 * standard blood banking guidelines (e.g. general WHO / AABB / Red Cross references)
 * and are NOT universal regulatory rules. Specific eligibility thresholds vary by
 * jurisdiction, local blood bank, and individual on-site clinical evaluation.
 */
export const BLOOD_DONOR_DEMO_POLICY = {
  policyName: 'Standard Blood Banking Demonstration Reference (WHO / AABB Reference)',
  isDemoPolicy: true,
  criteria: {
    age: {
      min: 18,
      max: 65,
      unit: 'years',
      description: 'Typical adult voluntary donor age range (18–65 years). First-time donors >60 may require on-site blood-bank medical evaluation.'
    },
    weight: {
      minKg: 50,
      unit: 'kg',
      description: 'Standard minimum body weight of 50 kg (110 lbs) ensures safe whole-blood donation volume (350–450 mL).'
    },
    hemoglobin: {
      minFemale: 12.5,
      minMale: 13.0,
      generalMin: 12.5,
      unit: 'g/dL',
      description: 'Minimum hemoglobin of 12.5 g/dL (females) or 13.0 g/dL (males) protects against post-donation anemia.'
    },
    donationIntervalMonths: {
      wholeBloodMinMonths: 3,
      unit: 'months',
      description: 'Recommended minimum inter-donation interval of 3 months (84–90 days) for whole blood to replenish red-cell and iron reserves.'
    },
    medications: {
      aspirinPlateletDeferralHours: 48,
      description: 'Recent aspirin / NSAID intake temporarily affects platelet function (48-hour deferral for platelet apheresis; whole blood typically acceptable).'
    },
    infections: {
      acuteIllnessDeferralDays: 14,
      description: 'Donors must be symptom-free from acute fever, cough, respiratory illness, or systemic infection for at least 14 days.'
    }
  },
  disclaimer: 'Demonstration reference criteria only. Regulatory thresholds differ by country and blood bank. Final donor qualification is determined on-site by certified healthcare professionals.'
};
