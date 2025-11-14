
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import AddPatient from './pages/AddPatient';
import { Patient, Treatment } from './types';

const LOCAL_STORAGE_KEY = 'hospitalPortalPatients';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedPatients = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedPatients && storedPatients !== '[]') {
          setPatients(JSON.parse(storedPatients));
        } else {
          // Fetch patients and treatments concurrently
          const [patientsResponse, treatmentsResponse] = await Promise.all([
            fetch('./patients.json'),
            fetch('./treatments.json')
          ]);

          if (!patientsResponse.ok || !treatmentsResponse.ok) {
            throw new Error('Failed to fetch initial data');
          }

          const initialPatients: Patient[] = await patientsResponse.json();
          const treatmentsHistory: Record<string, Treatment[]> = await treatmentsResponse.json();

          // Merge the treatment history into the patient data
          const mergedPatients = initialPatients.map(patient => {
            if (treatmentsHistory[patient.id]) {
              return { ...patient, treatments: treatmentsHistory[patient.id] };
            }
            return patient;
          });
          
          setPatients(mergedPatients);
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
        // Fallback to empty array if all else fails
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
    }
  }, [patients, isLoading]);


  const handleAddPatient = (newPatientData: Omit<Patient, 'id' | 'dob' | 'treatments'>) => {
    setPatients(currentPatients => {
      const newId = Math.max(0, ...currentPatients.map(p => p.id)) + 1;
      const newPatient: Patient = {
        ...newPatientData,
        id: newId,
        dob: new Date(new Date().setFullYear(new Date().getFullYear() - (newPatientData.age || 0))).toISOString().split('T')[0],
        treatments: [],
      };
      return [...currentPatients, newPatient];
    });
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(currentPatients =>
      currentPatients.map(p => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-semibold text-gray-700">Loading Patient Portal...</div>
        </div>
      );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard patients={patients} />} />
          <Route path="/patients" element={<Patients patients={patients} />} />
          <Route path="/patients/new" element={<AddPatient onAddPatient={handleAddPatient} />} />
          <Route path="/patients/:patientId" element={<PatientDetail patients={patients} onUpdatePatient={handleUpdatePatient} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;