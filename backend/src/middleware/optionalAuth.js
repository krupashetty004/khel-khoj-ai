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
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error.message);
  }
} else if (admin.apps.length) {
  firebaseReady = true;
}

module.exports = async (req, res, next) => {
  req.userUid = null;
  req.userRole = "anonymous";
  req.userClaims = null;

  if (!firebaseReady) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userUid = decoded.uid;
    req.userClaims = decoded;
    req.userRole = decoded.role || decoded.roleName || decoded.userType || "user";
    next();
  } catch (err) {
    return next();
  }
};
