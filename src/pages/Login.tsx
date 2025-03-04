import { useEffect, useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

// Firebase imports
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';

const Login = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  // 1. Apply login page styling only when this component is active
  useEffect(() => {
    document.body.classList.add("login-page-body");
    return () => {
      document.body.classList.remove("login-page-body");
    };
  }, []);

  // 2. Session Handling: check if the user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to Home
        navigate("/Home");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // 3. Handle Login
  const handleSubmitClick = () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Sign in with Firebase
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // If successful, user is now logged in
        // onAuthStateChanged will handle navigation to /Home
      })
      .catch((err) => {
        console.log("Error code:", err.code); // For debugging
        if (
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential'
        ) {
          setError("Incorrect email or password");
        } else if (err.code === 'auth/network-request-failed') {
          setError("No internet connection. Please try again later.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      });      
  };

  // 4. Navigate to Reset Password page (implementation can be done later)
  const handleForgotPasswordClick = () => {
    navigate("/reset-password");
  };

  return (
    <div className='container'>
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        <div className="input">
          <img src={email_icon} alt="Email Icon" />
          <input 
            type="email" 
            placeholder="Email ID" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={password_icon} alt="Password Icon" />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="forgot-password" onClick={handleForgotPasswordClick}>
        Forgot Password? <span>Click Here!</span>
      </div>

      {error && <div className="error-message errormessage">{error}</div>}

      <div className="submit-container">
        <div className={`submit ${error ? 'error' : ''}`} onClick={handleSubmitClick}>
          Submit
        </div>
      </div>
    </div>
  );
};

export default Login;
