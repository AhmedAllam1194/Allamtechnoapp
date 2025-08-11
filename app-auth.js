// app-auth.js (Username+Password via Firestore + Anonymous sign-in)
// v2 – ready for GitHub Pages (ES modules via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const cfg = window.AT_FIREBASE_CONFIG;
if(!cfg){ console.warn("⚠️ Missing window.AT_FIREBASE_CONFIG (config.js). Ensure it's loaded before app-auth.js"); }
const app  = initializeApp(cfg);
const db   = getFirestore(app);
const auth = getAuth(app);

const $ = (s, r=document)=> r.querySelector(s);

async function loginWithUsernamePassword(uname, pass){
  const ref  = doc(db, "usernames", uname);
  const snap = await getDoc(ref);
  if(!snap.exists()) throw new Error("اسم المستخدم غير موجود");

  const data = snap.data();
  const role = data.role || "staff";

  // 1) لو فيه password في Firestore نطابقه محليًا
  if (data.password) {
    if (String(data.password) !== String(pass)) throw new Error("كلمة المرور غير صحيحة");
    // 2) نعمل تسجيل دخول مجهول عشان قواعد Firestore تعتمد على request.auth != null
    await signInAnonymously(auth);
    sessionStorage.setItem("AT_USERNAME", uname);
    sessionStorage.setItem("AT_ROLE", role);
    return { role, mode: "anonymous" };
  }

  // 3) بديل: لو مفيش password لكن فيه email → نستخدم Email/Password من Authentication
  if (data.email) {
    await signInWithEmailAndPassword(auth, data.email, pass);
    sessionStorage.setItem("AT_USERNAME", uname);
    sessionStorage.setItem("AT_ROLE", role);
    return { role, mode: "email" };
  }

  throw new Error("لا توجد طريقة دخول معرفة لهذا المستخدم");
}

function applyRoleUI(){
  const role = sessionStorage.getItem("AT_ROLE") || "staff";
  document.querySelectorAll('[data-role="developer"]').forEach(el=> el.style.display = (role==='developer'?'':'none'));
  document.querySelectorAll('[data-role="admin"]').forEach(el=> el.style.display = (role==='admin' || role==='developer' ? '' : 'none'));
}

document.addEventListener("DOMContentLoaded", ()=>{
  const form = $("#f") || document.querySelector(".login-card form");
  const uEl  = $("#username");
  const pEl  = $("#pass");
  const err  = document.querySelector(".err-msg");

  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if(err) err.style.display="none";
    try{
      const uname = (uEl?.value||"").trim();
      const pass  = (pEl?.value||"");
      if(!uname || !pass) throw new Error("اكتب اسم المستخدم وكلمة المرور");

      await loginWithUsernamePassword(uname, pass);

      document.querySelector(".login-overlay")?.style.setProperty("display","none");
      document.body.classList.add("logged-in");
      applyRoleUI();
    }catch(ex){
      console.error(ex);
      if(err){ err.textContent = ex.message || "فشل تسجيل الدخول"; err.style.display="block"; }
    }
  });

  document.getElementById("btnLogout")?.addEventListener("click", async ()=>{
    sessionStorage.clear();
    await signOut(auth);
    location.reload();
  });
});

onAuthStateChanged(auth, (user)=>{
  if(user){
    document.querySelector(".login-overlay")?.style.setProperty("display","none");
    document.body.classList.add("logged-in");
    applyRoleUI();
  }else{
    document.querySelector(".login-overlay")?.style.setProperty("display","grid");
    document.body.classList.remove("logged-in");
  }
});
