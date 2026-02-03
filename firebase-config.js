// Firebase Configuration
// Firebase Console (console.firebase.google.com)에서 프로젝트 설정의 '앱 추가'를 통해 아래 값을 얻으세요.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Global config for app.js to use
window.firebaseConfig = firebaseConfig;
