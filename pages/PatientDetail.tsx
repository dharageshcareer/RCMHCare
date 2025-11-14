
import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Patient, Treatment, EligibilityResponse, PreAuthResponse, EligibilityRequest, PreAuthRequest, PAStatus, EligibilityStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { checkEligibility, submitPreAuth } from '../services/api';
import { fileToBase64 } from '../utils/file';

// --- Sub-components for Agentic UI ---

const InfoItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 font-semibold">{value || children || 'N/A'}</dd>
    </div>
);

const AgentLoader: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg border">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-gray-600">{message}</span>
    </div>
);

// --- Main Component ---

interface PatientDetailProps {
    patients: Patient[];
    onUpdatePatient: (patient: Patient) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patients, onUpdatePatient }) => {
  const { patientId } = useParams<{ patientId: string }>();
  const patient = useMemo(() => patients.find(p => p.id === parseInt(patientId || '0')), [patientId, patients]);

  const [isChecking, setIsChecking] = useState(false);
  const [clinicalData, setClinicalData] = useState({
      diagnosisCode: 'M17.11',
      procedureCode: '27447',
      procedureName: 'Total Knee Arthroplasty',
      procedureDate: new Date().toISOString().split('T')[0],
  });

  const handleClinicalDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setClinicalData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setIsChecking(true);

    const [firstName, ...lastNameParts] = patient.name.split(' ');
    const request: EligibilityRequest = {
        patient: { firstName, lastName: lastNameParts.join(' '), dob: patient.dob, memberId: patient.memberId, insurancePlan: patient.insurer || 'Unknown' },
        clinical: clinicalData,
        provider: { npi: "1234567890", facilityName: "Sunrise Hospital" }
    };
    
    const response = await checkEligibility(request);
    
    const newTreatment: Treatment = {
        id: `TREAT-${Date.now()}`,
        clinical: { ...clinicalData },
        eligibilityResponse: response,
        preAuthResponse: null,
    };

    onUpdatePatient({ ...patient, treatments: [...patient.treatments, newTreatment] });
    setIsChecking(false);
  };

  const handleSubmitPreAuth = async (treatmentId: string, file: File) => {
      if (!patient) return;
      
      const treatmentToUpdate = patient.treatments.find(t => t.id === treatmentId);
      if (!treatmentToUpdate || !treatmentToUpdate.eligibilityResponse) return;

      const base64 = await fileToBase64(file);
      const [firstName, ...lastNameParts] = patient.name.split(' ');

      const request: PreAuthRequest = {
        eligibilityRequestId: treatmentToUpdate.eligibilityResponse.metadata.requestId,
        patient: { memberId: patient.memberId, firstName, lastName: lastNameParts.join(' ') },
        clinical: { ...treatmentToUpdate.clinical },
        documents: [{ fileName: file.name, fileType: file.type, base64 }],
        provider: { npi: "1234567890", physicianName: "Dr. Smith" }
      };

      const response = await submitPreAuth(request);
      
      const updatedTreatments = patient.treatments.map(t => 
        t.id === treatmentId ? { ...t, preAuthResponse: response } : t
      );
      
      onUpdatePatient({ ...patient, treatments: updatedTreatments });
  };
  
  if (!patient) return <Navigate to="/patients" replace />;

  const eligibleTreatments = patient.treatments.filter(t => t.eligibilityResponse);
  const preAuthSubmissions = patient.treatments.filter(t => t.preAuthResponse);

  return (
    <div className="space-y-8">
        <PatientInfo patient={patient} />
        
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">New Eligibility Check</h3>
            <form onSubmit={handleCheckEligibility} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <InputField label="Diagnosis Code (ICD)" name="diagnosisCode" value={clinicalData.diagnosisCode} onChange={handleClinicalDataChange} />
                <InputField label="Procedure Code (CPT)" name="procedureCode" value={clinicalData.procedureCode} onChange={handleClinicalDataChange} />
                <InputField label="Procedure Name" name="procedureName" value={clinicalData.procedureName} onChange={handleClinicalDataChange} />
                <InputField label="Procedure Date" name="procedureDate" value={clinicalData.procedureDate} onChange={handleClinicalDataChange} type="date" />
                <button type="submit" disabled={isChecking} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 h-10">
                    {isChecking ? 'Checking...' : 'Run Check'}
                </button>
            </form>
        </div>

        {isChecking && <AgentLoader message="Agent is processing eligibility..." />}

        <TreatmentSection 
            title="Eligible & Verified Treatments"
            treatments={eligibleTreatments}
            render={(treatment) => <EligibilityResultCard treatment={treatment} onSubmitPreAuth={handleSubmitPreAuth} />}
            emptyMessage="No eligibility checks have been performed yet."
        />

        <TreatmentSection 
            title="Pre-Authorization Submissions"
            treatments={preAuthSubmissions}
            render={(treatment) => treatment.preAuthResponse && <PreAuthResultCard response={treatment.preAuthResponse} clinical={treatment.clinical} />}
            emptyMessage="No pre-authorizations have been submitted."
        />
    </div>
  );
};

// --- Child Components for PatientDetail ---

const PatientInfo: React.FC<{ patient: Patient }> = ({ patient }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Patient Overview</h3>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <InfoItem label="Name" value={patient.name} />
            <InfoItem label="Member ID" value={patient.memberId} />
            <InfoItem label="Insurer" value={patient.insurer} />
            <InfoItem label="DOB | Age" value={`${patient.dob} (${patient.age})`} />
            <InfoItem label="Gender" value={patient.gender} />
            <InfoItem label="Blood Group" value={patient.bloodGroup} />
            <InfoItem label="Contact" value={patient.mobile} />
            <InfoItem label="Email" value={patient.email} />
        </dl>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 pt-4 border-t">
             <InfoItem label="Vitals" value={patient.vitals} />
             <InfoItem label="Medical History" value={patient.medicalHistory} />
             <InfoItem label="Diagnosis" value={patient.diagnosis} />
             <InfoItem label="Prescription" value={patient.prescription} />
             <InfoItem label="Lab Orders" value={patient.labOrders} />
        </dl>
    </div>
);

