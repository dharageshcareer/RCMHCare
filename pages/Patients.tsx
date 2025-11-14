
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ITEMS_PER_PAGE } from '../constants';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { Patient, Treatment, EligibilityStatus, PAStatus } from '../types';

interface PatientsProps {
    patients: Patient[];
}

const getLatestTreatment = (patient: Patient): Treatment | null => {
  if (!patient.treatments || patient.treatments.length === 0) {
    return null;
  }
  // Assuming the last treatment in the array is the most recent
  return patient.treatments[patient.treatments.length - 1];
};

const getEligibilityStatusForDisplay = (treatment: Treatment | null): EligibilityStatus => {
    if (!treatment?.eligibilityResponse) return EligibilityStatus.Pending;
    return treatment.eligibilityResponse.eligible ? EligibilityStatus.Eligible : EligibilityStatus.NotEligible;
};

const getPAStatusForDisplay = (treatment: Treatment | null): PAStatus => {
    if (!treatment) return PAStatus.NotRequired; // Default if no treatments
    if (treatment.preAuthResponse) {
        // Map response status string to our enum
        switch (treatment.preAuthResponse.status) {
            case "Approved": return PAStatus.Approved;
            case "Denied": return PAStatus.Denied;
            case "Submitted": return PAStatus.Submitted;
            case "Pending": return PAStatus.Pending;
            default: return PAStatus.Submitted;
        }
    }
    if (treatment.eligibilityResponse?.preAuthRequired) {
        return PAStatus.Required;
    }
    return PAStatus.NotRequired;
};


const Patients: React.FC<PatientsProps> = ({ patients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.memberId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, patients]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">All Patients</h3>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by name or Member ID..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            <Link to="/patients/new">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Patient
                </button>
            </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest CPT Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Eligibility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest PA Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPatients.map((patient) => {
              const latestTreatment = getLatestTreatment(patient);
              const cptCode = latestTreatment?.clinical.procedureCode || 'N/A';

              return (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.memberId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dob}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cptCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {latestTreatment ? (
                      <StatusBadge status={getEligibilityStatusForDisplay(latestTreatment)} />
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {latestTreatment ? (
                      <StatusBadge status={getPAStatusForDisplay(latestTreatment)} />
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/patients/${patient.id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default Patients;
