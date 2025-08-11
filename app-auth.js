import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const cfg = window.AT_FIREBASE_CONFIG;
if(!cfg){ console.warn("⚠️ Missing window.AT_FIREBASE_CONFIG. Copy config.example.js to config.js and fill keys."); }
const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

function $(s, r=document){ return r.querySelector(s); }

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.querySelector('form#f') || document.getElementById('f') || document.querySelector('.login-card form');
  const uEl = document.getElementById('username');
  const pEl = document.getElementById('pass');
  const err = document.querySelector('.err-msg') || document.getElementById('msg');

  if(form && uEl && pEl){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      err && (err.style.display='none');
      const uname = (uEl.value||'').trim();
      const pass = pEl.value||'';
      if(!uname || !pass){ if(err){ err.textContent = "اكتب اسم المستخدم وكلمة المرور"; err.style.display='block'; } return; }
      try{
        const ref = doc(db, 'usernames', uname);
        const snap = await getDoc(ref);
        if(!snap.exists()){ throw new Error("اسم المستخدم غير موجود"); }
        const { email, role } = snap.data();
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        sessionStorage.setItem('AT_USERNAME', uname);
        sessionStorage.setItem('AT_ROLE', role || 'staff');
        const loginOv = document.querySelector('.login-overlay');
        if(loginOv){ loginOv.style.display = 'none'; }
        document.body.classList.add('logged-in');
      }catch(e){
        console.error(e);
        if(err){ err.textContent = "فشل تسجيل الدخول، تحقق من البيانات"; err.style.display='block'; }
      }
    });
  }

  const logoutBtn = document.getElementById('btnLogout');
  if(logoutBtn){
    logoutBtn.addEventListener('click', async ()=>{
      await signOut(auth);
      sessionStorage.clear();
      location.reload();
    });
  }
});

onAuthStateChanged(auth, async (user)=>{
  const loginOv = document.querySelector('.login-overlay');
  if(user){
    loginOv && (loginOv.style.display = 'none');
    document.body.classList.add('logged-in');
    const role = sessionStorage.getItem('AT_ROLE') || 'staff';
    document.querySelectorAll('[data-role="developer"]').forEach(el=> el.style.display = (role==='developer'?'':'none'));
    document.querySelectorAll('[data-role="admin"]').forEach(el=> el.style.display = (role==='admin'||role==='developer'?'':'none'));
  }else{
    loginOv && (loginOv.style.display = 'grid');
    document.body.classList.remove('logged-in');
  }
});
