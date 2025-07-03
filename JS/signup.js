// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR66NWZVy1g4N30i6hhZGuzNBoR7y48Jk",
  authDomain: "spend-tracker-ddc1e.firebaseapp.com",
  databaseURL: "https://spend-tracker-ddc1e-default-rtdb.firebaseio.com",
  projectId: "spend-tracker-ddc1e",
  storageBucket: "spend-tracker-ddc1e.firebasestorage.app",
  messagingSenderId: "518672469273",
  appId: "1:518672469273:web:3c015e33223097ab334988"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Email/Password Sign-Up
document.getElementById("cr_acc_btn").addEventListener("click", () => {
  const firstName = document.getElementById("fname").value.trim();
  const lastName = document.getElementById("lname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pwd").value.trim();

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCred) => {
      const user = userCred.user;
      return database.ref("Users/" + user.uid).set({
        firstName,
        lastName,
        email,
        provider: "email",
      });
    })
    .then(() => {
      alert("Account created successfully!");
      window.location.href = "signin.html"
    })
    .catch((err) => {
      alert("Error: " + err.message);
    });
});

// Google Sign-Up
document.getElementById("google_btn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      return database.ref("Users/" + user.uid).set({
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        provider: "google",
      });
    })
    .then(() => {
      alert("Signed up with Google!");
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      alert("Google Sign-Up failed: " + err.message);
    });
});
