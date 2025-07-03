const firebaseConfig = {
  apiKey: "AIzaSyBR66NWZVy1g4N30i6hhZGuzNBoR7y48Jk",
  authDomain: "spend-tracker-ddc1e.firebaseapp.com",
  databaseURL: "https://spend-tracker-ddc1e-default-rtdb.firebaseio.com",
  projectId: "spend-tracker-ddc1e",
  storageBucket: "spend-tracker-ddc1e.appspot.com",
  messagingSenderId: "518672469273",
  appId: "1:518672469273:web:3c015e33223097ab334988"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("emailDisplay").innerText = user.email;
    document.getElementById("userName").innerText = user.displayName || "User";
  } else {
    window.location.href = "signin.html";
  }
});

function changePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const user = auth.currentUser;

  if (!newPassword || newPassword.length < 6) {
    alert("Password should be at least 6 characters.");
    return;
  }

  user.updatePassword(newPassword)
    .then(() => alert("Password updated successfully!"))
    .catch((error) => alert("Error: " + error.message));
}

function deleteAccount() {
  const user = auth.currentUser;
  if (confirm("Are you sure you want to permanently delete your account?")) {
    const uid = user.uid;

    // Remove user data from database
    database.ref("Users/" + uid).remove()
      .then(() => {
        return user.delete();
      })
      .then(() => {
        alert("Account deleted successfully.");
        window.location.href = "signup.html";
      })
      .catch((err) => {
        alert("Error deleting account: " + err.message);
      });
  }
}
