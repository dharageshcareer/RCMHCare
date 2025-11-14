import React from 'react';
import { useLocation } from 'react-router-dom';
import { UserIcon } from './icons/UserIcon';

const TopBar: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const { pathname } = location;
    if (pathname.startsWith('/patients/')) {
        if (pathname.endsWith('/new')) {
            return 'Add New Patient';
        }
        return 'Patient Details & Actions';
    }
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/patients':
        return 'Patient Records';
      default:
        return 'Hospital Insurance Portal';
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h2>
      <div className="flex items-center">
        <div className="relative">
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <UserIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;