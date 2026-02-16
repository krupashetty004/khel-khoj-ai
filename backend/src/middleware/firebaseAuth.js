const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const explicitServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const defaultServiceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");
const serviceAccountPath = explicitServiceAccountPath
  ? path.resolve(explicitServiceAccountPath)
  : defaultServiceAccountPath;

let firebaseReady = false;

if (!admin.apps.length && fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseReady = true;
    console.log(`✅ Firebase Admin initialized from: ${serviceAccountPath}`);
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
  }
} else if (admin.apps.length) {
  firebaseReady = true;
} else {
  console.warn(
    `⚠️  Firebase service account file not found at ${serviceAccountPath}. Protected routes will return 503 until configured.`
  );
}

module.exports = async (req, res, next) => {
  if (!firebaseReady) {
    return res.status(503).json({
      error: "Firebase Admin SDK is not configured",
      expectedEnv: "FIREBASE_SERVICE_ACCOUNT_PATH",
    });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userUid = decoded.uid;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
