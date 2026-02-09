let currentAccount = null;

function login() {
  const account = document.getElementById("account").value;
  const pin = document.getElementById("pin").value;

  fetch("http://localhost:3000/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({account, pin})
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message || "";
    if(data.status === "success") {
      currentAccount = account;
      document.getElementById("auth").style.display="none";
      document.getElementById("dashboard").style.display="block";
      document.getElementById("balance").innerText = data.balance;
      loadTransactions();
    }
  });
}

function register() {
  const account = document.getElementById("reg_account").value;
  const phone = document.getElementById("reg_phone").value;
  const pin = document.getElementById("reg_pin").value;

  fetch("http://localhost:3000/register", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({account, phone, pin})
  })
  .then(res=>res.json())
  .then(data => document.getElementById("reg_msg").innerText = data.message);
}

function transfer() {
  const to = document.getElementById("to").value;
  const amount = parseFloat(document.getElementById("amount").value);

  fetch("http://localhost:3000/transfer", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({from: currentAccount, to, amount})
  })
  .then(res=>res.json())
  .then(data => {
    alert(data.message);
    loadBalance();
    loadTransactions();
  });
}

function loadBalance() {
  fetch("http://localhost:3000/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({account:currentAccount, pin:"dummy"}) // PIN dummy لإعادة الرصيد
  })
  .then(res=>res.json())
  .then(data => document.getElementById("balance").innerText = data.balance);
}

function loadTransactions() {
  fetch(`http://localhost:3000/transactions/${currentAccount}`)
  .then(res=>res.json())
  .then(rows => {
    const ul = document.getElementById("transactions");
    ul.innerHTML="";
    rows.forEach(r=>{
      const li = document.createElement("li");
      li.innerText=`من: ${r.from_account} إلى: ${r.to_account} | ${r.amount} دج | ${r.date}`;
      ul.appendChild(li);
    });
  });
}

function logout() {
  currentAccount = null;
  document.getElementById("dashboard").style.display="none";
  document.getElementById("auth").style.display="block";
}

function showRegister() { document.getElementById("auth").style.display="none"; document.getElementById("register").style.display="block"; }
function showLogin() { document.getElementById("register").style.display="none"; document.getElementById("auth").style.display="block"; }
