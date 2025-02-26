// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
  
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://teaseyou-mvp-default-rtdb.firebaseio.com"
});
}

export default admin;