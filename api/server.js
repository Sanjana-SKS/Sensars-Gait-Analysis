import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());

// Firestore REST API Base URL
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// ✅ Middleware to authenticate Firebase token
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    req.token = authHeader.split("Bearer ")[1];
    try {
        const firebaseResponse = await axios.post(
            "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + process.env.FIREBASE_API_KEY,
            { idToken: req.token }
        );
        req.user = firebaseResponse.data.users[0]; // Attach user info to request
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

// ✅ API Endpoint: GET /clinicians/:clinicianId/patients
app.get("/clinicians/:clinicianId/patients", authenticate, async (req, res) => {
    try {
        const { clinicianId } = req.params;
        const { age, indication, page = 1, limit = 10 } = req.query;

        // ✅ RBAC: Ensure the clinician can only access their own patients
        if (req.user.localId !== clinicianId) {
            return res.status(403).json({ error: "Forbidden. You are not allowed to access these patients." });
        }

        // Firestore Query to filter patients by clinicianId
        const firestoreQuery = {
            structuredQuery: {
                from: [{ collectionId: "patients" }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: "clinicianId" },
                        op: "EQUAL",
                        value: { stringValue: clinicianId }
                    }
                },
                limit: parseInt(limit)
            }
        };

        // Add additional filters if provided
        if (age) {
            firestoreQuery.structuredQuery.where = {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        firestoreQuery.structuredQuery.where,
                        {
                            fieldFilter: {
                                field: { fieldPath: "age" },
                                op: "EQUAL",
                                value: { integerValue: parseInt(age) }
                            }
                        }
                    ]
                }
            };
        }

        if (indication) {
            firestoreQuery.structuredQuery.where = {
                compositeFilter: {
                    op: "AND",
                    filters: [
                        firestoreQuery.structuredQuery.where,
                        {
                            fieldFilter: {
                                field: { fieldPath: "indication" },
                                op: "EQUAL",
                                value: { stringValue: indication }
                            }
                        }
                    ]
                }
            };
        }

        // Make Firestore API request
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
            .filter(doc => doc.document) // Ensure only valid documents are processed
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
