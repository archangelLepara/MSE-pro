// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD99DgDdJgdFnGAynKMgGABLslPaMnnxQs",
  authDomain: "mse-portfolio-tracker.firebaseapp.com",
  projectId: "mse-portfolio-tracker",
  storageBucket: "mse-portfolio-tracker.firebasestorage.app",
  messagingSenderId: "559959273122",
  appId: "1:559959273122:web:0c799c6a426f5fe1b6b1fb",
  measurementId: "G-TT09TSVQRS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let chart = null;

// LOGIN
document.getElementById("loginBtn").onclick = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

// LOGOUT
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
};

// AUTH STATE
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    document.getElementById("user").innerText = `Logged in as ${user.email}`;
    loadStocks();
  } else {
    currentUser = null;
    document.getElementById("user").innerText = "Not logged in";
    if(chart) chart.destroy();
  }
});

// SAVE STOCK
document.getElementById("saveStock").onclick = async () => {
  if (!currentUser) {
    alert("Please login first");
    return;
  }

  const stock = document.getElementById("stock").value;
  const shares = Number(document.getElementById("shares").value);
  const price = Number(document.getElementById("price").value);

  if(!stock || shares <=0 || price <=0){
    alert("Enter valid stock info");
    return;
  }

  await addDoc(
    collection(db, "users", currentUser.uid, "stocks"),
    { stock, shares, price }
  );

  document.getElementById("stock").value = "";
  document.getElementById("shares").value = "";
  document.getElementById("price").value = "";
};

// LOAD STOCKS & CHART
function loadStocks() {
  const ref = collection(db, "users", currentUser.uid, "stocks");

  onSnapshot(ref, snapshot => {
    const labels = [];
    const values = [];

    snapshot.forEach(doc => {
      const d = doc.data();
      labels.push(d.stock);
      values.push(d.shares * d.price);
    });

    drawChart(labels, values);
  });
}

// DRAW CHART
function drawChart(labels, data) {
  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Portfolio Value",
        data,
        backgroundColor: "#0d6efd"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
