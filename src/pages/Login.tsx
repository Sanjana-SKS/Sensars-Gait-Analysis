import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig"; // Import Firestore
import "./Login.css";

import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";

const Login = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔥 Apply login page styling only when this component is active
  useEffect(() => {
    document.body.classList.add("login-page-body");
    return () => {
      document.body.classList.remove("login-page-body");
    };
  }, []);

  // 🔥 Session Handling: Redirect if already logged in & authorized
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const clinicianRef = doc(db, "clinicians", user.uid);
        const clinicianSnap = await getDoc(clinicianRef);
        if (clinicianSnap.exists()) {
          navigate("/"); // ✅ Redirect to dashboard
        } else {
          setError("Access Denied: You are not a registered clinician.");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🔥 Handle Login
  const handleSubmitClick = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Authenticate User
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Verify if the user exists in the "clinicians" collection
      const clinicianRef = doc(db, "clinicians", user.uid);
      const clinicianSnap = await getDoc(clinicianRef);

      if (clinicianSnap.exists()) {
        console.log("Clinician authenticated successfully");
        navigate("/"); // ✅ Redirect to the clinician dashboard
      } else {
        setError("Access Denied: You are not a registered clinician.");
      }
    } catch (err: any) {
      console.log("Error:", err.code);

      if (
        err.code === "auth/user-not-found" || 
        err.code === "auth/wrong-password" || 
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password");
      } else if (err.code === "auth/network-request-failed") {
        setError("No internet connection. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Clinician Login</div>
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
            disabled={loading}
          />
        </div>
        <div className="input">
          <img src={password_icon} alt="Password Icon" />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="forgot-password" onClick={() => navigate("/reset-password")}>
        Forgot Password? <span>Click Here!</span>
      </div>

      {error && <div className="error-message errormessage">{error}</div>}

      <div className="submit-container">
        <button 
          className={`submit ${error ? "error" : ""}`} 
          onClick={handleSubmitClick}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default Login;
