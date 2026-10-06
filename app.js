// ============================================================
// BM HOSPITAL - COMPLETE MANAGEMENT SYSTEM
// ============================================================

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('bm_' + key)) || []; }
    catch { return []; }
  },
  set(key, data) { localStorage.setItem('bm_' + key, JSON.stringify(data)); },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem('bm_' + key)) || {}; }
    catch { return {}; }
  },
  setObj(key, data) { localStorage.setItem('bm_' + key, JSON.stringify(data)); },
  id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
};

const USERS = {
  admin: { pass: 'admin123', role: 'Admin', name: 'অ্যাডমিন' },
  reception: { pass: 'rec123', role: 'Reception', name: 'রিসেপশনিস্ট' }
};

let currentUser = null;
let servqualChart = null;
let revenueChart = null;
let deptChart = null;

// ==================== INIT DEMO DATA ====================
function seedData() {
  if (DB.get('doctors').length) return;

  DB.set('doctors', [
    { id: 'd1', name: 'ডা. আব্দুর রহিম', dept: 'Medicine', phone: '01711000001', fee: 600, degree: 'MBBS, FCPS', exp: 15, schedule: 'শনি-বৃহঃ ৯টা-২টা' },
    { id: 'd2', name: 'ডা. ফাতেমা খাতুন', dept: 'Gynecology', phone: '01711000002', fee: 700, degree: 'MBBS, MS', exp: 12, schedule: 'রবি-বৃহঃ ১০টা-৩টা' },
    { id: 'd3', name: 'ডা. করিম উদ্দিন', dept: 'Cardiology', phone: '01711000003', fee: 900, degree: 'MBBS, MD', exp: 18, schedule: 'শনি-মঙ্গল ৯টা-১টা' },
    { id: 'd4', name: 'ডা. সালমা বেগম', dept: 'Pediatrics', phone: '01711000004', fee: 500, degree: 'MBBS, DCH', exp: 10, schedule: 'প্রতিদিন ১০টা-২টা' },
    { id: 'd5', name: 'ডা. জামাল হোসেন', dept: 'Orthopedics', phone: '01711000005', fee: 800, degree: 'MBBS, MS (Ortho)', exp: 14, schedule: 'রবি-বৃহঃ ১১টা-৩টা' },
    { id: 'd6', name: 'ডা. নাসরিন আক্তার', dept: 'Dermatology', phone: '01711000006', fee: 550, degree: 'MBBS, DDV', exp: 8, schedule: 'শনি-বুধ ৪টা-৮টা' }
  ]);

  DB.set('patients', [
    { id: 'p1', name: 'মোঃ আব্দুল্লাহ আল মামুন', age: 42, gender: 'Male', phone: '01812000001', blood: 'B+', address: 'মিরপুর, ঢাকা', emergency: '01812000099', history: 'ডায়াবেটিস', createdAt: new Date().toISOString() },
    { id: 'p2', name: 'সালমা আক্তার', age: 29, gender: 'Female', phone: '01812000002', blood: 'A+', address: 'উত্তরা, ঢাকা', emergency: '', history: '', createdAt: new Date().toISOString() },
    { id: 'p3', name: 'রফিকুল ইসলাম', age: 55, gender: 'Male', phone: '01812000003', blood: 'O+', address: 'মোহাম্মদপুর', emergency: '01711000999', history: 'হাইপারটেনশন', createdAt: new Date().toISOString() },
    { id: 'p4', name: 'নাজমা বেগম', age: 35, gender: 'Female', phone: '01812000004', blood: 'AB+', address: 'বনানী', emergency: '', history: '', createdAt: new Date().toISOString() }
  ]);

  const today = new Date().toISOString().split('T')[0];
  DB.set('appointments', [
    { id: 'a1', patientId: 'p1', patientName: 'মোঃ আব্দুল্লাহ আল মামুন', doctorId: 'd1', doctorName: 'ডা. আব্দুর রহিম', date: today, time: '10:00', notes: 'জ্বর ও কাশি', status: 'Confirmed', createdAt: new Date().toISOString() },
    { id: 'a2', patientId: 'p2', patientName: 'সালমা আক্তার', doctorId: 'd2', doctorName: 'ডা. ফাতেমা খাতুন', date: today, time: '11:30', notes: 'নিয়মিত চেকআপ', status: 'Confirmed', createdAt: new Date().toISOString() },
    { id: 'a3', patientId: 'p3', patientName: 'রফিকুল ইসলাম', doctorId: 'd3', doctorName: 'ডা. করিম উদ্দিন', date: today, time: '09:30', notes: 'বুকে ব্যথা', status: 'Completed', createdAt: new Date().toISOString() }
  ]);

  DB.set('bills', [
    { id: 'b1', patientId: 'p1', patientName: 'মোঃ আব্দুল্লাহ আল মামুন', service: 'Consultation', amount: 600, discount: 0, status: 'Paid', method: 'Cash', notes: '', date: today, createdAt: new Date().toISOString() },
    { id: 'b2', patientId: 'p3', patientName: 'রফিকুল ইসলাম', service: 'Lab Test', amount: 1200, discount: 100, status: 'Paid', method: 'bKash', notes: 'ECG + Blood', date: today, createdAt: new Date().toISOString() }
  ]);

  DB.set('labs', [
    { id: 'l1', patientId: 'p3', patientName: 'রফিকুল ইসলাম', test: 'ECG', fee: 400, status: 'Completed', result: 'Normal sinus rhythm', date: today, createdAt: new Date().toISOString() },
    { id: 'l2', patientId: 'p1', patientName: 'মোঃ আব্দুল্লাহ আল মামুন', test: 'Blood Sugar (FBS/RBS)', fee: 200, status: 'Pending', result: '', date: today, createdAt: new Date().toISOString() }
  ]);

  DB.set('feedbacks', [
    { id: 'f1', patientId: 'p1', patientName: 'মোঃ আব্দুল্লাহ আল মামুন', tangibility: 4, reliability: 3, responsiveness: 4, assurance: 5, empathy: 5, comment: 'ডাক্তার খুব ভালো, কিন্তু অপেক্ষা একটু বেশি', date: today, createdAt: new Date().toISOString() },
    { id: 'f2', patientId: 'p3', patientName: 'রফিকুল ইসলাম', tangibility: 4, reliability: 4, responsiveness: 3, assurance: 5, empathy: 4, comment: 'সার্ভিস মোটামুটি ভালো', date: today, createdAt: new Date().toISOString() }
  ]);

  DB.setObj('settings', {
    hospitalName: 'BM Hospital and Diagnostic Center',
    address: 'ঢাকা, বাংলাদেশ',
    phone: '02-12345678',
    email: 'info@bmhospital.com'
  });
}

