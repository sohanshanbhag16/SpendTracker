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

window.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit");

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const spendTitle = document.getElementById("spendTitle").value.trim();
    const spendCategory = document.getElementById("spendCategory").value;
    const spendValue = document.getElementById("spendValue").value.trim();
    const spendDate = document.getElementById("spendDate").value;
    const spendNotes = document.getElementById("spendNotes").value.trim();

    if (!spendTitle || !spendCategory || !spendValue || !spendDate) {
      alert("Please fill in all required fields.");
      return;
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
        const spendRef = database.ref("Users/" + uid + "/Spends").push();

        const spendData = {
          spendTitle,
          spendCategory,
          spendValue,
          spendDate,
          spendNotes,
          timestamp: new Date().toISOString()
        };

        spendRef.set(spendData)
          .then(() => {
            alert("Spend recorded successfully!");

            // Clear form
            document.getElementById("spendTitle").value = "";
            document.getElementById("spendCategory").value = "";
            document.getElementById("spendAmount").value = "";
            document.getElementById("spendDate").value = "";
            document.getElementById("spendNotes").value = "";
          })
          .catch((err) => {
            alert("Error saving spend: " + err.message);
          });
      } else {
        window.location.href = "signin.html";
      }
    });
  });
});
