import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Patients.css';
import { db } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import axios from "axios";
import folderIcon from '../Assets/folder.png';
import addIcon from '../Assets/plus.png';
import searchIcon from '../Assets/search.png';
import eyeOpenIcon from '../Assets/eye-open.png';
import eyeClosedIcon from '../Assets/eye-closed.png';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const authInstance = getAuth();

  // Automatically sign in a test clinician if not already signed in
  useEffect(() => {
    if (!authInstance.currentUser) {
      signInWithEmailAndPassword(authInstance, "clinician#1@gmail.com", "sensarsgait")
        .then((userCredential) => {
          console.log("User is signed in:", userCredential.user.uid);
        })
        .catch((error) => {
          console.error("Error signing in:", error);
        });
    }
  }, [authInstance]);

  // Modal state and UI toggles
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields for new patient
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

  // Patients state – fetched via your API
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients for the signed-in clinician from your API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const user = authInstance.currentUser;
        if (!user) {
          setFormError("User not authenticated.");
          setLoading(false);
          return;
        }
        const token = await user.getIdToken();
        const clinicianId = user.uid;
        // Call your API endpoint; it uses a Firestore structured query to return only patients where clinicianId === user.uid.
        const response = await axios.get(`http://localhost:3000/clinicians/${clinicianId}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setFormError("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [authInstance]);

  // Toggle modal and clear form fields when closing
  const toggleModal = () => {
    if (showModal) {
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Generate a random password (optional)
  const generateRandomPassword = (length = 12): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
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
    setPasswordError('');
  };

  // Check if required fields are filled
  const isCreateDisabled = !patientId || !password || !indication || !origin;

  // Create a new patient via your API
  const handleCreatePatient = async () => {
    if (!patientId.trim() || !password.trim() || !indication.trim() || !origin.trim()) {
      alert("Please fill all required fields.");
      return;
    }
  
    // Construct the new patient object as expected by Firestore/API
    const newPatient = {
      patientId: patientId.trim(),
      email: `${patientId.trim()}@example.com`,
      password: password.trim(),
      age: age ? parseInt(age) : null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      indication: indication.trim() || "N/A",
      originOfPain: origin.trim() || "Unknown",
      clinicianId: authInstance.currentUser?.uid,
    };
  
    try {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        alert("Authentication token not found. Please log in.");
        return;
      }
  
      const response = await axios.post(
        `http://localhost:3000/clinicians/${authInstance.currentUser?.uid}/patients`,
        newPatient,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      if (response.status === 201) {
        alert("Patient created successfully!");
        // Update state to include new patient
        setPatients((prev) => [{ id: response.data.id, ...newPatient, isNew: true }, ...prev]);
        toggleModal();
        navigate("/patients");
      } else {
        alert(response.data.error || "Failed to create patient.");
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

      {/* Show loading or error state */}
      {loading ? (
        <p>Loading patients...</p>
      ) : formError ? (
        <p className="error-text">{formError}</p>
      ) : (
        <div className="patients-grid">
          {patients.length === 0 ? (
            <p>No patients found for this clinician.</p>
          ) : (
            patients.map((patient) => (
              <div className="patient-card" key={patient.id}>
                <div className="patient-id">
                  <span className="label">Patient Clinical Study ID#: </span>
                  <span className="value">{patient.patientId}</span>
                  {patient.isNew && <span className="new-label"> NEW</span>}
                </div>
                <div className="patient-age">
                  <span className="label">Age: </span>
                  <span className="value">{patient.age ? `${patient.age} y.o.` : "N/A"}</span>
                </div>
                <div className="patient-origin">
                  <span className="label">Origin of pain: </span>
                  <span className="value">{patient.originOfPain || "Unknown"}</span>
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
            ))
          )}
        </div>
      )}

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
                  <div className="label-row">
                    <label>New Password*</label>
                    <button type="button" className="suggest-password-link" onClick={handleSuggestPassword}>
                      Suggest Password
                    </button>
                  </div>
                  <div className="password-group">
                    <input
                      key={showPassword ? 'text' : 'password'}
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="eye-button">
                      <img
                        src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                        alt={showPassword ? 'Hide password' : 'Show password'}
                        className="eye-icon"
                      />
                    </button>
                  </div>
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
            {formError && <span className="error-text">{formError}</span>}
            <div className="modal-buttons">
              <div className="cancel-button-container">
                <button className="cancel-btn" onClick={toggleModal}>Cancel</button>
              </div>
              <div className="submit-button-container">
                <button className="submit-btn" onClick={handleCreatePatient} disabled={isCreateDisabled}>
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
