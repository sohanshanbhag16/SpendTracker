const firebaseConfig = {
  apiKey: "AIzaSyBR66NWZVy1g4N30i6hhZGuzNBoR7y48Jk",
  authDomain: "spend-tracker-ddc1e.firebaseapp.com",
  databaseURL: "https://spend-tracker-ddc1e-default-rtdb.firebaseio.com",
  projectId: "spend-tracker-ddc1e",
  storageBucket: "spend-tracker-ddc1e.firebasestorage.app",
  messagingSenderId: "518672469273",
  appId: "1:518672469273:web:3c015e33223097ab334988"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

document.getElementById("signinbutton").addEventListener("click", () => {
  const email = document.getElementById("email_input").value;
  const password = document.getElementById("password_input").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  const persistence = rememberMe
    ? firebase.auth.Auth.Persistence.LOCAL
    : firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => {
      return auth.signInWithEmailAndPassword(email, password);
    })
    .then((userCred) => {
      alert("Welcome back, " + userCred.user.email);
      window.location.href = "../HTML/dashboard.html";
    })
    .catch((err) => alert("Sign in failed: " + err.message));
});


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
    .then(() => alert("Signed in with Google!"))
    .catch((err) => alert("Google Sign-In failed: " + err.message));
});

document.getElementById("togglePassword").addEventListener("click", () => {
  const passwordInput = document.getElementById("password_input");
  const toggleIcon = document.getElementById("togglePassword");

  const isPasswordVisible = passwordInput.type === "text";
  passwordInput.type = isPasswordVisible ? "password" : "text";

  toggleIcon.classList.toggle("fa-eye");
  toggleIcon.classList.toggle("fa-eye-slash");
});

