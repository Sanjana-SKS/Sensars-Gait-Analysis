import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";


dotenv.config(); // Load environment variables



// ✅ Middleware to authenticate Firebase token
import admin from "firebase-admin";
// 🔹 Ensure Firebase Admin SDK initializes only once
const serviceAccount = JSON.parse(readFileSync("src/firebase/serviceAccountKey.json", "utf8"));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        credential: admin.credential.cert(serviceAccount),
        projectId: "sensars-gaitanalysistol", // 🔹 Set your Firebase project ID explicitly
    });
    console.log("🔥 Firebase Admin SDK initialized!");
} else {
    console.log("⚠️ Firebase Admin SDK already initialized!");
}

const db = admin.firestore();

const app = express();
app.use(cors()); // Allows requests from frontend
app.use(express.json()); // Ensure JSON parsing

// Firestore REST API Base URL
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Received Auth Header:", authHeader); // Debugging

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("Missing or incorrect token format.");
            return res.status(401).json({ error: "Unauthorized. No token provided." });
        }

        req.token = authHeader.split("Bearer ")[1];

        // 🔹 Verify token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(req.token);
        console.log("Decoded Token:", decodedToken); // Debugging

        req.user = decodedToken; // Attach user data
        next();
    } catch (error) {
        console.error("Firebase Token Validation Error:", error);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

// ✅ Create New Patient API (Stores in "patients" collection)
app.post("/clinicians/:clinicianId/patients", authenticate, async (req, res) => {
    try {
        const clinicianId = req.params.clinicianId;
        const {
            patientId,
            email,
            password,
            age,
            height,
            weight,
            indication,
            originOfPain,
        } = req.body;

        if (!patientId || !email || !password) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        console.log("Writing new patient to Firestore...");

        // 🔹 Add patient to Firestore (Main patients collection)
        const patientRef = db.collection("patients").doc(patientId);
        await patientRef.set({
            patientId,
            email,
            passwordHash: password, // Hash password in production
            age,
            height,
            weight,
            indication,
            originOfPain,
            clinicianId, // Reference to clinician
            createdAt: new Date().toISOString(),
        });

        // 🔹 Add patient reference under clinician document
        const clinicianRef = db.collection("clinicians").doc(clinicianId);
        await clinicianRef.update({
            patients: admin.firestore.FieldValue.arrayUnion(patientId),
        });

        console.log(`✅ Patient ${patientId} added successfully.`);
        res.status(201).json({ message: "Patient created successfully!" });
    } catch (error) {
        console.error("🔥 Error writing to Firestore:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
  


app.get("/clinicians/:clinicianId/patients", authenticate, async (req, res) => {
    try {
      const { clinicianId } = req.params;
      const { age, indication, page = 1, limit = 10 } = req.query;
  
      // RBAC: Ensure the clinician can only access their own patients.
      console.log("User UID from Token:", req.user.uid);
      console.log("Requested Clinician ID:", clinicianId);
      if (req.user.uid !== clinicianId) {
        console.log("❌ Clinician ID does not match authenticated user.");
        return res.status(403).json({ error: "Forbidden. You are not allowed to access these patients." });
      }
      console.log("✅ Clinician ID matches authenticated user. Proceeding...");
  
      // Build filters array
      const filters = [
        {
          fieldFilter: {
            field: { fieldPath: "clinicianId" },
            op: "EQUAL",
            value: { stringValue: clinicianId }
          }
        }
      ];
  
      if (age) {
        filters.push({
          fieldFilter: {
            field: { fieldPath: "age" },
            op: "EQUAL",
            value: { integerValue: parseInt(age.toString()) }
          }
        });
      }
  
      if (indication) {
        filters.push({
          fieldFilter: {
            field: { fieldPath: "indication" },
            op: "EQUAL",
            value: { stringValue: indication.toString() }
          }
        });
      }
  
      // Determine the "where" clause based on the number of filters
      let whereClause;
      if (filters.length === 1) {
        whereClause = filters[0];
      } else {
        whereClause = { compositeFilter: { op: "AND", filters: filters } };
      }
  
      // Build the structured query
      const structuredQuery = {
        from: [{ collectionId: "patients" }],
        where: whereClause,
        limit: parseInt(limit.toString())
      };
  
      console.log("Structured Query:", JSON.stringify(structuredQuery, null, 2));
  
      const firestoreQuery = { structuredQuery };
  
      // Make Firestore API request using axios
      const response = await axios.post(
        `${FIRESTORE_BASE_URL}:runQuery`,
        firestoreQuery,
        {
          headers: {
            "Authorization": `Bearer ${req.token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      // Parse Firestore response
      const patients = response.data
        .filter(doc => doc.document) // Only process valid documents
        .map(doc => {
          const data = doc.document.fields;
          return {
            patientId: doc.document.name.split("/").pop(),
            name: data.name?.stringValue,
            age: data.age?.integerValue ?? null,
            height: data.height?.integerValue ?? null,
            weight: data.weight?.integerValue ?? null,
            indication: data.indication?.stringValue ?? null,
            originOfPain: data.originOfPain?.stringValue ?? null
          };
        });
  
      return res.json({ patients });
    } catch (error) {
      console.error("Error fetching patients:", error);
      return res.status(500).json({ error: "Internal Server Error." });
    }
  });
  
  
  

// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
