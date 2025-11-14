
import React from 'react';
import { TIMELINE_EVENTS } from '../constants';
import { TimelineEvent, Patient, PAStatus } from '../types';
import KpiCard from '../components/KpiCard';

const TotalPatientsIcon = () => (
  <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ChecksCompletedIcon = () => (
    <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const PreAuthSubmittedIcon = () => (
    <svg className="h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);

const PendingPreAuthIcon = () => (
    <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


interface DashboardProps {
  patients: Patient[];
}

const Dashboard: React.FC<DashboardProps> = ({ patients }) => {
  const totalPatients = patients.length;

  const eligibilityChecksCompleted = patients.reduce((acc, patient) => {
      return acc + patient.treatments.filter(t => t.eligibilityResponse).length;
  }, 0);

  const preAuthsSubmitted = patients.reduce((acc, patient) => {
      return acc + patient.treatments.filter(t => t.preAuthResponse).length;
  }, 0);

  const pendingPreAuths = patients.reduce((acc, patient) => {
      const pendingCount = patient.treatments.filter(t => 
        t.preAuthResponse?.status === PAStatus.Submitted || t.preAuthResponse?.status === PAStatus.Pending
      ).length;
      return acc + pendingCount;
  }, 0);

  const renderTimelineIcon = (icon: TimelineEvent['icon']) => {
    const baseClass = "h-5 w-5 text-white";
    switch (icon) {
      case 'check': return <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
      case 'submit': return <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
      case 'approved': return <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'rejected': return <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'pending': return <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default: return null;
    }
  };

  const getIconBgColor = (icon: TimelineEvent['icon']) => {
    switch (icon) {
      case 'check': return 'bg-green-500';
      case 'submit': return 'bg-indigo-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Patients" value={totalPatients} icon={<TotalPatientsIcon />} />
        <KpiCard title="Eligibility Checks" value={eligibilityChecksCompleted} icon={<ChecksCompletedIcon />} />
        <KpiCard title="Pre-Auths Submitted" value={preAuthsSubmitted} icon={<PreAuthSubmittedIcon />} />
        <KpiCard title="Pending Pre-Auths" value={pendingPreAuths} icon={<PendingPreAuthIcon />} />
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div className="space-y-6">
          {TIMELINE_EVENTS.map((event, index) => (
            <div key={event.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getIconBgColor(event.icon)}`}>
                    {renderTimelineIcon(event.icon)}
                  </div>
                </div>
                {index !== TIMELINE_EVENTS.length - 1 && <div className="w-px h-full bg-gray-300"></div>}
              </div>
              <div className="pb-8">
                <p className="mb-1 text-sm text-gray-800 font-medium">
                  <span className="font-bold">{event.patientName}</span> - {event.action}
                </p>
                <p className="text-xs text-gray-500">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
