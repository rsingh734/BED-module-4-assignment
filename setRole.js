import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as fs from 'fs';

// Load service account key
const serviceAccount = JSON.parse(fs.readFileSync('./src/serviceKey.json', 'utf8'));

// Initialize the Firebase Admin app
initializeApp({
    credential: cert(serviceAccount),
});

// Get auth reference
const auth = getAuth();

async function setUserRole() {
  const uid = 'qOD4rVCEofUAvf3Hqpo5B89kcjF2'; // Your user UID
  const role = 'manager';

  try {
    await auth.setCustomUserClaims(uid, { role });
    console.log(`Role '${role}' set successfully for user ${uid}`);

    // Verify the role was set
    const user = await auth.getUser(uid);
    console.log('User custom claims:', user.customClaims);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

setUserRole();
