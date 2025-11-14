
import { EligibilityRequest, EligibilityResponse, PreAuthRequest, PreAuthResponse } from '../types';

// Mock API service to simulate backend agent interactions

/**
 * Simulates checking patient eligibility against their insurance plan.
 * @param request The eligibility check request payload.
 * @returns A promise that resolves with a detailed eligibility response.
 */
export const checkEligibility = (request: EligibilityRequest): Promise<EligibilityResponse> => {
  console.log('Checking eligibility for:', request);

  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate different outcomes for demonstration purposes
      const isEligible = Math.random() > 0.1; // 90% chance to be eligible
      const preAuthRequired = isEligible && Math.random() > 0.3; // 70% chance to need PA if eligible

      const response: EligibilityResponse = {
        eligible: isEligible,
        preAuthRequired: preAuthRequired,
        planBenefits: isEligible ? {
          copay: 40,
          deductible: 1000,
          deductibleRemaining: 350,
          coinsurance: "20%",
          coveragePercent: 80,
        } : null,
        evidence: isEligible ? [
          `CPT ${request.clinical.procedureCode} is a covered benefit under ${request.patient.insurancePlan}.`,
          "Prior Authorization is required for surgical orthopedic procedures.",
          `Diagnosis ${request.clinical.diagnosisCode} meets medical necessity criteria.`,
        ] : [
          `Procedure ${request.clinical.procedureCode} is not covered under the patient's current plan.`,
          "Patient plan does not include elective surgical benefits."
        ],
        metadata: {
          requestId: `ELIG-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp: new Date().toISOString(),
        },
      };
      resolve(response);
    }, 1500);
  });
};

/**
 * Simulates submitting documents for pre-authorization.
 * @param request The pre-authorization submission payload.
 * @returns A promise that resolves with a pre-auth submission confirmation.
 */
export const submitPreAuth = (request: PreAuthRequest): Promise<PreAuthResponse> => {
    console.log('Submitting Pre-Auth:', request);

    return new Promise(resolve => {
        setTimeout(() => {
            const response: PreAuthResponse = {
                preAuthId: `PA-${Math.floor(100000 + Math.random() * 900000)}`,
                status: "Submitted",
                paRequired: true,
                aiAssessment: {
                    medicalNecessityMet: true,
                    evidence: [
                        "Provided imaging confirms severe osteoarthritis.",
                        "Surgical intervention aligns with plan guidelines.",
                        "All supporting documents provided."
                    ],
                },
                turnaroundTime: "72 hours",
                metadata: {
                    timestamp: new Date().toISOString(),
                }
            };
            resolve(response);
        }, 2000);
    });
};
