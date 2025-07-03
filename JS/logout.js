document.getElementById("logoutBtn")?.addEventListener("click", () => {
  firebase.auth().signOut()
    .then(() => {
      alert("You have been logged out.");
      window.location.href = "signin.html";
    })
    .catch((error) => {
      console.error("Logout failed:", error.message);
      alert("Logout failed. Please try again.");
    });
});