// ==================== TOAST ====================
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ==================== MODAL ====================
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'appointmentModal' || id === 'prescriptionModal' || id === 'labModal' || id === 'billingModal' || id === 'feedbackModal') {
    fillSelects();
  }
  if (id === 'appointmentModal') {
    const d = document.getElementById('aDate');
    d.min = new Date().toISOString().split('T')[0];
    d.value = new Date().toISOString().split('T')[0];
  }
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  const form = document.querySelector(`#${id} form`);
  if (form) form.reset();
  const hidden = document.querySelector(`#${id} input[type=hidden]`);
  if (hidden) hidden.value = '';
}

// ==================== LOGIN ====================
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = document.getElementById('loginUser').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  if (USERS[user] && USERS[user].pass === pass) {
    currentUser = { username: user, ...USERS[user] };
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('loggedUser').textContent = currentUser.name;
    document.getElementById('userRoleBadge').textContent = currentUser.role;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    seedData();
    navigate('dashboard');
  } else {
    toast('ভুল ইউজারনেম বা পাসওয়ার্ড!', 'error');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
});

// ==================== NAVIGATION ====================
const pageTitles = {
  dashboard: 'ড্যাশবোর্ড',
  patients: 'রোগী ব্যবস্থাপনা',
  appointments: 'অ্যাপয়েন্টমেন্ট',
  doctors: 'ডাক্তার তালিকা',
  prescriptions: 'প্রেসক্রিপশন',
  lab: 'ল্যাব টেস্ট',
  billing: 'বিলিং',
  feedback: 'সার্ভিস ফিডব্যাক',
  reports: 'রিপোর্ট ও এক্সপোর্ট',
  settings: 'সেটিংস'
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  document.getElementById(page).classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[page] || page;
  refreshPage(page);
}

function refreshPage(page) {
  fillSelects();
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'patients': renderPatients(); break;
    case 'appointments': renderAppointments(); break;
    case 'doctors': renderDoctors(); break;
    case 'prescriptions': renderPrescriptions(); break;
    case 'lab': renderLabs(); break;
    case 'billing': renderBills(); break;
    case 'feedback': renderFeedback(); break;
    case 'reports': renderReports(); break;
    case 'settings': loadSettings(); break;
  }
}

