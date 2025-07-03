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

// Wait for login and fetch user data
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;

    // 1. Display user name
    const userRef = database.ref("Users/" + uid);
    userRef.once("value")
      .then((snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          
          document.getElementById("welcomeText").innerText =
            "Welcome Back, " + userData.firstName;
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error.message);
      });

    // 2. Fetch and sum assets
    const spendsRef = database.ref("Users/"+uid+"/Spends/");
    spendsRef.once("value")
      .then((snapshot) => {
        if (!snapshot.exists()) {
          console.warn("No spends found for this user.");
          return;
        }

        let totalValue = 0;
        let spendCount = 0;
        let spendCategoryList = {};

        snapshot.forEach((childSnapshot) => {
          const spend = childSnapshot.val();
          const value = parseFloat(spend.spendValue);
          const category = spend.spendCategory;
          if (!isNaN(value)) {
            totalValue += value;
            spendCount += 1;
          }
          if(spendCategoryList[category]){
             spendCategoryList[category]++;
          }else{
            spendCategoryList[category]=1;
          }
        });
        const spendCategories = Object.keys(spendCategoryList)
        const spendCounts = Object.values(spendCategoryList)

        const ctx = document.getElementById("assetPieChart").getContext("2d");

        new Chart(ctx, {
          type: "pie",
          data: {
            labels: spendCategories,
            datasets: [{
              label: "Expenditure Distribution",
              data: spendCounts,
              backgroundColor: [
                "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#f67019", "#00a950"
              ],
              borderColor: "#fff",
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom"
              },
              title: {
                display: true,
                text: "Expenditure Category Distribution"
              }
            }
          }
        });

        const monthlyActivity = {}; // { "2025-06": total, "2025-07": total }

snapshot.forEach((childSnapshot) => {
  const data = childSnapshot.val();
  const rawDate = data.spendDate;

  if (!rawDate) return;

  const date = new Date(rawDate);
  if (isNaN(date)) {
    console.warn("Invalid spendDate:", rawDate);
    return;
  }

  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const value = parseFloat(data.spendValue || 0);

  if (!monthlyActivity[yearMonth]) {
    monthlyActivity[yearMonth] = 0;
  }

  monthlyActivity[yearMonth] += value;

  console.log("Spend:", data.spendTitle, "| Date:", rawDate, "| Month:", yearMonth);
});



const sortedMonths = Object.keys(monthlyActivity).sort();
const spendData = sortedMonths.map(month => monthlyActivity[month]);
const ctx1 = document.getElementById("monthlyActivityChart").getContext("2d");

new Chart(ctx1, {
  type: "bar",
  data: {
    labels: sortedMonths,
    datasets: [{
      label: "Spends",
      data: spendData,
      backgroundColor: "green"
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Monthly Activity: Expenditure"
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          min: 0,
          callback: function(value) {
            return '₹' + value;
          }
        },
        scaleLabel: {
          display: true,
          labelString: 'Amount (₹)'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Month'
        }
      }]
    }
  }
});







        // Update DOM
        document.getElementById("totalValue").innerText = "₹" + totalValue.toFixed(2);
        document.getElementById("spendCount").innerText = spendCount;
        document.getElementById("avg").innerText ="₹"+ (totalValue/spendCount).toFixed(2);
      })
      .catch((error) => {
        console.error("Error fetching asset data:", error.message);
      });

    spendsRef.once("value")
      .then((snapshot)=>{
        let hva = 0
        snapshot.forEach((childSnapshot)=> {
          const spend = childSnapshot.val();
          const value = parseFloat(spend.spendValue);
          if (!isNaN(value)) {
            if(value > hva){
              hva = value
            }
          }
        })
        document.getElementById("highestValue").innerText = "₹"+ hva.toFixed(2)
      })
      .catch((error)=>{
        console.error("error fetching asset data")
      })


  } else {
    // Not logged in — redirect to sign in
    window.location.href = "signin.html";
  }
});
