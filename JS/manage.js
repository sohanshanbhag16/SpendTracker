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
const database = firebase.database();
const auth = firebase.auth();

let allSpends = [];

auth.onAuthStateChanged((user) => {
  if (!user) return (window.location.href = "signin.html");
  const uid = user.uid;
  const ref = database.ref(`Users/${uid}/Spends`);

  ref.once("value")
    .then((snapshot) => {
      allSpends = [];
      snapshot.forEach((child) => {
        const data = child.val();
        allSpends.push({ ...data, key: child.key });
      });
      renderFilteredSorted(uid);
    })
    .catch((err) => console.error("Error loading spends:", err.message));
});

function renderFilteredSorted(uid) {
  const filterCategory = document.getElementById("filterCategory").value;
  const sortBy = document.getElementById("sortBy").value;

  let filtered = [...allSpends];
  if (filterCategory !== "all") {
    filtered = filtered.filter(s => s.spendCategory === filterCategory);
  }

  switch (sortBy) {
    case "date_desc":
      filtered.sort((a, b) => new Date(b.spendDate) - new Date(a.spendDate));
      break;
    case "date_asc":
      filtered.sort((a, b) => new Date(a.spendDate) - new Date(b.spendDate));
      break;
    case "amount_desc":
      filtered.sort((a, b) => parseFloat(b.spendValue) - parseFloat(a.spendValue));
      break;
    case "amount_asc":
      filtered.sort((a, b) => parseFloat(a.spendValue) - parseFloat(b.spendValue));
      break;
    case "title_asc":
      filtered.sort((a, b) => a.spendTitle.localeCompare(b.spendTitle));
      break;
    case "title_desc":
      filtered.sort((a, b) => b.spendTitle.localeCompare(a.spendTitle));
      break;
  }

  displayLogs(filtered, uid);
}

function displayLogs(spends, uid) {
  const container = document.getElementById("logsContainer");
  if (!container) return console.warn("logsContainer not found.");

  container.innerHTML = "";
  spends.forEach((spend) => {
    const div = document.createElement("div");
    div.classList.add("log-card");
    div.innerHTML = `
      <h3>${spend.spendTitle}</h3>
      <div class="badge" style="background-color: ${getBadgeColor(spend.spendCategory)}">${spend.spendCategory}</div>
      <p><strong>Value:</strong> ₹${spend.spendValue}</p>
      <p><strong>Location:</strong> ${spend.spendLocation || "N/A"}</p>
      <p><strong>Spent On:</strong> ${spend.spendDate || "-"}</p>
      <p><strong>Notes:</strong> ${spend.spendNotes || "-"}</p>
      <button class="delete-btn" title="Delete" data-key="${spend.key}">
        <i class="fas fa-trash-alt"></i>
      </button>`;
    container.appendChild(div);

    const deleteBtn = div.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      const key = deleteBtn.getAttribute("data-key");
      if (confirm("Delete this spend?")) {
        database.ref(`Users/${uid}/Spends/${key}`).remove()
          .then(() => div.remove())
          .catch((err) => alert("Failed to delete: " + err.message));
      }
    });
  });
}

function getBadgeColor(category) {
  const colors = {
    "House Help Salary": "#b8a1ff",
    "Groceries": "#99cfff",
    "Transport": "#f6a6b2",
    "Bills & Utilities": "#fbc687",
    "Healthcare": "#9ee7c7",
    "Dining & Food": "#f9dda4",
    "Personal": "#fbb8e1",
    "Other": "#c4c4c4"
  };
  return colors[category] || "#aaa";
}

document.getElementById("filterCategory").addEventListener("change", () => {
  const uid = firebase.auth().currentUser?.uid;
  if (uid) renderFilteredSorted(uid);
});

document.getElementById("sortBy").addEventListener("change", () => {
  const uid = firebase.auth().currentUser?.uid;
  if (uid) renderFilteredSorted(uid);
});

// PDF Export
document.getElementById("exportPDFBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;

  const uid = firebase.auth().currentUser?.uid;
  if (!uid) return alert("Please sign in to export.");

  const ref = database.ref("Users/" + uid + "/Spends");

  ref.once("value")
    .then((snapshot) => {
      const spendsArray = [];

      snapshot.forEach((childSnapshot) => {
        const spend = childSnapshot.val();
        spendsArray.push([
          spend.spendTitle || "",
          spend.spendCategory || "",
          "₹" + (spend.spendValue || "0"),
          spend.spendLocation || "-",
          spend.spendDate || "-",
          spend.spendNotes || "-"
        ]);
      });

      if (spendsArray.length === 0) return alert("No spend logs found.");

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Spend Tracker - Logs", 14, 20);

      doc.autoTable({
        startY: 30,
        head: [["Title", "Category", "Value", "Location", "Date", "Notes"]],
        body: spendsArray,
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [40, 40, 40] }
      });

      doc.save("spend_logs.pdf");
    })
    .catch((error) => {
      console.error("Export failed:", error.message);
      alert("Failed to export spend logs.");
    });
});