const TreatmentSection: React.FC<{ title: string; treatments: Treatment[]; render: (t: Treatment) => React.ReactNode; emptyMessage: string; }> = ({ title, treatments, render, emptyMessage }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title} ({treatments.length})</h3>
        {treatments.length > 0 ? (
            <div className="space-y-4">
                {treatments.map(render)}
            </div>
        ) : (
            <div className="text-center py-10 px-4 bg-white rounded-lg shadow-md"><p className="text-gray-500">{emptyMessage}</p></div>
        )}
    </div>
);

const EligibilityResultCard: React.FC<{ treatment: Treatment; onSubmitPreAuth: (treatmentId: string, file: File) => Promise<void>; }> = ({ treatment, onSubmitPreAuth }) => {
    const response = treatment.eligibilityResponse;
    if (!response) return null;
    
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files ? e.target.files[0] : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setIsSubmitting(true);
        await onSubmitPreAuth(treatment.id, file);
        setIsSubmitting(false);
    };
    
    const statusText = response.eligible ? "Eligible" : "Not Eligible";
    const statusColor = response.eligible ? "text-green-600" : "text-red-600";
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden" key={treatment.id}>
            <div className="p-4 border-b">
                <h4 className="font-bold text-gray-800">{treatment.clinical.procedureName}</h4>
                <p className="text-sm text-gray-500">CPT: {treatment.clinical.procedureCode} | ICD: {treatment.clinical.diagnosisCode} | Date: {treatment.clinical.procedureDate}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold">Result: <span className={statusColor}>{statusText}</span></h5>
                        <StatusBadge status={response.preAuthRequired ? PAStatus.Required : PAStatus.NotRequired} />
                    </div>
                    {response.planBenefits && (
                         <div>
                            <h6 className="font-semibold text-gray-600 text-sm">Plan Benefits</h6>
                            <dl className="grid grid-cols-2 gap-2 mt-2 text-sm p-3 bg-gray-50 rounded-md border">
                                <InfoItem label="Copay" value={`$${response.planBenefits.copay}`} />
                                <InfoItem label="Deductible" value={`$${response.planBenefits.deductible}`} />
                                <InfoItem label="Deductible Remaining" value={`$${response.planBenefits.deductibleRemaining}`} />
                                <InfoItem label="Coverage" value={`${response.planBenefits.coveragePercent}%`} />
                            </dl>
                        </div>
                    )}
                    <div>
                        <h6 className="font-semibold text-gray-600 text-sm mb-2">Agent Rationale</h6>
                        <ul className="space-y-1.5 list-disc list-inside text-sm text-gray-600">
                            {response.evidence.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <p className="text-xs text-gray-400 text-right pt-2">Request ID: {response.metadata.requestId}</p>
                </div>
                <div className="p-4 bg-gray-50/50 border-t md:border-t-0 md:border-l">
                    {response.preAuthRequired && !treatment.preAuthResponse && (
                        <form onSubmit={handleSubmit} className="space-y-3">
                             <h4 className="text-md font-semibold text-gray-700">Pre-Authorization Required</h4>
                             <p className="text-sm text-gray-600">Attach supporting documents for agent review.</p>
                             <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
                             <button type="submit" disabled={isSubmitting || !file} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                                {isSubmitting ? 'Submitting...' : 'Submit Pre-Auth'}
                             </button>
                        </form>
                    )}
                    {response.preAuthRequired && treatment.preAuthResponse && (
                         <div className="flex items-center justify-center h-full text-center">
                            <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                                <h4 className="font-bold">Pre-Authorization Submitted</h4>
                                <p className="text-sm">See details in the section below.</p>
                            </div>
                        </div>
                    )}
                     {!response.preAuthRequired && (
                        <div className="flex items-center justify-center h-full text-center">
                            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg">
                                <h4 className="font-bold">No Pre-Auth Needed</h4>
                                <p className="text-sm">This treatment is approved as per plan benefits.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PreAuthResultCard: React.FC<{ response: PreAuthResponse; clinical: Treatment['clinical'] }> = ({ response, clinical }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" key={response.preAuthId}>
        <div className="p-4 border-b">
            <h4 className="font-bold text-gray-800">{clinical.procedureName}</h4>
            <p className="text-sm text-gray-500">CPT: {clinical.procedureCode} | Submitted: {new Date(response.metadata.timestamp).toLocaleDateString()}</p>
        </div>
        <div className="p-4 space-y-3">
             <div className="flex justify-between items-center">
                <h5 className="font-semibold">Status: <span className="text-yellow-600">{response.status}</span></h5>
                <span className="text-sm font-medium text-gray-600">PA ID: {response.preAuthId}</span>
            </div>
            <div>
                <h6 className="font-semibold text-gray-600 text-sm mb-2">AI Assessment</h6>
                <div className="p-3 bg-gray-50 rounded-md border space-y-2">
                    <p className="text-sm">Medical Necessity Met: <span className="font-semibold">{response.aiAssessment.medicalNecessityMet ? 'Yes' : 'No'}</span></p>
                    <ul className="space-y-1.5 list-disc list-inside text-sm text-gray-600">
                        {response.aiAssessment.evidence.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
            <p className="text-xs text-gray-400 text-right pt-2">Est. Turnaround: {response.turnaroundTime}</p>
        </div>
    </div>
);

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; }> = 
({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 h-10" required/>
  </div>
);

export default PatientDetail;
