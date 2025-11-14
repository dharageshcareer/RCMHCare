
import React from 'react';
import { EligibilityStatus, PAStatus } from '../types';

interface StatusBadgeProps {
  status: EligibilityStatus | PAStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case EligibilityStatus.Eligible:
      case PAStatus.Approved:
        return 'bg-green-100 text-green-800';
      case EligibilityStatus.PartiallyEligible:
      case PAStatus.Required:
      case EligibilityStatus.Pending:
      case PAStatus.Submitted:
      case PAStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case EligibilityStatus.NotEligible:
      case PAStatus.Denied:
        return 'bg-red-100 text-red-800';
      case PAStatus.NotRequired:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
