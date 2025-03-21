import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Patients.css';
import { db } from '../firebase/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  getAuth, 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence,
  signOut  // Import signOut from Firebase
} from 'firebase/auth';
import axios from "axios";
import folderIcon from '../Assets/folder.png';
import addIcon from '../Assets/plus.png';
import searchIcon from '../Assets/search.png';
import eyeOpenIcon from '../Assets/eye-open.png';
import eyeClosedIcon from '../Assets/eye-closed.png';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const authInstance = getAuth();

  // Local state to store the authenticated user and track if auth state is determined
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // useRef to track intentional logout so that auto sign in doesn't trigger
  const intentionalLogoutRef = useRef(false);

  // Set persistence and listen for auth state changes
  useEffect(() => {
    setPersistence(authInstance, browserLocalPersistence)
      .then(() => {
        onAuthStateChanged(authInstance, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            setAuthChecked(true); // Mark that auth has been checked
            console.log("User is authenticated:", currentUser.uid);
          } else {
            setAuthChecked(true);
          }
        });
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, [authInstance]);

  // Logout handler: sign out and navigate to login page
  const handleLogout = async () => {
    intentionalLogoutRef.current = true;
    try {
      await signOut(authInstance);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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

  // Search state: one for live input and one for applied search query
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search input for smooth filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Fetch patients only after auth state has been determined
  useEffect(() => {
    if (!authChecked) return; // wait until auth is checked

    const fetchPatients = async () => {
      if (!user) {
        setFormError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const clinicianId = user.uid;
        const response = await axios.get(
          `http://localhost:3000/clinicians/${clinicianId}/patients`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setFormError("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [authChecked, user]);

  // Filter patients based on the applied search query (case-insensitive)
  const filteredPatients = patients.filter((patient) =>
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  
    const newPatient = {
      patientId: patientId.trim(),
      email: `${patientId.trim()}@example.com`,
      password: password.trim(),
      age: age ? parseInt(age) : null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      indication: indication.trim() || "N/A",
      originOfPain: origin.trim() || "Unknown",
      clinicianId: user?.uid,
    };
  
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `http://localhost:3000/clinicians/${user?.uid}/patients`,
        newPatient,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 201) {
        alert("Patient created successfully!");
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
      {/* Top Header with Title, Search Bar, Add New Patient, and Logout */}
      <div className="patients-header">
        <h1 className="page-title">Patients</h1>
        <div className="header-actions">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <div className="search-and-add">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search by Patient ID" 
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="search-btn">
              <img src={searchIcon} alt="Search" className="search-icon" />
            </button>
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
          {filteredPatients.length === 0 ? (
            <p>No patients found.</p>
          ) : (
            filteredPatients.map((patient) => (
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
