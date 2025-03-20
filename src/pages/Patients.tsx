import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // If using React Router
import './Patients.css';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import bcrypt from 'bcryptjs'; // Optionally for hashing (client side - not ideal)
import folderIcon from '../Assets/folder.png';
import addIcon from '../Assets/plus.png';
import searchIcon from '../Assets/search.png';
import eyeOpenIcon from '../Assets/eye-open.png';
import eyeClosedIcon from '../Assets/eye-closed.png';

const Patients: React.FC = () => {
  // Navigation hook (remove if you don't use React Router)
  const navigate = useNavigate();

    // Automatically sign in a test clinician if not already signed in
    useEffect(() => {
      if (!auth.currentUser) {
        signInWithEmailAndPassword(auth, "clinician#1@gmail.com", "sensarsgait")
          .then((userCredential) => {
            console.log("User is signed in:", userCredential.user.uid);
          })
          .catch((error) => {
            console.error("Error signing in:", error);
          });
      }
    }, []);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [indication, setIndication] = useState('');
  const [origin, setOrigin] = useState('');

  // Inline errors
  const [heightError, setHeightError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

   // Patient list (includes newly added patients)
   const [patients] = useState([
    { clinicalStudyId: 8493, isNew: true, age: 46, origin: 'Right foot, right calf' },
    { clinicalStudyId: 5442, age: 54, origin: 'Right foot, right calf' },
    { clinicalStudyId: 3498, age: 41, origin: 'Right calf' },
    { clinicalStudyId: 2865, age: 78, origin: 'Right foot' },
    { clinicalStudyId: 9087, age: 61, origin: 'Right foot, right calf' },
    { clinicalStudyId: 3100, age: 42, origin: 'Left foot, left calf' },
  ]);

  // Toggle modal, clear form if closing
  const toggleModal = () => {
    if (showModal) {
      // Modal is about to close -> clear all fields
      setPatientId('');
      setPassword('');
      setAge('');
      setHeight('');
      setWeight('');
      setIndication('');
      setOrigin('');
      setHeightError('');
      setWeightError('');
      setPasswordError('');
    }
    setShowModal(!showModal);
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Generate a random password (optional utility)
  const generateRandomPassword = (length = 12): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  };

  // Suggest password
  const handleSuggestPassword = () => {
    const newPass = generateRandomPassword();
    setPassword(newPass);
    setPasswordError(''); // clear error if any
  };

    // Generate a unique Patient ID if not provided
    const generatePatientId = () => {
      if (clinicalId.trim() !== '') {
        return clinicalId;
      }
      // If user didn't specify an ID, generate one:
      return 'P' + Math.floor(Math.random() * 100000).toString();
    };

  // Check if required fields are filled
  const isCreateDisabled = !patientId || !password || !indication || !origin;

  // Create a Patient
  const handleCreatePatient = async () => {
    // Ensure required fields are filled
    if (!patientId.trim() || !password.trim() || !indication.trim() || !origin.trim()) {
      alert("Please fill all required fields.");
      return;
    }
  
    const newPatient = {
      patientId: patientId.trim(),  // Match Firestore field names
      email: `${patientId.trim()}@example.com`, 
      password: password.trim(),
      age: age ? parseInt(age) : null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      indication: indication.trim() || "N/A",  // Avoid `undefined`
      originOfPain: origin.trim() || "Unknown",  // Ensure correct field name
    };
  
    try {
      const authToken = localStorage.getItem("token");
  
      if (!authToken) {
        alert("Authentication token not found. Please log in.");
        return;
      }
  
      const response = await fetch(
        `http://localhost:3000/clinicians/IWnyzrA45mSBcFGufxy9smdwgcK2/patients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(newPatient),
        }
      );
  
      const data = await response.json();
      if (response.ok) {
        alert("Patient created successfully!");
  
        // Update Patients List dynamically  
        toggleModal();
        navigate("/patients");
      } else {
        alert(data.error || "Failed to create patient.");
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("An error occurred. Please try again.");
    }
  };
  
  

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
          <button className="add-patient-button" onClick={toggleModal}>
            <img src={addIcon} alt="Add" className="add-icon" />
            Add New Patient
          </button>
        </div>
      </div>

      {/* Grid Layout for Patient Cards */}
      <div className="patients-grid">
        {patients.map((patient, idx) => (
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

      {/* Modal for Adding New Patient */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create a Patient</h2>
            <button className="close-modal" onClick={toggleModal}>×</button>
            <div className="form-container">
              {/* First Column */}
              <div className="form-column">
                <div className="form-group">
                  <label>Patient Clinical Study ID#</label>
                  <input
                    type="text"
                    className="form-input"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  {/* Label row with "Suggest Password" on the right */}
                  <div className="label-row">
                    <label>New Password*</label>
                    <button
                      type="button"
                      className="suggest-password-link"
                      onClick={handleSuggestPassword}
                    >
                      Suggest Password
                    </button>
                  </div>

                  <div className="password-group">
                    <input
                      key={showPassword ? 'text' : 'password'}
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder=""
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="eye-button"
                    >
                      <img
                        src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                        alt={showPassword ? 'Hide password' : 'Show password'}
                        className="eye-icon"
                      />
                    </button>
                  </div>
                  {/* Inline error for password */}
                  {passwordError && <span className="error-text">{passwordError}</span>}
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="text"
                    className="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Height</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      className="form-input"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <div className="unit-divider"></div>
                    <span className="unit">cm</span>
                    {/* Inline error for height */}
                    {heightError && <span className="error-text">{heightError}</span>}
                  </div>
                </div>
              </div>

              {/* Second Column */}
              <div className="form-column">
                <div className="form-group">
                  <label>Weight</label>
                  <div className="input-with-unit">
                    <input
                      type="text"
                      className="form-input"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <div className="unit-divider"></div>
                    <span className="unit">kg</span>
                    {/* Inline error for weight */}
                    {weightError && <span className="error-text">{weightError}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Indication*</label>
                  <input
                    type="text"
                    className="form-input"
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Origin of Pain*</label>
                  <input
                    type="text"
                    className="form-input"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* If there's a top-level form error (missing fields, duplicate ID, etc.) */}
            {formError && <span className="error-text">{formError}</span>}

            {/* Modal Buttons */}
            <div className="modal-buttons">
              <div className="cancel-button-container">
                <button className="cancel-btn" onClick={toggleModal}>Cancel</button>
              </div>
              <div className="submit-button-container">
                <button
                  className="submit-btn"
                  onClick={handleCreatePatient}
                  disabled={isCreateDisabled}  // disabled if required fields not filled
                >
                  Create a Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
