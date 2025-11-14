
export enum EligibilityStatus {
  Eligible = 'Eligible',
  PartiallyEligible = 'Partially Eligible',
  NotEligible = 'Not Eligible',
  Pending = 'Pending',
}

export enum PAStatus {
  Approved = 'Approved',
  Denied = 'Denied',
  Submitted = 'Submitted',
  Required = 'Required',
  NotRequired = 'Not Required',
  Pending = 'Pending',
}

export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';


// --- API Contract Types ---

// 1. Eligibility Check
export interface EligibilityRequest {
  patient: {
    firstName: string;
    lastName: string;
    dob: string;
    memberId: string;
    insurancePlan: string;
  };
  clinical: {
    diagnosisCode: string;
    procedureCode: string;
    procedureName: string;
    procedureDate: string;
  };
  provider: {
    npi: string;
    facilityName: string;
  };
}

export interface EligibilityResponse {
  eligible: boolean;
  preAuthRequired: boolean;
  planBenefits: {
    copay: number;
    deductible: number;
    deductibleRemaining: number;
    coinsurance: string;
    coveragePercent: number;
  } | null;
  evidence: string[];
  metadata: {
    requestId: string;
    timestamp: string;
  };
}

// 2. Pre-Authorization Submission
export interface PreAuthRequest {
  eligibilityRequestId: string;
  patient: {
    memberId: string;
    firstName: string;
    lastName: string;
  };
  clinical: {
    diagnosisCode: string;
    procedureCode: string;
    procedureName: string;
  };
  documents: {
    fileName: string;
    fileType: string;
    base64: string;
  }[];
  provider: {
    npi: string;
    physicianName: string;
  };
}

export interface PreAuthResponse {
  preAuthId: string;
  status: "Submitted" | "Approved" | "Denied" | "Pending";
  paRequired: boolean;
  aiAssessment: {
    medicalNecessityMet: boolean;
    evidence: string[];
  };
  turnaroundTime: string;
  metadata: {
    timestamp: string;
  };
}

// --- Main Application Types ---

export interface Treatment {
  id: string; // Unique ID for each treatment instance
  clinical: {
    diagnosisCode: string;
    procedureCode: string;
    procedureName: string;
    procedureDate: string;
  };
  eligibilityResponse: EligibilityResponse | null;
  preAuthResponse: PreAuthResponse | null;
}

export interface Patient {
  id: number;
  name: string;
  memberId: string;
  dob: string;
  insurer?: string;

  // Detailed demographic/medical fields
  mobile?: string;
  email?: string;
  gender?: Gender;
  age?: number;
  bloodGroup?: BloodGroup;
  vitals?: string;
  medicalHistory?: string;
  diagnosis?: string;
  prescription?: string;
  labOrders?: string;

  // Patient's history of treatments and checks
  treatments: Treatment[];
}

export interface TimelineEvent {
  id: number;
  patientName: string;
  action: string;
  timestamp: string;
  icon: 'check' | 'submit' | 'approved' | 'rejected' | 'pending';
}
