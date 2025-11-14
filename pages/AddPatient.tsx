import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, Gender, BloodGroup } from '../types';

interface AddPatientProps {
  // FIX: Updated Omit to match the function signature in App.tsx. It should omit 'treatments' and not non-existent properties.
  onAddPatient: (patientData: Omit<Patient, 'id' | 'dob' | 'treatments'>) => void;
}

const InputField: React.FC<{ label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean }> = 
({ label, name, value, onChange, type = 'text', required = true }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      required={required}
    />
  </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> =
({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
            {children}
        </select>
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; }> =
({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

const AddPatient: React.FC<AddPatientProps> = ({ onAddPatient }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    memberId: '',
    insurer: '',
    mobile: '',
    email: '',
    gender: 'Male' as Gender,
    age: '',
    bloodGroup: 'A+' as BloodGroup,
    vitals: '',
    medicalHistory: '',
    diagnosis: '',
    prescription: '',
    labOrders: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData = {
        ...formData,
        age: parseInt(formData.age, 10),
    };
    onAddPatient(patientData);
    navigate('/patients');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
        {/* Left Column: Patient Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient & Insurance Details</h3>
          <InputField label="Patient Name" name="name" value={formData.name} onChange={handleChange} />
           <div className="grid grid-cols-2 gap-6">
            <InputField label="Member ID" name="memberId" value={formData.memberId} onChange={handleChange} />
            <InputField label="Insurer" name="insurer" value={formData.insurer} onChange={handleChange} />
           </div>
          <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} type="tel" />
          <InputField label="Email ID" name="email" value={formData.email} onChange={handleChange} type="email" />
          <div className="grid grid-cols-2 gap-6">
             <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
             </SelectField>
             <InputField label="Age" name="age" value={formData.age} onChange={handleChange} type="number" />
          </div>
           <SelectField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <option key={group}>{group}</option>)}
           </SelectField>
        </div>

        {/* Right Column: Medical Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Medical Information</h3>
          <TextAreaField label="Vitals" name="vitals" value={formData.vitals} onChange={handleChange} />
          <TextAreaField label="Medical History" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} />
          <TextAreaField label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
          <TextAreaField label="Prescription" name="prescription" value={formData.prescription} onChange={handleChange} />
          <TextAreaField label="Lab Orders" name="labOrders" value={formData.labOrders} onChange={handleChange} />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="pt-5 border-t">
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/patients')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
            Cancel
          </button>
          <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            Save Patient
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddPatient;