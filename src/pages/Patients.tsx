import React from 'react';
import './Patients.css';
import folderIcon from '../Assets/folder.png';
import addIcon from '../Assets/plus.png';
import searchIcon from '../Assets/search.png';

// Dummy data for the patients
const dummyPatients = [
  {
    clinicalStudyId: 8493,
    isNew: true,
    age: 46,
    origin: "Right foot, right calf",
  },
  {
    clinicalStudyId: 5442,
    age: 54,
    origin: "Right foot, right calf",
  },
  {
    clinicalStudyId: 3498,
    age: 41,
    origin: "Right calf",
  },
  {
    clinicalStudyId: 2865,
    age: 78,
    origin: "Right foot",
  },
  {
    clinicalStudyId: 9087,
    age: 61,
    origin: "Right foot, right calf",
  },
  {
    clinicalStudyId: 3100,
    age: 42,
    origin: "Left foot, left calf",
  },
];

const Patients: React.FC = () => {
  return (
    <div className="patients-page">
      {/* Top Header with Title, Search Bar, and Add New Patient */}
      <div className="patients-header">
        <h1 className="page-title">Patients</h1>
        <div className="search-and-add">
          <div className="search-container">
            <img src={searchIcon} alt="Search" className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <button className="add-patient-button">
            <img src={addIcon} alt="Add" className="add-icon" />
            Add New Patient
          </button>
        </div>
      </div>

      {/* Grid Layout for Patient Cards */}
      <div className="patients-grid">
        {dummyPatients.map((patient, idx) => (
          <div className="patient-card" key={idx}>
          <div className="patient-id">
            <span className="label">Patient Clinical Study ID#: </span>
            <span className="value">{patient.clinicalStudyId}</span>
            {patient.isNew && <span className="new-label"> NEW</span>}
          </div>
        
          <div className="patient-age">
            <span className="label">Age: </span>
            <span className="value">{patient.age} y.o.</span>
          </div>
        
          <div className="patient-origin">
            <span className="label">Origin of pain: </span>
            <span className="value">{patient.origin}</span>
          </div>
        
          {/* Buttons */}
          <div className="action-buttons">
              <button className="action-btn">
                <img src={folderIcon} alt="Folder" className="action-icon" />
                Data Visualization
              </button>
              <button className="action-btn">
                <img src={folderIcon} alt="Folder" className="action-icon" />
                Therapy Change
              </button>
              <button className="action-btn">
                <img src={folderIcon} alt="Folder" className="action-icon" />
                Pair IPG
              </button>
          </div>
        </div>        
        ))}
      </div>
    </div>
  );
};

export default Patients;