// ==================== SELECTS ====================
function fillSelects() {
  const patients = DB.get('patients');
  const doctors = DB.get('doctors');
  const pOpts = '<option value="">নির্বাচন করুন</option>' + patients.map(p =>
    `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('');
  const dOpts = '<option value="">নির্বাচন করুন</option>' + doctors.map(d =>
    `<option value="${d.id}">${d.name} — ${d.dept}</option>`).join('');

  ['aPatient', 'rxPatient', 'labPatient', 'bPatient', 'fPatient'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = pOpts;
  });
  ['aDoctor', 'rxDoctor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = dOpts;
  });
}

// ==================== DASHBOARD ====================
function renderDashboard() {
  const patients = DB.get('patients');
  const appointments = DB.get('appointments');
  const doctors = DB.get('doctors');
  const bills = DB.get('bills');
  const labs = DB.get('labs');
  const feedbacks = DB.get('feedbacks');
  const today = new Date().toISOString().split('T')[0];

  document.getElementById('statPatients').textContent = patients.length;
  document.getElementById('statDoctors').textContent = doctors.length;
  document.getElementById('statTodayAppt').textContent = appointments.filter(a => a.date === today && a.status !== 'Cancelled').length;
  document.getElementById('statLab').textContent = labs.filter(l => l.status === 'Pending').length;

  const todayRev = bills.filter(b => b.date === today && b.status === 'Paid')
    .reduce((s, b) => s + (Number(b.amount) - Number(b.discount || 0)), 0);
  document.getElementById('statRevenue').textContent = '৳' + todayRev.toLocaleString('bn-BD');

  if (feedbacks.length) {
    const avg = feedbacks.reduce((s, f) => s + (f.tangibility + f.reliability + f.responsiveness + f.assurance + f.empathy) / 5, 0) / feedbacks.length;
    document.getElementById('statRating').textContent = avg.toFixed(1);
  } else {
    document.getElementById('statRating').textContent = '—';
  }

  // Recent appointments
  const recent = appointments.slice(-6).reverse();
  document.getElementById('dashRecentAppt').innerHTML = recent.length ? `
    <table>
      <thead><tr><th>রোগী</th><th>ডাক্তার</th><th>তারিখ</th><th>স্ট্যাটাস</th></tr></thead>
      <tbody>${recent.map(a => `
        <tr>
          <td>${a.patientName}</td>
          <td>${a.doctorName}</td>
          <td>${a.date} ${a.time}</td>
          <td>${statusBadge(a.status)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<div class="empty-state">কোনো অ্যাপয়েন্টমেন্ট নেই</div>';

  // Today list
  const todayList = appointments.filter(a => a.date === today);
  document.getElementById('dashTodayList').innerHTML = todayList.length ? `
    <table>
      <thead><tr><th>সময়</th><th>রোগী</th><th>ডাক্তার</th><th>নোট</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr></thead>
      <tbody>${todayList.map(a => `
        <tr>
          <td>${a.time}</td>
          <td><strong>${a.patientName}</strong></td>
          <td>${a.doctorName}</td>
          <td>${a.notes || '—'}</td>
          <td>${statusBadge(a.status)}</td>
          <td>
            ${a.status !== 'Completed' && a.status !== 'Cancelled' ? `
              <button class="btn btn-success btn-sm" onclick="updateApptStatus('${a.id}','Completed')">✓ সম্পন্ন</button>
              <button class="btn btn-danger btn-sm" onclick="updateApptStatus('${a.id}','Cancelled')">✗ বাতিল</button>
            ` : '—'}
          </td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<div class="empty-state">আজকের কোনো অ্যাপয়েন্টমেন্ট নেই</div>';

  // SERVQUAL Chart
  renderServqualChart(feedbacks);
}

function statusBadge(s) {
  const map = {
    Confirmed: 'badge-upcoming', Completed: 'badge-completed', Cancelled: 'badge-cancelled',
    Paid: 'badge-paid', Pending: 'badge-pending', Partial: 'badge-partial'
  };
  const labels = {
    Confirmed: 'নিশ্চিত', Completed: 'সম্পন্ন', Cancelled: 'বাতিল',
    Paid: 'পরিশোধিত', Pending: 'বাকি', Partial: 'আংশিক'
  };
  return `<span class="badge ${map[s] || 'badge-info'}">${labels[s] || s}</span>`;
}

function renderServqualChart(feedbacks) {
  const ctx = document.getElementById('servqualChart');
  if (!ctx) return;
  if (servqualChart) servqualChart.destroy();

  const keys = ['tangibility', 'reliability', 'responsiveness', 'assurance', 'empathy'];
  const labels = ['Tangibility', 'Reliability', 'Responsiveness', 'Assurance', 'Empathy'];
  const avg = keys.map(k => feedbacks.length ? +(feedbacks.reduce((s, f) => s + f[k], 0) / feedbacks.length).toFixed(2) : 0);

  servqualChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'গড় স্কোর',
        data: avg,
        backgroundColor: 'rgba(37,99,235,.15)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#2563eb',
        borderWidth: 2
      }]
    },
    options: {
      scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } },
      plugins: { legend: { display: false } }
    }
  });
}

// ==================== PATIENTS ====================
document.getElementById('patientForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('patientId').value;
  const data = {
    name: document.getElementById('pName').value.trim(),
    age: +document.getElementById('pAge').value,
    gender: document.getElementById('pGender').value,
    phone: document.getElementById('pPhone').value.trim(),
    blood: document.getElementById('pBlood').value,
    address: document.getElementById('pAddress').value.trim(),
    emergency: document.getElementById('pEmergency').value.trim(),
    history: document.getElementById('pHistory').value.trim()
  };
  let patients = DB.get('patients');
  if (id) {
    patients = patients.map(p => p.id === id ? { ...p, ...data } : p);
    toast('রোগী আপডেট হয়েছে');
  } else {
    patients.push({ id: DB.id(), ...data, createdAt: new Date().toISOString() });
    toast('নতুন রোগী যোগ হয়েছে');
  }
  DB.set('patients', patients);
  closeModal('patientModal');
  renderPatients();
});

function renderPatients(filter = '') {
  let list = DB.get('patients');
  if (filter) {
    const q = filter.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.id.includes(q));
  }
  const wrap = document.getElementById('patientTableWrap');
  if (!list.length) { wrap.innerHTML = '<div class="empty-state">কোনো রোগী নেই</div>'; return; }
  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr>
        <th>ID</th><th>নাম</th><th>বয়স</th><th>লিঙ্গ</th><th>মোবাইল</th>
        <th>রক্ত</th><th>ঠিকানা</th><th>অ্যাকশন</th>
      </tr></thead>
      <tbody>${list.map(p => `
        <tr>
          <td><code>${p.id.slice(-6)}</code></td>
          <td><strong>${p.name}</strong></td>
          <td>${p.age}</td>
          <td>${p.gender === 'Male' ? 'পুরুষ' : p.gender === 'Female' ? 'মহিলা' : 'অন্যান্য'}</td>
          <td>${p.phone}</td>
          <td>${p.blood || '—'}</td>
          <td>${p.address || '—'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="editPatient('${p.id}')">✏️</button>
            <button class="btn btn-outline btn-sm" onclick="viewPatient('${p.id}')">👁️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('patients','${p.id}',renderPatients)">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function editPatient(id) {
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return;
  document.getElementById('patientId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pAge').value = p.age;
  document.getElementById('pGender').value = p.gender;
  document.getElementById('pPhone').value = p.phone;
  document.getElementById('pBlood').value = p.blood || '';
  document.getElementById('pAddress').value = p.address || '';
  document.getElementById('pEmergency').value = p.emergency || '';
  document.getElementById('pHistory').value = p.history || '';
  document.getElementById('patientModalTitle').textContent = 'রোগী সম্পাদনা';
  openModal('patientModal');
}

function viewPatient(id) {
  const p = DB.get('patients').find(x => x.id === id);
  if (!p) return;
  const appts = DB.get('appointments').filter(a => a.patientId === id);
  const bills = DB.get('bills').filter(b => b.patientId === id);
  document.getElementById('viewModalTitle').textContent = 'রোগীর বিস্তারিত';
  document.getElementById('viewModalBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div><strong>নাম:</strong> ${p.name}</div>
      <div><strong>বয়স:</strong> ${p.age}</div>
      <div><strong>লিঙ্গ:</strong> ${p.gender}</div>
      <div><strong>মোবাইল:</strong> ${p.phone}</div>
      <div><strong>রক্ত:</strong> ${p.blood || '—'}</div>
      <div><strong>জরুরি:</strong> ${p.emergency || '—'}</div>
      <div style="grid-column:1/-1"><strong>ঠিকানা:</strong> ${p.address || '—'}</div>
      <div style="grid-column:1/-1"><strong>মেডিকেল হিস্ট্রি:</strong> ${p.history || '—'}</div>
    </div>
    <h4 style="margin:12px 0 8px">অ্যাপয়েন্টমেন্ট (${appts.length})</h4>
    ${appts.length ? `<table><thead><tr><th>তারিখ</th><th>ডাক্তার</th><th>স্ট্যাটাস</th></tr></thead>
      <tbody>${appts.map(a => `<tr><td>${a.date} ${a.time}</td><td>${a.doctorName}</td><td>${statusBadge(a.status)}</td></tr>`).join('')}</tbody></table>` : '<p class="text-muted">নেই</p>'}
    <h4 style="margin:12px 0 8px">বিল (${bills.length})</h4>
    ${bills.length ? `<table><thead><tr><th>তারিখ</th><th>সার্ভিস</th><th>পরিমাণ</th><th>স্ট্যাটাস</th></tr></thead>
      <tbody>${bills.map(b => `<tr><td>${b.date}</td><td>${b.service}</td><td>৳${b.amount}</td><td>${statusBadge(b.status)}</td></tr>`).join('')}</tbody></table>` : '<p class="text-muted">নেই</p>'}`;
  openModal('viewModal');
}

document.getElementById('patientSearch').addEventListener('input', e => renderPatients(e.target.value));

// ==================== DOCTORS ====================
document.getElementById('doctorForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('doctorId').value;
  const data = {
    name: document.getElementById('dName').value.trim(),
    dept: document.getElementById('dDept').value,
    phone: document.getElementById('dPhone').value.trim(),
    fee: +document.getElementById('dFee').value,
    degree: document.getElementById('dDegree').value.trim(),
    exp: +document.getElementById('dExp').value || 0,
    schedule: document.getElementById('dSchedule').value.trim()
  };
  let doctors = DB.get('doctors');
  if (id) {
    doctors = doctors.map(d => d.id === id ? { ...d, ...data } : d);
    toast('ডাক্তার আপডেট হয়েছে');
  } else {
    doctors.push({ id: DB.id(), ...data });
    toast('নতুন ডাক্তার যোগ হয়েছে');
  }
  DB.set('doctors', doctors);
  closeModal('doctorModal');
  renderDoctors();
});

function renderDoctors() {
  const list = DB.get('doctors');
  const wrap = document.getElementById('doctorTableWrap');
  if (!list.length) { wrap.innerHTML = '<div class="empty-state">কোনো ডাক্তার নেই</div>'; return; }
  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>নাম</th><th>বিভাগ</th><th>ডিগ্রি</th><th>অভিজ্ঞতা</th><th>ফি</th><th>সময়</th><th>অ্যাকশন</th></tr></thead>
      <tbody>${list.map(d => `
        <tr>
          <td><strong>${d.name}</strong><br><small>${d.phone || ''}</small></td>
          <td>${d.dept}</td>
          <td>${d.degree || '—'}</td>
          <td>${d.exp ? d.exp + ' বছর' : '—'}</td>
          <td>৳${Number(d.fee).toLocaleString('bn-BD')}</td>
          <td>${d.schedule || '—'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="editDoctor('${d.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('doctors','${d.id}',renderDoctors)">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function editDoctor(id) {
  const d = DB.get('doctors').find(x => x.id === id);
  if (!d) return;
  document.getElementById('doctorId').value = d.id;
  document.getElementById('dName').value = d.name;
  document.getElementById('dDept').value = d.dept;
  document.getElementById('dPhone').value = d.phone || '';
  document.getElementById('dFee').value = d.fee;
  document.getElementById('dDegree').value = d.degree || '';
  document.getElementById('dExp').value = d.exp || '';
  document.getElementById('dSchedule').value = d.schedule || '';
  document.getElementById('doctorModalTitle').textContent = 'ডাক্তার সম্পাদনা';
  openModal('doctorModal');
}

// ==================== APPOINTMENTS ====================
document.getElementById('appointmentForm').addEventListener('submit', e => {
  e.preventDefault();
  const patients = DB.get('patients');
  const doctors = DB.get('doctors');
  const patient = patients.find(p => p.id === document.getElementById('aPatient').value);
  const doctor = doctors.find(d => d.id === document.getElementById('aDoctor').value);
  if (!patient || !doctor) return toast('রোগী/ডাক্তার নির্বাচন করুন', 'error');

  const appointments = DB.get('appointments');
  appointments.push({
    id: DB.id(),
    patientId: patient.id, patientName: patient.name,
    doctorId: doctor.id, doctorName: doctor.name,
    date: document.getElementById('aDate').value,
    time: document.getElementById('aTime').value,
    notes: document.getElementById('aNotes').value.trim(),
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  });
  DB.set('appointments', appointments);
  closeModal('appointmentModal');
  toast('অ্যাপয়েন্টমেন্ট বুক হয়েছে');
  renderAppointments();
});

function renderAppointments() {
  const filter = document.getElementById('apptFilter')?.value || 'all';
  const today = new Date().toISOString().split('T')[0];
  let list = DB.get('appointments').slice().reverse();
  if (filter === 'today') list = list.filter(a => a.date === today);
  else if (filter === 'upcoming') list = list.filter(a => a.date >= today && a.status !== 'Cancelled' && a.status !== 'Completed');
  else if (filter === 'completed') list = list.filter(a => a.status === 'Completed');
  else if (filter === 'cancelled') list = list.filter(a => a.status === 'Cancelled');

  const wrap = document.getElementById('appointmentTableWrap');
  if (!list.length) { wrap.innerHTML = '<div class="empty-state">কোনো অ্যাপয়েন্টমেন্ট নেই</div>'; return; }
  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>তারিখ</th><th>সময়</th><th>রোগী</th><th>ডাক্তার</th><th>নোট</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr></thead>
      <tbody>${list.map(a => `
        <tr>
          <td>${a.date}</td><td>${a.time}</td>
          <td><strong>${a.patientName}</strong></td>
          <td>${a.doctorName}</td>
          <td>${a.notes || '—'}</td>
          <td>${statusBadge(a.status)}</td>
          <td>
            ${a.status === 'Confirmed' ? `
              <button class="btn btn-success btn-sm" onclick="updateApptStatus('${a.id}','Completed')">✓</button>
              <button class="btn btn-danger btn-sm" onclick="updateApptStatus('${a.id}','Cancelled')">✗</button>
            ` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteItem('appointments','${a.id}',renderAppointments)">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function updateApptStatus(id, status) {
  let list = DB.get('appointments');
  list = list.map(a => a.id === id ? { ...a, status } : a);
  DB.set('appointments', list);
  toast('স্ট্যাটাস আপডেট হয়েছে');
  renderAppointments();
  if (document.getElementById('dashboard').classList.contains('active')) renderDashboard();
}

document.getElementById('apptFilter')?.addEventListener('change', renderAppointments);

// ==================== PRESCRIPTIONS ====================
document.getElementById('prescriptionForm').addEventListener('submit', e => {
  e.preventDefault();
  const patients = DB.get('patients');
  const doctors = DB.get('doctors');
  const patient = patients.find(p => p.id === document.getElementById('rxPatient').value);
  const doctor = doctors.find(d => d.id === document.getElementById('rxDoctor').value);
  if (!patient || !doctor) return toast('রোগী/ডাক্তার নির্বাচন করুন', 'error');

  const list = DB.get('prescriptions');
  list.push({
    id: DB.id(),
    patientId: patient.id, patientName: patient.name,
    doctorId: doctor.id, doctorName: doctor.name,
    diagnosis: document.getElementById('rxDiagnosis').value.trim(),
    medicines: document.getElementById('rxMedicines').value.trim(),
    advice: document.getElementById('rxAdvice').value.trim(),
    followUp: document.getElementById('rxFollowUp').value,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  });
  DB.set('prescriptions', list);
  closeModal('prescriptionModal');
  toast('প্রেসক্রিপশন সংরক্ষিত');
  renderPrescriptions();
});

function renderPrescriptions() {
  const list = DB.get('prescriptions').slice().reverse();
  const wrap = document.getElementById('prescriptionTableWrap');
  if (!list.length) { wrap.innerHTML = '<div class="empty-state">কোনো প্রেসক্রিপশন নেই</div>'; return; }
  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>তারিখ</th><th>রোগী</th><th>ডাক্তার</th><th>ডায়াগনোসিস</th><th>অ্যাকশন</th></tr></thead>
      <tbody>${list.map(r => `
        <tr>
          <td>${r.date}</td>
          <td><strong>${r.patientName}</strong></td>
          <td>${r.doctorName}</td>
          <td>${r.diagnosis || '—'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="viewPrescription('${r.id}')">👁️ দেখুন</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('prescriptions','${r.id}',renderPrescriptions)">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function viewPrescription(id) {
  const r = DB.get('prescriptions').find(x => x.id === id);
  if (!r) return;
  const settings = DB.getObj('settings');
  document.getElementById('viewModalTitle').textContent = 'প্রেসক্রিপশন';
  document.getElementById('viewModalBody').innerHTML = `
    <div style="text-align:center;margin-bottom:16px;border-bottom:2px solid #2563eb;padding-bottom:12px">
      <h2 style="color:#2563eb">${settings.hospitalName || 'BM Hospital'}</h2>
      <p style="color:#64748b;font-size:.9rem">${settings.address || ''} | ${settings.phone || ''}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <div><strong>রোগী:</strong> ${r.patientName}</div>
      <div><strong>তারিখ:</strong> ${r.date}</div>
      <div><strong>ডাক্তার:</strong> ${r.doctorName}</div>
      <div><strong>ডায়াগনোসিস:</strong> ${r.diagnosis || '—'}</div>
    </div>
    <h4 style="margin-bottom:8px">Rx</h4>
    <pre style="background:#f8fafc;padding:14px;border-radius:8px;white-space:pre-wrap;font-family:inherit;line-height:1.7">${r.medicines}</pre>
    ${r.advice ? `<h4 style="margin:12px 0 6px">Advice</h4><p>${r.advice}</p>` : ''}
    ${r.followUp ? `<p style="margin-top:10px"><strong>পরবর্তী ভিজিট:</strong> ${r.followUp}</p>` : ''}
    <div style="margin-top:30px;text-align:right">
      <p>_____________________</p>
      <p><strong>${r.doctorName}</strong></p>
    </div>`;
  openModal('viewModal');
}

// ==================== LAB ====================
document.getElementById('labForm').addEventListener('submit', e => {
  e.preventDefault();
  const patients = DB.get('patients');
  const patient = patients.find(p => p.id === document.getElementById('labPatient').value);
  if (!patient) return toast('রোগী নির্বাচন করুন', 'error');

  const list = DB.get('labs');
  list.push({
    id: DB.id(),
    patientId: patient.id, patientName: patient.name,
    test: document.getElementById('labTest').value,
    fee: +document.getElementById('labFee').value,
    status: document.getElementById('labStatus').value,
    result: document.getElementById('labResult').value.trim(),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  });
  DB.set('labs', list);
  closeModal('labModal');
  toast('ল্যাব টেস্ট যোগ হয়েছে');
  renderLabs();
});

function renderLabs() {
  const filter = document.getElementById('labFilter')?.value || 'all';
  let list = DB.get('labs').slice().reverse();
  if (filter !== 'all') list = list.filter(l => l.status === filter);

  const wrap = document.getElementById('labTableWrap');
  if (!list.length) { wrap.innerHTML = '<div class="empty-state">কোনো ল্যাব টেস্ট নেই</div>'; return; }
  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>তারিখ</th><th>রোগী</th><th>টেস্ট</th><th>ফি</th><th>স্ট্যাটাস</th><th>ফলাফল</th><th>অ্যাকশন</th></tr></thead>
      <tbody>${list.map(l => `
        <tr>
          <td>${l.date}</td>
          <td><strong>${l.patientName}</strong></td>
          <td>${l.test}</td>
          <td>৳${l.fee}</td>
          <td>${statusBadge(l.status)}</td>
          <td>${l.result || '—'}</td>
          <td>
            ${l.status === 'Pending' ? `<button class="btn btn-success btn-sm" onclick="completeLab('${l.id}')">সম্পন্ন</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteItem('labs','${l.id}',renderLabs)">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function completeLab(id) {
  const result = prompt('ফলাফল লিখুন:');
  if (result === null) return;
  let list = DB.get('labs');
  list = list.map(l => l.id === id ? { ...l, status: 'Completed', result } : l);
  DB.set('labs', list);
  toast('ল্যাব টেস্ট সম্পন্ন');
  renderLabs();
}

document.getElementById('labFilter')?.addEventListener('change', renderLabs);

// ==================== BILLING ====================
document.getElementById('billingForm').addEventListener('submit', e => {
  e.preventDefault();
  const patients = DB.get('patients');
  const patient = patients.find(p => p.id === document.getElementById('bPatient').value);
  if (!patient) return toast('রোগী নির্বাচন করুন', 'error');

  const list = DB.get('bills');
  list.push({
    id: DB.id(),
    patientId: patient.id, patientName: patient.name,
    service: document.getElementById('bService').value,
    amount: +document.getElementById('bAmount').value,
    discount: +document.getElementById('bDiscount').value || 0,
    status: document.getElementById('bStatus').value,
    method: document.getElementById('bMethod').value,
    notes: document.getElementById('bNotes').value.trim(),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  });
  DB.set('bills', list);
  closeModal('billingModal');
  toast('বিল তৈরি হয়েছে');
  renderBills();
});

function renderBills() {
  const filter = document.getElementById('billFilter')?.value || 'all';
  let list = DB.get('bills').slice().reverse();
  if (filter !== 'all') list = list.filter(b => b.status === filter);

  const wrap = document.getElementById('billingTableWrap');
  if (!list.length) { wrap.innerHTML = '<div class="empty-state">কোনো বিল নেই</div>'; return; }
  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>তারিখ</th><th>রোগী</th><th>সার্ভিস</th><th>পরিমাণ</th><th>ডিসকাউন্ট</th><th>নেট</th><th>মেথড</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr></thead>
      <tbody>${list.map(b => {
        const net = Number(b.amount) - Number(b.discount || 0);
        return `<tr>
          <td>${b.date}</td>
          <td><strong>${b.patientName}</strong></td>
          <td>${b.service}</td>
          <td>৳${Number(b.amount).toLocaleString('bn-BD')}</td>
          <td>৳${Number(b.discount || 0).toLocaleString('bn-BD')}</td>
          <td><strong>৳${net.toLocaleString('bn-BD')}</strong></td>
          <td>${b.method || '—'}</td>
          <td>${statusBadge(b.status)}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="viewBill('${b.id}')">🖨️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('bills','${b.id}',renderBills)">🗑️</button>
          </td>
        </tr>`;
      }).join('')}
      </tbody>
    </table></div>`;
}

function viewBill(id) {
  const b = DB.get('bills').find(x => x.id === id);
  if (!b) return;
  const settings = DB.getObj('settings');
  const net = Number(b.amount) - Number(b.discount || 0);
  document.getElementById('viewModalTitle').textContent = 'ইনভয়েস';
  document.getElementById('viewModalBody').innerHTML = `
    <div style="text-align:center;margin-bottom:16px;border-bottom:2px solid #2563eb;padding-bottom:12px">
      <h2 style="color:#2563eb">${settings.hospitalName || 'BM Hospital'}</h2>
      <p style="color:#64748b;font-size:.9rem">${settings.address || ''} | ${settings.phone || ''}</p>
      <p><strong>INVOICE</strong></p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <div><strong>রোগী:</strong> ${b.patientName}</div>
      <div><strong>তারিখ:</strong> ${b.date}</div>
      <div><strong>ইনভয়েস ID:</strong> ${b.id.slice(-8).toUpperCase()}</div>
      <div><strong>পেমেন্ট:</strong> ${b.method || '—'}</div>
    </div>
    <table>
      <thead><tr><th>সার্ভিস</th><th>পরিমাণ</th><th>ডিসকাউন্ট</th><th>নেট</th></tr></thead>
      <tbody>
        <tr><td>${b.service}</td><td>৳${b.amount}</td><td>৳${b.discount || 0}</td><td><strong>৳${net}</strong></td></tr>
      </tbody>
    </table>
    <div style="margin-top:16px;text-align:right">
      <p>${statusBadge(b.status)}</p>
      ${b.notes ? `<p class="text-muted">নোট: ${b.notes}</p>` : ''}
    </div>`;
  openModal('viewModal');
}

document.getElementById('billFilter')?.addEventListener('change', renderBills);

// ==================== FEEDBACK ====================
document.getElementById('feedbackForm').addEventListener('submit', e => {
  e.preventDefault();
  const patients = DB.get('patients');
  const patient = patients.find(p => p.id === document.getElementById('fPatient').value);
  if (!patient) return toast('রোগী নির্বাচন করুন', 'error');

  const list = DB.get('feedbacks');
  list.push({
    id: DB.id(),
    patientId: patient.id, patientName: patient.name,
    tangibility: +document.getElementById('fTangibility').value,
    reliability: +document.getElementById('fReliability').value,
    responsiveness: +document.getElementById('fResponsiveness').value,
    assurance: +document.getElementById('fAssurance').value,
    empathy: +document.getElementById('fEmpathy').value,
    comment: document.getElementById('fComment').value.trim(),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  });
  DB.set('feedbacks', list);
  closeModal('feedbackModal');
  toast('ফিডব্যাক জমা হয়েছে');
  renderFeedback();
});

function renderFeedback() {
  const list = DB.get('feedbacks');
  const cards = document.getElementById('feedbackAvgCards');
  const wrap = document.getElementById('feedbackTableWrap');

  if (!list.length) {
    cards.innerHTML = '';
    wrap.innerHTML = '<div class="empty-state">কোনো ফিডব্যাক নেই</div>';
    return;
  }

  const avg = key => (list.reduce((s, f) => s + f[key], 0) / list.length).toFixed(2);
  const dims = [
    { key: 'tangibility', label: 'Tangibility', cls: 'c-blue' },
    { key: 'reliability', label: 'Reliability', cls: 'c-green' },
    { key: 'responsiveness', label: 'Responsiveness', cls: 'c-orange' },
    { key: 'assurance', label: 'Assurance', cls: 'c-purple' },
    { key: 'empathy', label: 'Empathy', cls: 'c-teal' }
  ];
  cards.innerHTML = dims.map(d => `
    <div class="stat-card ${d.cls}">
      <div class="stat-info">
        <span class="stat-label">${d.label}</span>
        <span class="stat-value">${avg(d.key)}</span>
      </div>
    </div>`).join('');

  wrap.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>তারিখ</th><th>রোগী</th><th>Tang</th><th>Rel</th><th>Resp</th><th>Assur</th><th>Emp</th><th>গড়</th><th>মন্তব্য</th></tr></thead>
      <tbody>${list.slice().reverse().map(f => {
        const g = ((f.tangibility + f.reliability + f.responsiveness + f.assurance + f.empathy) / 5).toFixed(1);
        return `<tr>
          <td>${f.date}</td>
          <td><strong>${f.patientName}</strong></td>
          <td>${f.tangibility}</td><td>${f.reliability}</td><td>${f.responsiveness}</td>
          <td>${f.assurance}</td><td>${f.empathy}</td>
          <td><strong>${g}</strong></td>
          <td>${f.comment || '—'}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table></div>`;
}

// ==================== REPORTS ====================
function renderReports() {
  const bills = DB.get('bills');
  const appointments = DB.get('appointments');
  const doctors = DB.get('doctors');

  // Revenue by month (last 6)
  const months = {};
  bills.filter(b => b.status === 'Paid').forEach(b => {
    const m = b.date?.slice(0, 7) || 'N/A';
    months[m] = (months[m] || 0) + (Number(b.amount) - Number(b.discount || 0));
  });
  const sortedMonths = Object.keys(months).sort().slice(-6);

  const ctx1 = document.getElementById('revenueChart');
  if (revenueChart) revenueChart.destroy();
  if (ctx1) {
    revenueChart = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: sortedMonths,
        datasets: [{ label: 'আয় (৳)', data: sortedMonths.map(m => months[m]), backgroundColor: '#2563eb' }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  // Dept distribution
  const deptCount = {};
  appointments.forEach(a => {
    const doc = doctors.find(d => d.id === a.doctorId);
    const dept = doc?.dept || 'Other';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });

  const ctx2 = document.getElementById('deptChart');
  if (deptChart) deptChart.destroy();
  if (ctx2) {
    deptChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: Object.keys(deptCount),
        datasets: [{
          data: Object.values(deptCount),
          backgroundColor: ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0d9488', '#dc2626', '#64748b']
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }
}

function exportData(key) {
  const data = DB.get(key);
  if (!data.length) return toast('কোনো ডেটা নেই', 'error');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bm_${key}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  toast('এক্সপোর্ট সম্পন্ন');
}

function exportAll() {
  const all = {
    patients: DB.get('patients'),
    doctors: DB.get('doctors'),
    appointments: DB.get('appointments'),
    bills: DB.get('bills'),
    labs: DB.get('labs'),
    prescriptions: DB.get('prescriptions'),
    feedbacks: DB.get('feedbacks'),
    settings: DB.getObj('settings'),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bm_hospital_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  toast('সম্পূর্ণ ব্যাকআপ ডাউনলোড হয়েছে');
}

// ==================== SETTINGS ====================
function loadSettings() {
  const s = DB.getObj('settings');
  document.getElementById('setHospitalName').value = s.hospitalName || '';
  document.getElementById('setAddress').value = s.address || '';
  document.getElementById('setPhone').value = s.phone || '';
  document.getElementById('setEmail').value = s.email || '';
}

document.getElementById('settingsForm').addEventListener('submit', e => {
  e.preventDefault();
  DB.setObj('settings', {
    hospitalName: document.getElementById('setHospitalName').value.trim(),
    address: document.getElementById('setAddress').value.trim(),
    phone: document.getElementById('setPhone').value.trim(),
    email: document.getElementById('setEmail').value.trim()
  });
  toast('সেটিংস সংরক্ষিত');
});

function clearAllData() {
  if (!confirm('সব ডেটা মুছে ফেলতে চান? এটি ফিরিয়ে আনা যাবে না!')) return;
  if (!confirm('নিশ্চিত? সব রোগী, বিল, অ্যাপয়েন্টমেন্ট মুছে যাবে!')) return;
  ['patients', 'doctors', 'appointments', 'bills', 'labs', 'prescriptions', 'feedbacks'].forEach(k => DB.set(k, []));
  toast('সব ডেটা মুছে ফেলা হয়েছে');
  seedData();
  navigate('dashboard');
}

// ==================== GENERIC DELETE ====================
function deleteItem(key, id, callback) {
  if (!confirm('মুছে ফেলতে চান?')) return;
  let list = DB.get(key);
  list = list.filter(x => x.id !== id);
  DB.set(key, list);
  toast('মুছে ফেলা হয়েছে');
  if (callback) callback();
}

// ==================== CLOSE MODAL ON OUTSIDE CLICK ====================
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  });
});

// Init date display etc. happens after login
