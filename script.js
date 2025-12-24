
const ADMIN = { username: "admin", password: "admin123", role: "Admin" };
const USERS_KEY = "bd_users";
const DONATIONS_KEY = "bd_donations";
const REQUESTS_KEY = "bd_requests";

function read(key){ return JSON.parse(localStorage.getItem(key) || "[]"); }
function write(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function genId(prefix="id_"){ return prefix + Date.now() + Math.floor(Math.random()*900); }


if(!localStorage.getItem(USERS_KEY)) write(USERS_KEY, []);
if(!localStorage.getItem(DONATIONS_KEY)) write(DONATIONS_KEY, []);
if(!localStorage.getItem(REQUESTS_KEY)) write(REQUESTS_KEY, []);


function hideAll(){
  ["registerPage","loginPage","donorPage","receiverPage","adminPage"].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display="none";
  });
}
function showRegister(){ hideAll(); document.getElementById("registerPage").style.display="block"; }
function showLogin(){ hideAll(); document.getElementById("loginPage").style.display="block"; }
function showDonor(){ hideAll(); document.getElementById("donorPage").style.display="block"; renderDonorInfo(); }
function showReceiver(){ hideAll(); document.getElementById("receiverPage").style.display="block"; renderReceiverInfo(); }
function showAdmin(){ hideAll(); document.getElementById("adminPage").style.display="block"; renderAdminInfo(); }
function logout(){ localStorage.removeItem("bd_current"); alert("Logged out"); showLogin(); }


function current(){ return JSON.parse(localStorage.getItem("bd_current") || "null"); }
function setCurrent(obj){ localStorage.setItem("bd_current", JSON.stringify(obj)); }


document.getElementById("registerForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("r_name").value.trim();
  const age = document.getElementById("r_age").value.trim();
  const bgroup = document.getElementById("r_bgroup").value;
  const contact = document.getElementById("r_contact").value.trim();
  const role = document.getElementById("r_role").value;
  const password = document.getElementById("r_password").value;

  if(!name||!age||!bgroup||!contact||!role||!password){ alert("Fill all fields"); return; }

  const users = read(USERS_KEY);
  if(users.find(u=>u.name.toLowerCase()===name.toLowerCase())){ alert("Name already registered. Use unique name."); return; }

  const u = { id: genId("u_"), name, age, bgroup, contact, role, password };
  users.push(u);
  write(USERS_KEY, users);

  alert("Registration successful! Please login.");
  this.reset();
  showLogin();
});


document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();
  const uname = document.getElementById("l_user").value.trim();
  const pass = document.getElementById("l_pass").value;
  const role = document.getElementById("l_role").value;

  if(!uname||!pass||!role){ alert("Fill all login fields"); return; }


  if(role === "Admin"){
    if(uname === ADMIN.username && pass === ADMIN.password){
      setCurrent({ id: "admin", name: "Administrator", role: "Admin" });
      showAdmin(); return;
    } else { alert("Invalid admin credentials"); return; }
  }


  const users = read(USERS_KEY);
  const user = users.find(u=>u.name.toLowerCase()===uname.toLowerCase() && u.role===role && u.password===pass);
  if(!user){ alert("Invalid credentials or role. Check name/role/password."); return; }

  setCurrent({ id: user.id, name: user.name, role: user.role });
  if(user.role==="Donor") showDonor(); else showReceiver();
});


function renderDonorInfo(){
  const cur = current(); if(!cur) return;
  const users = read(USERS_KEY);
  const me = users.find(u=>u.id===cur.id);
  const box = document.getElementById("donorInfoBox");
  box.style.display = "block";
  box.innerHTML = `<strong>${me.name}</strong><br>Blood Group: ${me.bgroup} • Contact: ${me.contact} • Age: ${me.age}`;
}

function checkEligibility(){
  const cur = current(); if(!cur) return alert("User not found");
  const donations = read(DONATIONS_KEY).filter(d=>d.userId===cur.id).sort((a,b)=> b.date.localeCompare(a.date));
  if(!donations.length){ alert("No donations found — you are eligible."); return; }
  const last = new Date(donations[0].date);
  const days = Math.floor((Date.now() - last.getTime())/(1000*60*60*24));
  if(days>=30) alert(`Eligible — last donation was ${days} days ago.`);
  else alert(`Not eligible. Last donation ${days} days ago. Wait ${30-days} more day(s).`);
}

function showDonationHistory(){
  const cur = current(); if(!cur) return;
  const donations = read(DONATIONS_KEY).filter(d=>d.userId===cur.id).sort((a,b)=> b.date.localeCompare(a.date));
  if(!donations.length) return alert("No donation history.");
  const list = donations.map(d=>new Date(d.date).toLocaleString()).join("\n");
  alert("Donation history:\n\n" + list);
}


function renderReceiverInfo(){
  const cur = current(); if(!cur) return;
  const users = read(USERS_KEY);
  const me = users.find(u=>u.id===cur.id);
  const box = document.getElementById("receiverInfoBox");
  box.style.display = "block";
  box.innerHTML = `<strong>${me.name}</strong><br>Blood Group: ${me.bgroup} • Contact: ${me.contact} • Age: ${me.age}`;
}


function renderAdminInfo(){
  const users = read(USERS_KEY);
  const donors = users.filter(u=>u.role==="Donor").length;
  const receivers = users.filter(u=>u.role==="Receiver").length;
  const reqs = read(REQUESTS_KEY).length;
  const box = document.getElementById("adminInfoBox");
  box.style.display = "block";
  box.innerHTML = `<strong>Summary</strong><br>Donors: ${donors} • Receivers: ${receivers} • Requests: ${reqs}`;
}

function showStats(){
  const donations = read(DONATIONS_KEY);
  const total = donations.length;
  const last = donations.length ? new Date(donations[donations.length-1].date).toLocaleString() : "None";
  alert(`Donation Statistics:\n\nTotal donations: ${total}\nLast donation: ${last}`);
}


(function init(){
  showRegister();
})();

