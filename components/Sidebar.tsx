
import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon } from './icons/DashboardIcon';
import { PatientsIcon } from './icons/PatientsIcon';

const Sidebar: React.FC = () => {
  const commonClasses = "flex items-center px-6 py-3 text-gray-200 hover:bg-blue-700 hover:text-white transition-colors duration-200";
  const activeClasses = "bg-blue-700 text-white";

  return (
    <div className="w-64 bg-blue-800 text-white flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-blue-700">
        <h1 className="text-2xl font-bold">HealthPortal</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}
        >
          <DashboardIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="/patients"
          className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}
        >
          <PatientsIcon className="w-6 h-6" />
          <span className="mx-4 font-medium">Patients</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
