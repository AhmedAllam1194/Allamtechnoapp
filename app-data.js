import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

const app = initializeApp(window.AT_FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

function $(id){ return document.getElementById(id); }

async function loadOrders(){
  try{
    const qs = await getDocs(collection(db, 'orders'));
    const list = [];
    qs.forEach(d=> list.push({ id:d.id, ...d.data() }));
    const today = list.length;
    const pending = list.filter(o=>o.status==='pending').length;
    const delivered = list.filter(o=>o.status==='delivered').length;
    const revenue = list.reduce((s,o)=> s + (Number(o.amount)||0), 0).toFixed(2);
    if($('k1')) $('k1').textContent = today;
    if($('k2')) $('k2').textContent = pending;
    if($('k3')) $('k3').textContent = delivered;
    if($('k4')) $('k4').textContent = revenue + ' د.ك';

    const wrap = document.getElementById('ordersList');
    if(wrap){
      wrap.innerHTML = '';
      list.slice(0,12).forEach(o=>{
        const el = document.createElement('div');
        el.className='slice';
        el.style.cssText='border:1px dashed var(--line);border-radius:12px;padding:10px;margin-bottom:8px';
        el.innerHTML = `<b>طلب #${o.id}</b> — ${o.status||''} — ${o.vehicle||''} — ${(o.amount||0)} د.ك`;
        wrap.appendChild(el);
      });
    }

    const tb = document.querySelector('#orders-table tbody');
    if(tb){
      tb.innerHTML = '';
      list.forEach(o=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${o.id}</td><td>${o.customer||''}</td><td>${o.driver||''}</td><td>${o.vehicle||''}</td><td>${o.status||''}</td><td>${o.amount||0}</td>`;
        tb.appendChild(tr);
      });
    }

    if(window.drawMarkers){ window.drawMarkers(list.filter(o=>o.lat && o.lng)); }
  }catch(e){
    console.warn('Orders fetch failed (maybe rules/auth)', e);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  auth.onAuthStateChanged(u=>{ if(u){ loadOrders(); } });
});
