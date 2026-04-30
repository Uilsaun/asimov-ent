/* ══════════════════════════════════════════════
   COLLÈGE ASIMOV — Logique principale v4.0
   ══════════════════════════════════════════════ */
let currentUser = null;
let currentRole = 'eleve';
let currentDemandeFilter = 'en_attente';

/* ─── COULEURS MATIÈRES (harmonisées partout) ─── */
const MATIERE_COLORS = {
  'Mathématiques': { bg: '#F0F7FF', border: '#BFDBFE', text: '#1E3A8A', dot: '#2563EB' },
  'Français': { bg: '#FFF0F7', border: '#FBCFE8', text: '#831843', dot: '#DB2777' },
  'Histoire-Géo': { bg: '#FFFBEB', border: '#FDE68A', text: '#78350F', dot: '#D97706' },
  'SVT': { bg: '#F0FDF4', border: '#BBF7D0', text: '#14532D', dot: '#16A34A' },
  'Anglais': { bg: '#F0FDFA', border: '#99F6E4', text: '#134E4A', dot: '#0D9488' },
  'Physique-Chimie': { bg: '#F5F3FF', border: '#DDD6FE', text: '#312E81', dot: '#6366F1' },
  'Espagnol LV2': { bg: '#FFF7ED', border: '#FED7AA', text: '#7C2D12', dot: '#EA580C' },
  'EPS': { bg: '#FEFCE8', border: '#FEF08A', text: '#713F12', dot: '#CA8A04' },
  'Arts Plastiques': { bg: '#FAF5FF', border: '#E9D5FF', text: '#581C87', dot: '#9333EA' },
  'Musique': { bg: '#F5F3FF', border: '#DDD6FE', text: '#4C1D95', dot: '#7C3AED' },
  'Technologie': { bg: '#F0F9FF', border: '#BAE6FD', text: '#0C4A6E', dot: '#0284C7' },
  'Latin (initiation)': { bg: '#FFFBEB', border: '#FDE68A', text: '#78350F', dot: '#B45309' },
  'Latin': { bg: '#FFFBEB', border: '#FDE68A', text: '#78350F', dot: '#B45309' },
  'Accompagnement': { bg: '#F8FAFC', border: '#E2E8F0', text: '#1E293B', dot: '#64748B' },
  'Prépa Brevet': { bg: '#F0F7FF', border: '#BFDBFE', text: '#1E3A8A', dot: '#2563EB' },
  'Orientation/Avenir': { bg: '#F0FDF4', border: '#BBF7D0', text: '#14532D', dot: '#16A34A' },
  'Permanence': { bg: '#F1F5F9', border: '#CBD5E1', text: '#475569', dot: '#94A3B8' },
  'default': { bg: '#F8FAFC', border: '#E2E8F0', text: '#334155', dot: '#94A3B8' },
};
function getMatiereColor(matiere) {
  return MATIERE_COLORS[matiere] || MATIERE_COLORS['default'];
}

/* ─── UTILITAIRES ─── */
const $ = id => document.getElementById(id);
const show = id => { const el = $(id); if (el) el.classList.remove('hidden'); };
const hide = id => { const el = $(id); if (el) el.classList.add('hidden'); };

function getInitials(prenom, nom) { return ((prenom || '?')[0] + (nom || '?')[0]).toUpperCase(); }
function getAverageColor(avg) { if (avg >= 14) return 'note-good'; if (avg >= 10) return 'note-avg'; return 'note-bad'; }

function formatDateFR() {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const d = new Date();
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}

/* ══════════════════════════════════════════════
   NAVIGATION LOGIN
   ══════════════════════════════════════════════ */

function switchAuthTab(tab) {
  const formLogin = $('form-login');
  const formDemande = $('form-demande');
  const tabs = document.querySelectorAll('.auth-tab');
  if (tab === 'login') {
    formLogin.classList.remove('hidden');
    formDemande.classList.add('hidden');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');
  } else {
    formLogin.classList.add('hidden');
    formDemande.classList.remove('hidden');
    tabs[0].classList.remove('active');
    tabs[1].classList.add('active');
    // Reset du formulaire demande
    $('demande-form-content').classList.remove('hidden');
    $('demande-success-box').classList.add('hidden');
    $('demande-error').classList.add('hidden');
  }
}

function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('#form-login .role-tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`#form-login .role-tab[data-role="${role}"]`);
  if (tab) tab.classList.add('active');
}

function togglePassword() {
  const input = $('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function fillDemo(user, pass, role) {
  $('username').value = user;
  $('password').value = pass;
  switchRole(role);
}

/* ══════════════════════════════════════════════
   CONNEXION
   ══════════════════════════════════════════════ */

async function handleLogin(e) {
  e.preventDefault();
  const username = $('username').value.trim().toLowerCase();
  const password = $('password').value.trim();
  const errEl = $('login-error');
  const errMsg = $('login-error-msg');

  errEl.classList.add('hidden');

  const btn = document.querySelector('#form-login .btn-login');
  if (btn) { btn.disabled = true; btn.textContent = 'Connexion en cours…'; }

  const result = await AsimovAuth.login(username, password, currentRole);

  if (btn) { btn.disabled = false; btn.innerHTML = 'Se connecter →'; }

  if (!result.ok) {
    errMsg.textContent = result.msg;
    errEl.classList.remove('hidden');
    errEl.style.animation = 'none';
    setTimeout(() => errEl.style.animation = '', 10);
    return;
  }

  errEl.classList.add('hidden');
  currentUser = result.user;
  login(result.user);
}

function login(user) {
  hidePage('page-login');
  const rolesAdmin = ['principal', 'cpe', 'secretaire'];
  if (user.role === 'eleve') {
    setupEleveDashboard(user);
    showPage('page-eleve');
    setTimeout(() => updateNotifBadge('eleve'), 100);
  } else if (user.role === 'professeur') {
    setupProfDashboard(user);
    showPage('page-prof');
  } else if (user.role === 'parent') {
    setupParentDashboard(user);
    showPage('page-parent');
  } else if (rolesAdmin.includes(user.role)) {
    setupAdminDashboard(user);
    showPage('page-principal');
  }
}

async function logout() {
  await AsimovAuth.logout();
  currentUser = null;
  ['page-eleve', 'page-prof', 'page-principal', 'page-parent'].forEach(hidePage);
  showPage('page-login');
  $('username').value = '';
  $('password').value = '';
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  const firstTab = document.querySelector('#form-login .role-tab[data-role="eleve"]');
  if (firstTab) firstTab.classList.add('active');
  currentRole = 'eleve';
  switchAuthTab('login');
}

function showPage(id) { const el = $(id); if (el) { el.classList.add('active'); el.style.display = 'flex'; } }
function hidePage(id) { const el = $(id); if (el) { el.classList.remove('active'); el.style.display = 'none'; } }

/* ══════════════════════════════════════════════
   DEMANDE DE COMPTE
   ══════════════════════════════════════════════ */

async function handleDemande(e) {
  e.preventDefault();
  const identifiant = $('dem-identifiant').value.trim().toLowerCase();
  const pwd1 = $('dem-password').value;
  const pwd2 = $('dem-password2').value;
  const errEl = $('demande-error');
  const errMsg = $('demande-error-msg');

  errEl.classList.add('hidden');

  if (pwd1 !== pwd2) {
    errMsg.textContent = 'Les deux mots de passe ne correspondent pas.';
    errEl.classList.remove('hidden'); return;
  }

  const result = await AsimovDB.soumettreDemandeCompte(identifiant, pwd1);

  if (!result.ok) {
    errMsg.textContent = result.msg;
    errEl.classList.remove('hidden'); return;
  }

  // Succès
  $('demande-form-content').classList.add('hidden');
  $('demande-success-box').classList.remove('hidden');
  $('demande-success-titre').textContent = `Demande envoyée pour ${result.eleve.prenom} ${result.eleve.nom} !`;
  $('demande-success-msg').innerHTML =
    `Classe : <strong>${result.eleve.classe}</strong><br><br>
     Le directeur va examiner votre demande.<br>
     Une fois validée, connectez-vous avec :<br>
     <strong style="font-family:'JetBrains Mono',monospace">${identifiant}</strong>`;
}

function checkPwdStrength(val) {
  const bar = $('dem-pwd-bar');
  const label = $('dem-pwd-label');
  if (!bar) return;
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { pct: '20%', color: '#EF4444', label: 'Très faible' },
    { pct: '40%', color: '#F97316', label: 'Faible' },
    { pct: '60%', color: '#EAB308', label: 'Moyen' },
    { pct: '80%', color: '#22C55E', label: 'Fort' },
    { pct: '100%', color: '#059669', label: 'Très fort 💪' },
  ];
  const lvl = levels[Math.min(score, 4)];
  bar.style.width = lvl.pct;
  bar.style.background = lvl.color;
  label.textContent = val.length ? lvl.label : '';
}

/* ══════════════════════════════════════════════
   DASHBOARD ADMIN (PRINCIPAL / CPE / SECRÉTAIRE)
   ══════════════════════════════════════════════ */

/* ─── Données absences profs ─── */
const ABSENCES_PROFS = [
  { id: 'abs1', profId: 'prof1', profNom: 'M. Dupont', matiere: 'Mathématiques', dateDebut: '18/03/2026', dateFin: '19/03/2026', motif: 'maladie', note: 'Certificat médical reçu', remplace: true, remplacant: 'M. Bernard', actif: true },
  { id: 'abs2', profId: 'prof2', profNom: 'Mme Laurent', matiere: 'Français', dateDebut: '18/03/2026', dateFin: '18/03/2026', motif: 'formation', note: 'Formation académique Paris', remplace: false, remplacant: '', actif: true },
];

/* ─── Retards professeurs ─── */
let RETARDS_PROFS = [
  { id: 'ret1', profId: 'prof1', profNom: 'M. Dupont', matiere: 'Mathématiques', heure: '08h00', classe: '4ème B', motif: 'Bouchon sur A6 — signalé à 07h52', duree: 15, statut: 'en_cours', date: '19/03/2026', lu: false },
  { id: 'ret2', profId: 'prof2', profNom: 'Mme Laurent', matiere: 'Français', heure: '09h00', classe: '5ème A', motif: 'Panne de voiture', duree: 20, statut: 'resolu', date: '18/03/2026', lu: true },
];

/* ─── Messages admin enrichis ─── */
const ADMIN_MESSAGES_DATA = {
  principal1: [
    { id: 1, lu: false, favori: false, corbeille: false, dateCorbeille: null, expediteur: 'Académie de Paris', sujet: 'Circulaire n°2025-04', corps: 'Madame,\n\nVeuillez trouver la circulaire relative aux évaluations nationales.\n\nAcadémie de Paris', date: '08/03/2025 – 09h00', role: 'institutionnel' },
    { id: 2, lu: true, favori: true, corbeille: false, dateCorbeille: null, expediteur: 'M. Dupont (Mathématiques)', sujet: 'Demande de matériel — Salle C12', corps: 'Bonjour,\n\nJe souhaiterais signaler que le projecteur de la salle C12 est défaillant.\n\nCordialement,\nM. Dupont', date: '12/03/2025 – 11h20', role: 'professeur' },
    { id: 3, lu: false, favori: false, corbeille: false, dateCorbeille: null, expediteur: 'Parents Lefebvre', sujet: 'RDV entretien — Martin 4ème B', corps: 'Bonjour Madame la Directrice,\n\nNous souhaiterions convenir d\'un rendez-vous concernant notre fils Martin.\n\nCordialement', date: '15/03/2025 – 14h35', role: 'parent' },
  ],
};

/* ─── Notifs admin ─── */
const NOTIFS_ADMIN = {
  principal1: [
    { id: 1, lu: false, icone: '🔴', titre: 'M. Dupont absent aujourd\'hui', detail: 'Mathématiques — 6 classes impactées', heure: 'Ce matin', cible: 'admin-absences-profs' },
    { id: 2, lu: false, icone: '⏰', titre: 'Retard signalé — M. Dupont', detail: '4ème B 08h00 — Bouchon sur A6 (~15 min)', heure: 'Il y a 10min', cible: 'admin-retards-profs' },
    { id: 3, lu: false, icone: '📋', titre: '2 demandes de compte en attente', detail: 'Nouvelles demandes à valider', heure: 'Il y a 1h', cible: 'admin-demandes' },
    { id: 4, lu: false, icone: '✉️', titre: 'Message des parents Lefebvre', detail: 'RDV entretien Martin 4ème B', heure: 'Hier', cible: 'admin-messagerie' },
  ],
};

/* ─── Notifs CPE ─── */
const NOTIFS_CPE = {
  cpe1: [
    { id: 1, lu: false, icone: '⚠️', titre: 'Absence élève — Martin Lefebvre', detail: '4ème B — Non justifiée depuis 2j', heure: 'Ce matin', cible: 'cpe-absences-eleves' },
    { id: 2, lu: false, icone: '📅', titre: 'Réunion parents — Jeudi 20/03', detail: 'Salle de réunion A — 17h30', heure: 'Il y a 2h', cible: 'cpe-reunions' },
  ],
};

function setupAdminDashboard(user) {
  $('admin-avatar').textContent = getInitials(user.prenom, user.nom);
  $('admin-fullname').textContent = `${user.prenom} ${user.nom}`;
  $('admin-poste').textContent = user.poste || user.role;
  if ($('admin-welcome')) $('admin-welcome').textContent = `Bonjour, ${user.nom} 👋`;
  if ($('admin-today-date')) $('admin-today-date').textContent = formatDateFR();

  const sidebar = document.querySelector('#page-principal .sidebar-principal');
  if (user.role === 'cpe') {
    sidebar.style.background = 'linear-gradient(160deg, #14532D, #16A34A)';
    $('admin-role-label').textContent = 'Espace CPE';
    $('admin-avatar').style.background = 'linear-gradient(135deg,#15803D,#4ADE80)';
    // Restreindre la nav CPE : masquer les éléments non autorisés
    document.querySelectorAll('#page-principal .nav-item').forEach(item => {
      const onclick = item.getAttribute('onclick') || '';
      const allowed = ['admin-accueil', 'cpe-absences-eleves', 'cpe-emploi-temps', 'cpe-planning-prof', 'cpe-reunions', 'admin-messagerie'];
      const isAllowed = allowed.some(a => onclick.includes(a));
      item.style.display = isAllowed ? '' : 'none';
    });
    // Afficher les items CPE spécifiques
    document.querySelectorAll('.cpe-only').forEach(el => el.style.display = '');
  } else if (user.role === 'secretaire') {
    sidebar.style.background = 'linear-gradient(160deg, #1E1B4B, #4338CA)';
    $('admin-role-label').textContent = 'Secrétariat';
    $('admin-avatar').style.background = 'linear-gradient(135deg,#4338CA,#818CF8)';
  } else {
    sidebar.style.background = 'linear-gradient(160deg, #0C1E4A, #1E3A8A)';
    $('admin-role-label').textContent = 'Direction';
  }

  renderDemandes('en_attente');
  renderComptes();
  if (user.role === 'secretaire') setTimeout(applySecretaireRestrictions, 80);
  renderAdminClasses();
  renderFaqMessages();
  renderAdminAccueil(user);
  renderRetardsProfs();
  updateAdminNotifBadge();
}

async function renderAdminAccueil(user) {
  const toutes = await Demandes.getAll();
  const demandes = toutes.filter(d => d.statut === 'en_attente').length;
  const comptes = Auth.getAll().length;
  const absAuj = ABSENCES_PROFS.filter(a => a.actif).length;
  const retards = RETARDS_PROFS.filter(r => r.statut === 'en_cours').length;
  const msgs = (ADMIN_MESSAGES_DATA[user.id] || []).filter(m => !m.lu && !m.corbeille).length;
  if ($('dash-stat-demandes')) $('dash-stat-demandes').textContent = demandes;
  if ($('dash-stat-comptes')) $('dash-stat-comptes').textContent = comptes;
  if ($('dash-stat-absences')) $('dash-stat-absences').textContent = absAuj;
  if ($('dash-stat-retards')) $('dash-stat-retards').textContent = retards;
  if ($('dash-stat-messages')) $('dash-stat-messages').textContent = msgs;

  const absEl = $('admin-absences-today');
  if (absEl) {
    const actives = ABSENCES_PROFS.filter(a => a.actif);
    absEl.innerHTML = actives.length ? actives.map(a => renderAbsenceCard(a, true)).join('')
      : '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:20px">Aucune absence aujourd\'hui 🎉</p>';
  }

  const demandesEl = $('admin-demandes-recent');
  if (demandesEl) {
    const recentes = toutes.slice(0, 3);
    demandesEl.innerHTML = recentes.length ? recentes.map(d => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F1F5F9">
        <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#1E3A8A,#3B82F6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${(d.prenom[0] + d.nom[0]).toUpperCase()}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600;color:#0F172A">${d.prenom} ${d.nom}</div><div style="font-size:11px;color:#64748B">${d.classe} · ${d.dateDemande}</div></div>
        <span class="${d.statut === 'en_attente' ? 'badge-attente' : d.statut === 'approuve' ? 'badge-approuve' : 'badge-refuse'}">${d.statut === 'en_attente' ? 'En attente' : d.statut === 'approuve' ? 'Approuvé' : 'Refusé'}</span>
      </div>`).join('')
      : '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:20px">Aucune demande</p>';
  }
}

/* ─── NAVIGATION ADMIN ─── */
function showAdminSection(id, linkEl) {
  document.querySelectorAll('#page-principal .dash-section').forEach(s => s.classList.remove('active'));
  $(`section-${id}`)?.classList.add('active');
  if (linkEl) {
    document.querySelectorAll('#page-principal .nav-item').forEach(n => n.classList.remove('active'));
    linkEl.classList.add('active');
  }
  if (id === 'admin-accueil' && currentUser) renderAdminAccueil(currentUser);
  if (id === 'admin-demandes') renderDemandes(currentDemandeFilter);
  if (id === 'admin-comptes') renderComptes();
  if (id === 'admin-absences-profs') renderAbsencesProfs('actives');
  if (id === 'admin-retards-profs') renderRetardsProfs();
  if (id === 'admin-messagerie' && currentUser) renderAdminMailFull(currentUser);
  if (id === 'admin-faq-messages') renderFaqMessages();
  if (id === 'admin-stats') renderStatsDirection();
  if (id === 'cpe-emploi-temps') initCpeEdtSelect();
  if (id === 'cpe-planning-prof') initCpePlanningProfSelect();
  // Sync notifs cloche : marquer les notifs correspondant à cette section comme lues
  const notifStore = currentUser?.role === 'cpe' ? NOTIFS_CPE : NOTIFS_ADMIN;
  if (currentUser && notifStore[currentUser.id]) {
    notifStore[currentUser.id].filter(n => n.cible === id && !n.lu).forEach(n => n.lu = true);
    updateAdminNotifBadge();
  }
}

/* ─── COMPTES PAR STATUT ─── */
let currentComptesTab = 'tous';
let currentComptesSearch = '';

function switchComptesTab(tab) {
  currentComptesTab = tab;
  document.querySelectorAll('.msg-tab[id^="comptes-tab"]').forEach(t => t.classList.remove('active'));
  $(`comptes-tab-${tab}`)?.classList.add('active');
  renderComptes();
}
function filterComptes(q) { currentComptesSearch = q.toLowerCase(); renderComptes(); }

function renderComptes() {
  const tous = Auth.getAll();
  const container = $('comptes-list');
  if (!container) return;
  const roleColors = { eleve: '#3B82F6', professeur: '#10B981', principal: '#7C3AED', cpe: '#16A34A', secretaire: '#4338CA' };
  const roleLabels = { eleve: 'Élève', professeur: 'Professeur', principal: 'Principal', cpe: 'CPE', secretaire: 'Secrétaire' };
  const roleIcons = { eleve: '🎒', professeur: '📚', principal: '🏫', cpe: '🛡️', secretaire: '📋' };
  const dirRoles = ['principal', 'cpe', 'secretaire'];
  const all = tous;

  // Badges onglets
  [['tous', all], ['eleve', all.filter(u => u.role === 'eleve')], ['professeur', all.filter(u => u.role === 'professeur')], ['direction', all.filter(u => dirRoles.includes(u.role))]].forEach(([key, arr]) => {
    const b = $(`badge-comptes-${key}`); if (b) b.textContent = arr.length;
  });

  let liste = currentComptesTab === 'tous' ? all : currentComptesTab === 'direction' ? all.filter(u => dirRoles.includes(u.role)) : all.filter(u => u.role === currentComptesTab);
  if (currentComptesSearch) liste = liste.filter(u => `${u.prenom} ${u.nom} ${u.id} ${u.classe || ''} ${u.matiere || ''} ${u.poste || ''}`.toLowerCase().includes(currentComptesSearch));

  if (!liste.length) { container.innerHTML = '<p style="text-align:center;padding:40px;color:#94A3B8">Aucun compte trouvé</p>'; return; }

  container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">${liste.map(u => {
    const col = roleColors[u.role] || '#64748B', label = roleLabels[u.role] || u.role, icon = roleIcons[u.role] || '👤', detail = u.classe || u.matiere || u.poste || '';
    return `<div style="background:#fff;border-radius:12px;padding:16px 18px;border:1px solid #E2E8F0;box-shadow:0 1px 4px rgba(0,0,0,.04);display:flex;align-items:center;gap:14px">
      <div style="width:44px;height:44px;border-radius:12px;background:${col}22;border:2px solid ${col}44;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px;color:#0F172A">${u.prenom} ${u.nom}</div>
        <div style="font-size:11px;color:#64748B;margin-top:2px">${detail}</div>
        <div style="font-size:10px;color:#94A3B8;font-family:'JetBrains Mono',monospace;margin-top:2px">${u.id}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
        <span style="background:${col}18;color:${col};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${label}</span>
        <span style="background:#F0FDF4;color:#15803D;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600">● Actif</span>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* ─── ABSENCES PROFESSEURS ─── */
let currentAbsTab = 'actives';

function switchAbsTab(tab) {
  currentAbsTab = tab;
  document.querySelectorAll('[id^="abs-tab-"]').forEach(t => t.classList.remove('active'));
  $(`abs-tab-${tab}`)?.classList.add('active');
  renderAbsencesProfs(tab);
}

function renderAbsencesProfs(tab) {
  const actives = ABSENCES_PROFS.filter(a => a.actif);
  if ($('abs-stat-today')) $('abs-stat-today').textContent = actives.length;
  if ($('abs-stat-semaine')) $('abs-stat-semaine').textContent = ABSENCES_PROFS.length;
  if ($('abs-stat-remplaces')) $('abs-stat-remplaces').textContent = ABSENCES_PROFS.filter(a => a.remplace).length;
  const badge = $('abs-profs-badge');
  if (badge) { badge.textContent = actives.length; badge.style.display = actives.length > 0 ? 'inline-flex' : 'none'; }
  const liste = tab === 'actives' ? actives : ABSENCES_PROFS;
  const container = $('absences-profs-list');
  if (!container) return;
  container.innerHTML = liste.length ? liste.map(a => renderAbsenceCard(a, false)).join('')
    : '<p style="color:#94A3B8;text-align:center;padding:40px">Aucune absence à afficher</p>';
}

function renderAbsenceCard(a, compact) {
  const motifLabels = { maladie: '🤒 Maladie', formation: '📚 Formation', conge: '🏖 Congé', retard: '⏱ Retard', autre: '📌 Autre' };
  const motifColors = { maladie: '#FEE2E2', formation: '#EFF6FF', conge: '#F0FDF4', retard: '#FEF3C7', autre: '#F1F5F9' };
  const motifText = { maladie: '#DC2626', formation: '#1D4ED8', conge: '#15803D', retard: '#D97706', autre: '#475569' };
  return `<div style="background:#fff;border-radius:12px;border:1px solid #E2E8F0;box-shadow:0 1px 4px rgba(0,0,0,.05);overflow:hidden;margin-bottom:4px">
    <div style="display:flex;align-items:center;gap:14px;padding:16px 20px">
      <div style="width:44px;height:44px;border-radius:12px;background:#FEF2F2;border:2px solid #FECACA;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">👨‍🏫</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;color:#0F172A">${a.profNom}</div>
        <div style="font-size:12px;color:#64748B;margin-top:2px">${a.matiere} · Du ${a.dateDebut} au ${a.dateFin}</div>
        ${a.note ? `<div style="font-size:11px;color:#94A3B8;margin-top:3px;font-style:italic">${a.note}</div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <span style="background:${motifColors[a.motif] || '#F1F5F9'};color:${motifText[a.motif] || '#475569'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${motifLabels[a.motif] || a.motif}</span>
        ${a.actif ? '<span style="background:#FEF2F2;color:#DC2626;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700">● En cours</span>' : '<span style="background:#F0FDF4;color:#15803D;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700">✓ Terminée</span>'}
      </div>
      ${!compact ? `<button onclick="supprimerAbsence('${a.id}')" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:6px 10px;cursor:pointer;color:#DC2626;font-size:12px;margin-left:4px;font-family:'Sora',sans-serif">Clôturer</button>` : ''}
    </div>
    ${a.remplace && !compact ? `<div style="background:#F0FDF4;border-top:1px solid #BBF7D0;padding:10px 20px;font-size:12px;color:#15803D"><strong>✓ Remplacé par :</strong> ${a.remplacant}</div>` : ''}
    ${!a.remplace && !compact ? `<div style="background:#FEF3C7;border-top:1px solid #FDE68A;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#D97706"><span>⚠️ Remplacement non confirmé</span><button onclick="showToast('🔔 Notification envoyée aux familles')" style="background:#fff;border:1px solid #FDE68A;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;color:#D97706;font-weight:600;font-family:'Sora',sans-serif">Notifier les familles</button></div>` : ''}
  </div>`;
}

function openModalAbsenceProf() { $('modal-absence-prof')?.classList.remove('hidden'); }
function closeModalAbsenceProf() { $('modal-absence-prof')?.classList.add('hidden'); }

function validerAbsenceProf() {
  const profId = $('abs-prof-select')?.value;
  const profNomRaw = $('abs-prof-select')?.selectedOptions[0]?.text || '';
  const debut = $('abs-date-debut')?.value;
  const fin = $('abs-date-fin')?.value;
  const motif = $('abs-motif')?.value;
  const note = $('abs-note')?.value;
  if (!profId || !debut) { showToast('⚠️ Sélectionnez un professeur et une date'); return; }
  const debutFR = new Date(debut).toLocaleDateString('fr-FR');
  const finFR = fin ? new Date(fin).toLocaleDateString('fr-FR') : debutFR;
  const matiere = profId === 'prof1' ? 'Mathématiques' : 'Français';
  const profNom = profNomRaw.split(' (')[0];
  ABSENCES_PROFS.unshift({ id: 'abs' + Date.now(), profId, profNom, matiere, dateDebut: debutFR, dateFin: finFR, motif, note, remplace: false, remplacant: '', actif: true });
  if (currentUser?.id && NOTIFS_ADMIN[currentUser.id]) {
    NOTIFS_ADMIN[currentUser.id].unshift({ id: Date.now(), lu: false, icone: '🔴', titre: `${profNom} — absence signalée`, detail: `${matiere} du ${debutFR} au ${finFR}`, heure: 'À l\'instant', cible: 'admin-absences-profs' });
    updateAdminNotifBadge();
  }
  closeModalAbsenceProf();
  renderAbsencesProfs(currentAbsTab);
  if (currentUser) renderAdminAccueil(currentUser);
  showToast(`✅ Absence de ${profNom} enregistrée`);
}

function supprimerAbsence(id) {
  const a = ABSENCES_PROFS.find(a => a.id === id);
  if (a) a.actif = false;
  renderAbsencesProfs(currentAbsTab);
  if (currentUser) renderAdminAccueil(currentUser);
  showToast('✓ Absence clôturée');
}

/* ─── RETARDS PROFESSEURS ─── */
function renderRetardsProfs() {
  const container = $('retards-profs-list');
  if (!container) return;
  if (!RETARDS_PROFS.length) {
    container.innerHTML = '<p style="text-align:center;color:#94A3B8;padding:40px;font-size:13px">Aucun retard signalé</p>';
    return;
  }
  container.innerHTML = RETARDS_PROFS.map(r => `
    <div style="background:#fff;border-radius:12px;border:1px solid ${r.statut === 'en_cours' ? '#FDE68A' : '#E2E8F0'};box-shadow:0 1px 4px rgba(0,0,0,.05);overflow:hidden;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:14px;padding:16px 20px">
        <div style="width:44px;height:44px;border-radius:12px;background:#FEF9C3;border:2px solid #FDE68A;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">⏰</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px;color:#0F172A">${r.profNom} <span style="font-weight:400;font-size:12px;color:#64748B">— ${r.matiere}</span></div>
          <div style="font-size:12px;color:#64748B;margin-top:2px">${r.classe} · ${r.heure} · ${r.date}</div>
          <div style="font-size:12px;color:#92400E;margin-top:4px;font-style:italic">💬 ${r.motif}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <span style="background:${r.statut === 'en_cours' ? '#FEF9C3' : '#F0FDF4'};color:${r.statut === 'en_cours' ? '#92400E' : '#15803D'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${r.statut === 'en_cours' ? '⏳ En cours' : '✓ Résolu'}</span>
          <span style="font-size:11px;color:#94A3B8">~${r.duree} min</span>
        </div>
        ${r.statut === 'en_cours' ? `<button onclick="resoudreRetard('${r.id}')" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:6px 12px;cursor:pointer;color:#15803D;font-size:12px;font-weight:600;font-family:'Sora',sans-serif;margin-left:4px">Résoudre</button>` : ''}
      </div>
    </div>`).join('');
}

function resoudreRetard(id) {
  const r = RETARDS_PROFS.find(r => r.id === id);
  if (r) { r.statut = 'resolu'; renderRetardsProfs(); showToast('✓ Retard marqué comme résolu'); }
}

function openModalRetardProf() { $('modal-retard-prof')?.classList.remove('hidden'); }
function closeModalRetardProf() { $('modal-retard-prof')?.classList.add('hidden'); }

function validerRetardProf() {
  const profId = $('ret-prof-select')?.value;
  const profNom = $('ret-prof-select')?.selectedOptions[0]?.text.split(' (')[0] || '';
  const matiere = profId === 'prof1' ? 'Mathématiques' : 'Français';
  const heure = $('ret-heure')?.value || '08h00';
  const classe = $('ret-classe')?.value || '–';
  const motif = $('ret-motif')?.value || '';
  const duree = parseInt($('ret-duree')?.value) || 15;
  if (!profId || !motif) { showToast('⚠️ Remplissez tous les champs'); return; }
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  RETARDS_PROFS.unshift({ id: 'ret' + Date.now(), profId, profNom, matiere, heure, classe, motif, duree, statut: 'en_cours', date: dateStr, lu: false });
  // Notif admin
  if (currentUser?.id && NOTIFS_ADMIN[currentUser.id]) {
    NOTIFS_ADMIN[currentUser.id].unshift({ id: Date.now(), lu: false, icone: '⏰', titre: `Retard — ${profNom}`, detail: `${classe} ${heure} — ${motif}`, heure: 'À l\'instant', cible: 'admin-retards-profs' });
    updateAdminNotifBadge();
  }
  closeModalRetardProf();
  renderRetardsProfs();
  showToast(`⏰ Retard de ${profNom} enregistré`);
}

function validerRetardProfFromModal() {
  const motifType = $('ret-motif-type')?.selectedOptions[0]?.text.split(' ').slice(1).join(' ') || '';
  const motifDetail = $('ret-motif')?.value?.trim();
  const fullMotif = motifDetail ? `${motifType} — ${motifDetail}` : motifType;
  if ($('ret-motif')) $('ret-motif').value = fullMotif;
  validerRetardProf();
}

function initCpeEdtSelect() {
  const sel = $('cpe-classe-select');
  if (!sel) return;
  // Remplir avec toutes les classes de DB.emploiDuTemps triées
  const classes = Object.keys(DB.emploiDuTemps).sort((a, b) => {
    const niveaux = ['6ème', '5ème', '4ème', '3ème'];
    const na = niveaux.findIndex(n => a.startsWith(n));
    const nb = niveaux.findIndex(n => b.startsWith(n));
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
  const current = sel.value;
  sel.innerHTML = '<option value="">— Choisir une classe —</option>' +
    classes.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
}

function renderCpeEdt() {
  const classe = $('cpe-classe-select')?.value;
  if (!classe) return;
  const edt = DB.emploiDuTemps[classe];
  if (!edt) return;
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  // Collecter tous les créneaux uniques dans l'ordre
  const allSlots = [];
  jours.forEach(j => (edt[j] || []).forEach(s => { if (!allSlots.includes(s.heure)) allSlots.push(s.heure); }));
  let html = `<div class="timetable" style="gap:3px"><div class="tt-header"></div>`;
  jours.forEach(j => { html += `<div class="tt-header">${j}</div>`; });
  allSlots.forEach(heure => {
    html += `<div class="tt-time" style="font-size:10px;justify-content:flex-end;padding-right:6px">${heure.split(' – ')[0]}</div>`;
    jours.forEach(j => {
      const slot = (edt[j] || []).find(s => s.heure === heure);
      if (!slot) { html += `<div class="tt-cell empty"></div>`; return; }
      if (slot.type === 'pause') {
        html += `<div class="tt-cell" style="background:#fff;border-left:3px solid #E2E8F0;min-height:30px;justify-content:center"><div style="font-size:9px;color:#CBD5E1;text-align:center;font-style:italic">${slot.label}</div></div>`;
        return;
      }
      if (slot.type === 'repas') {
        html += `<div class="tt-cell" style="background:#fff;border-left:3px solid #E2E8F0;min-height:40px;justify-content:center"><div style="font-size:9px;color:#CBD5E1;text-align:center;font-style:italic">${slot.label}</div></div>`;
        return;
      }
      if (slot.type === 'vide' || !slot.matiere) { html += `<div class="tt-cell empty"></div>`; return; }
      const col = getMatiereColor(slot.matiere);
      html += `<div class="tt-cell" style="background:${col.bg};border-left:4px solid ${col.dot}"><div style="font-weight:700;font-size:10px;color:${col.text}">${slot.matiere}</div><div style="font-size:9px;color:${col.text};opacity:.8">${slot.prof}</div><div style="font-size:9px;color:${col.text};opacity:.6">${slot.salle}</div></div>`;
    });
  });
  html += '</div>';
  const container = $('cpe-edt-container');
  if (container) container.innerHTML = html;
}

/* ─── NOTIFICATIONS ADMIN ─── */
function toggleAdminNotifs() {
  const panel = $('notif-panel-admin');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderAdminNotifs();
}
function getAdminNotifStore() {
  if (!currentUser) return [];
  if (currentUser.role === 'cpe') return NOTIFS_CPE[currentUser.id] || [];
  return NOTIFS_ADMIN[currentUser.id] || [];
}
function renderAdminNotifs() {
  const notifs = getAdminNotifStore();
  const list = $('notif-list-admin');
  if (!list) return;
  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.lu ? 'lu' : ''}" onclick="handleAdminNotifClick(${n.id})" style="cursor:pointer">
      <div class="notif-icone">${n.icone}</div>
      <div class="notif-content">
        <div class="notif-titre">${n.titre}</div>
        <div class="notif-detail">${n.detail}</div>
        <div class="notif-heure">${n.heure}${n.cible ? ` <span style="font-size:10px;background:#EFF6FF;color:#1D4ED8;padding:1px 6px;border-radius:10px;margin-left:4px">→ Voir</span>` : ''}</div>
      </div>
      ${!n.lu ? '<div class="notif-unread-dot"></div>' : ''}
    </div>`).join('') || '<p style="text-align:center;color:#94A3B8;padding:20px;font-size:13px">Aucune notification</p>';
}
function handleAdminNotifClick(id) {
  const notifs = getAdminNotifStore();
  const notif = notifs.find(n => n.id === id);
  if (!notif) return;
  notif.lu = true; renderAdminNotifs(); updateAdminNotifBadge();
  $('notif-panel-admin')?.classList.add('hidden');
  if (notif.cible) { const l = document.querySelector(`#page-principal .nav-item[onclick*="${notif.cible}"]`); showAdminSection(notif.cible, l); }
}
function clearAllAdminNotifs() { getAdminNotifStore().forEach(n => n.lu = true); renderAdminNotifs(); updateAdminNotifBadge(); }
function updateAdminNotifBadge() {
  const count = getAdminNotifStore().filter(n => !n.lu).length;
  const badge = $('notif-count-admin'), dot = $('notif-dot-admin');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  if (dot) { dot.style.display = count > 0 ? 'block' : 'none'; }
}

/* ─── MESSAGERIE ADMIN ENRICHIE ─── */
let adminMsgCurrentTab = 'recus';

function switchAdminMsgTab(tab) {
  adminMsgCurrentTab = tab;
  document.querySelectorAll('[id^="admin-msg-tab-"]').forEach(t => t.classList.remove('active'));
  document.getElementById('admin-msg-tab-' + tab)?.classList.add('active');
  document.querySelectorAll('[id^="admin-msg-panel-"]').forEach(p => p.classList.add('hidden'));
  document.getElementById('admin-msg-panel-' + tab)?.classList.remove('hidden');
  // On ne touche JAMAIS au panneau droit — le message reste affiché quel que soit l'onglet actif
}

function renderAdminMailFull(user) {
  if (!ADMIN_MESSAGES_DATA[user.id]) ADMIN_MESSAGES_DATA[user.id] = (DB.messages[user.id] || []).map(m => ({ ...m, favori: false, corbeille: false, dateCorbeille: null, role: 'inconnu' }));
  const msgs = ADMIN_MESSAGES_DATA[user.id];
  const roleColors = { institutionnel: '#7C3AED', professeur: '#10B981', parent: '#F59E0B', eleve: '#3B82F6', inconnu: '#94A3B8' };
  const roleLabels = { institutionnel: 'Institution', professeur: 'Professeur', parent: 'Parent', eleve: 'Élève', inconnu: '?' };

  const nonLus = msgs.filter(m => !m.lu && !m.corbeille).length;
  const favs = msgs.filter(m => m.favori && !m.corbeille).length;
  const corb = msgs.filter(m => m.corbeille);

  const bR = $('admin-badge-recus'), bF = $('admin-badge-favoris'), bC = $('admin-badge-corbeille');
  if (bR) bR.textContent = nonLus || ''; if (bF) bF.textContent = favs || ''; if (bC) bC.textContent = corb.length || '';
  const navB = $('admin-msg-badge'); if (navB) { navB.textContent = nonLus; navB.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }

  function itemHtml(m) {
    const col = roleColors[m.role] || '#94A3B8', lab = roleLabels[m.role] || '?';
    return `<div class="pronote-mail-item ${!m.lu ? 'unread' : ''}" id="admin-pmi-${m.id}" onclick="openAdminMsg(${m.id},'${user.id}')">
      <div class="pmi-header">
        <div style="display:flex;align-items:center;gap:5px">
          ${!m.lu ? '<div class="pmi-unread-dot"></div>' : ''}
          <span class="pmi-sender">${m.expediteur}</span>
          <span style="background:${col}18;color:${col};padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700">${lab}</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px">
          ${m.favori ? '<span style="color:#F59E0B;font-size:12px">★</span>' : ''}
          <span class="pmi-date">${m.date.split('–')[0].trim()}</span>
        </div>
      </div>
      <div class="pmi-subject">${m.sujet}</div>
      <div class="pmi-preview">${m.corps.split('\n')[0]}</div>
    </div>`;
  }

  const recusEl = $('admin-mail-list-recus'), favEl = $('admin-mail-list-favoris'), corbEl = $('admin-mail-list-corbeille');
  if (recusEl) recusEl.innerHTML = msgs.filter(m => !m.corbeille).map(itemHtml).join('') || '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucun message</p>';
  if (favEl) favEl.innerHTML = msgs.filter(m => m.favori && !m.corbeille).map(itemHtml).join('') || '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucun favori</p>';
  if (corbEl) {
    corbEl.innerHTML = corb.length
      ? `<div style="padding:10px 12px;background:#FEF2F2;border-bottom:1px solid #FECACA;font-size:11px;color:#DC2626;display:flex;justify-content:space-between;align-items:center"><span>🗑 ${corb.length} message${corb.length > 1 ? 's' : ''} — suppression auto 30 jours</span><button onclick="viderCorbeille('${user.id}')" style="background:#DC2626;color:#fff;border:none;border-radius:5px;padding:3px 8px;font-size:10px;cursor:pointer;font-family:'Sora',sans-serif">Vider</button></div>${corb.map(itemHtml).join('')}`
      : '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Corbeille vide</p>';
  }
}

/* ID du message actuellement ouvert */
/* Met à jour UNIQUEMENT les boutons d'action sans toucher au corps du message ni au formulaire */
/* ─── Messagerie admin : message actuellement ouvert ─── */
let _adminMsgOpenId = null;
let _adminMsgOpenUser = null;

function _adminBtnFavStyle(favori) {
  return favori
    ? 'background:#FEF3C7;color:#D97706;border:1px solid #FDE68A;padding:5px 12px;border-radius:7px;font-size:12px;cursor:pointer;font-family:Sora,sans-serif;font-weight:500'
    : 'background:#fff;color:#64748B;border:1px solid #E2E8F0;padding:5px 12px;border-radius:7px;font-size:12px;cursor:pointer;font-family:Sora,sans-serif;font-weight:500';
}
function _adminBtnLuStyle(lu) {
  return lu
    ? 'background:#fff;color:#64748B;border:1px solid #E2E8F0;padding:5px 12px;border-radius:7px;font-size:12px;cursor:pointer;font-family:Sora,sans-serif;font-weight:500'
    : 'background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;padding:5px 12px;border-radius:7px;font-size:12px;cursor:pointer;font-family:Sora,sans-serif;font-weight:500';
}

/* Met à jour SEULEMENT les boutons — ne touche pas au formulaire ni au corps */
function refreshAdminMsgButtons(id, userId) {
  const msg = (ADMIN_MESSAGES_DATA[userId] || []).find(m => m.id === id);
  if (!msg) return;
  const btnFavEl = document.getElementById('admin-btn-fav-' + id);
  const btnLuEl = document.getElementById('admin-btn-lu-' + id);
  if (btnFavEl) {
    btnFavEl.setAttribute('style', _adminBtnFavStyle(msg.favori));
    btnFavEl.textContent = msg.favori ? '★ Favori' : '☆ Ajouter favori';
  }
  if (btnLuEl) {
    btnLuEl.setAttribute('style', _adminBtnLuStyle(msg.lu));
    btnLuEl.textContent = msg.lu ? '👁 Marquer non lu' : '● Marquer lu';
  }
}

/* Met à jour SEULEMENT le badge de l'item dans la liste latérale */
function refreshAdminMsgListItem(id, userId) {
  const msg = (ADMIN_MESSAGES_DATA[userId] || []).find(m => m.id === id);
  const item = document.getElementById('admin-pmi-' + id);
  if (!item || !msg) return;
  // lu/non-lu
  item.classList.toggle('unread', !msg.lu);
  const dot = item.querySelector('.pmi-unread-dot');
  if (msg.lu && dot) dot.remove();
  if (!msg.lu && !dot) {
    const hdr = item.querySelector('.pmi-header');
    if (hdr) {
      const d = document.createElement('div');
      d.className = 'pmi-unread-dot';
      hdr.prepend(d);
    }
  }
  // favori : étoile dans la date
  let star = item.querySelector('.pmi-star');
  if (msg.favori && !star) {
    star = document.createElement('span');
    star.className = 'pmi-star';
    star.style.cssText = 'color:#F59E0B;font-size:12px;margin-right:2px';
    star.textContent = '★';
    const dateEl = item.querySelector('.pmi-date');
    if (dateEl) dateEl.parentNode.insertBefore(star, dateEl);
  } else if (!msg.favori && star) {
    star.remove();
  }
}

function openAdminMsg(id, userId) {
  const msgs = ADMIN_MESSAGES_DATA[userId] || [];
  const msg = msgs.find(m => m.id === id);
  if (!msg) return;

  // Marquer lu + sync notifs cloche
  msg.lu = true;
  if (NOTIFS_ADMIN[userId]) {
    NOTIFS_ADMIN[userId].forEach(n => { if (n.cible === 'admin-messagerie') n.lu = true; });
    updateAdminNotifBadge();
  }

  _adminMsgOpenId = id;
  _adminMsgOpenUser = userId;

  // Re-render la liste + badges (items recréés)
  renderAdminMailFull({ id: userId });

  // Sélectionner l'item APRÈS le re-render
  document.querySelectorAll('#page-principal .pronote-mail-item').forEach(i => i.classList.remove('selected'));
  document.getElementById('admin-pmi-' + id)?.classList.add('selected');

  const roleColors = { institutionnel: '#7C3AED', professeur: '#10B981', parent: '#F59E0B', eleve: '#3B82F6', inconnu: '#94A3B8' };
  const roleLabels = { institutionnel: 'Institution', professeur: 'Professeur', parent: 'Parent', eleve: 'Élève', inconnu: '?' };
  const col = roleColors[msg.role] || '#94A3B8';
  const lab = roleLabels[msg.role] || '?';

  $('admin-mail-view').innerHTML = `
    <div class="pmail-header">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div class="pmail-subject" style="flex:1;margin:0">${msg.sujet}</div>
        <span style="background:${col}18;color:${col};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">${lab}</span>
      </div>
      <div class="pmail-meta"><span>De : <strong>${msg.expediteur}</strong></span><span>Le ${msg.date}</span></div>
      <div id="admin-msg-actions-${id}" style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
        <button id="admin-btn-fav-${id}" onclick="toggleAdminFavori(${id},'${userId}')" style="${_adminBtnFavStyle(msg.favori)}">${msg.favori ? '★ Favori' : '☆ Ajouter favori'}</button>
        <button id="admin-btn-lu-${id}"  onclick="toggleAdminLu(${id},'${userId}')"     style="${_adminBtnLuStyle(msg.lu)}">${msg.lu ? '👁 Marquer non lu' : '● Marquer lu'}</button>
        <button onclick="mettreEnCorbeille(${id},'${userId}')" style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;padding:5px 12px;border-radius:7px;font-size:12px;cursor:pointer;font-family:Sora,sans-serif;font-weight:500">🗑 Corbeille</button>
      </div>
    </div>
    <div class="pmail-body" style="white-space:pre-line">${msg.corps}</div>
    <div style="padding:0 24px 20px">
      <div id="admin-reply-wrap" style="background:#F8FAFC;border-radius:10px;border:1.5px solid #E2E8F0;padding:14px">
        <div style="font-size:12px;font-weight:700;color:#64748B;margin-bottom:8px">↩ Répondre à <strong>${msg.expediteur}</strong></div>
        <textarea id="admin-reply-area" class="pchat-input" style="border-radius:8px;width:100%;display:block;margin-bottom:8px" placeholder="Votre réponse…"></textarea>
        <button onclick="sendAdminReply('${userId}',${id})" class="btn-primary" style="padding:8px 18px;font-size:13px">✈️ Envoyer</button>
      </div>
    </div>`;
}

function toggleAdminFavori(id, userId) {
  const m = (ADMIN_MESSAGES_DATA[userId] || []).find(m => m.id === id);
  if (!m) return;
  m.favori = !m.favori;
  // 1. Mettre à jour les boutons dans le panneau (pas de reconstruction)
  refreshAdminMsgButtons(id, userId);
  // 2. Mettre à jour uniquement l'item dans la liste (pas de reconstruction)
  refreshAdminMsgListItem(id, userId);
  // 3. Recalculer les badges onglets (Favoris = 1 ou 0)
  const msgs = ADMIN_MESSAGES_DATA[userId] || [];
  const favs = msgs.filter(mm => mm.favori && !mm.corbeille).length;
  const bF = document.getElementById('admin-badge-favoris');
  if (bF) bF.textContent = favs || '';
}

function toggleAdminLu(id, userId) {
  const m = (ADMIN_MESSAGES_DATA[userId] || []).find(m => m.id === id);
  if (!m) return;
  m.lu = !m.lu;
  if (m.lu) {
    // Redevient lu : juste mettre à jour les boutons + item liste
    refreshAdminMsgButtons(id, userId);
    refreshAdminMsgListItem(id, userId);
    // Recalc badge Reçus
    const nonLus = (ADMIN_MESSAGES_DATA[userId] || []).filter(mm => !mm.lu && !mm.corbeille).length;
    const bR = document.getElementById('admin-badge-recus');
    if (bR) bR.textContent = nonLus || '';
    const nb = document.getElementById('admin-msg-badge');
    if (nb) { nb.textContent = nonLus; nb.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
  } else {
    // Non lu : mettre à jour item + fermer panneau
    refreshAdminMsgListItem(id, userId);
    const nonLus = (ADMIN_MESSAGES_DATA[userId] || []).filter(mm => !mm.lu && !mm.corbeille).length;
    const bR = document.getElementById('admin-badge-recus');
    if (bR) bR.textContent = nonLus || '';
    const nb = document.getElementById('admin-msg-badge');
    if (nb) { nb.textContent = nonLus; nb.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
    _adminMsgOpenId = null;
    document.querySelectorAll('#page-principal .pronote-mail-item').forEach(i => i.classList.remove('selected'));
    $('admin-mail-view').innerHTML = `
      <div class="mail-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" style="opacity:.3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
        <p>Marqué comme non lu</p>
        <span style="font-size:12px;color:#CBD5E1">Apparaît en gras dans la liste</span>
      </div>`;
    showToast('○ Message marqué comme non lu');
  }
}

function openAdminMail(id, userId, el) { openAdminMsg(id, userId); }

/* ─── CLASSES ADMIN ─── */
function renderAdminClasses() {
  const container = $('admin-classes-list');
  if (!container) return;
  container.innerHTML = Object.keys(DB.emploiDuTemps).map(c => `
    <div style="background:#fff;border-radius:12px;padding:18px;border:1px solid #E2E8F0;text-align:center">
      <div style="font-size:20px;font-weight:800;color:#1E3A8A">${c}</div>
      <div style="font-size:12px;color:#64748B;margin-top:4px">Emploi du temps actif</div>
      <div style="width:8px;height:8px;border-radius:50%;background:#10B981;margin:8px auto 0"></div>
    </div>`).join('');
}
function refreshDemandes() {
  renderDemandes(currentDemandeFilter);
  showToast('✅ Liste actualisée');
}

function filterDemandes(filtre, el) {
  currentDemandeFilter = filtre;
  document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderDemandes(filtre);
}

async function renderDemandes(filtre) {
  const toutes = await Demandes.getAll();
  const nb = toutes.filter(d => d.statut === 'en_attente').length;

  // Stats
  $('stat-attente').textContent = toutes.filter(d => d.statut === 'en_attente').length;
  $('stat-approuve').textContent = toutes.filter(d => d.statut === 'approuve').length;
  $('stat-refuse').textContent = toutes.filter(d => d.statut === 'refuse').length;

  // Badge nav
  const badge = $('demandes-badge-nav');
  if (badge) { badge.textContent = nb; badge.style.display = nb > 0 ? 'inline-flex' : 'none'; }

  // Filtre
  let liste = toutes;
  if (filtre !== 'toutes') liste = toutes.filter(d => d.statut === filtre);

  // Trier : plus récentes en premier
  liste = [...liste].sort((a, b) => b.id.localeCompare(a.id));

  const container = $('demandes-list');
  if (!liste.length) {
    container.innerHTML = `
      <div class="empty-demandes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        <p>${filtre === 'en_attente' ? 'Aucune demande en attente 🎉' : 'Aucune demande dans cette catégorie.'}</p>
      </div>`;
    return;
  }

  container.innerHTML = liste.map(d => {
    const initiales = (d.prenom[0] + d.nom[0]).toUpperCase();
    const badgeHtml = d.statut === 'en_attente'
      ? `<span class="badge-attente">⏳ En attente</span>`
      : d.statut === 'approuve'
        ? `<span class="badge-approuve">✅ Approuvé</span>`
        : `<span class="badge-refuse">❌ Refusé</span>`;

    const actionsHtml = d.statut === 'en_attente' ? `
      <div class="demande-actions">
        <button class="btn-approuver" onclick="approveDemande('${d.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14"><polyline points="20 6 9 17 4 12"/></svg>
          Approuver
        </button>
        <button class="btn-refuser" onclick="refuserDemande('${d.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Refuser
        </button>
      </div>` : `<div style="padding-right:8px">${badgeHtml}</div>`;

    return `
      <div class="demande-card" id="demande-card-${d.id}">
        <div class="demande-avatar">${initiales}</div>
        <div class="demande-info">
          <div class="demande-nom">${d.prenom} ${d.nom}</div>
          <div class="demande-meta">
            <span>🏫 ${d.classe}</span>
            <span>🎂 ${d.dateNaissance}</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px">🔑 ${d.identifiant}</span>
          </div>
          <div class="demande-date">Demande le ${d.dateDemande}</div>
        </div>
        ${actionsHtml}
      </div>
    `;
  }).join('');
}

async function approveDemande(id) {
  const result = await Demandes.approuver(id);
  if (result.ok) {
    showToast(`✅ ${result.msg}`);
    renderDemandes(currentDemandeFilter);
    renderComptes();
  } else {
    showToast(`❌ ${result.msg}`);
  }
}

async function refuserDemande(id) {
  if (!confirm('Refuser cette demande de compte ?')) return;
  const result = await Demandes.refuser(id, 'Refusé par la direction');
  if (result.ok) {
    showToast('🚫 Demande refusée.');
    renderDemandes(currentDemandeFilter);
  }
}

/* ─── MESSAGES FORMULAIRE SITE VITRINE (directeur) ─── */
function renderFaqMessages() {
  const KEY = 'asimov_contact_messages';
  const raw = localStorage.getItem(KEY);
  const msgs = raw ? JSON.parse(raw) : [];
  const nonLus = msgs.filter(m => !m.lu).length;
  const badge = $('faq-msg-badge');
  if (badge) { badge.textContent = nonLus; badge.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
  const list = $('faq-msg-list');
  if (!list) return;
  if (!msgs.length) {
    list.innerHTML = '<p style="padding:24px;color:#94A3B8;font-size:13px;text-align:center">Aucun message reçu depuis le site vitrine.</p>';
    return;
  }
  list.innerHTML = [...msgs].reverse().map(m => `
    <div class="mail-item ${!m.lu ? 'unread' : ''}" onclick="openFaqMessage('${m.id}', this)">
      <div class="mail-meta">
        <span class="mail-sender">${m.prenom} ${m.nom}</span>
        <span class="mail-date">${m.date.split(' ')[0]}</span>
      </div>
      <div class="mail-subject" style="font-size:12px;color:#64748B">${m.profil || 'Visiteur'} · ${m.email}</div>
    </div>`).join('');
}

function openFaqMessage(id, el) {
  const KEY = 'asimov_contact_messages';
  const raw = localStorage.getItem(KEY);
  const msgs = raw ? JSON.parse(raw) : [];
  const msg = msgs.find(m => m.id === id);
  if (!msg) return;
  msg.lu = true;
  localStorage.setItem(KEY, JSON.stringify(msgs));
  document.querySelectorAll('#faq-msg-list .mail-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected'); el.classList.remove('unread');
  const nonLus = msgs.filter(m => !m.lu).length;
  const badge = $('faq-msg-badge');
  if (badge) { badge.textContent = nonLus; badge.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
  $('faq-msg-view').innerHTML = `
    <div class="mail-full-header">
      <div class="mail-full-subject">${msg.prenom} ${msg.nom}</div>
      <div class="mail-full-from"><strong>${msg.profil || 'Visiteur'}</strong> · <a href="mailto:${msg.email}" style="color:#3B82F6">${msg.email}</a> · ${msg.date}</div>
    </div>
    <div class="mail-full-body" style="white-space:pre-line;margin-top:16px">${msg.message}</div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #E2E8F0">
      <button onclick="deleteFaqMessage('${msg.id}')" style="padding:7px 14px;border-radius:8px;border:1.5px solid #FCA5A5;background:#FEF2F2;color:#DC2626;font-family:'Sora',sans-serif;font-size:12px;font-weight:600;cursor:pointer">🗑️ Supprimer</button>
    </div>`;
}

function deleteFaqMessage(id) {
  if (!confirm('Supprimer ce message ?')) return;
  const KEY = 'asimov_contact_messages';
  const msgs = JSON.parse(localStorage.getItem(KEY) || '[]').filter(m => m.id !== id);
  localStorage.setItem(KEY, JSON.stringify(msgs));
  $('faq-msg-view').innerHTML = '<div class="mail-placeholder"><p>Message supprimé.</p></div>';
  renderFaqMessages();
}

function refreshFaqMessages() { renderFaqMessages(); showToast('✅ Messages actualisés'); }

/* ══════════════════════════════════════════════
   DASHBOARD ÉLÈVE
   ══════════════════════════════════════════════ */

function setupEleveDashboard(user) {
  $('eleve-fullname').textContent = `${user.prenom} ${user.nom}`;
  $('eleve-class').textContent = user.classe;
  $('eleve-avatar').textContent = getInitials(user.prenom, user.nom);
  $('eleve-welcome').textContent = `Bonjour, ${user.prenom} 👋`;
  $('today-date').textContent = formatDateFR();
  $('eleve-classe-label').textContent = `Classe : ${user.classe}`;

  // Moyenne
  const notes = DB.notes[user.id] || [];
  if (notes.length) {
    const avg = (notes.reduce((s, m) => s + m.moyenne, 0) / notes.length).toFixed(1);
    $('eleve-moyenne').textContent = avg;
  } else {
    $('eleve-moyenne').textContent = '–';
  }

  // Stats rapides
  const devoirs = DB.devoirs[user.id] || [];
  $('eleve-devoirs-count').textContent = devoirs.filter(d => !d.done).length;
  $('eleve-abs-count').textContent = (DB.absences[user.id] || []).length;
  const msgs = DB.messages[user.id] || [];
  const nonLus = msgs.filter(m => !m.lu).length;
  $('eleve-msg-count').textContent = nonLus;
  $('eleve-msg-badge').textContent = nonLus;
  $('eleve-msg-badge').style.display = nonLus > 0 ? 'inline-flex' : 'none';

  renderTodaySchedule(user);
  renderHomeDevoirs(user);
  renderHomeNotes(user);
  renderTimetable(user);
  renderNotesWithPeriode(user, '');
  renderDevoirs(user);
  renderMailList(user);
  renderAbsences(user);
  renderRessources();
  renderVieScolaire(user);
}

/* ─── EMPLOI DU TEMPS AUJOURD'HUI ─── */
function renderTodaySchedule(user) {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const aujourd = jours[new Date().getDay()];
  const edt = getEmploiEleve(user);
  const slots = edt[aujourd] || edt['Lundi'] || [];
  const container = $('today-schedule');
  if (!slots.length) {
    container.innerHTML = '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:20px">Pas de cours aujourd\'hui</p>';
    return;
  }
  container.innerHTML = slots.map(s => {
    if (s.type === 'pause') {
      return `<div style="border-left:3px solid #E2E8F0;background:#fff;border-radius:8px;padding:7px 14px;display:flex;align-items:center;gap:12px;margin-bottom:6px;border:1px solid #F1F5F9">
        <span style="font-size:10px;color:#CBD5E1;min-width:90px">${s.heure}</span>
        <div style="font-size:11px;color:#CBD5E1;font-style:italic">${s.label}</div>
      </div>`;
    }
    if (s.type === 'repas') {
      return `<div style="border-left:3px solid #E2E8F0;background:#fff;border-radius:8px;padding:7px 14px;display:flex;align-items:center;gap:12px;margin-bottom:6px;border:1px solid #F1F5F9">
        <span style="font-size:10px;color:#CBD5E1;min-width:90px">${s.heure}</span>
        <div style="font-size:11px;color:#CBD5E1;font-style:italic">${s.label}</div>
      </div>`;
    }
    if (s.type !== 'cours') return '';
    const col = getMatiereColor(s.matiere);
    const dureeLabel = s.duree >= 2
      ? `<span style="font-size:10px;background:${col.border};color:${col.text};padding:1px 7px;border-radius:10px;font-weight:700">${s.duree}h</span>`
      : '';
    return `
    <div class="schedule-item" style="border-left:3px solid ${col.dot};background:${col.bg};border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:12px;margin-bottom:6px">
      <span class="schedule-time" style="font-size:11px;font-weight:700;color:${col.text};min-width:90px">${s.heure}</span>
      <div style="flex:1"><div class="schedule-subject" style="font-weight:700;font-size:13px;color:${col.text}">${s.matiere}</div><div class="schedule-teacher" style="font-size:11px;color:${col.text};opacity:.7">${s.prof}</div></div>
      ${dureeLabel}
      <span class="schedule-room" style="font-size:11px;background:${col.border};color:${col.text};padding:2px 8px;border-radius:5px">${s.salle}</span>
    </div>`;
  }).join('');
}

/* ─── DEVOIRS ACCUEIL ─── */
function renderHomeDevoirs(user) {
  const tous = DB.devoirs[user.id] || [];
  const pending = tous.filter(d => !d.done).slice(0, 4);
  const doneNb = tous.filter(d => d.done).length;
  const doneStr = doneNb > 0 ? `<div style="font-size:11px;color:#10B981;font-weight:600;text-align:center;margin-top:4px">✓ ${doneNb} terminé${doneNb > 1 ? 's' : ''} — voir dans Devoirs</div>` : '';
  $('home-devoirs').innerHTML = (pending.map(d => `
    <div class="devoir-item ${d.done ? 'done-item' : ''}" style="margin-bottom:6px">
      <div class="devoir-check ${d.done ? 'done' : ''}" onclick="toggleDevoir(${d.id},'${user.id}')" title="${d.done ? 'Remettre en à faire' : 'Marquer comme fait'}"></div>
      <div class="devoir-info">
        <div class="devoir-subject">${d.matiere}</div>
        <div class="devoir-title" style="${d.done ? 'text-decoration:line-through;color:#94A3B8' : ''}">${d.titre}</div>
      </div>
      <div class="devoir-date ${d.urgent && !d.done ? 'devoir-urgent' : ''}"><strong>${d.dateRendu}</strong></div>
    </div>`).join('') || '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:16px">Aucun devoir en attente 🎉</p>') + doneStr;
}

/* ─── NOTES ACCUEIL ─── */
function renderHomeNotes(user) {
  const notes = DB.notes[user.id] || [];
  $('home-notes').innerHTML = notes.map(m => `
    <div class="note-chip" onclick="naviguerVersNotes()" style="cursor:pointer" title="Voir Notes & Bulletins">
      <div class="note-subject">${m.matiere.substring(0, 10)}</div>
      <div class="note-value" style="color:#0F172A">${m.moyenne}</div>
      <div class="note-over">/20</div>
    </div>`).join('') || '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:16px">Aucune note disponible</p>';
}

function naviguerVersNotes() {
  /* Naviguer vers la section Notes & Bulletins ET synchroniser le nav item */
  const navLink = document.querySelector('#page-eleve .nav-item[onclick*="notes"]');
  showSection('notes', navLink);
}

/* ─── Helper EDT : rendre une cellule de cours ─── */
function renderTtCell(slot) {
  if (!slot) return `<div class="tt-cell empty"></div>`;
  if (slot.type === 'pause') {
    const span = slot.duree <= 0.25 ? 1 : 1;
    return `<div class="tt-cell pause-cell" style="grid-row:span ${span}">
      <div style="font-size:9px;color:#CBD5E1;text-align:center;font-style:italic">☕ ${slot.label}</div>
    </div>`;
  }
  if (slot.type === 'repas') {
    return `<div class="tt-cell repas-cell" style="grid-row:span 2">
      <div style="font-size:10px;color:#CBD5E1;text-align:center;font-style:italic">🍽 ${slot.label}</div>
    </div>`;
  }
  if (slot.type === 'vide' || !slot.matiere) return `<div class="tt-cell empty"></div>`;
  const col = getMatiereColor(slot.matiere);
  const span = slot.duree || 1;
  const dureeLabel = span >= 2 ? `<div class="tt-cell-duration">${span}h de cours</div>` : '';
  return `<div class="tt-cell" style="background:${col.bg};border-color:${col.border};border-left:4px solid ${col.dot};grid-row:span ${span}">
    <div class="tt-cell-subject" style="color:${col.text}">${slot.matiere}</div>
    <div class="tt-cell-teacher" style="color:${col.text}">${slot.prof}</div>
    <div class="tt-cell-room" style="color:${col.text}">${slot.salle}</div>
    ${dureeLabel}
  </div>`;
}

/* ─── EMPLOI DU TEMPS COMPLET ─── */
let weekOffset = 0;
function renderTimetable(user) {
  const edt = getEmploiEleve(user);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
  const fmt = d => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  $('week-label').textContent = `${fmt(monday)} au ${fmt(friday)}`;

  // Collecter toutes les clés dans l'ordre (référence = Lundi)
  const allKeys = [];
  const keySet = new Set();
  jours.forEach(j => {
    (edt[j] || []).forEach(s => {
      if (!keySet.has(s.debutKey)) { keySet.add(s.debutKey); allKeys.push(s.debutKey); }
    });
  });

  // Index debutKey → slot par jour
  const idx = {};
  jours.forEach(j => {
    idx[j] = {};
    (edt[j] || []).forEach(s => { idx[j][s.debutKey] = s; });
  });

  // Calculer les rowspans : combien de lignes consécutives ont la même matière
  // Pour chaque jour, calculer rowspan[j][keyIdx] = nb de lignes à fusionner
  const rowspan = {};
  jours.forEach(j => {
    rowspan[j] = {};
    const skip = new Set();
    allKeys.forEach((key, ki) => {
      if (skip.has(ki)) return;
      const slot = idx[j][key];
      if (!slot || slot.type === 'repas' || slot.type === 'pause') {
        rowspan[j][ki] = 1;
        return;
      }
      // Ne jamais fusionner les vide : chaque créneau = une ligne visible (sonnerie)
      if (slot.type === 'vide') { rowspan[j][ki] = 1; return; }
      // Fusionner uniquement les cours identiques consécutifs
      let span = 1;
      for (let ni = ki + 1; ni < allKeys.length; ni++) {
        const nslot = idx[j][allKeys[ni]];
        const sameBlock = nslot &&
          nslot.type === 'cours' &&
          nslot.matiere === slot.matiere &&
          nslot.prof === slot.prof;
        if (sameBlock) { span++; skip.add(ni); }
        else break;
      }
      rowspan[j][ki] = span;
    });
  });



  // Hauteur d'une ligne de base (1h de cours)
  const ROW_H = 60;
  const REPAS_H = 48;
  const PAUSE_H = 22;
  const VIDE_MIN_H = 28;

  let html = `<table style="width:100%;border-collapse:separate;border-spacing:3px;min-width:800px">
    <thead><tr>
      <th style="width:68px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;"></th>`;
  jours.forEach((j, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    html += `<th style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;font-size:12px;font-weight:700;color:#64748B;text-align:center">
      ${j}<br><span style="font-size:10px;font-weight:400">${fmt(d)}</span></th>`;
  });
  html += `</tr></thead><tbody>`;

  const skipCells = {}; // { j: Set<ki> }
  jours.forEach(j => { skipCells[j] = new Set(); });

  allKeys.forEach((key, ki) => {
    const refSlot = jours.map(j => idx[j][key]).find(Boolean);
    if (!refSlot) return;

    const isRepas = refSlot.type === 'repas';
    const isPause = refSlot.type === 'pause';
    const rowH = isRepas ? REPAS_H : isPause ? PAUSE_H : ROW_H;

    // Séparateur horizontal à chaque créneau (chaque ligne = une sonnerie)
    const sepStyle = ki > 0 ? 'border-top:1.5px solid rgba(203,213,225,0.45);' : '';

    html += `<tr>`;

    // Colonne heure
    const heureLabel = key;
    const tC = (isRepas || isPause) ? '#CBD5E1' : '#94A3B8';
    const tS = (isRepas || isPause) ? '9px' : '10px';
    html += `<td style="${sepStyle}text-align:right;padding-right:8px;padding-top:6px;vertical-align:top;font-size:${tS};color:${tC};font-family:'JetBrains Mono',monospace;white-space:nowrap;height:${rowH}px">${heureLabel}</td>`;

    jours.forEach(j => {
      if (skipCells[j].has(ki)) return; // absorbé par rowspan

      const slot = idx[j][key];
      const span = rowspan[j][ki] || 1;
      // Marquer les lignes suivantes comme skip
      for (let s = 1; s < span; s++) skipCells[j].add(ki + s);

      const cellH = `${span * rowH}px`;
      const spanAttr = span > 1 ? ` rowspan="${span}"` : '';

      if (!slot) {
        if (isPause && !(j === 'Mercredi' && key.startsWith('15h15'))) {
          html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle">
            <span style="font-size:9px;color:#CBD5E1;font-style:italic">☕ Récré</span></td>`;
        } else {
          html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#F8FAFC;border-radius:8px;border:1px solid #F1F5F9"></td>`;
        }
        return;
      }
      if (slot.type === 'repas') {
        html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle">
          <span style="font-size:10px;color:#CBD5E1;font-style:italic">🍽 Déjeuner</span></td>`;
        return;
      }
      if (slot.type === 'pause') {
        if (j === 'Mercredi' && key.startsWith('15h15')) {
          html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#F8FAFC;border-radius:8px;border:1px solid #F1F5F9"></td>`;
        } else {
          html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle">
            <span style="font-size:9px;color:#CBD5E1;font-style:italic">☕ Récré</span></td>`;
        }
        return;
      }
      if (slot.type === 'vide') {
        html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#F8FAFC;border-radius:8px;border:1px solid #F1F5F9"></td>`;
        return;
      }
      // Cours
      const col = getMatiereColor(slot.matiere);
      const dureeH = span; // 1h par ligne
      const badge = span >= 2
        ? `<div style="font-size:9px;opacity:.5;margin-top:6px">${span}h</div>` : '';
      html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:${col.bg};border-left:4px solid ${col.dot};border-radius:8px;padding:10px 12px;vertical-align:middle;cursor:pointer;transition:filter .15s"
        onmouseover="this.style.filter='brightness(0.93)'" onmouseout="this.style.filter=''">
        <div style="font-weight:700;font-size:12px;color:${col.text};margin-bottom:3px">${slot.matiere}</div>
        <div style="font-size:10px;color:${col.text};opacity:.75;margin-bottom:2px">${slot.prof}</div>
        <div style="font-size:10px;color:${col.text};opacity:.6;font-family:'JetBrains Mono',monospace">${slot.salle}</div>
        ${badge}
      </td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  // ── Fin de journée : ligne 17h40 ──
  html += `<div style="display:flex;align-items:center;gap:8px;margin-top:2px">
    <div style="width:68px;text-align:right;padding-right:8px;font-size:10px;font-weight:600;color:#64748B;font-family:'JetBrains Mono',monospace;flex-shrink:0">17h40</div>
    <div style="flex:1;height:1.5px;background:rgba(203,213,225,0.5)"></div>
  </div>`;
  $('timetable').innerHTML = html;
  $('timetable').style.display = 'block';
}

function changeWeek(dir) {
  weekOffset += dir;
  if (currentUser) renderTimetable(currentUser);
}

/* ─── PÉRIODES SCOLAIRES ─── */
function getPeriodes() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-12
  /* Année scolaire : sept N → juin N+1 */
  const anneeDebut = m >= 9 ? y : y - 1;
  const anneeFin = anneeDebut + 1;
  const label = `${anneeDebut}-${anneeFin}`;
  return {
    label,
    trimestres: [
      { id: 'T1', nom: `Trimestre 1 (${label})`, debut: new Date(anneeDebut, 8, 1), fin: new Date(anneeDebut, 11, 20) },
      { id: 'T2', nom: `Trimestre 2 (${label})`, debut: new Date(anneeDebut, 11, 21), fin: new Date(anneeFin, 2, 31) },
      { id: 'T3', nom: `Trimestre 3 (${label})`, debut: new Date(anneeFin, 3, 1), fin: new Date(anneeFin, 6, 10) },
    ],
    semestres: [
      { id: 'S1', nom: `Semestre 1 (${label})`, debut: new Date(anneeDebut, 8, 1), fin: new Date(anneeDebut, 11, 31) },
      { id: 'S2', nom: `Semestre 2 (${label})`, debut: new Date(anneeFin, 0, 1), fin: new Date(anneeFin, 6, 10) },
    ],
  };
}

function parseDate(str) {
  /* Format dd/mm/yyyy */
  const [d, mo, y] = str.split('/').map(Number);
  return new Date(y, mo - 1, d);
}

/* ─── HELPER : trouver le chapitre en cours pour une matière/classe ─── */
function getChapitreEleveForMatiere(classe, matiere) {
  // Chercher le prof qui enseigne cette matière à cette classe
  const tous = Auth.getAll();
  const profEntry = tous.find(u =>
    u.role === 'professeur' &&
    u.matiere === matiere &&
    (u.classes || []).includes(classe)
  );
  if (!profEntry) return null;
  const chapsProfClasse = CHAPITRES_PROG[profEntry.id]?.[classe];
  if (!chapsProfClasse || chapsProfClasse.length === 0) {
    // Auto-générer si pas encore de données
    const annee = getAnneeScolaire();
    if (!CHAPITRES_PROG[profEntry.id]) CHAPITRES_PROG[profEntry.id] = {};
    CHAPITRES_PROG[profEntry.id][classe] = getChapitresDefautNiveau(classe, annee.debut);
    return CHAPITRES_PROG[profEntry.id][classe].find(c => c.statut === 'en_cours') || null;
  }
  const sorted = [...chapsProfClasse].sort((a, b) => a.num - b.num);
  // Prioriser le chapitre en cours, sinon le premier à venir, sinon le dernier terminé
  return sorted.find(c => c.statut === 'en_cours')
    || sorted.find(c => c.statut === 'a_venir')
    || sorted.filter(c => c.statut === 'termine').slice(-1)[0]
    || null;
}

function renderChapitreBlockEleve(classe, matiere, col) {
  const ch = getChapitreEleveForMatiere(classe, matiere);
  if (!ch) return '';

  const now = new Date();
  let pct = 0;
  if (ch.statut === 'termine') {
    pct = 100;
  } else if (ch.statut === 'en_cours' && ch.debut && ch.fin) {
    const d = new Date(ch.debut), f = new Date(ch.fin);
    pct = Math.round(Math.min(Math.max((now - d) / (f - d), 0), 1) * 100);
  }

  const statusColor = ch.statut === 'termine' ? '#16A34A' : ch.statut === 'en_cours' ? col.dot : '#94A3B8';
  const statusBg = ch.statut === 'termine' ? '#F0FDF4' : ch.statut === 'en_cours' ? col.bg : '#F8FAFC';
  const statusText = ch.statut === 'termine' ? '#14532D' : ch.statut === 'en_cours' ? col.text : '#64748B';
  const statusLabel = ch.statut === 'termine' ? '✅ Terminé' : ch.statut === 'en_cours' ? '⏳ En cours' : '📅 À venir';

  const debutStr = ch.debut ? new Date(ch.debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';
  const finStr = ch.fin ? new Date(ch.fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';

  // Semaines (juste actuelle + total)
  let semaineInfo = '';
  if (ch.debut && ch.fin) {
    const s1 = getNumSemaine(new Date(ch.debut));
    const s2 = getNumSemaine(new Date(ch.fin));
    const nbSem = Math.max(s2 - s1 + 1, 1);
    const semAct = getNumSemaine(now);
    const enCours = semAct >= s1 && semAct <= s2;
    semaineInfo = `<span style="font-size:10px;color:#94A3B8">
      ${enCours ? `<span style="background:#DBEAFE;color:#1D4ED8;padding:1px 7px;border-radius:5px;font-weight:700">Sem. ${semAct}</span>` : `Sem. ${s1}–${s2}`}
      · ${nbSem} semaine${nbSem > 1 ? 's' : ''}
    </span>`;
  }

  return `
  <div style="margin-top:12px;background:${statusBg};border-radius:10px;padding:11px 14px;border:1.5px solid ${statusColor}20">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.4px">Chapitre ${ch.num}</span>
      <span style="font-size:12px;font-weight:700;color:${statusText};flex:1">${ch.titre}</span>
      <span style="background:${statusColor}20;color:${statusColor};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700">${statusLabel}</span>
    </div>
    <div style="height:6px;background:#E2E8F0;border-radius:20px;overflow:hidden;margin-bottom:5px">
      <div style="height:100%;background:${statusColor};border-radius:20px;width:${pct}%;transition:width 1s ease"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      ${semaineInfo}
      <div style="display:flex;align-items:center;gap:6px">
        ${debutStr && finStr ? `<span style="font-size:10px;color:#CBD5E1">${debutStr} → ${finStr}</span>` : ''}
        <span style="font-size:11px;font-weight:800;color:${statusColor}">${pct}%</span>
      </div>
    </div>
  </div>`;
}

function renderNotesWithPeriode(user, periodeId) {
  const notes = DB.notes[user.id] || [];
  const classe = user.classe || '';
  const periodes = getPeriodes();
  const toutes = [...periodes.trimestres, ...periodes.semestres];
  const periode = toutes.find(p => p.id === periodeId);

  /* Filtrer les évaluations selon la période */
  const notesFiltrees = notes.map(m => {
    const evalsFiltrees = periode
      ? m.evaluations.filter(ev => {
        const d = parseDate(ev.date);
        return d >= periode.debut && d <= periode.fin;
      })
      : m.evaluations;
    const moy = evalsFiltrees.length
      ? (evalsFiltrees.reduce((s, ev) => s + ev.note, 0) / evalsFiltrees.length).toFixed(1)
      : null;
    return { ...m, evaluations: evalsFiltrees, moyenne: moy ? parseFloat(moy) : m.moyenne, _filtered: evalsFiltrees.length };
  }).filter(m => m._filtered > 0 || !periode);

  /* Moyenne générale */
  const moyGene = notesFiltrees.length
    ? (notesFiltrees.reduce((s, m) => s + (m.moyenne || 0), 0) / notesFiltrees.length).toFixed(2)
    : '–';

  const periodeSelector = `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px;background:#fff;border-radius:12px;padding:16px 20px;border:1px solid #E2E8F0">
      <div style="flex:1">
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-bottom:6px">PÉRIODE</div>
        <select id="periode-select" onchange="renderNotesWithPeriode(currentUser, this.value)"
          style="border:1.5px solid #E2E8F0;border-radius:8px;padding:7px 12px;font-family:'Sora',sans-serif;font-size:13px;color:#0F172A;cursor:pointer">
          <option value="">Toutes les périodes</option>
          <optgroup label="── Trimestres">
            ${periodes.trimestres.map(t => `<option value="${t.id}" ${periodeId === t.id ? 'selected' : ''}>${t.nom}</option>`).join('')}
          </optgroup>
          <optgroup label="── Semestres">
            ${periodes.semestres.map(s => `<option value="${s.id}" ${periodeId === s.id ? 'selected' : ''}>${s.nom}</option>`).join('')}
          </optgroup>
        </select>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:#64748B;font-weight:600;margin-bottom:4px">MOYENNE GÉNÉRALE</div>
        <div style="font-size:28px;font-weight:800;color:#0F172A">${moyGene}<span style="font-size:14px;font-weight:500;color:#94A3B8">/20</span></div>
        ${periode ? `<div style="font-size:11px;color:#94A3B8;margin-top:2px">${periode.nom}</div>` : ''}
      </div>
    </div>`;

  const cartes = notesFiltrees.length ? notesFiltrees.map(m => {
    const col = getMatiereColor(m.matiere);
    return `
    <div class="notes-matiere-card" style="border-top:3px solid ${col.dot}">
      <div class="notes-matiere-header">
        <div class="notes-matiere-name" style="color:${col.text}">${m.matiere}</div>
        <div class="notes-matiere-avg" style="color:#374151;background:#F1F5F9;border:1px solid #E2E8F0">${m.moyenne}/20</div>
      </div>
      <div class="notes-list" style="margin-top:10px">
        ${m.evaluations.map(ev => `
          <div style="border-left:3px solid ${col.dot};background:${col.bg};padding:8px 12px;border-radius:6px;margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <strong style="color:#374151;font-size:15px">${ev.note}/${ev.sur}</strong>
            <span style="flex:1;font-size:12px;color:#374151">— ${ev.titre}</span>
            <span style="font-size:10px;color:#94A3B8">${ev.date}</span>
            <button onclick="openCorrige('${m.matiere.replace(/'/g, "\\'")}','${ev.titre.replace(/'/g, "\\'")}',${ev.note},${ev.sur})"
              style="background:${col.border};color:${col.text};border:none;border-radius:5px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600">📄 Corrigé</button>
          </div>`).join('')}
      </div>
    </div>`;
  }).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94A3B8">Aucune note pour cette période.</div>`;

  $('notes-grid').innerHTML = periodeSelector + cartes;

  // Animer les barres de progression après rendu
  setTimeout(() => {
    document.querySelectorAll('#notes-grid [style*="transition:width"]').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => { bar.style.width = w; });
    });
  }, 80);

  // Subtitle dynamique
  const subtitle = $('notes-periode-subtitle');
  if (subtitle) {
    const p = getPeriodes();
    const now = new Date();
    const trim = p.trimestres.find(t => now >= t.debut && now <= t.fin);
    const anneeLabel = p.label.replace('-', '/');
    if (periodeId) {
      const sel = toutes.find(x => x.id === periodeId);
      subtitle.textContent = sel ? `${sel.nom.split('(')[0].trim()} — ${anneeLabel}` : anneeLabel;
    } else if (trim) {
      subtitle.textContent = `${trim.nom.split('(')[0].trim()} — ${anneeLabel}`;
    } else {
      subtitle.textContent = `Année scolaire ${anneeLabel}`;
    }
  }
}

/* ─── MODAL CORRIGÉ PDF ─── */
function openCorrige(matiere, titre, note, sur) {
  const col = getMatiereColor(matiere);
  const existing = document.getElementById('modal-corrige');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-corrige';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(900px,96vw);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3)">
      <!-- Header -->
      <div style="display:flex;align-items:center;gap:14px;padding:18px 24px;border-bottom:1px solid #E2E8F0">
        <div style="width:40px;height:40px;border-radius:10px;background:${col.bg};border:1.5px solid ${col.border};display:flex;align-items:center;justify-content:center;font-size:18px">📄</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:15px;color:#0F172A">${titre}</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px">${matiere} · Note : <strong style="color:${col.text}">${note}/${sur}</strong></div>
        </div>
        <button onclick="document.getElementById('modal-corrige').remove()"
          style="width:32px;height:32px;border-radius:8px;border:1px solid #E2E8F0;background:#F8FAFC;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>
      </div>
      <!-- Colonnes PDF -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;flex:1;overflow:hidden;border-radius:0 0 16px 16px">
        <!-- Corrigé prof -->
        <div style="border-right:1px solid #E2E8F0;display:flex;flex-direction:column">
          <div style="padding:12px 16px;background:#F0FDF4;border-bottom:1px solid #BBF7D0;display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;font-weight:700;color:#15803D;text-transform:uppercase;letter-spacing:.5px">📋 Corrigé du professeur</span>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#FAFAFA;gap:12px">
            <div style="width:100%;max-width:300px;background:#fff;border:1.5px dashed #BBF7D0;border-radius:12px;padding:28px;text-align:center">
              <div style="font-size:40px;margin-bottom:12px">📄</div>
              <div style="font-weight:700;font-size:13px;color:#15803D">Corrigé_${matiere.replace(/\s/g, '_')}.pdf</div>
              <div style="font-size:11px;color:#94A3B8;margin-top:4px">Déposé par le professeur</div>
              <div style="margin-top:16px;padding:10px 16px;background:#F0FDF4;border-radius:8px;font-size:12px;color:#15803D">
                <strong>${note}/${sur}</strong> — Très bien, bonne maîtrise du chapitre.<br>
                <span style="font-size:11px;color:#64748B">Quelques erreurs de calcul à revoir.</span>
              </div>
            </div>
            <span style="font-size:11px;color:#94A3B8">Simulation — PDF fictif pour démonstration</span>
          </div>
        </div>
        <!-- Copie élève -->
        <div style="display:flex;flex-direction:column">
          <div style="padding:12px 16px;background:${col.bg};border-bottom:1.5px solid ${col.border};display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;font-weight:700;color:${col.text};text-transform:uppercase;letter-spacing:.5px">✏️ Copie de l'élève</span>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:#FAFAFA;gap:12px">
            <div style="width:100%;max-width:300px;background:#fff;border:1.5px dashed ${col.border};border-radius:12px;padding:28px;text-align:center">
              <div style="font-size:40px;margin-bottom:12px">📝</div>
              <div style="font-weight:700;font-size:13px;color:${col.text}">Copie_eleve_${matiere.replace(/\s/g, '_')}.pdf</div>
              <div style="font-size:11px;color:#94A3B8;margin-top:4px">Rendu le ${new Date().toLocaleDateString('fr-FR')}</div>
              <div style="margin-top:16px;padding:10px 16px;background:${col.bg};border-radius:8px;font-size:12px;color:${col.text}">
                Note obtenue : <strong>${note}/${sur}</strong>
              </div>
            </div>
            <span style="font-size:11px;color:#94A3B8">Simulation — PDF fictif pour démonstration</span>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ─── DEVOIRS COMPLETS ─── */
function renderDevoirs(user) {
  // Nettoyer les devoirs cochés dont la date de rendu est passée (nettoyage hebdo simulé)
  const now = new Date();
  if (DB.devoirs[user.id]) {
    DB.devoirs[user.id] = DB.devoirs[user.id].filter(d => {
      if (!d.done) return true;
      // Garder les devoirs terminés de la semaine en cours uniquement
      const parts = (d.dateRendu || '').split('/');
      if (parts.length !== 3) return false;
      const dDate = new Date(+('20' + parts[2]), +parts[1] - 1, +parts[0]);
      const diff = (now - dDate) / (1000 * 60 * 60 * 24);
      return diff < 7; // supprimer après 7 jours
    });
  }
  const devoirs = DB.devoirs[user.id] || [];
  const pending = devoirs.filter(d => !d.done);
  const done = devoirs.filter(d => d.done);
  let html = '';
  if (pending.length) {
    html += `<h3 style="font-size:13px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">À faire (${pending.length})</h3>`;
    html += pending.map(d => renderDevoirItem(d, user.id)).join('');
  }
  if (done.length) {
    html += `<h3 style="font-size:13px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.5px;margin:20px 0 12px">Terminés (${done.length})</h3>`;
    html += done.map(d => renderDevoirItem(d, user.id)).join('');
  }
  if (!html) html = '<p style="color:#94A3B8;text-align:center;padding:40px">Aucun devoir disponible pour ce compte.</p>';
  $('devoirs-container').innerHTML = html;
}

function renderDevoirItem(d, userId) {
  const urgentBadge = d.urgent && !d.done
    ? `<span style="background:#FEE2E2;color:#EF4444;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px">⚡ Urgent</span>`
    : '';
  const doneBadge = d.done
    ? `<span style="background:#D1FAE5;color:#059669;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px">✓ Fait</span>`
    : '';
  return `
    <div class="devoir-item ${d.done ? 'done-item' : ''}" style="transition:all .2s">
      <div class="devoir-check ${d.done ? 'done' : ''}" onclick="toggleDevoir(${d.id},'${userId}')" title="${d.done ? 'Remettre en à faire' : 'Marquer comme fait'}"></div>
      <div class="devoir-info">
        <div class="devoir-subject">${d.matiere}</div>
        <div class="devoir-title" style="${d.done ? 'text-decoration:line-through;color:#94A3B8' : ''}">
          ${d.titre}
        </div>
        <div style="margin-top:4px;font-size:11px;color:#94A3B8;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span>Par ${d.prof}</span>
          ${urgentBadge}${doneBadge}
        </div>
      </div>
      <div class="devoir-date ${d.urgent && !d.done ? 'devoir-urgent' : ''}">
        <span>Pour le<br><strong>${d.dateRendu}</strong></span>
        <span class="devoir-undo-hint">${d.done ? '↩ Remettre en à faire' : ''}</span>
      </div>
    </div>`;
}

function toggleDevoir(id, userId) {
  const devoir = DB.devoirs[userId]?.find(d => d.id === id);
  if (devoir) {
    devoir.done = !devoir.done;
    renderDevoirs({ id: userId });
    renderHomeDevoirs({ id: userId });
    // Mettre à jour le compteur stat
    const countEl = $('eleve-devoirs-count');
    if (countEl) countEl.textContent = (DB.devoirs[userId] || []).filter(d => !d.done).length;
    // Dès qu'on coche un devoir, marquer la notif "devoirs" comme lue
    if (devoir.done && NOTIFS[userId]) {
      NOTIFS[userId].filter(n => n.cible === 'devoirs').forEach(n => n.lu = true);
      updateNotifBadge('eleve');
    }
  }
}

/* ─── MESSAGERIE ÉLÈVE ─── */
function renderMailList(user) {
  const messages = DB.messages[user.id] || [];
  $('mail-list').innerHTML = messages.map(m => `
    <div class="mail-item ${!m.lu ? 'unread' : ''}" onclick="openMail(${m.id},'${user.id}',this)">
      <div class="mail-meta">
        <span class="mail-sender">${m.expediteur}</span>
        <div style="display:flex;align-items:center;gap:6px">
          ${!m.lu ? '<span class="unread-dot"></span>' : ''}
          <span class="mail-date">${m.date.split('–')[0].trim()}</span>
        </div>
      </div>
      <div class="mail-subject">${m.sujet}</div>
    </div>`).join('') || '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucun message</p>';
}

function openMail(id, userId, el) {
  const msg = (DB.messages[userId] || []).find(m => m.id === id);
  if (!msg) return;
  msg.lu = true;
  document.querySelectorAll('#mail-list .mail-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  el.classList.remove('unread');
  el.querySelector('.unread-dot')?.remove();

  /* Recalc badge messagerie */
  const nonLus = (DB.messages[userId] || []).filter(m => !m.lu).length;
  const badge = $('eleve-msg-badge');
  const countEl = $('eleve-msg-count');
  if (badge) { badge.textContent = nonLus; badge.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
  if (countEl) countEl.textContent = nonLus;
  // Sync cloche : si plus de messages non lus, marquer les notifs messagerie comme lues
  syncMsgBadgeEleve();

  $('mail-view').innerHTML = `
    <div class="mail-full-header">
      <div class="mail-full-subject">${msg.sujet}</div>
      <div class="mail-full-from">De : <strong>${msg.expediteur}</strong> — ${msg.date}</div>
    </div>
    <div class="mail-full-body" style="white-space:pre-line">${msg.corps}</div>
    <div class="reply-box" id="reply-box-${id}">
      <div class="reply-box-header">↩ Répondre à <strong>${msg.expediteur}</strong></div>
      <textarea id="reply-text-${id}" class="reply-textarea" placeholder="Votre réponse..."></textarea>
      <div class="reply-actions">
        <button class="reply-btn-cancel" onclick="document.getElementById('reply-box-${id}').style.display='none'">Annuler</button>
        <button class="reply-btn-send" onclick="sendReply(${id},'${userId}')">Envoyer</button>
      </div>
    </div>`;
}

function sendReply(id, userId) {
  const text = document.getElementById(`reply-text-${id}`)?.value.trim();
  if (!text) { showToast('⚠️ Veuillez écrire un message'); return; }
  showToast('✅ Message envoyé avec succès !');
  document.getElementById(`reply-box-${id}`).innerHTML = `<div style="color:#10B981;font-size:13px;padding:12px">✅ Message envoyé !</div>`;
}

/* ─── ABSENCES ─── */
function renderAbsences(user) {
  const absences = DB.absences[user.id] || [];
  const container = $('absences-container');
  if (!container) return;

  const listHtml = absences.length ? absences.map(a => `
    <div class="absence-item absence-${a.type}" style="flex-wrap:wrap;gap:10px">
      <div class="absence-icon">
        ${a.type === 'abs'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'}
      </div>
      <div class="absence-info" style="flex:1">
        <div class="absence-date">${a.date}</div>
        <div class="absence-details">${a.detail}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="absence-badge ${a.statut === 'En attente' ? 'badge-abs' : a.statut === 'Justifié' ? 'badge-ok' : 'badge-retard'}">${a.statut}</span>
        ${a.statut === 'En attente' ? `
          <button onclick="ouvrirJustifAbsence(${a.id},'${user.id}')"
            style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;border-radius:7px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif">
            📎 Justifier
          </button>` : ''}
      </div>
    </div>`).join('')
    : '<p style="color:#94A3B8;text-align:center;padding:30px">Aucune absence enregistrée 🎉</p>';

  container.innerHTML = listHtml;
}

function ouvrirJustifAbsence(absId, userId) {
  const existing = document.getElementById('modal-justif');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'modal-justif';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(460px,95vw);padding:24px;box-shadow:0 24px 64px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="font-size:16px;font-weight:700;color:#0F172A">📎 Justifier une absence</h3>
        <button onclick="document.getElementById('modal-justif').remove()" style="background:#F1F5F9;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Motif</label>
          <select id="justif-motif" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px">
            <option value="medical">Rendez-vous médical</option>
            <option value="maladie">Maladie</option>
            <option value="familial">Motif familial</option>
            <option value="transport">Problème de transport</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Justificatif (document)</label>
          <div style="border:2px dashed #BFDBFE;border-radius:10px;padding:20px;text-align:center;background:#EFF6FF;cursor:pointer" onclick="showToast('📎 Import de fichier simulé')">
            <div style="font-size:24px;margin-bottom:6px">📄</div>
            <div style="font-size:13px;color:#2563EB;font-weight:600">Cliquer pour joindre un document</div>
            <div style="font-size:11px;color:#94A3B8;margin-top:3px">PDF, JPG, PNG — max 5 Mo</div>
          </div>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Note complémentaire (optionnel)</label>
          <textarea id="justif-note" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px;resize:none;height:70px" placeholder="Informations supplémentaires…"></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button onclick="document.getElementById('modal-justif').remove()" style="padding:9px 18px;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;font-family:'Sora',sans-serif;font-size:13px">Annuler</button>
          <button onclick="soumettreJustif(${absId},'${userId}')" style="padding:9px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;cursor:pointer;font-family:'Sora',sans-serif;font-size:13px;font-weight:600">✅ Envoyer la justification</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function soumettreJustif(absId, userId) {
  const abs = (DB.absences[userId] || []).find(a => a.id === absId);
  if (abs) {
    abs.statut = 'En cours de traitement';
    renderAbsences({ id: userId });
  }
  document.getElementById('modal-justif')?.remove();
  showToast('✅ Justificatif envoyé à la Vie Scolaire');
}

/* ─── RESSOURCES ─── */
const RESSOURCES_DATA = [
  { cat: 'Manuels', icone: '📘', titre: 'Manuels numériques', desc: 'Tous vos manuels scolaires en ligne', lien: 'https://www.lelivrescolaire.fr', tag: 'Gratuit' },
  { cat: 'Manuels', icone: '📗', titre: 'Leçons PDF', desc: 'Cours partagés par vos professeurs', lien: 'https://www.schoolmouv.fr', tag: 'Nouveau' },
  { cat: 'Exercices', icone: '🎓', titre: 'Khan Academy', desc: 'Exercices interactifs toutes matières', lien: 'https://fr.khanacademy.org', tag: 'Externe' },
  { cat: 'Exercices', icone: '🧮', titre: 'GeoGebra', desc: 'Géométrie et calcul interactif', lien: 'https://www.geogebra.org', tag: 'Externe' },
  { cat: 'Exercices', icone: '📝', titre: 'Lumni', desc: 'Vidéos éducatives Éducation Nationale', lien: 'https://www.lumni.fr', tag: 'Officiel' },
  { cat: 'Sciences', icone: '🔬', titre: 'Labos virtuels', desc: 'Simulations de TP scientifiques', lien: 'https://www.pedagogix-tagc.univ-mrs.fr', tag: 'Interactif' },
  { cat: 'Sciences', icone: '🌍', titre: 'Atlas numérique', desc: 'Cartes interactives de géographie', lien: 'https://www.geoportail.gouv.fr', tag: 'Officiel' },
  { cat: 'Culture', icone: '📚', titre: 'Bibliothèque ENT', desc: 'Romans, BD et documents disponibles', lien: 'https://mediatheque.numerique.fr', tag: 'Gratuit' },
  { cat: 'Outils', icone: '🖥️', titre: 'Suite bureautique', desc: 'Traitement de texte et tableur en ligne', lien: 'https://www.office.com', tag: 'Gratuit' },
  { cat: 'Outils', icone: '🔤', titre: 'Dictionnaire', desc: 'Larousse et définitions en ligne', lien: 'https://www.larousse.fr', tag: 'Gratuit' },
  { cat: 'Aide', icone: '🤝', titre: 'Devoirs faits', desc: 'Aide aux devoirs en ligne', lien: 'https://www.devoirsfaits.fr', tag: 'Officiel' },
  { cat: 'Aide', icone: '🎯', titre: 'Onisep', desc: 'Orientation scolaire et métiers', lien: 'https://www.onisep.fr', tag: 'Officiel' },
];
let currentCat = 'Tous';

function renderRessources() {
  const cats = ['Tous', ...new Set(RESSOURCES_DATA.map(r => r.cat))];
  const catsEl = $('ressources-cats');
  if (catsEl) catsEl.innerHTML = cats.map(c => `<button class="ressource-cat-btn ${c === currentCat ? 'active' : ''}" onclick="filterCat('${c}')">${c}</button>`).join('');
  renderRessourcesGrid(RESSOURCES_DATA.filter(r => currentCat === 'Tous' || r.cat === currentCat));
}
function filterCat(cat) { currentCat = cat; renderRessources(); }
function filterRessources(q) { renderRessourcesGrid(RESSOURCES_DATA.filter(r => r.titre.toLowerCase().includes(q.toLowerCase()) || r.desc.toLowerCase().includes(q.toLowerCase()))); }
function renderRessourcesGrid(data) {
  const grid = $('ressources-grid');
  if (!grid) return;
  grid.innerHTML = data.map(r => `
    <a href="${r.lien}" target="${r.lien !== '#' ? '_blank' : '_self'}" class="ressource-card" style="text-decoration:none">
      <div style="font-size:28px;margin-bottom:10px">${r.icone}</div>
      <div class="ressource-title">${r.titre}</div>
      <div class="ressource-desc">${r.desc}</div>
    </a>`).join('') || '<p style="color:#94A3B8;text-align:center;padding:30px;grid-column:1/-1">Aucune ressource trouvée</p>';
}

/* ─── VIE SCOLAIRE ─── */
function buildCantineHtml(isDemiP, jours, repasCoches, userId) {
  if (!isDemiP) {
    return `<div class="vs-card">
      <h4>🍽️ Cantine</h4>
      <div style="text-align:center;padding:20px;color:#94A3B8;font-size:13px">
        <div style="font-size:32px;margin-bottom:10px">🚶</div>
        Vous êtes inscrit(e) en tant qu'<strong>externe</strong>.<br>La cantine n'est pas disponible pour votre régime.
      </div>
    </div>`;
  }
  const cartes = jours.map(j => {
    const m = DB.menusCantine[j];
    if (!m) return '';
    const coche = repasCoches[j] || false;
    const bg = coche ? '#F0FDF4' : '#F8FAFC';
    const bord = coche ? '#86EFAC' : '#E2E8F0';
    const btnBg = coche ? '#16A34A' : '#E2E8F0';
    const btnCl = coche ? '#fff' : '#64748B';
    const btnTx = coche ? '✓ Inscrit' : "+ S'inscrire";
    return '<div style="background:' + bg + ';border-radius:10px;padding:12px;border:1.5px solid ' + bord + ';transition:all .2s">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
      + '<div style="font-weight:700;font-size:12px;color:#1E3A8A">' + j + '</div>'
      + '<button onclick="toggleRepas(' + "'" + j + "','" + userId + "')" + '"'
      + ' style="background:' + btnBg + ';color:' + btnCl + ';border:none;border-radius:6px;padding:3px 10px;font-size:11px;cursor:pointer;font-family:Sora,sans-serif;font-weight:600">'
      + btnTx + '</button></div>'
      + '<div style="font-size:11px;color:#64748B;display:flex;flex-direction:column;gap:4px">'
      + '<div>🥗 ' + m.entree + '</div>'
      + '<div>🍖 ' + m.plat + '</div>'
      + '<div>🌿 <em>' + m.veggie + '</em></div>'
      + '<div>🍮 ' + m.dessert + '</div>'
      + '</div></div>';
  }).join('');
  return '<div class="vs-card" style="grid-column:1/-1">'
    + '<h4>🍽️ Menu Cantine — Semaine du 18 mars</h4>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px">'
    + cartes + '</div>'
    + '<div style="margin-top:10px;font-size:11px;color:#94A3B8;text-align:center">Les inscriptions sont fermes jusqu\'à la veille à 12h00</div>'
    + '</div>';
}

function renderVieScolaire(user) {
  const regime = user.regime || 'externe';
  const isDemiP = regime === 'demi-pensionnaire';

  // Demandes absence
  const demandesAbs = DB.demandesAbsence?.[user.id] || [];

  // Menus cantine
  const jours = Object.keys(DB.menusCantine || {});
  const repasCoches = JSON.parse(localStorage.getItem('repas_coches_' + user.id) || '{}');

  const cantineHtml = buildCantineHtml(isDemiP, jours, repasCoches, user.id);

  $('vie-scolaire-grid').innerHTML = `
    <!-- Profil + Infos -->
    <div class="vs-card">
      <h4>👤 Mon profil</h4>
      <div style="font-size:13px;display:flex;flex-direction:column;gap:8px">
        <div><span style="color:#64748B">Nom :</span> <strong>${user.nom}</strong></div>
        <div><span style="color:#64748B">Prénom :</span> <strong>${user.prenom}</strong></div>
        <div><span style="color:#64748B">Classe :</span> <strong>${user.classe}</strong></div>
        <div><span style="color:#64748B">Naissance :</span> <strong>${user.dateNaissance || '–'}</strong></div>
        <div><span style="color:#64748B">Email :</span> <strong>${user.email || user.id + '@asimov.edu'}</strong></div>
        <div style="margin-top:4px">
          <span style="background:${isDemiP ? '#F0FDF4' : '#F1F5F9'};color:${isDemiP ? '#15803D' : '#64748B'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">
            ${isDemiP ? '🍽️ Demi-pensionnaire' : '🚶 Externe'}
          </span>
        </div>
      </div>
    </div>

    <!-- Événements -->
    <div class="vs-card">
      <h4>📅 Événements à venir</h4>
      <div style="font-size:13px;display:flex;flex-direction:column;gap:10px">
        <div style="padding:8px;background:#F0F4FF;border-radius:8px;border-left:3px solid #3B82F6"><div style="font-weight:700">Conseil de classe – 2ème trimestre</div><div style="color:#64748B">Jeudi 20 mars 2026</div></div>
        <div style="padding:8px;background:#F0FDF4;border-radius:8px;border-left:3px solid #10B981"><div style="font-weight:700">Réunion parents-professeurs</div><div style="color:#64748B">Jeudi 20 mars 2026 – 17h00</div></div>
        <div style="padding:8px;background:#FEF3C7;border-radius:8px;border-left:3px solid #F59E0B"><div style="font-weight:700">Sortie scolaire – Musée des Sciences</div><div style="color:#64748B">Vendredi 28 mars 2026</div></div>
      </div>
    </div>

    <!-- Règlement intérieur -->
    <div class="vs-card">
      <h4>📋 Règlement intérieur</h4>
      <div style="font-size:13px;color:#64748B;margin-bottom:12px">Mis à jour le 01/09/2024 — Collège Asimov</div>
      <button onclick="ouvrirReglementInterieur()"
        style="width:100%;padding:10px;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px">
        📖 Lire le règlement intérieur
      </button>
      <div style="margin-top:10px;font-size:11px;color:#94A3B8;display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;align-items:center;gap:6px"><span style="color:#10B981">✓</span> Ponctualité et assiduité obligatoires</div>
        <div style="display:flex;align-items:center;gap:6px"><span style="color:#10B981">✓</span> Respect des personnes et du matériel</div>
        <div style="display:flex;align-items:center;gap=6px"><span style="color:#10B981">✓</span> Téléphones interdits en classe</div>
      </div>
    </div>

    <!-- Demandes d'absence -->
    <div class="vs-card">
      <h4>📝 Mes demandes d'absence</h4>
      <div id="demandes-absence-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
        ${demandesAbs.length ? demandesAbs.map(d => `
          <div style="background:#F8FAFC;border-radius:9px;padding:10px 12px;border:1px solid #E2E8F0;display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div style="font-size:12px;font-weight:700;color:#0F172A">${d.dateDebut}${d.dateFin !== d.dateDebut ? ' → ' + d.dateFin : ''}</div>
              <div style="font-size:11px;color:#64748B;margin-top:2px">${d.motif}</div>
            </div>
            <span style="background:${d.statut === 'validée' ? '#D1FAE5' : d.statut === 'en attente' ? '#FEF3C7' : '#FEE2E2'};color:${d.statut === 'validée' ? '#065F46' : d.statut === 'en attente' ? '#92400E' : '#991B1B'};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${d.statut}</span>
            ${d.modifiable ? `
              <button onclick="supprimerDemandeAbsence(${d.id},'${user.id}')" title="Supprimer"
                style="background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#DC2626">✕</button>` : ''}
          </div>`).join('')
      : '<p style="font-size:13px;color:#94A3B8;text-align:center;padding:10px">Aucune demande en cours</p>'}
      </div>
      <button onclick="ouvrirDemandeAbsence('${user.id}')"
        style="width:100%;padding:9px;background:#EFF6FF;color:#2563EB;border:1.5px solid #BFDBFE;border-radius:9px;cursor:pointer;font-family:'Sora',sans-serif;font-size:13px;font-weight:600">
        + Nouvelle demande d'absence
      </button>
    </div>

    <!-- Informations pratiques -->
    <div class="vs-card">
      <h4>ℹ️ Informations pratiques</h4>
      <div style="font-size:13px;display:flex;flex-direction:column;gap:8px">
        <div style="padding:8px;background:#F8FAFC;border-radius:8px">📞 Accueil : <strong>01 23 45 67 89</strong></div>
        <div style="padding:8px;background:#F8FAFC;border-radius:8px">📧 Secrétariat : <strong>secretariat@asimov.edu</strong></div>
        <div style="padding:8px;background:#F8FAFC;border-radius:8px">🏥 Infirmière : <strong>Mme Garnier — Bâtiment A</strong></div>
        <div style="padding:8px;background:#F8FAFC;border-radius:8px">🛡️ CPE : <strong>M. Vidal — Bureau 104</strong></div>
      </div>
    </div>

    ${cantineHtml}`;
}

function toggleRepas(jour, userId) {
  const key = 'repas_coches_' + userId;
  const coches = JSON.parse(localStorage.getItem(key) || '{}');
  coches[jour] = !coches[jour];
  localStorage.setItem(key, JSON.stringify(coches));
  renderVieScolaire(currentUser);
  showToast(coches[jour] ? '✅ Repas réservé — ' + jour : '○ Réservation annulée — ' + jour);
}

function ouvrirDemandeAbsence(userId) {
  const existing = document.getElementById('modal-demande-abs');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'modal-demande-abs';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(460px,95vw);padding:24px;box-shadow:0 24px 64px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="font-size:16px;font-weight:700;color:#0F172A">📝 Nouvelle demande d'absence</h3>
        <button onclick="document.getElementById('modal-demande-abs').remove()" style="background:#F1F5F9;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Date début</label>
            <input type="date" id="dem-abs-debut" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px">
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Date fin</label>
            <input type="date" id="dem-abs-fin" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px">
          </div>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Motif</label>
          <input type="text" id="dem-abs-motif" placeholder="Ex: Rendez-vous médical, compétition…"
            style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px">
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px">
          <button onclick="document.getElementById('modal-demande-abs').remove()"
            style="padding:9px 18px;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;font-family:'Sora',sans-serif">Annuler</button>
          <button onclick="soumettreDemAbsence('${userId}')"
            style="padding:9px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600">Envoyer</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function soumettreDemAbsence(userId) {
  const debut = $('dem-abs-debut')?.value;
  const fin = $('dem-abs-fin')?.value;
  const motif = $('dem-abs-motif')?.value.trim();
  if (!debut || !motif) { showToast('⚠️ Remplissez tous les champs'); return; }
  const debutFR = new Date(debut).toLocaleDateString('fr-FR');
  const finFR = fin ? new Date(fin).toLocaleDateString('fr-FR') : debutFR;
  if (!DB.demandesAbsence) DB.demandesAbsence = {};
  if (!DB.demandesAbsence[userId]) DB.demandesAbsence[userId] = [];
  const id = Date.now();
  DB.demandesAbsence[userId].push({ id, dateDebut: debutFR, dateFin: finFR, motif, statut: 'en attente', modifiable: true });
  document.getElementById('modal-demande-abs')?.remove();
  renderVieScolaire(currentUser);
  showToast('✅ Demande d\'absence envoyée à la Vie Scolaire');
}

function supprimerDemandeAbsence(id, userId) {
  if (!DB.demandesAbsence?.[userId]) return;
  DB.demandesAbsence[userId] = DB.demandesAbsence[userId].filter(d => d.id !== id);
  renderVieScolaire(currentUser);
  showToast('🗑 Demande supprimée');
}

function ouvrirReglementInterieur() {
  const existing = document.getElementById('modal-reglement');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'modal-reglement';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(680px,96vw);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3)">
      <div style="display:flex;align-items:center;gap:14px;padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#1E3A8A;border-radius:16px 16px 0 0">
        <div style="font-size:28px">📋</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:16px;color:#fff">Règlement intérieur — Collège Asimov</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7)">Mis à jour le 01/09/2024 · Académie de Paris</div>
        </div>
        <button onclick="document.getElementById('modal-reglement').remove()"
          style="background:rgba(255,255,255,.15);border:none;border-radius:8px;width:32px;height:32px;color:#fff;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;font-size:13px;line-height:1.7;color:#374151">
        ${[
      { titre: 'Article 1 — Assiduité et ponctualité', contenu: 'Tout élève a l\'obligation d\'assister à tous les cours inscrits à son emploi du temps. Toute absence doit être signalée par la famille dès le premier jour et justifiée dans les 48h. Les retards répétés font l\'objet d\'un avertissement.' },
      { titre: 'Article 2 — Tenue et comportement', contenu: 'Les élèves doivent adopter une tenue vestimentaire correcte et décente. Le port de tenues à caractère politique, religieux ou provoquant est interdit. Le respect mutuel entre élèves et adultes est une exigence fondamentale.' },
      { titre: 'Article 3 — Téléphones et équipements numériques', contenu: 'L\'utilisation du téléphone portable est interdite dans l\'enceinte de l\'établissement pendant les heures de cours. Les appareils doivent être rangés et éteints. Tout appareil saisi sera remis aux parents.' },
      { titre: 'Article 4 — Respect du matériel', contenu: 'Chaque élève est responsable du matériel et des locaux mis à sa disposition. Les dégradations volontaires entraînent une sanction disciplinaire et le remboursement des dommages par la famille.' },
      { titre: 'Article 5 — Harcèlement et violence', contenu: 'Tout acte de violence physique ou verbale, toute forme de harcèlement ou de cyberharcèlement est strictement interdit et sanctionné. L\'établissement met en œuvre une politique de tolérance zéro.' },
      { titre: 'Article 6 — Cantine et internat', contenu: 'Les demi-pensionnaires doivent se conformer aux horaires de la cantine. Les inscriptions aux repas se font via l\'ENT. Tout repas réservé et non annulé avant 12h la veille reste dû.' },
      { titre: 'Article 7 — Sanctions', contenu: 'Les manquements au règlement peuvent entraîner : avertissement, retenue, exclusion temporaire ou définitive selon la gravité. Toute sanction est inscrite au dossier scolaire et portée à la connaissance des familles.' },
    ].map(a => `
          <div style="background:#F8FAFC;border-radius:10px;padding:14px 16px;border-left:3px solid #1E3A8A">
            <div style="font-weight:700;color:#1E3A8A;margin-bottom:6px;font-size:13px">${a.titre}</div>
            <div>${a.contenu}</div>
          </div>`).join('')}
        <div style="text-align:center;padding:12px;color:#94A3B8;font-size:12px;border-top:1px solid #F1F5F9;margin-top:8px">
          Document officiel — Collège Asimov · Académie de Paris · Année scolaire 2024-2025
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ─── NAVIGATION ÉLÈVE ─── */
/* ══════════════════════════════════════════════
   PROGRESSION ÉLÈVE — synchronisée avec le prof
   ══════════════════════════════════════════════ */
function renderEleveProgression(user) {
  const container = $('eleve-prog-container');
  const subtitle = $('eleve-prog-subtitle');
  if (!container) return;

  const classe = user.classe || '';
  const annee = getAnneeScolaire();

  // Subtitle dynamique
  if (subtitle) {
    const p = getPeriodes();
    const now = new Date();
    const trim = p.trimestres.find(t => now >= t.debut && now <= t.fin);
    subtitle.textContent = trim
      ? `${trim.nom.split('(')[0].trim()} — ${annee.label.replace('-', '/')}`
      : `Année scolaire ${annee.label.replace('-', '/')}`;
  }

  // Récupérer toutes les matières de l'élève depuis ses notes + EDT
  const notesUser = DB.notes[user.id] || [];
  const matieres = notesUser.map(n => n.matiere);
  // Ajouter matières de l'EDT qui ne sont pas dans les notes
  const edt = getEmploiEleve(user);
  Object.values(edt).forEach(jour => {
    (jour || []).forEach(s => {
      if (s.type === 'cours' && s.matiere && !matieres.includes(s.matiere))
        matieres.push(s.matiere);
    });
  });

  if (!matieres.length) {
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#94A3B8">
      <p style="font-size:14px">Aucune matière trouvée pour ta classe.</p>
    </div>`;
    return;
  }

  // Barre globale toutes matières
  const now = new Date();
  let totalPct = 0, count = 0;
  matieres.forEach(mat => {
    const ch = getChapitreEleveForMatiere(classe, mat);
    if (!ch) return;
    let p = 0;
    if (ch.statut === 'termine') p = 100;
    else if (ch.statut === 'en_cours' && ch.debut && ch.fin) {
      p = Math.round(Math.min(Math.max((now - new Date(ch.debut)) / (new Date(ch.fin) - new Date(ch.debut)), 0), 1) * 100);
    }
    totalPct += p; count++;
  });
  const pctGlobal = count ? Math.round(totalPct / count) : 0;

  let html = `
  <!-- Barre globale -->
  <div style="background:#fff;border-radius:14px;border:1px solid #E2E8F0;padding:20px 24px;margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div>
        <div style="font-size:13px;font-weight:700;color:#0F172A">Avancement global — ${classe}</div>
        <div style="font-size:11px;color:#94A3B8;margin-top:2px">${matieres.length} matières · Année ${annee.label.replace('-', '/')}</div>
      </div>
      <div style="font-size:32px;font-weight:800;color:#2563EB">${pctGlobal}<span style="font-size:14px;font-weight:500;color:#94A3B8">%</span></div>
    </div>
    <div style="height:10px;background:#F1F5F9;border-radius:20px;overflow:hidden">
      <div style="height:100%;background:linear-gradient(90deg,#2563EB,#7C3AED);border-radius:20px;width:0%;transition:width 1.2s ease" data-w="${pctGlobal}%"></div>
    </div>
  </div>

  <!-- Grille matières -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">`;

  matieres.forEach((matiere, idx) => {
    const col = getMatiereColor(matiere);
    const ch = getChapitreEleveForMatiere(classe, matiere);

    // Tous les chapitres de cette matière pour la mini-timeline
    const tous = Auth.getAll();
    const profEntry = tous.find(u =>
      u.role === 'professeur' && u.matiere === matiere && (u.classes || []).includes(classe)
    );
    let tousChaps = [];
    if (profEntry) {
      tousChaps = [...(CHAPITRES_PROG[profEntry.id]?.[classe] || [])].sort((a, b) => a.num - b.num);
      if (!tousChaps.length) {
        if (!CHAPITRES_PROG[profEntry.id]) CHAPITRES_PROG[profEntry.id] = {};
        CHAPITRES_PROG[profEntry.id][classe] = getChapitresDefautNiveau(classe, annee.debut);
        tousChaps = [...CHAPITRES_PROG[profEntry.id][classe]].sort((a, b) => a.num - b.num);
      }
    }

    const nbTermines = tousChaps.filter(c => c.statut === 'termine').length;
    const nbTotal = tousChaps.length;

    let pct = 0;
    if (ch) {
      if (ch.statut === 'termine') pct = 100;
      else if (ch.statut === 'en_cours' && ch.debut && ch.fin) {
        pct = Math.round(Math.min(Math.max((now - new Date(ch.debut)) / (new Date(ch.fin) - new Date(ch.debut)), 0), 1) * 100);
      }
    }

    const statusColor = !ch ? '#94A3B8' : ch.statut === 'termine' ? '#16A34A' : ch.statut === 'en_cours' ? col.dot : '#94A3B8';
    const statusLabel = !ch ? '–' : ch.statut === 'termine' ? '✅ Terminé' : ch.statut === 'en_cours' ? '⏳ En cours' : '📅 À venir';

    // Mini-timeline : petits ronds pour chaque chapitre
    const miniDots = tousChaps.map(c => {
      const isCurrent = ch && c.id === ch.id;
      const dotColor = c.statut === 'termine' ? '#16A34A' : c.statut === 'en_cours' ? col.dot : '#E2E8F0';
      return `<div title="Ch.${c.num} — ${c.titre}" style="
        width:${isCurrent ? '18px' : '10px'};
        height:${isCurrent ? '18px' : '10px'};
        border-radius:50%;
        background:${dotColor};
        border:${isCurrent ? `3px solid ${col.dot}` : 'none'};
        box-shadow:${isCurrent ? `0 0 0 3px ${col.dot}30` : 'none'};
        flex-shrink:0;
        transition:all .2s;
        cursor:default;
      "></div>`;
    }).join(`<div style="flex:1;height:2px;background:#E2E8F0;align-self:center;min-width:4px"></div>`);

    const debutStr = ch?.debut ? new Date(ch.debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';
    const finStr = ch?.fin ? new Date(ch.fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';

    // Semaine actuelle
    let semInfo = '';
    if (ch?.debut && ch?.fin) {
      const s1 = getNumSemaine(new Date(ch.debut));
      const s2 = getNumSemaine(new Date(ch.fin));
      const sa = getNumSemaine(now);
      const enCours = sa >= s1 && sa <= s2;
      semInfo = enCours
        ? `<span style="background:#DBEAFE;color:#1D4ED8;padding:1px 7px;border-radius:5px;font-size:10px;font-weight:700">Sem. ${sa}</span>`
        : `<span style="font-size:10px;color:#CBD5E1">S${s1}–S${s2}</span>`;
    }

    html += `
    <div style="background:#fff;border-radius:14px;border:1.5px solid ${col.border};padding:18px 20px;transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 6px 20px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
      <!-- En-tête matière -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:10px;height:10px;border-radius:50%;background:${col.dot};flex-shrink:0"></div>
        <span style="font-weight:700;font-size:14px;color:${col.text};flex:1">${matiere}</span>
        <span style="font-size:11px;font-weight:700;color:#94A3B8">${nbTermines}/${nbTotal} ch.</span>
      </div>

      <!-- Mini timeline des chapitres -->
      ${nbTotal > 0 ? `<div style="display:flex;align-items:center;gap:0;margin-bottom:14px;padding:0 2px">${miniDots}</div>` : ''}

      <!-- Chapitre en cours -->
      ${ch ? `
      <div style="background:${col.bg};border-radius:9px;padding:10px 12px;border-left:3px solid ${statusColor}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap">
          <span style="font-size:10px;font-weight:700;color:#94A3B8">Ch. ${ch.num}</span>
          <span style="font-size:12px;font-weight:700;color:${col.text};flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ch.titre}</span>
          <span style="background:${statusColor}20;color:${statusColor};padding:1px 7px;border-radius:20px;font-size:10px;font-weight:700;flex-shrink:0">${statusLabel}</span>
        </div>
        ${ch.desc ? `<div style="font-size:11px;color:#94A3B8;margin-bottom:6px">${ch.desc}</div>` : ''}
        <div style="height:6px;background:#E2E8F0;border-radius:20px;overflow:hidden;margin-bottom:5px">
          <div class="eleve-prog-bar" data-w="${pct}%" style="height:100%;background:${statusColor};border-radius:20px;width:0%;transition:width 0.9s ease ${idx * 0.08}s"></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">${semInfo}${debutStr ? `<span style="font-size:10px;color:#CBD5E1">${debutStr} → ${finStr}</span>` : ''}</div>
          <span style="font-size:12px;font-weight:800;color:${statusColor}">${pct}%</span>
        </div>
      </div>` : `<div style="font-size:12px;color:#94A3B8;text-align:center;padding:10px">Aucun chapitre disponible</div>`}
    </div>`;
  });

  html += '</div>';
  container.innerHTML = html;

  // Animer toutes les barres
  setTimeout(() => {
    container.querySelectorAll('.eleve-prog-bar').forEach(b => { b.style.width = b.dataset.w; });
    const globalBar = container.querySelector('[data-w]');
    if (globalBar) globalBar.style.width = globalBar.dataset.w;
  }, 80);
}

function showSection(id, linkEl) {
  document.querySelectorAll('#page-eleve .dash-section').forEach(s => s.classList.remove('active'));
  $(`section-${id}`).classList.add('active');
  document.querySelectorAll('#page-eleve .nav-item').forEach(n => n.classList.remove('active'));
  const target = linkEl || document.querySelector(`#page-eleve .nav-item[onclick*="${id}"]`);
  if (target) target.classList.add('active');
  if (id === 'progression' && currentUser) renderEleveProgression(currentUser);
  if (currentUser && NOTIFS[currentUser.id]) {
    NOTIFS[currentUser.id].filter(n => n.cible === id && !n.lu).forEach(n => n.lu = true);
    updateNotifBadge('eleve');
  }
}

/* ══════════════════════════════════════════════
   DASHBOARD PROF
   ══════════════════════════════════════════════ */

function setupProfDashboard(user) {
  $('prof-fullname').textContent = `${user.prenom} ${user.nom}`;
  $('prof-matiere').textContent = user.matiere;
  $('prof-avatar').textContent = getInitials(user.prenom, user.nom);
  $('prof-welcome').textContent = `Bonjour, ${user.nom} 👋`;
  $('prof-today-date').textContent = formatDateFR();

  renderProfPlanningToday(user);
  renderProfClassesHome(user);
  renderActivityLog(user);
  renderProfClassesGrid(user);
  renderProfTimetable(user);
  setTimeout(updateProfNavBadge, 100);
  renderProfMailList(user);
  renderProfDsAndRattrapages(user);
  setTimeout(() => { initAppelAuto(); updateProfNotifBadge(); }, 200);
}

function renderProfPlanningToday(user) {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const aujourd = jours[new Date().getDay()];
  const planning = DB.planningProf[user.id] || {};
  const cours = planning[aujourd] || planning['Lundi'] || [];
  $('prof-planning-today').innerHTML = cours.map(c => `
    <div class="prof-slot">
      <span class="prof-slot-time">${c.heure}</span>
      <div><div class="prof-slot-class">${c.classe}</div><div class="prof-slot-room">${c.salle}</div></div>
    </div>`).join('') || '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:20px">Pas de cours aujourd\'hui</p>';
}

function getClassKey(nom) {
  /* '4ème B' → '4B', '6ème A' → '6A', etc. */
  const m = nom.match(/^(\d)ème ([A-D])$/);
  if (m) return m[1] + m[2];
  return null;
}

function renderProfClassesHome(user) {
  const classes = user.classes || [];
  $('prof-classes-home').innerHTML = classes.map(c => {
    const key = getClassKey(c);
    const count = DB.classes[key]?.eleves?.length || 0;
    return `<div class="prof-class-chip"><span class="prof-class-name">${c}</span><span class="prof-class-count">${count} élèves</span></div>`;
  }).join('');
}

function voirDernieresNotes() {
  const navLink = document.querySelector('#page-prof .nav-item[onclick*="prof-notes"]');
  showProfSection('prof-notes', navLink);
  // Si une dernière saisie existe, pré-sélectionner la classe
  if (window._derniereSaisie?.classe) {
    setTimeout(() => {
      const sel = $('saisie-classe');
      if (sel) { sel.value = window._derniereSaisie.classe; loadClasseNotes(); }
      // Afficher un bandeau récap
      const container = $('saisie-table-container');
      if (container && window._derniereSaisie) {
        const recap = document.createElement('div');
        recap.style.cssText = 'background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:1.5px solid #86EFAC;border-radius:10px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px;font-size:13px';
        recap.innerHTML = `<span style="font-size:18px">✅</span><div><strong style="color:#15803D">Dernière saisie :</strong> <span style="color:#374151">${window._derniereSaisie.classeNom} — ${window._derniereSaisie.evalLabel} n°${window._derniereSaisie.num}</span></div>`;
        container.prepend(recap);
        setTimeout(() => recap.remove(), 4000);
      }
    }, 100);
  }
}

function renderActivityLog(user) {
  const activite = DB.activite[user.id] || [];
  $('activity-log').innerHTML = activite.map(a => {
    const isNotes = a.type === 'notes';
    return `
    <div class="activity-item" ${isNotes ? `onclick="ouvrirNotesDepuisJournal('${a.classeKey}','${a.evalId}')" style="cursor:pointer;transition:background .15s" onmouseover="this.style.background='#F0F4FF'" onmouseout="this.style.background=''"` : ''}>
      <div class="activity-dot" style="background:${a.couleur}"></div>
      <span class="activity-text">${isNotes ? '📝 ' : ''}${a.texte}</span>
      <span class="activity-time">${a.heure}</span>
      ${isNotes ? '<span style="font-size:10px;color:#2563EB;font-weight:600;white-space:nowrap">→ voir notes</span>' : ''}
    </div>`;
  }).join('');
}

function ouvrirNotesDepuisJournal(classeKey, evalId) {
  if (!classeKey) return;
  // Naviguer vers saisie des notes
  const navLink = document.querySelector('#page-prof .nav-item[onclick*="prof-notes"]');
  showProfSection('prof-notes', navLink);
  setTimeout(() => {
    // Sélectionner la classe
    const sel = $('saisie-classe');
    if (sel && sel.value !== classeKey) { sel.value = classeKey; loadClasseNotes(); }
    // Basculer sur l'historique
    switchNotesView('historique');
    // Déplier la bonne carte
    setTimeout(() => {
      renderHistoriqueNotes(evalId);
      const card = $(`histo-card-${evalId}`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, 80);
}

function voirDernieresNotes() {
  const navLink = document.querySelector('#page-prof .nav-item[onclick*="prof-notes"]');
  showProfSection('prof-notes', navLink);
  if (window._derniereSaisie?.classe) {
    setTimeout(() => {
      const sel = $('saisie-classe');
      if (sel) { sel.value = window._derniereSaisie.classe; loadClasseNotes(); }
      if (window._derniereSaisie.evalId) {
        switchNotesView('historique');
        setTimeout(() => renderHistoriqueNotes(window._derniereSaisie.evalId), 80);
      }
    }, 80);
  }
}

function renderProfDsAndRattrapages(user) {
  // DS programmés (données exemple liées aux classes du prof)
  const dsList = $('prof-ds-list');
  const rattList = $('prof-rattrapages-list');
  if (!dsList || !rattList) return;

  const classes = user.classes || [];
  const ds = [
    { classe: '4ème B', titre: 'DS Chapitre 4 — Fractions', date: '20/03' },
    { classe: '6ème A', titre: 'Interrogation — Puissances', date: '21/03' },
    { classe: '5ème C', titre: 'Devoir maison noté', date: '25/03' },
  ].filter(d => classes.some(c => c === d.classe));

  const rattrapages = [
    { classe: '4ème B', eleve: 'Lucas Martin', motif: 'Absent DS 14/03', date: '24/03' },
    { classe: '6ème A', eleve: 'Emma Rousseau', motif: 'Absent interro 10/03', date: '22/03' },
  ].filter(r => classes.some(c => c === r.classe));

  dsList.innerHTML = (ds.length ? ds.map(d => `
    <div style="background:#fff;border-radius:7px;padding:8px 10px;border-left:3px solid #3B82F6;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;color:#1E3A8A">${d.classe}</div>
        <div style="color:#64748B;margin-top:2px">${d.titre}</div>
      </div>
      <div style="background:#DBEAFE;color:#1D4ED8;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700;flex-shrink:0">${d.date}</div>
    </div>`).join('')
    : `<div style="color:#94A3B8;font-size:12px;text-align:center;padding:10px">Aucun DS prévu</div>`);

  rattList.innerHTML = (rattrapages.length ? rattrapages.map(r => `
    <div style="background:#fff;border-radius:7px;padding:8px 10px;border-left:3px solid #F59E0B;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;color:#92400E">${r.eleve} <span style="font-weight:400;color:#64748B">(${r.classe})</span></div>
        <div style="color:#64748B;margin-top:2px">${r.motif}</div>
      </div>
      <div style="background:#FEF3C7;color:#D97706;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700;flex-shrink:0">${r.date}</div>
    </div>`).join('')
    : `<div style="color:#94A3B8;font-size:12px;text-align:center;padding:10px">Aucun rattrapage prévu</div>`);
}

function renderProfClassesGrid(user) {
  const niveaux = ['6ème', '5ème', '4ème', '3ème'];
  let html = '';
  niveaux.forEach(niv => {
    const classesNiv = (user.classes || []).filter(c => c.startsWith(niv));
    if (!classesNiv.length) return;
    html += `<div style="grid-column:1/-1;font-size:13px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;padding:8px 0 4px">${niv}</div>`;
    classesNiv.forEach(c => {
      const key = getClassKey(c);
      const classe = DB.classes[key];
      if (!classe) return;
      const avg = (classe.eleves.reduce((s, e) => s + e.avg, 0) / classe.eleves.length).toFixed(1);
      html += `
        <div class="prof-class-card">
          <div class="prof-class-card-header">
            <div class="prof-class-card-name">${c}</div>
            <div class="prof-class-card-students">${classe.eleves.length} élèves · Moy. <strong>${avg}</strong></div>
          </div>
          <div class="student-list">
            ${classe.eleves.slice(0, 6).map(s => `
              <div class="student-item">
                <div class="student-avatar">${s.nom.split(' ').map(w => w[0]).join('').substring(0, 2)}</div>
                <span class="student-name">${s.nom}</span>
                <span class="student-avg ${getAverageColor(s.avg)}">${s.avg}</span>
              </div>`).join('')}
            ${classe.eleves.length > 6 ? `<div style="font-size:11px;color:#94A3B8;padding:4px 0 0 8px">+ ${classe.eleves.length - 6} autres élèves…</div>` : ''}
          </div>
        </div>`;
    });
  });
  $('prof-classes-grid').innerHTML = html;
}

/* ═══════════════════════════════════════════
   PLANNING PROF — même format EDT élève/parent
   ═══════════════════════════════════════════ */

// Mapping horaires planningProf (arrondis) → debutKey EDT réel
const PROF_HEURE_MAP = {
  '08h00': '08h15', '09h00': '09h10',
  '10h15': '10h20', '11h15': '11h15',
  '14h00': '13h45', '15h00': '14h40',
  '16h00': '15h50', '17h00': '16h45',
};

function _buildProfTimetableHtml(planningProf, profUser, containerId) {
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const edtRef = DB.emploiDuTemps['4ème B'] || {};

  // Toutes les clés horaires dans l'ordre (référence = EDT élève)
  const allKeys = [];
  const keySet = new Set();
  jours.forEach(j => (edtRef[j] || []).forEach(s => {
    if (!keySet.has(s.debutKey)) { keySet.add(s.debutKey); allKeys.push(s.debutKey); }
  }));

  // Index EDT référence
  const refIdx = {};
  jours.forEach(j => { refIdx[j] = {}; (edtRef[j] || []).forEach(s => { refIdx[j][s.debutKey] = s; }); });

  // Index planning prof (remapper les horaires)
  const profIdx = {};
  jours.forEach(j => {
    profIdx[j] = {};
    (planningProf[j] || []).forEach(cours => {
      const debut = cours.heure.split(' – ')[0].trim();
      const mapped = PROF_HEURE_MAP[debut] || debut;
      profIdx[j][mapped] = cours;
    });
  });

  // Couleur matière prof
  const col = getMatiereColor(profUser?.matiere || 'Mathématiques');

  const ROW_H = 60, REPAS_H = 48, PAUSE_H = 22;
  const now = new Date(), monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  const fmt = d => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

  let html = `<table style="width:100%;border-collapse:separate;border-spacing:3px;min-width:800px">
    <thead><tr>
      <th style="width:68px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;"></th>`;
  jours.forEach((j, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    html += `<th style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;font-size:12px;font-weight:700;color:#64748B;text-align:center">${j}<br><span style="font-size:10px;font-weight:400">${fmt(d)}</span></th>`;
  });
  html += `</tr></thead><tbody>`;

  const skipCells = {}; jours.forEach(j => { skipCells[j] = new Set(); });

  allKeys.forEach((key, ki) => {
    const refSlot = jours.map(j => refIdx[j]?.[key]).find(Boolean); if (!refSlot) return;
    const isRepas = refSlot.type === 'repas', isPause = refSlot.type === 'pause';
    const rowH = isRepas ? REPAS_H : isPause ? PAUSE_H : ROW_H;
    const sep = ki > 0 ? 'border-top:1.5px solid rgba(203,213,225,0.45);' : '';
    const tC = isRepas || isPause ? '#CBD5E1' : '#94A3B8';

    html += `<tr>
      <td style="${sep}text-align:right;padding-right:8px;padding-top:6px;vertical-align:top;font-size:10px;color:${tC};font-family:'JetBrains Mono',monospace;white-space:nowrap;height:${rowH}px">${key}</td>`;

    jours.forEach(j => {
      if (skipCells[j].has(ki)) return;
      const cours = profIdx[j]?.[key];
      const cellH = `${rowH}px`;

      if (!cours) {
        if (isRepas) html += `<td style="${sep}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle"><span style="font-size:10px;color:#CBD5E1;font-style:italic">🍽 Déjeuner</span></td>`;
        else if (isPause) html += `<td style="${sep}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle"><span style="font-size:9px;color:#CBD5E1;font-style:italic">☕ Récré</span></td>`;
        else html += `<td style="${sep}height:${cellH};background:#F8FAFC;border-radius:8px;border:1px solid #F1F5F9"></td>`;
        return;
      }

      const log = window._dernierAppelLog;
      const appelFait = log && getClassKey(log.classeNom) === getClassKey(cours.classe);
      const appelBadge = appelFait ? `<div title="Appel effectué à ${log.heure}" onclick="scrollToAppelLog()" style="position:absolute;top:6px;right:6px;width:16px;height:16px;background:#16A34A;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;cursor:pointer">✓</div>` : '';

      html += `<td style="${sep}height:${cellH};background:${col.bg};border-left:4px solid ${col.dot};border-radius:8px;padding:10px 12px;vertical-align:middle;position:relative;cursor:pointer;transition:filter .15s"
        onmouseover="this.style.filter='brightness(0.93)'" onmouseout="this.style.filter=''">
        <div style="font-weight:800;font-size:12px;color:${col.text};margin-bottom:3px">${cours.classe}</div>
        <div style="font-size:10px;color:${col.text};opacity:.65;font-family:'JetBrains Mono',monospace">${cours.salle}</div>
        ${appelBadge}
      </td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>
  <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
    <div style="width:68px;text-align:right;padding-right:8px;font-size:10px;font-weight:600;color:#64748B;font-family:'JetBrains Mono',monospace;flex-shrink:0">17h40</div>
    <div style="flex:1;height:1.5px;background:rgba(203,213,225,0.5)"></div>
  </div>`;
  return html;
}

function renderProfTimetable(user) {
  const planning = DB.planningProf[user.id] || {};
  const container = $('prof-timetable');
  if (container) container.innerHTML = _buildProfTimetableHtml(planning, user, 'prof-timetable');
}

function scrollToAppelLog() {
  const logEl = $('planning-appel-log');
  if (logEl) logEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════════
   MESSAGERIE STYLE PRONOTE — SYSTÈME COMPLET
   ══════════════════════════════════════════════ */

/* Données chat classe et profs (simulées) */
const CHATS_CLASSE = {
  prof1: [
    {
      id: '4B', nom: '4ème B', couleur: '#6366F1', messages: [
        { from: 'Lucas Martin', moi: false, texte: 'Monsieur, le DM est pour vendredi ?', heure: '10:32', lu: false },
        { from: 'Zoé Leclerc', moi: false, texte: 'Et on a le droit à la calculatrice ?', heure: '10:34', lu: false },
        { from: 'Vous', moi: true, texte: 'Oui, DM vendredi. Calculatrice autorisée.', heure: '10h45', lu: true },
        { from: 'Emma Bernard', moi: false, texte: 'Merci monsieur !', heure: '10:47', lu: false },
      ]
    },
    {
      id: '6A', nom: '6ème A', couleur: '#0EA5E9', messages: [
        { from: 'Théo Moreau', moi: false, texte: 'Monsieur, j\'ai pas compris l\'exercice 5.', heure: 'Hier 17h12', lu: false },
        { from: 'Vous', moi: true, texte: 'Je t\'expliquerai demain en cours Théo.', heure: 'Hier 18h00', lu: true },
        { from: 'Léa Martin', moi: false, texte: 'Moi non plus je comprends pas 😅', heure: 'Hier 18h05', lu: false },
      ]
    },
    {
      id: '5A', nom: '5ème A', couleur: '#10B981', messages: [
        { from: 'Baptiste Faure', moi: false, texte: 'Cours de demain annulé ?', heure: '08h15', lu: false },
      ]
    },
  ],
};

const CHATS_PROFS = {
  prof1: [
    {
      id: 'mme_martin', nom: 'Mme Laurent (Français)', initiales: 'ML', couleur: '#EC4899', messages: [
        { from: 'Mme Laurent', moi: false, texte: 'Bonjour Pierre, réunion pédago reportée à 17h30.', heure: 'Hier 14h20', lu: false },
        { from: 'Vous', moi: true, texte: 'Merci Marie, je serai là.', heure: 'Hier 14h35', lu: true },
      ]
    },
    {
      id: 'direction', nom: 'Mme Benoît (Direction)', initiales: 'IB', couleur: '#7C3AED', messages: [
        { from: 'Mme Benoît', moi: false, texte: 'Conseil de classe 4ème B — 25 mars 17h30. Rappel.', heure: '10/03 08h00', lu: false },
      ]
    },
  ],
};

/* Envoyés simulés */
const MESSAGES_ENVOYES = {
  prof1: [
    { id: 1, destinataire: 'Martin Lefebvre (4ème B)', sujet: 'Résultats DS n°2', corps: 'Bonjour Martin,\n\nTrès bon devoir, continuez ainsi !\n\nM. Dupont', date: '10/03/2025 – 09h15' },
    { id: 2, destinataire: 'Parents Moreau (6ème A)', sujet: 'Point sur Théo', corps: 'Bonjour,\n\nJe souhaitais faire un point sur les résultats de Théo...\n\nM. Dupont', date: '08/03/2025 – 16h00' },
  ],
};

let currentMsgTab = 'recus';
let currentChatId = null;
let currentChatType = null; // 'classe' | 'profs'

function setupProfMessagerie(user) {
  // Remplir badge reçus non lus
  const nonLus = (DB.messages[user.id] || []).filter(m => !m.lu).length;
  const badgeRecus = $('badge-recus');
  if (badgeRecus) { badgeRecus.textContent = nonLus || ''; }

  renderMsgListRecus(user);
  renderMsgListEnvoyes(user);
  renderMsgChatClasse(user);
  renderMsgChatProfs(user);
}

function switchMsgTab(tab) {
  currentMsgTab = tab;
  document.querySelectorAll('.msg-tab').forEach(t => t.classList.remove('active'));
  $(`msg-tab-${tab}`)?.classList.add('active');
  document.querySelectorAll('.msg-panel').forEach(p => p.classList.add('hidden'));
  $(`msg-panel-${tab}`)?.classList.remove('hidden');
  // Reset vue droite
  $('pronote-mail-view').innerHTML = `<div class="mail-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg><p>Sélectionnez une conversation</p><span style="font-size:12px;color:#CBD5E1">Vos messages s'afficheront ici</span></div>`;
}

function renderMsgListRecus(user) {
  const messages = DB.messages[user.id] || [];
  const container = $('msg-list-recus');
  if (!container) return;
  container.innerHTML = messages.length ? messages.map(m => `
    <div class="pronote-mail-item ${!m.lu ? 'unread' : ''}" id="pmi-${m.id}" onclick="openPronoteMsg(${m.id},'${user.id}')">
      <div class="pmi-header">
        <span class="pmi-sender">${m.expediteur}</span>
        <div style="display:flex;align-items:center;gap:5px">
          ${!m.lu ? '<div class="pmi-unread-dot"></div>' : ''}
          <span class="pmi-date">${m.date.split('–')[0].trim()}</span>
        </div>
      </div>
      <div class="pmi-subject">${m.sujet}</div>
      <div class="pmi-preview">${m.corps.split('\n')[0]}</div>
    </div>`).join('')
    : '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucun message reçu</p>';
}

function renderMsgListEnvoyes(user) {
  const messages = MESSAGES_ENVOYES[user.id] || [];
  const container = $('msg-list-envoyes');
  if (!container) return;
  container.innerHTML = messages.length ? messages.map(m => `
    <div class="pronote-mail-item" onclick="openPronoteEnvoye(${m.id},'${user.id}')">
      <div class="pmi-header">
        <span class="pmi-sender">À : ${m.destinataire}</span>
        <span class="pmi-date">${m.date.split('–')[0].trim()}</span>
      </div>
      <div class="pmi-subject">${m.sujet}</div>
      <div class="pmi-preview">${m.corps.split('\n')[0]}</div>
    </div>`).join('')
    : '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucun message envoyé</p>';
}

function updateChatTabBadges() {
  if (!currentUser) return;
  // Badge onglet Chat classe
  const totalClasse = (CHATS_CLASSE[currentUser.id] || [])
    .reduce((s, ch) => s + ch.messages.filter(m => !m.moi && !m.lu).length, 0);
  const badgeClasse = $('badge-chat-classe');
  if (badgeClasse) { badgeClasse.textContent = totalClasse || ''; }

  // Badge onglet Profs
  const totalProfs = (CHATS_PROFS[currentUser.id] || [])
    .reduce((s, ch) => s + ch.messages.filter(m => !m.moi && !m.lu).length, 0);
  const badgeProfs = $('badge-chat-profs');
  if (badgeProfs) { badgeProfs.textContent = totalProfs || ''; }
}

function renderMsgChatClasse(user) {
  const chats = CHATS_CLASSE[user.id] || [];
  const container = $('msg-list-chat-classe');
  if (!container) return;
  container.innerHTML = chats.map(ch => {
    const nonLus = ch.messages.filter(m => !m.moi && !m.lu).length;
    const last = ch.messages[ch.messages.length - 1];
    return `
    <div class="pronote-chat-item" id="pci-classe-${ch.id}" onclick="openChat('classe','${ch.id}','${user.id}')">
      <div class="pci-avatar" style="background:${ch.couleur}">${ch.nom.substring(0, 2)}</div>
      <div class="pci-info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pci-name">${ch.nom}</span>
          ${nonLus ? `<span style="background:#EF4444;color:#fff;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700">${nonLus}</span>` : ''}
        </div>
        <div class="pci-last">${last ? (last.moi ? 'Vous : ' : last.from.split(' ')[0] + ' : ') + last.texte : ''}</div>
      </div>
    </div>`;
  }).join('') || '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucun chat de classe</p>';
  updateChatTabBadges();
}

function renderMsgChatProfs(user) {
  const chats = CHATS_PROFS[user.id] || [];
  const container = $('msg-list-chat-profs');
  if (!container) return;
  container.innerHTML = chats.map(ch => {
    const nonLus = ch.messages.filter(m => !m.moi && !m.lu).length;
    const last = ch.messages[ch.messages.length - 1];
    return `
    <div class="pronote-chat-item" id="pci-profs-${ch.id}" onclick="openChat('profs','${ch.id}','${user.id}')">
      <div class="pci-avatar" style="background:${ch.couleur}">${ch.initiales}</div>
      <div class="pci-info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pci-name">${ch.nom}</span>
          ${nonLus ? `<span style="background:#EF4444;color:#fff;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700">${nonLus}</span>` : ''}
        </div>
        <div class="pci-last">${last ? (last.moi ? 'Vous : ' : last.from.split(' ')[0] + ' : ') + last.texte : ''}</div>
      </div>
    </div>`;
  }).join('') || '<p style="padding:20px;color:#94A3B8;font-size:13px;text-align:center">Aucune conversation</p>';
  updateChatTabBadges();
}

function openPronoteMsg(id, userId) {
  const msg = (DB.messages[userId] || []).find(m => m.id === id);
  if (!msg) return;
  // Marquer lu
  msg.lu = true;
  // Mettre à jour visuellement dans la liste
  const item = $(`pmi-${id}`);
  if (item) { item.classList.remove('unread'); item.querySelector('.pmi-unread-dot')?.remove(); }
  // Recalc tous les badges messagerie
  const nonLus = (DB.messages[userId] || []).filter(m => !m.lu).length;
  const navBadge = document.querySelector('#page-prof .nav-badge');
  if (navBadge) { navBadge.textContent = nonLus; navBadge.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
  const badgeRecus = $('badge-recus');
  if (badgeRecus) { badgeRecus.textContent = nonLus || ''; }

  // Sync notifs cloche prof : marquer comme lues les notifs de messagerie pointant vers ce message
  if (NOTIFS_PROF[userId]) {
    NOTIFS_PROF[userId].forEach(n => {
      if (n.cible === 'prof-messagerie' && !n.lu) n.lu = true;
    });
    updateProfNotifBadge();
  }

  // Sélection visuelle
  document.querySelectorAll('#page-prof .pronote-mail-item').forEach(i => i.classList.remove('selected'));
  if (item) item.classList.add('selected');

  $('pronote-mail-view').innerHTML = `
    <div class="pmail-header">
      <div class="pmail-subject">${msg.sujet}</div>
      <div class="pmail-meta">
        <span>De : <strong>${msg.expediteur}</strong></span>
        <span>Le ${msg.date}</span>
        <span style="background:#D1FAE5;color:#065F46;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">✓ Lu</span>
      </div>
    </div>
    <div class="pmail-body" style="white-space:pre-line">${msg.corps}</div>
    <div style="padding:0 24px 20px">
      <div style="background:#F8FAFC;border-radius:10px;border:1.5px solid #E2E8F0;padding:14px">
        <div style="font-size:12px;font-weight:700;color:#64748B;margin-bottom:8px">↩ Répondre à <strong>${msg.expediteur}</strong></div>
        <textarea id="reply-area" class="pchat-input" style="border-radius:8px;width:100%;display:block;margin-bottom:8px" placeholder="Votre réponse…"></textarea>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button onclick="sendProfReply('${userId}','${msg.expediteur}')" class="btn-primary-pro" style="padding:8px 18px;font-size:13px">✈️ Envoyer</button>
        </div>
      </div>
    </div>`;
}

function openPronoteEnvoye(id, userId) {
  const msg = (MESSAGES_ENVOYES[userId] || []).find(m => m.id === id);
  if (!msg) return;
  document.querySelectorAll('.pronote-mail-item').forEach(i => i.classList.remove('selected'));
  $('pronote-mail-view').innerHTML = `
    <div class="pmail-header">
      <div class="pmail-subject">${msg.sujet}</div>
      <div class="pmail-meta">
        <span>À : <strong>${msg.destinataire}</strong></span>
        <span>Le ${msg.date}</span>
        <span style="background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">📤 Envoyé</span>
      </div>
    </div>
    <div class="pmail-body" style="white-space:pre-line">${msg.corps}</div>`;
}

function openChat(type, chatId, userId) {
  currentChatId = chatId;
  currentChatType = type;
  const chats = type === 'classe' ? (CHATS_CLASSE[userId] || []) : (CHATS_PROFS[userId] || []);
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  // Marquer tous les messages reçus comme lus
  chat.messages.forEach(m => { if (!m.moi) m.lu = true; });

  // Mettre à jour les listes latérales
  if (type === 'classe') renderMsgChatClasse({ id: userId });
  else renderMsgChatProfs({ id: userId });

  // Re-appliquer la sélection visuelle
  document.querySelectorAll('.pronote-chat-item').forEach(i => i.classList.remove('selected'));
  $(`pci-${type}-${chatId}`)?.classList.add('selected');

  function buildBubble(m) {
    const initiales = m.from.split(' ').map(w => w[0]).join('').substring(0, 2);
    return `<div class="pchat-bubble-wrap ${m.moi ? 'mine' : ''}">
      ${!m.moi ? `<div class="pchat-avatar-sm" style="background:${chat.couleur}">${initiales}</div>` : ''}
      <div>
        ${!m.moi ? `<div style="font-size:10px;color:#94A3B8;margin-bottom:2px">${m.from}</div>` : ''}
        <div class="pchat-bubble ${m.moi ? 'mine' : ''}">${m.texte}</div>
        <div class="pchat-time" style="${m.moi ? 'text-align:right' : ''}">${m.heure}</div>
      </div>
    </div>`;
  }

  // Vérifier si on est déjà sur ce même chat
  const existingArea = $('pchat-messages-area');
  const sameChat = existingArea && existingArea.getAttribute('data-chatkey') === `${type}__${chatId}`;

  if (!sameChat) {
    const bubblesHtml = chat.messages.map(m => buildBubble(m)).join('');
    $('pronote-mail-view').innerHTML = `
      <div class="pchat-header">
        <div style="width:36px;height:36px;border-radius:10px;background:${chat.couleur};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">${chat.initiales || chat.nom.substring(0, 2)}</div>
        <div>
          <div style="font-weight:700;font-size:14px;color:#0F172A">${chat.nom}</div>
          <div style="font-size:11px;color:#64748B">${type === 'classe' ? 'Chat de classe' : 'Conversation privée'}</div>
        </div>
      </div>
      <div class="pchat-messages" id="pchat-messages-area"
        data-chatkey="${type}__${chatId}"
        data-type="${type}"
        data-chatid="${chatId}"
        data-userid="${userId}">${bubblesHtml}</div>
      <div class="pchat-input-area">
        <textarea class="pchat-input" id="pchat-input-field" placeholder="Écrire un message…" rows="1"></textarea>
        <button class="pchat-send-btn" id="pchat-send-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>`;

    // Attacher les events proprement via JS (pas de inline HTML)
    const inputEl = $('pchat-input-field');
    const sendBtn = $('pchat-send-btn');
    if (inputEl) {
      inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChatMsg();
        }
      });
    }
    if (sendBtn) {
      sendBtn.addEventListener('click', () => sendChatMsg());
    }
  }

  setTimeout(() => { const el = $('pchat-messages-area'); if (el) el.scrollTop = el.scrollHeight; }, 50);
}

function sendChatMsg() {
  const input = $('pchat-input-field');
  const text = input?.value.trim();
  if (!text) return;

  const area = $('pchat-messages-area');
  if (!area) return;
  const type = area.getAttribute('data-type');
  const chatId = area.getAttribute('data-chatid');
  const userId = area.getAttribute('data-userid');

  const chats = type === 'classe' ? (CHATS_CLASSE[userId] || []) : (CHATS_PROFS[userId] || []);
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  const now = new Date();
  const heure = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
  chat.messages.push({ from: 'Vous', moi: true, texte: text, heure, lu: true });

  // Vider le champ
  input.value = '';

  // Ajouter la bulle sans reconstruire le DOM
  const bubble = document.createElement('div');
  bubble.className = 'pchat-bubble-wrap mine';
  bubble.innerHTML = `
    <div>
      <div class="pchat-bubble mine">${text}</div>
      <div class="pchat-time" style="text-align:right">${heure}</div>
    </div>`;
  area.appendChild(bubble);
  area.scrollTop = area.scrollHeight;

  // Mettre à jour la liste latérale + re-sélection
  if (type === 'classe') renderMsgChatClasse({ id: userId });
  else renderMsgChatProfs({ id: userId });
  document.querySelectorAll('.pronote-chat-item').forEach(i => i.classList.remove('selected'));
  $(`pci-${type}-${chatId}`)?.classList.add('selected');
}

function sendProfReply(userId, expediteur) {
  const text = $('reply-area')?.value.trim();
  if (!text) { showToast('⚠️ Écrivez un message avant d\'envoyer'); return; }
  const now = new Date();
  const date = `${now.toLocaleDateString('fr-FR')} – ${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
  const id = Date.now();
  if (!MESSAGES_ENVOYES[userId]) MESSAGES_ENVOYES[userId] = [];
  MESSAGES_ENVOYES[userId].unshift({ id, destinataire: expediteur, sujet: 'RE: ' + (expediteur), corps: text, date });
  showToast('✅ Réponse envoyée !');
  $('reply-area').closest('div').innerHTML = `<div style="color:#10B981;font-size:13px;padding:12px">✅ Message envoyé !</div>`;
}

function filterMsgList(panel, q) {
  const items = document.querySelectorAll(`#msg-list-${panel === 'recus' ? 'recus' : 'envoyes'} .pronote-mail-item`);
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q.toLowerCase()) ? '' : 'none';
  });
}

function renderProfMailList(user) {
  // Maintenant géré par setupProfMessagerie, appelé au clic nav
}

function openProfMail(id, userId, el) {
  // Legacy — redirige vers nouveau système
  openPronoteMsg(id, userId);
}


/* ══════════════════════════════════════════════
   SAISIE DE NOTES — SYSTÈME COMPLET
   ══════════════════════════════════════════════ */

/* État de la saisie */
let saisieSelection = new Set(); // indices sélectionnés
let saisieNotes = {};            // { index: valeur }  valeur = string ou 'ABS'
let saisieHistorique = [];       // log des actions

function loadClasseNotes() {
  const key = $('saisie-classe').value;
  if (!key) { $('saisie-table-container').innerHTML = ''; return; }
  const classe = DB.classes[key];
  if (!classe) return;

  // Mettre à jour badge historique
  const nb = (HISTORIQUE_NOTES[key] || []).length;
  const badge = $('badge-histo');
  if (badge) { badge.textContent = nb; badge.style.display = nb > 0 ? 'inline-flex' : 'none'; }

  // Trier par ordre alphabétique (Nom Prénom)
  const eleves = [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

  saisieSelection = new Set();
  saisieNotes = {};
  saisieHistorique = [];

  $('saisie-table-container').innerHTML = `
    <!-- Barre d'outils -->
    <div class="saisie-toolbar">
      <!-- Recherche -->
      <div class="saisie-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94A3B8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="saisie-search" class="saisie-search-input" placeholder="Rechercher un élève…" oninput="filterSaisieTable(this.value)" />
      </div>
      <!-- Sélection multiple -->
      <div class="saisie-sel-btns">
        <button class="btn-saisie-tool" onclick="saisieSelectAll()" title="Tout sélectionner">☑ Tous</button>
        <button class="btn-saisie-tool" onclick="saisieDeselectAll()" title="Tout désélectionner">☐ Aucun</button>
      </div>
      <!-- Boutons rapides -->
      <div class="saisie-quick-btns">
        <span style="font-size:11px;color:#64748B;font-weight:600">Rapide :</span>
        <button class="btn-quick-note" onclick="applyQuickNote('0')">0/20</button>
        <button class="btn-quick-note btn-quick-20" onclick="applyQuickNote('20')">20/20</button>
        <button class="btn-quick-note btn-quick-abs" onclick="applyQuickNote('ABS')">Absent</button>
      </div>
      <!-- Saisie groupée -->
      <div class="saisie-bulk-wrap" id="saisie-bulk-area" style="display:none">
        <span class="saisie-bulk-info" id="saisie-bulk-info">0 sélectionné(s)</span>
        <input type="text" id="saisie-bulk-input" class="saisie-bulk-input" maxlength="5"
          placeholder="Note…" oninput="sanitizeNoteInput(this)" onkeydown="if(event.key==='Enter') applyBulkNote()" />
        <button class="btn-primary-pro" style="padding:6px 14px;font-size:12px" onclick="applyBulkNote()">Appliquer</button>
      </div>
    </div>

    <!-- Historique -->
    <div id="saisie-histo-wrap" style="display:none;margin-bottom:10px">
      <div style="font-size:11px;font-weight:700;color:#64748B;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">📋 Historique de saisie</div>
      <div id="saisie-histo" style="max-height:80px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:4px"></div>
    </div>

    <!-- Tableau -->
    <table class="saisie-table" id="saisie-table">
      <thead>
        <tr>
          <th style="width:36px">
            <input type="checkbox" id="saisie-check-all" onchange="saisieToggleAll(this.checked)" title="Tout cocher" style="cursor:pointer;width:14px;height:14px" />
          </th>
          <th>Élève</th>
          <th style="width:160px">Note /20</th>
          <th>Appréciation</th>
        </tr>
      </thead>
      <tbody id="saisie-tbody">
        ${eleves.map((e, i) => renderSaisieRow(e, i)).join('')}
      </tbody>
    </table>`;
}

function renderSaisieRow(e, i) {
  const val = saisieNotes[i] || '';
  const isAbs = val === 'ABS';
  const isBonus = !isNaN(parseFloat(val)) && parseFloat(val) > 20;
  const isSelected = saisieSelection.has(i);
  return `
    <tr id="saisie-row-${i}" class="saisie-row ${isSelected ? 'saisie-row-selected' : ''}" data-nom="${e.nom.toLowerCase()}">
      <td>
        <input type="checkbox" class="saisie-row-check" id="saisie-chk-${i}"
          ${isSelected ? 'checked' : ''} onchange="saisieToggleRow(${i}, this.checked)"
          style="cursor:pointer;width:14px;height:14px" />
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="student-avatar" style="width:28px;height:28px;font-size:10px;flex-shrink:0">
            ${e.nom.split(' ').map(w => w[0]).join('').substring(0, 2)}
          </div>
          <span style="font-size:13px;font-weight:600;color:#0F172A">${e.nom}</span>
        </div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;position:relative">
          ${isBonus ? '<span title="Points bonus" style="font-size:16px;line-height:1">⭐</span>' : ''}
          <input type="text" id="saisie-note-${i}"
            class="note-input-free ${isAbs ? 'note-input-abs' : ''}"
            value="${isAbs ? 'ABS' : val}"
            maxlength="5"
            placeholder="–"
            oninput="sanitizeNoteInput(this); updateNoteState(${i}, this.value)"
            onblur="finalizeNoteInput(${i}, this)"
            ${isAbs ? 'disabled' : ''}
            style="width:80px" />
          <button class="btn-abs-toggle ${isAbs ? 'btn-abs-active' : ''}"
            onclick="toggleAbsNote(${i})" title="${isAbs ? 'Retirer absent' : 'Marquer absent'}">
            ${isAbs ? '✓ Abs' : 'Abs'}
          </button>
        </div>
      </td>
      <td>
        <input type="text" class="input-pro" style="width:100%;font-size:12px" placeholder="Appréciation…" id="saisie-appre-${i}" />
      </td>
    </tr>`;
}

function sanitizeNoteInput(input) {
  let v = input.value;
  // Garder uniquement chiffres, virgule, point
  v = v.replace(/[^0-9.,]/g, '');
  // Remplacer virgule par point pour la logique interne (on garde virgule pour affichage)
  // Limiter à 2 chiffres avant la décimale
  const parts = v.replace(',', '.').split('.');
  if (parts[0] && parts[0].length > 2) {
    parts[0] = parts[0].substring(0, 2);
  }
  // Max 2 décimales
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }
  // On rend la virgule en gris si plus de 2 chiffres avant (indication visuelle)
  if (parts[0] && parts[0].length >= 2 && !v.includes('.') && !v.includes(',')) {
    input.style.color = '#0F172A';
  }
  input.value = v;
}

function updateNoteState(i, val) {
  if (!val || val.trim() === '') {
    delete saisieNotes[i];
  } else {
    saisieNotes[i] = val;
  }
  // Afficher étoile si > 20
  const numVal = parseFloat(val.replace(',', '.'));
  const bonusEl = document.querySelector(`#saisie-row-${i} span[title="Points bonus"]`);
  const input = $(`saisie-note-${i}`);
  if (numVal > 20 && !isNaN(numVal)) {
    if (!bonusEl && input) {
      const star = document.createElement('span');
      star.title = 'Points bonus'; star.style.cssText = 'font-size:16px;line-height:1';
      star.textContent = '⭐';
      input.parentNode.insertBefore(star, input);
    }
  } else if (bonusEl) {
    bonusEl.remove();
  }
}

function finalizeNoteInput(i, input) {
  const v = input.value.trim();
  if (v === '') return;
  // Valider que c'est bien un nombre
  const num = parseFloat(v.replace(',', '.'));
  if (!isNaN(num)) {
    saisieNotes[i] = v;
  }
}

function toggleAbsNote(i) {
  const input = $(`saisie-note-${i}`);
  const btn = document.querySelector(`#saisie-row-${i} .btn-abs-toggle`);
  if (!input) return;
  if (saisieNotes[i] === 'ABS') {
    // Retirer absent
    delete saisieNotes[i];
    input.value = '';
    input.disabled = false;
    input.classList.remove('note-input-abs');
    btn.classList.remove('btn-abs-active');
    btn.textContent = 'Abs';
  } else {
    // Marquer absent
    saisieNotes[i] = 'ABS';
    input.value = 'ABS';
    input.disabled = true;
    input.classList.add('note-input-abs');
    btn.classList.add('btn-abs-active');
    btn.textContent = '✓ Abs';
    addHistorique(i, 'ABS');
  }
}

function saisieToggleRow(i, checked) {
  if (checked) {
    saisieSelection.add(i);
  } else {
    saisieSelection.delete(i);
  }
  const row = $(`saisie-row-${i}`);
  if (row) row.classList.toggle('saisie-row-selected', checked);
  updateBulkArea();
}

function saisieSelectAll() {
  const tbody = $('saisie-tbody');
  if (!tbody) return;
  tbody.querySelectorAll('.saisie-row').forEach(row => {
    const i = parseInt(row.id.replace('saisie-row-', ''));
    if (!isNaN(i)) {
      saisieSelection.add(i);
      row.classList.add('saisie-row-selected');
      const chk = $(`saisie-chk-${i}`);
      if (chk) chk.checked = true;
    }
  });
  updateBulkArea();
}

function saisieDeselectAll() {
  saisieSelection.clear();
  document.querySelectorAll('.saisie-row').forEach(row => {
    row.classList.remove('saisie-row-selected');
  });
  document.querySelectorAll('.saisie-row-check').forEach(chk => chk.checked = false);
  const allChk = $('saisie-check-all');
  if (allChk) allChk.checked = false;
  updateBulkArea();
}

function saisieToggleAll(checked) {
  document.querySelectorAll('.saisie-row-check').forEach(chk => {
    const i = parseInt(chk.id.replace('saisie-chk-', ''));
    chk.checked = checked;
    saisieToggleRow(i, checked);
  });
}

function updateBulkArea() {
  const area = $('saisie-bulk-area');
  const info = $('saisie-bulk-info');
  if (!area) return;
  const n = saisieSelection.size;
  area.style.display = n > 0 ? 'flex' : 'none';
  if (info) info.textContent = `${n} élève${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''}`;
}

function applyQuickNote(val) {
  if (saisieSelection.size === 0) {
    showToast('⚠️ Sélectionnez d\'abord des élèves');
    return;
  }
  applyNoteToSelection(val);
}

function applyBulkNote() {
  const input = $('saisie-bulk-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) { showToast('⚠️ Saisissez une note'); return; }
  applyNoteToSelection(val);
  input.value = '';
}

function applyNoteToSelection(val) {
  const indices = [...saisieSelection];
  indices.forEach(i => {
    saisieNotes[i] = val;
    const noteInput = $(`saisie-note-${i}`);
    const btn = document.querySelector(`#saisie-row-${i} .btn-abs-toggle`);
    if (!noteInput) return;
    if (val === 'ABS') {
      noteInput.value = 'ABS';
      noteInput.disabled = true;
      noteInput.classList.add('note-input-abs');
      if (btn) { btn.classList.add('btn-abs-active'); btn.textContent = '✓ Abs'; }
    } else {
      noteInput.value = val;
      noteInput.disabled = false;
      noteInput.classList.remove('note-input-abs');
      if (btn) { btn.classList.remove('btn-abs-active'); btn.textContent = 'Abs'; }
      updateNoteState(i, val);
    }
    addHistorique(i, val);
  });
  // Désélectionner après application
  saisieDeselectAll();
  showToast(`✅ Note ${val} appliquée à ${indices.length} élève${indices.length > 1 ? 's' : ''}`);
}

function addHistorique(i, val) {
  const key = $('saisie-classe')?.value;
  const classe = key ? DB.classes[key] : null;
  const eleves = classe ? [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')) : [];
  const nom = eleves[i]?.nom || `Élève ${i + 1}`;
  saisieHistorique.push({ nom, val, ts: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
  renderHistorique();
}

function renderHistorique() {
  const wrap = $('saisie-histo-wrap');
  const histo = $('saisie-histo');
  if (!wrap || !histo) return;
  if (!saisieHistorique.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  histo.innerHTML = saisieHistorique.slice(-20).reverse().map(h => {
    const isAbs = h.val === 'ABS';
    const isBonus = !isNaN(parseFloat(h.val?.replace(',', '.'))) && parseFloat(h.val?.replace(',', '.')) > 20;
    const color = isAbs ? '#EF4444' : isBonus ? '#7C3AED' : '#10B981';
    const bg = isAbs ? '#FEF2F2' : isBonus ? '#F5F3FF' : '#F0FDF4';
    return `<span style="background:${bg};color:${color};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap">
      ${h.nom.split(' ')[0]} → ${isBonus ? '⭐' : ''}${h.val} <span style="opacity:.5">${h.ts}</span>
    </span>`;
  }).join('');
}

function filterSaisieTable(q) {
  const rows = document.querySelectorAll('#saisie-tbody .saisie-row');
  rows.forEach(row => {
    const nom = row.getAttribute('data-nom') || '';
    row.style.display = nom.includes(q.toLowerCase()) ? '' : 'none';
  });
}

/* Stockage historique des évaluations par classe : { '4B': [ { id, evalLabel, sujet, date, eleves:[{nom,note}] } ] } */
const HISTORIQUE_NOTES = {};

function switchNotesView(view) {
  document.querySelectorAll('.notes-view-tab').forEach(t => t.classList.remove('active'));
  if (view === 'saisie') {
    $('tab-nouvelle-saisie')?.classList.add('active');
    $('notes-panel-saisie').classList.remove('hidden');
    $('notes-panel-historique').classList.add('hidden');
  } else {
    $('tab-historique')?.classList.add('active');
    $('notes-panel-saisie').classList.add('hidden');
    $('notes-panel-historique').classList.remove('hidden');
    renderHistoriqueNotes();
  }
}

function renderHistoriqueNotes(highlightId) {
  const key = $('saisie-classe')?.value;
  const container = $('histo-liste-evaluations');
  if (!container) return;
  if (!key) { container.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:30px">Sélectionnez une classe pour voir l\'historique.</p>'; return; }

  const evals = HISTORIQUE_NOTES[key] || [];
  if (!evals.length) { container.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:30px">Aucune évaluation enregistrée pour cette classe.</p>'; return; }

  container.innerHTML = evals.map((ev, idx) => {
    const moy = ev.eleves.filter(e => e.note !== 'ABS' && e.note !== '').length
      ? (ev.eleves.filter(e => e.note !== 'ABS' && e.note !== '').reduce((s, e) => s + parseFloat(e.note), 0)
        / ev.eleves.filter(e => e.note !== 'ABS' && e.note !== '').length).toFixed(1)
      : '–';
    const couleurMoy = parseFloat(moy) >= 14 ? '#059669' : parseFloat(moy) >= 10 ? '#D97706' : '#DC2626';
    const isOpen = highlightId === ev.id;
    return `
    <div class="histo-eval-card" id="histo-card-${ev.id}">
      <div class="histo-eval-header" onclick="toggleHistoCard('${ev.id}')">
        <div style="width:36px;height:36px;border-radius:9px;background:#EFF6FF;border:1.5px solid #BFDBFE;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">📝</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px;color:#0F172A">${ev.evalLabel} — ${ev.sujet || 'Sans titre'}</div>
          <div style="font-size:11px;color:#64748B;margin-top:2px">📅 ${ev.date} · ${ev.eleves.length} élève${ev.eleves.length > 1 ? 's' : ''}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:11px;color:#64748B;font-weight:600">Moyenne</div>
          <div style="font-size:22px;font-weight:800;color:${couleurMoy}">${moy}<span style="font-size:11px;font-weight:400;color:#94A3B8">/20</span></div>
        </div>
        <div style="margin-left:8px;color:#94A3B8;font-size:14px;transition:transform .2s" id="histo-chevron-${ev.id}">${isOpen ? '▲' : '▼'}</div>
        <button onclick="event.stopPropagation();editHistoEval('${key}','${ev.id}')"
          style="margin-left:6px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:600;color:#64748B;cursor:pointer;white-space:nowrap">✏️ Modifier</button>
      </div>
      <div class="histo-eval-body ${isOpen ? 'open' : ''}" id="histo-body-${ev.id}">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px">
          ${ev.eleves.map(e => {
      const n = e.note;
      const isAbs = n === 'ABS' || n === '';
      const val = isAbs ? 'ABS' : parseFloat(n);
      const bg = isAbs ? '#FEF2F2' : val >= 14 ? '#F0FDF4' : val >= 10 ? '#FFFBEB' : '#FEF2F2';
      const col = isAbs ? '#DC2626' : val >= 14 ? '#059669' : val >= 10 ? '#D97706' : '#DC2626';
      return `
            <div class="histo-note-row" style="background:${bg}">
              <span style="font-size:12px;font-weight:600;color:#0F172A">${e.nom}</span>
              <span class="histo-note-val" style="background:${bg};color:${col}">${isAbs ? 'ABS' : val + '/20'}</span>
            </div>`;
    }).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleHistoCard(id) {
  const body = $(`histo-body-${id}`);
  const chev = $(`histo-chevron-${id}`);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.textContent = isOpen ? '▼' : '▲';
}

function editHistoEval(classeKey, evalId) {
  const evals = HISTORIQUE_NOTES[classeKey] || [];
  const ev = evals.find(e => e.id === evalId);
  if (!ev) return;
  // Préremplir les champs de saisie avec les données de cette évaluation
  switchNotesView('saisie');
  const selClasse = $('saisie-classe');
  if (selClasse && selClasse.value !== classeKey) { selClasse.value = classeKey; loadClasseNotes(); }
  setTimeout(() => {
    const selEval = $('saisie-eval');
    const inputSujet = $('saisie-sujet');
    const inputDate = $('saisie-date');
    if (selEval) selEval.value = ev.evalLabel;
    if (inputSujet) inputSujet.value = ev.sujet || '';
    if (inputDate) inputDate.value = ev.dateISO || '';
    // Préremplir les notes dans le tableau
    const classe = DB.classes[classeKey];
    if (classe) {
      const eleves = [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      ev.eleves.forEach((eleveNote, i) => {
        const input = $(`saisie-note-${i}`);
        if (input) {
          input.value = eleveNote.note;
          updateNoteState(i, eleveNote.note);
        }
      });
    }
    // Stocker l'id en cours de modification
    window._editingEvalId = evalId;
    window._editingClasseKey = classeKey;
    showToast(`✏️ Mode modification — ${ev.evalLabel} · ${ev.sujet}`);
  }, 150);
}

function sauvegarderNotes() {
  const nbSaisies = Object.keys(saisieNotes).length;
  if (nbSaisies === 0) { showToast('⚠️ Aucune note à enregistrer'); return; }

  const key = $('saisie-classe')?.value;
  if (!key) { showToast('⚠️ Sélectionnez une classe'); return; }
  const classeNom = DB.classes[key]?.nom || key;
  const evalType = $('saisie-eval')?.value || '';
  if (!evalType) { showToast('⚠️ Sélectionnez un type d\'évaluation'); return; }
  const sujet = $('saisie-sujet')?.value.trim() || '';
  const dateInput = $('saisie-date')?.value || '';
  const dateAff = dateInput ? new Date(dateInput).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  const now = new Date();
  const heure = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;

  // Construire liste élèves + notes
  const classe = DB.classes[key];
  const elevesTriés = [...(classe?.eleves || [])].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  const elevesAvecNotes = elevesTriés.map((e, i) => ({
    nom: e.nom,
    note: saisieNotes[i] !== undefined ? saisieNotes[i] : '',
  }));

  // Init ou update historique
  if (!HISTORIQUE_NOTES[key]) HISTORIQUE_NOTES[key] = [];

  const editId = window._editingEvalId;
  let evalId, numDS, texteActivite;

  if (editId && window._editingClasseKey === key) {
    // Mode modification : remplacer l'évaluation existante
    const idx = HISTORIQUE_NOTES[key].findIndex(e => e.id === editId);
    if (idx !== -1) {
      HISTORIQUE_NOTES[key][idx] = { id: editId, evalLabel: evalType, sujet, date: dateAff, dateISO: dateInput, eleves: elevesAvecNotes };
      evalId = editId;
      numDS = HISTORIQUE_NOTES[key].length;
    }
    window._editingEvalId = null;
    window._editingClasseKey = null;
    showToast(`✅ Évaluation modifiée — ${classeNom} · ${evalType} ${sujet}`);
  } else {
    // Nouvelle évaluation
    numDS = HISTORIQUE_NOTES[key].length + 1;
    evalId = `${key}-${Date.now()}`;
    HISTORIQUE_NOTES[key].unshift({ id: evalId, evalLabel: evalType, sujet, date: dateAff, dateISO: dateInput, eleves: elevesAvecNotes });
    showToast(`💾 ${nbSaisies} note${nbSaisies > 1 ? 's' : ''} enregistrée${nbSaisies > 1 ? 's' : ''} — ${classeNom} · ${evalType} ${sujet}`);
  }

  const label = sujet ? `${evalType} — ${sujet}` : `${evalType} n°${numDS}`;
  texteActivite = `Notes saisies — ${classeNom} (${label})`;

  // Mettre à jour badge historique
  const badge = $('badge-histo');
  if (badge) { badge.textContent = HISTORIQUE_NOTES[key].length; badge.style.display = 'inline-flex'; }

  // Ajouter au journal d'activité
  if (currentUser?.id && DB.activite[currentUser.id]) {
    DB.activite[currentUser.id].unshift({
      texte: texteActivite,
      heure: `Aujourd'hui ${heure}`,
      couleur: '#10B981',
      type: 'notes',
      classeKey: key,
      evalId,
    });
    renderActivityLog(currentUser);
  }

  // Notif cloche
  if (currentUser?.id && NOTIFS_PROF[currentUser.id]) {
    NOTIFS_PROF[currentUser.id].unshift({
      id: Date.now(), lu: false, icone: '📝',
      titre: `Notes saisies — ${classeNom}`,
      detail: `${label} · ${nbSaisies} note${nbSaisies > 1 ? 's' : ''}`,
      heure: 'À l\'instant', cible: 'prof-notes', classeKey: key, evalId,
    });
    updateProfNotifBadge();
  }

  window._derniereSaisie = { classe: key, classeNom, evalLabel: evalType, evalId };
}

/* ══════════════════════════════════════════════
   FEUILLE D'APPEL — SYSTÈME COMPLET
   ══════════════════════════════════════════════ */

let appelStatuts = {}; // { index: { statut:'present'|'absent'|'retard', minutes:'' } }

function getCurrentCoursProf(user) {
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const now = new Date();
  const jourNom = jours[now.getDay()];
  const planning = DB.planningProf[user.id] || {};
  const coursAujourd = planning[jourNom] || [];

  const heureStr = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;

  /* Plages horaires → [debut, fin] en minutes depuis minuit */
  function toMin(h) {
    const m = h.match(/(\d+)h(\d+)/);
    return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
  }
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Chercher le cours en cours
  let coursEnCours = null;
  let prochainCours = null;

  for (const c of coursAujourd) {
    const [debutStr, finStr] = c.heure.split(' – ');
    const debut = toMin(debutStr);
    const fin = toMin(finStr);
    if (nowMin >= debut && nowMin < fin) {
      coursEnCours = c;
      break;
    }
    if (nowMin < debut && !prochainCours) {
      prochainCours = c;
    }
  }

  // Si pas de cours aujourd'hui, chercher le prochain jour
  if (!coursEnCours && !prochainCours) {
    const jourOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const jourIdx = jourOrdre.indexOf(jourNom);
    for (let d = 1; d <= 6; d++) {
      const nextJour = jourOrdre[(jourIdx + d) % 5];
      const coursNext = planning[nextJour] || [];
      if (coursNext.length) {
        prochainCours = { ...coursNext[0], _prochainJour: nextJour };
        break;
      }
    }
  }

  return { coursEnCours, prochainCours };
}

function loadAppel() {
  // Cette fonction est appelée manuellement si on change la classe
  renderAppel();
}

function initAppelAuto() {
  // Appelé depuis setupProfDashboard pour auto-détecter
  if (!currentUser) return;
  const { coursEnCours, prochainCours } = getCurrentCoursProf(currentUser);
  const cours = coursEnCours || prochainCours;
  if (!cours) return;

  // Trouver la clé de classe
  const classeNom = cours.classe;
  const key = getClassKey(classeNom);
  const selectEl = $('appel-classe');
  if (selectEl && key) {
    selectEl.value = key;
  }
  renderAppel(cours, !!coursEnCours);
}

function renderAppel(coursInfo, estEnCours) {
  const key = $('appel-classe')?.value;
  if (!key) { $('appel-list').innerHTML = ''; return; }
  const classe = DB.classes[key];
  if (!classe) return;

  appelStatuts = {};

  // Trier alphabétiquement
  const eleves = [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

  // Bandeau cours actif
  let bandeauHtml = '';
  if (coursInfo) {
    const label = estEnCours
      ? `<span style="background:#DCFCE7;color:#15803D;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">🟢 Cours en cours</span>`
      : `<span style="background:#FEF3C7;color:#B45309;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">⏰ Prochain cours${coursInfo._prochainJour ? ' — ' + coursInfo._prochainJour : ''}</span>`;
    bandeauHtml = `
      <div style="background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:1px solid #BFDBFE;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px;color:#1D4ED8">${coursInfo.classe} — ${coursInfo.heure}</div>
          <div style="font-size:12px;color:#3B82F6;margin-top:2px">📍 ${coursInfo.salle}</div>
        </div>
        ${label}
      </div>`;
  }

  $('appel-list').innerHTML = `
    ${bandeauHtml}
    <div style="font-size:11px;color:#64748B;margin-bottom:10px;font-weight:600">${eleves.length} élèves · Triés alphabétiquement</div>
    <div class="appel-list-items" id="appel-items">
      ${eleves.map((e, i) => renderAppelRow(e, i)).join('')}
    </div>`;
}

function renderAppelRow(e, i) {
  const st = appelStatuts[i] || { statut: null, minutes: '' };
  return `
    <div class="appel-item" id="appel-item-${i}">
      <div class="student-avatar" style="width:32px;height:32px;font-size:11px;flex-shrink:0">
        ${e.nom.split(' ').map(w => w[0]).join('').substring(0, 2)}
      </div>
      <span class="appel-name">${e.nom}</span>
      <div class="appel-btns">
        <button class="appel-btn present ${st.statut === 'present' ? 'active' : ''}" id="appel-p-${i}" onclick="setAppel(${i},'present')">✓ Présent</button>
        <button class="appel-btn absent  ${st.statut === 'absent' ? 'active' : ''}" id="appel-a-${i}" onclick="setAppel(${i},'absent')">✗ Absent</button>
        <button class="appel-btn retard  ${st.statut === 'retard' ? 'active' : ''}" id="appel-r-${i}" onclick="setAppel(${i},'retard')">⏱ Retard</button>
      </div>
      <div class="appel-retard-input" id="appel-retard-wrap-${i}" style="display:${st.statut === 'retard' ? 'flex' : 'none'};align-items:center;gap:4px;margin-left:8px">
        <input type="number" id="appel-min-${i}" class="input-pro" style="width:60px;font-size:12px;padding:4px 8px"
          min="0" max="59" placeholder="min" value="${st.minutes}"
          onchange="appelSetMinutes(${i}, this.value)" />
        <span style="font-size:11px;color:#64748B">min</span>
      </div>
    </div>`;
}

function setAppel(i, statut) {
  appelStatuts[i] = { statut, minutes: appelStatuts[i]?.minutes || '' };
  // Mettre à jour visuellement
  ['p', 'a', 'r'].forEach(s => {
    const b = document.getElementById(`appel-${s}-${i}`);
    if (b) b.classList.remove('active');
  });
  const map = { present: 'p', absent: 'a', retard: 'r' };
  const btn = document.getElementById(`appel-${map[statut]}-${i}`);
  if (btn) btn.classList.add('active');

  // Afficher/cacher champ retard
  const retardWrap = $(`appel-retard-wrap-${i}`);
  if (retardWrap) retardWrap.style.display = statut === 'retard' ? 'flex' : 'none';

  // Coloration de la ligne
  const item = $(`appel-item-${i}`);
  if (item) {
    item.classList.remove('appel-item-present', 'appel-item-absent', 'appel-item-retard');
    item.classList.add(`appel-item-${statut}`);
  }
}

function appelSetMinutes(i, val) {
  if (!appelStatuts[i]) appelStatuts[i] = { statut: 'retard', minutes: '' };
  appelStatuts[i].minutes = val;
}

function validerAppel() {
  const key = $('appel-classe')?.value;
  if (!key) { showToast('⚠️ Sélectionnez une classe'); return; }
  const classe = DB.classes[key];
  if (!classe) return;

  const eleves = [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  const nbAbsents = Object.values(appelStatuts).filter(s => s.statut === 'absent').length;
  const nbRetards = Object.values(appelStatuts).filter(s => s.statut === 'retard').length;
  const nbPresents = Object.values(appelStatuts).filter(s => s.statut === 'present').length;
  const now = new Date();
  const heure = `${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
  const classeNom = DB.classes[key]?.nom || key;

  showToast(`✅ Appel validé — ${nbPresents} présent(s), ${nbAbsents} absent(s), ${nbRetards} retard(s) · ${heure}`);

  // Ajouter à l'activité
  if (DB.activite[currentUser?.id]) {
    DB.activite[currentUser.id].unshift({
      texte: `Appel validé — ${classeNom} (${heure})`,
      heure: `Aujourd'hui ${heure}`,
      couleur: '#6366F1'
    });
  }

  // Construire le détail ligne par ligne
  const lignesAppel = eleves.map((e, i) => {
    const st = appelStatuts[i]?.statut || 'non renseigné';
    const min = appelStatuts[i]?.minutes ? ` (${appelStatuts[i].minutes} min)` : '';
    return { nom: e.nom, statut: st, minutes: min };
  });

  // Stocker le log pour l'afficher dans le planning
  window._dernierAppelLog = { classeNom, heure, lignes: lignesAppel, nbPresents, nbAbsents, nbRetards };

  // Basculer vers Mon planning et y afficher le log
  const navLink = document.querySelector('#page-prof .nav-item[onclick*="prof-planning"]');
  showProfSection('prof-planning', navLink);

  // Afficher le log dans la section planning
  setTimeout(() => renderAppelLogDansPlanning(), 50);
}

function renderAppelLogDansPlanning() {
  const log = window._dernierAppelLog;
  const logEl = $('planning-appel-log');
  if (!logEl || !log) return;

  const presentsLignes = log.lignes.filter(l => l.statut === 'present');
  const absentsLignes = log.lignes.filter(l => l.statut === 'absent');
  const retardsLignes = log.lignes.filter(l => l.statut === 'retard');
  const nonLignes = log.lignes.filter(l => l.statut === 'non renseigné');

  function badge(statut) {
    if (statut === 'present') return `<span style="background:#DCFCE7;color:#15803D;border-radius:10px;padding:1px 8px;font-size:10px;font-weight:700">✓ Présent</span>`;
    if (statut === 'absent') return `<span style="background:#FEE2E2;color:#DC2626;border-radius:10px;padding:1px 8px;font-size:10px;font-weight:700">✗ Absent</span>`;
    if (statut === 'retard') return `<span style="background:#FEF3C7;color:#D97706;border-radius:10px;padding:1px 8px;font-size:10px;font-weight:700">⏱ Retard</span>`;
    return `<span style="background:#F1F5F9;color:#94A3B8;border-radius:10px;padding:1px 8px;font-size:10px">–</span>`;
  }

  logEl.innerHTML = `
    <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px solid #86EFAC;border-radius:14px;padding:18px 20px;margin-bottom:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">✅</span>
          <div>
            <div style="font-weight:800;font-size:15px;color:#14532D">Appel effectué — ${log.classeNom}</div>
            <div style="font-size:12px;color:#64748B">Validé à ${log.heure}</div>
          </div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
          <span style="background:#DCFCE7;color:#15803D;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${log.nbPresents} présents</span>
          <span style="background:#FEE2E2;color:#DC2626;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${log.nbAbsents} absents</span>
          <span style="background:#FEF3C7;color:#D97706;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">${log.nbRetards} retards</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:5px;max-height:260px;overflow-y:auto">
        ${log.lignes.map(l => `
          <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border-radius:7px;padding:6px 10px;font-size:12px">
            <span style="font-weight:600;color:#0F172A">${l.nom}</span>
            <span>${badge(l.statut)}${l.minutes ? `<span style="font-size:10px;color:#94A3B8;margin-left:4px">${l.minutes}</span>` : ''}</span>
          </div>`).join('')}
      </div>
    </div>`;

  logEl.classList.remove('hidden');

  // Rafraîchir le planning pour afficher le badge vert sur la cellule
  if (currentUser) renderProfTimetable(currentUser);
}

/* ─── NAVIGATION PROF ─── */
function showProfSection(id, linkEl) {
  document.querySelectorAll('#page-prof .dash-section').forEach(s => s.classList.remove('active'));
  $(`section-${id}`).classList.add('active');
  if (linkEl) {
    document.querySelectorAll('#page-prof .nav-item').forEach(n => n.classList.remove('active'));
    linkEl.classList.add('active');
  }
  if (id === 'prof-messagerie' && currentUser) setupProfMessagerie(currentUser);
  if (id === 'prof-progression' && currentUser) initProgressionSection(currentUser);
  // Sync notifs cloche
  if (currentUser && NOTIFS_PROF[currentUser.id]) {
    NOTIFS_PROF[currentUser.id].filter(n => n.cible === id && !n.lu).forEach(n => n.lu = true);
    updateProfNotifBadge();
  }
}

/* ══════════════════════════════════════════════
   NOTIFICATIONS (ÉLÈVE)
   ══════════════════════════════════════════════ */
const NOTIFS = {
  eleve1: [
    { id: 1, lu: false, icone: '✉️', titre: 'Nouveau message de M. Dupont', detail: 'Résultats DS n°2 — Félicitations', heure: 'Il y a 2h', cible: 'messagerie' },
    { id: 2, lu: false, icone: '📝', titre: 'Nouvelle note en SVT', detail: 'Contrôle : 16/20', heure: 'Il y a 3h', cible: 'notes' },
    { id: 3, lu: false, icone: '📚', titre: 'Devoir à rendre demain', detail: 'Français — Résumé chapitre 5', heure: 'Il y a 5h', cible: 'devoirs' },
    { id: 4, lu: false, icone: '⚠️', titre: 'Absence non justifiée', detail: 'Jeudi 06/03 — Justificatif requis', heure: 'Hier', cible: 'absences' },
  ],
};

/* ─── NOTIFICATIONS PROF ─── */
const NOTIFS_PROF = {
  prof1: [
    { id: 1, lu: false, icone: '💬', titre: 'Chat de classe — 4ème B', detail: 'Lucas M. : "Monsieur, le DM est pour quand ?"', heure: 'Il y a 15min', cible: 'prof-messagerie' },
    { id: 2, lu: false, icone: '👩‍🏫', titre: 'Message de Mme Martin', detail: 'Réunion pédagogique reportée à 17h30', heure: 'Il y a 1h', cible: 'prof-messagerie' },
    { id: 3, lu: false, icone: '📣', titre: 'Chat classe — 6ème A', detail: '3 nouveaux messages non lus', heure: 'Il y a 2h', cible: 'prof-messagerie' },
  ],
};

/* Stockage des appels validés pour affichage dans le planning */
let appelValidesLog = {};

function toggleNotifs() {
  const panel = $('notif-panel-eleve');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderNotifs('eleve');
}
function renderNotifs(role) {
  const notifs = NOTIFS[currentUser?.id] || [];
  const list = $(`notif-list-${role}`);
  if (!list) return;
  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.lu ? 'lu' : ''}" onclick="naviguerNotifEleve(${n.id},'${role}')" style="cursor:pointer">
      <div class="notif-icone">${n.icone}</div>
      <div class="notif-content">
        <div class="notif-titre">${n.titre}</div>
        <div class="notif-detail">${n.detail}</div>
        <div class="notif-heure">${n.heure}${n.cible ? ' <span style="font-size:10px;background:#EFF6FF;color:#2563EB;padding:1px 6px;border-radius:10px;margin-left:4px">→ Voir</span>' : ''}</div>
      </div>
      ${!n.lu ? '<div class="notif-unread-dot"></div>' : ''}
    </div>`).join('') || '<p style="text-align:center;color:#94A3B8;padding:20px;font-size:13px">Aucune notification</p>';
}

function naviguerNotifEleve(id, role) {
  const notif = (NOTIFS[currentUser?.id] || []).find(n => n.id === id);
  if (!notif) return;
  notif.lu = true;
  renderNotifs(role);
  updateNotifBadge(role);
  // Fermer le panneau
  $('notif-panel-eleve')?.classList.add('hidden');
  // Naviguer vers la section cible + sync nav
  if (notif.cible) {
    const navLink = document.querySelector(`#page-eleve .nav-item[onclick*="${notif.cible}"]`);
    showSection(notif.cible, navLink);
    // Si c'est la messagerie, marquer le message comme lu dans la liste
    if (notif.cible === 'messagerie') syncMsgBadgeEleve();
  }
}
function markNotifRead(id, role) {
  const notif = (NOTIFS[currentUser?.id] || []).find(n => n.id === id);
  if (notif) { notif.lu = true; renderNotifs(role); updateNotifBadge(role); }
}
function clearAllNotifs(role) {
  (NOTIFS[currentUser?.id] || []).forEach(n => n.lu = true);
  renderNotifs(role); updateNotifBadge(role);
}
function updateNotifBadge(role) {
  const count = (NOTIFS[currentUser?.id] || []).filter(n => !n.lu).length;
  const badge = $(`notif-count-${role}`);
  const dot = $(`notif-dot-${role}`);
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  if (dot) { dot.style.display = count > 0 ? 'block' : 'none'; }
  // Sync badge nav messagerie avec les vrais messages non lus
  if (role === 'eleve') syncMsgBadgeEleve();
}

function syncMsgBadgeEleve() {
  if (!currentUser) return;
  const nonLus = (DB.messages[currentUser.id] || []).filter(m => !m.lu).length;
  const navBadge = $('eleve-msg-badge');
  const statCount = $('eleve-msg-count');
  if (navBadge) { navBadge.textContent = nonLus; navBadge.style.display = nonLus > 0 ? 'inline-flex' : 'none'; }
  if (statCount) statCount.textContent = nonLus;
  // Sync : marquer les notifs de cible 'messagerie' comme lues si plus aucun message DB non lu
  if (nonLus === 0 && NOTIFS[currentUser.id]) {
    NOTIFS[currentUser.id].filter(n => n.cible === 'messagerie').forEach(n => n.lu = true);
    const badge = $('notif-count-eleve');
    const dot = $('notif-dot-eleve');
    const count = NOTIFS[currentUser.id].filter(n => !n.lu).length;
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
    if (dot) { dot.style.display = count > 0 ? 'block' : 'none'; }
  }
}
document.addEventListener('click', e => {
  const panel = $('notif-panel-eleve');
  const btn = $('notif-btn-eleve');
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) panel.classList.add('hidden');
  // Prof panel
  const panelP = $('notif-panel-prof');
  const btnP = $('notif-btn-prof');
  if (panelP && btnP && !panelP.contains(e.target) && !btnP.contains(e.target)) panelP.classList.add('hidden');
});

function toggleProfNotifs() {
  const panel = $('notif-panel-prof');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderProfNotifs();
}
function renderProfNotifs() {
  const notifs = NOTIFS_PROF[currentUser?.id] || [];
  const list = $('notif-list-prof');
  if (!list) return;
  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.lu ? 'lu' : ''}" onclick="navigateProfNotif(${n.id})" style="cursor:pointer">
      <div class="notif-icone">${n.icone}</div>
      <div class="notif-content">
        <div class="notif-titre">${n.titre}</div>
        <div class="notif-detail">${n.detail}</div>
        <div class="notif-heure">${n.heure} ${n.cible ? '<span style="font-size:10px;background:#EFF6FF;color:#1D4ED8;padding:1px 6px;border-radius:10px;margin-left:4px">→ ' + labelSection(n.cible) + '</span>' : ''}</div>
      </div>
      ${!n.lu ? '<div class="notif-unread-dot"></div>' : ''}
    </div>`).join('') || '<p style="text-align:center;color:#94A3B8;padding:20px;font-size:13px">Aucune notification</p>';
}

function labelSection(cible) {
  const labels = {
    'prof-messagerie': 'Messagerie',
    'prof-notes': 'Notes',
    'prof-appel': 'Appel',
    'prof-planning': 'Planning',
    'prof-accueil': 'Tableau de bord',
    'prof-classes': 'Mes classes',
  };
  return labels[cible] || cible;
}

function navigateProfNotif(id) {
  const notif = (NOTIFS_PROF[currentUser?.id] || []).find(n => n.id === id);
  if (!notif) return;
  notif.lu = true;
  renderProfNotifs();
  updateProfNotifBadge();
  $('notif-panel-prof')?.classList.add('hidden');
  if (!notif.cible) return;

  const navLink = document.querySelector(`#page-prof .nav-item[onclick*="${notif.cible}"]`);
  showProfSection(notif.cible, navLink);

  // Si notif de notes → pré-sélectionner la classe
  if (notif.cible === 'prof-notes' && notif.classeKey) {
    setTimeout(() => {
      const sel = $('saisie-classe');
      if (sel) { sel.value = notif.classeKey; loadClasseNotes(); }
    }, 80);
  }
}
function markProfNotifRead(id) {
  const notif = (NOTIFS_PROF[currentUser?.id] || []).find(n => n.id === id);
  if (notif) { notif.lu = true; renderProfNotifs(); updateProfNotifBadge(); }
}
function clearAllProfNotifs() {
  (NOTIFS_PROF[currentUser?.id] || []).forEach(n => n.lu = true);
  renderProfNotifs(); updateProfNotifBadge();
}
function updateProfNotifBadge() {
  const count = (NOTIFS_PROF[currentUser?.id] || []).filter(n => !n.lu).length;
  const badge = $('notif-count-prof');
  const dot = $('notif-dot-prof');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  if (dot) { dot.style.display = count > 0 ? 'block' : 'none'; }
}

/* ══════════════════════════════════════════════
   MODALES & TOAST
   ══════════════════════════════════════════════ */
/* ======================================================
   MESSAGERIE - COMPOSE (modal commune)
   ====================================================== */
function _buildDestinatairesOptions() {
  const tous = Auth.getAll();
  const roleLabels = { eleve:'Eleve', professeur:'Professeur', principal:'Direction', cpe:'CPE', secretaire:'Secretariat', parent:'Parent' };
  const role = currentUser?.role;
  let filtres = tous.filter(u => u.id !== currentUser?.id);
  if (role === 'eleve') filtres = filtres.filter(u => ['professeur','principal','cpe'].includes(u.role));
  if (role === 'parent') filtres = filtres.filter(u => ['professeur','principal','cpe','secretaire'].includes(u.role));
  return filtres.map(u => ({ id: u.id, label: `${u.prenom} ${u.nom} (${roleLabels[u.role] || u.role})` }));
}

function openCompose() {
  const modal = $('modal-compose');
  if (!modal) return;
  const opts = _buildDestinatairesOptions();
  const destList = $('compose-dest-list');
  if (destList) destList.innerHTML = opts.map(o => `<option value="${o.id}">${o.label}</option>`).join('');
  const destInput = $('compose-dest');
  if (destInput) { destInput.value = ''; destInput.setAttribute('list', 'compose-dest-list'); }
  const sujetEl = $('compose-sujet'); if (sujetEl) sujetEl.value = '';
  const corpsEl = $('compose-corps'); if (corpsEl) corpsEl.value = '';
  const errEl = $('compose-error'); if (errEl) errEl.classList.add('hidden');
  modal.classList.remove('hidden');
}
function openComposePro() { openCompose(); }
function closeCompose() { $('modal-compose').classList.add('hidden'); }

async function sendCompose() {
  const destRaw = $('compose-dest')?.value.trim();
  const sujet = $('compose-sujet')?.value.trim();
  const corps = $('compose-corps')?.value.trim();
  const errEl = $('compose-error');
  const errMsg = $('compose-error-msg');
  if (!destRaw || !sujet || !corps) {
    if (errMsg) errMsg.textContent = 'Tous les champs sont obligatoires.';
    if (errEl) errEl.classList.remove('hidden'); return;
  }
  const opts = _buildDestinatairesOptions();
  const match = opts.find(o => o.label === destRaw || o.id === destRaw);
  const destinataireId = match ? match.id : destRaw;
  const btn = $('compose-send-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Envoi\u2026'; }
  let result = { ok: false };
  try { result = await AsimovDB.envoyerMessage(currentUser.id, destinataireId, sujet, corps); } catch(_) {}
  if (!result.ok) {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('fr-FR')} \u2013 ${now.getHours().toString().padStart(2,'0')}h${now.getMinutes().toString().padStart(2,'0')}`;
    if (!DB.messages[destinataireId]) DB.messages[destinataireId] = [];
    DB.messages[destinataireId].unshift({ id: Date.now(), expediteur: `${currentUser.prenom} ${currentUser.nom}`, sujet, corps, date: dateStr, lu: false });
    result = { ok: true };
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Envoyer'; }
  if (result.ok) { closeCompose(); showToast('\u2705 Message envoy\u00e9 !'); }
  else { if (errMsg) errMsg.textContent = result.msg || 'Erreur.'; if (errEl) errEl.classList.remove('hidden'); }
}

function showToast(msg, duration = 3000) {
  const existing = document.querySelectorAll('.toast-success');
  existing.forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast-success';
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const dateEl = $('today-date');
  if (dateEl) dateEl.textContent = formatDateFR();

  const pwdInput = $('password');
  if (pwdInput) {
    pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(e); } });
  }

  // Hint en temps réel pour l'identifiant demande
  const demIdent = $('dem-identifiant');
  if (demIdent) {
    demIdent.addEventListener('input', () => {
      const val = demIdent.value.toLowerCase();
      const hint = $('dem-hint');
      const parts = val.split('.');
      if (parts.length === 3 && parts[2].length === 8) {
        const eleveDB = DB.elevesPreinscrits[val];
        if (eleveDB) {
          hint.textContent = `✅ Élève trouvé : ${eleveDB.prenom} ${eleveDB.nom} — ${eleveDB.classe}`;
          hint.style.color = '#059669';
        } else {
          hint.textContent = '❌ Aucun élève trouvé avec cet identifiant';
          hint.style.color = '#DC2626';
        }
      } else if (val.length > 5) {
        hint.textContent = 'Format attendu : nom.prenom.JJMMAAAA';
        hint.style.color = '#64748B';
      } else {
        hint.textContent = '';
      }
    });
  }
});

/* ══════════════════════════════════════════════
   PROGRESSION ANNUELLE — PROF
   ══════════════════════════════════════════════ */

/* Données chapitres : { [profId]: { [classe]: [ chapitre, ... ] } } */
let CHAPITRES_PROG = {
  prof1: {
    '4ème B': [
      { id: 1, num: 1, titre: 'Nombres entiers et décimaux', debut: '2025-09-08', fin: '2025-09-26', statut: 'termine', desc: 'Rappels, opérations, ordre de grandeur' },
      { id: 2, num: 2, titre: 'Fractions — notion et simplification', debut: '2025-09-29', fin: '2025-10-17', statut: 'termine', desc: 'Fractions irréductibles, comparaison' },
      { id: 3, num: 3, titre: 'Fractions — opérations', debut: '2025-10-20', fin: '2025-11-14', statut: 'termine', desc: 'Addition, soustraction, multiplication' },
      { id: 4, num: 4, titre: 'Proportionnalité', debut: '2025-11-17', fin: '2025-12-12', statut: 'termine', desc: 'Tableaux, règle de trois, pourcentages' },
      { id: 5, num: 5, titre: 'Équations du premier degré', debut: '2026-01-05', fin: '2026-02-06', statut: 'termine', desc: 'Résolution, mise en équation' },
      { id: 6, num: 6, titre: 'Géométrie — triangles', debut: '2026-02-16', fin: '2026-03-20', statut: 'en_cours', desc: 'Pythagore, Thalès, construction' },
      { id: 7, num: 7, titre: 'Statistiques et probabilités', debut: '2026-03-23', fin: '2026-04-17', statut: 'a_venir', desc: 'Fréquences, moyennes, probabilités simples' },
      { id: 8, num: 8, titre: 'Puissances et notation scientifique', debut: '2026-04-27', fin: '2026-05-22', statut: 'a_venir', desc: 'Exposants, écriture scientifique' },
      { id: 9, num: 9, titre: 'Révisions brevet', debut: '2026-05-25', fin: '2026-06-19', statut: 'a_venir', desc: 'Annales, entraînement' },
    ],
    '6ème A': [
      { id: 1, num: 1, titre: 'Nombres entiers', debut: '2025-09-08', fin: '2025-10-03', statut: 'termine', desc: 'Écriture, comparaison, opérations' },
      { id: 2, num: 2, titre: 'Géométrie de base', debut: '2025-10-06', fin: '2025-11-07', statut: 'termine', desc: 'Points, droites, angles, cercles' },
      { id: 3, num: 3, titre: 'Fractions simples', debut: '2025-11-10', fin: '2025-12-12', statut: 'termine', desc: 'Notion de fraction, représentation' },
      { id: 4, num: 4, titre: 'Symétrie axiale', debut: '2026-01-05', fin: '2026-02-06', statut: 'termine', desc: 'Axe de symétrie, figures symétriques' },
      { id: 5, num: 5, titre: 'Nombres décimaux', debut: '2026-02-16', fin: '2026-03-27', statut: 'en_cours', desc: 'Opérations, ordre, valeur approchée' },
      { id: 6, num: 6, titre: 'Périmètres et aires', debut: '2026-03-30', fin: '2026-05-01', statut: 'a_venir', desc: 'Carré, rectangle, triangle, cercle' },
      { id: 7, num: 7, titre: 'Données et statistiques', debut: '2026-05-04', fin: '2026-06-12', statut: 'a_venir', desc: 'Tableaux, graphiques, fréquences' },
    ],
  },
};

/* ─── INIT SECTION ─── */
function initProgressionSection(user) {
  const sel = $('prog-classe-select');
  if (!sel) return;
  // Trier les classes par niveau (6→5→4→3) puis lettre
  const niveaux = ['6ème', '5ème', '4ème', '3ème'];
  const classes = [...(user.classes || [])].sort((a, b) => {
    const na = niveaux.findIndex(n => a.startsWith(n));
    const nb = niveaux.findIndex(n => b.startsWith(n));
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
  const current = sel.value || classes[0] || '';
  sel.innerHTML = '<option value="">— Choisir une classe —</option>' +
    classes.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
  // Remplir aussi le select de la modal
  const chSel = $('ch-classe');
  if (chSel) {
    chSel.innerHTML = '<option value="">— Choisir —</option>' +
      classes.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  if (current) { sel.value = current; renderProgression(); }
}

/* ─── HELPERS SEMAINES ─── */
function getAnneeScolaire() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const debut = m >= 9 ? y : y - 1;
  return { debut, fin: debut + 1, label: `${debut}/${debut + 1}` };
}

function getNumSemaine(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getLundiDeSemaine(annee, semaine) {
  const simple = new Date(annee, 0, 1 + (semaine - 1) * 7);
  const dow = simple.getDay();
  const lundi = new Date(simple);
  lundi.setDate(simple.getDate() - (dow <= 4 ? dow - 1 : dow - 8));
  return lundi;
}

function getNbJoursOuvres(debut, fin, absences) {
  // Compte les jours ouvrés (lundi-vendredi) hors absences
  let jours = 0;
  const d = new Date(debut);
  while (d <= fin) {
    const dow = d.getDay();
    if (dow >= 1 && dow <= 5) {
      const ds = d.toISOString().split('T')[0];
      const absente = (absences || []).some(a => ds >= a.debut && ds <= a.fin);
      if (!absente) jours++;
    }
    d.setDate(d.getDate() + 1);
  }
  return jours;
}

function decalerChapitres(chapitres, absences) {
  // Recalcule les dates de fin en tenant compte des absences
  // Pour chaque chapitre, on décale la fin si des absences tombent dedans
  return chapitres.map(ch => {
    if (!ch.debut || !ch.fin || !absences?.length) return ch;
    const debut = new Date(ch.debut);
    const finPrev = new Date(ch.fin);
    // Compter les jours d'absence dans la période
    let joursAbsence = 0;
    absences.forEach(a => {
      const ad = new Date(a.debut), af = new Date(a.fin);
      // Intersection
      const start = new Date(Math.max(debut, ad));
      const end = new Date(Math.min(finPrev, af));
      if (start <= end) {
        let d = new Date(start);
        while (d <= end) {
          const dow = d.getDay();
          if (dow >= 1 && dow <= 5) joursAbsence++;
          d.setDate(d.getDate() + 1);
        }
      }
    });
    if (!joursAbsence) return ch;
    // Décaler la fin de finPrev de joursAbsence jours ouvrés
    let fin = new Date(finPrev);
    let added = 0;
    while (added < joursAbsence) {
      fin.setDate(fin.getDate() + 1);
      if (fin.getDay() >= 1 && fin.getDay() <= 5) added++;
    }
    return { ...ch, fin: fin.toISOString().split('T')[0], _decale: joursAbsence };
  });
}

/* ─── CHAPITRES PAR DÉFAUT PAR NIVEAU ─── */
function getChapitresDefautNiveau(classe, anneeDebut) {
  const niveau = classe.charAt(0); // '6','5','4','3'
  const ay = anneeDebut;
  const ny = anneeDebut + 1;
  const ch = {
    '6': [
      { num: 1, titre: 'Nombres entiers et décimaux', debut: `${ay}-09-08`, fin: `${ay}-10-03`, desc: 'Lecture, écriture, ordre, opérations' },
      { num: 2, titre: 'Géométrie — points et droites', debut: `${ay}-10-06`, fin: `${ay}-11-07`, desc: 'Vocabulaire, constructions de base' },
      { num: 3, titre: 'Fractions — introduction', debut: `${ay}-11-10`, fin: `${ay}-12-12`, desc: 'Notion de fraction, représentation' },
      { num: 4, titre: 'Symétrie axiale', debut: `${ny}-01-05`, fin: `${ny}-02-06`, desc: 'Axe, figures symétriques' },
      { num: 5, titre: 'Nombres décimaux — opérations', debut: `${ny}-02-16`, fin: `${ny}-03-27`, desc: 'Addition, soustraction, multiplication' },
      { num: 6, titre: 'Périmètres et aires', debut: `${ny}-03-30`, fin: `${ny}-05-01`, desc: 'Rectangle, carré, triangle, disque' },
      { num: 7, titre: 'Données et graphiques', debut: `${ny}-05-04`, fin: `${ny}-06-12`, desc: 'Lecture, tableaux, fréquences' },
    ],
    '5': [
      { num: 1, titre: 'Nombres entiers — rappels', debut: `${ay}-09-08`, fin: `${ay}-10-03`, desc: 'Divisibilité, nombres premiers, PGCD' },
      { num: 2, titre: 'Fractions — opérations', debut: `${ay}-10-06`, fin: `${ay}-11-14`, desc: 'Addition, soustraction, multiplication' },
      { num: 3, titre: 'Proportionnalité', debut: `${ay}-11-17`, fin: `${ay}-12-19`, desc: 'Tableaux, pourcentages, échelles' },
      { num: 4, titre: 'Géométrie — triangles', debut: `${ny}-01-05`, fin: `${ny}-02-06`, desc: 'Pythagore, constructions' },
      { num: 5, titre: 'Symétrie centrale', debut: `${ny}-02-16`, fin: `${ny}-03-27`, desc: 'Centre, figures symétriques' },
      { num: 6, titre: 'Calcul littéral', debut: `${ny}-03-30`, fin: `${ny}-05-01`, desc: 'Expressions, développement, factorisation' },
      { num: 7, titre: 'Probabilités — introduction', debut: `${ny}-05-04`, fin: `${ny}-06-12`, desc: 'Expériences aléatoires, fréquences' },
    ],
    '4': [
      { num: 1, titre: 'Nombres entiers et décimaux', debut: `${ay}-09-08`, fin: `${ay}-09-26`, desc: 'Rappels, opérations, ordre de grandeur' },
      { num: 2, titre: 'Fractions — simplification', debut: `${ay}-09-29`, fin: `${ay}-10-17`, desc: 'Fractions irréductibles, comparaison' },
      { num: 3, titre: 'Fractions — opérations', debut: `${ay}-10-20`, fin: `${ay}-11-14`, desc: 'Addition, soustraction, multiplication' },
      { num: 4, titre: 'Proportionnalité', debut: `${ay}-11-17`, fin: `${ay}-12-12`, desc: 'Tableaux, règle de trois, pourcentages' },
      { num: 5, titre: 'Équations du premier degré', debut: `${ny}-01-05`, fin: `${ny}-02-06`, desc: 'Résolution, mise en équation' },
      { num: 6, titre: 'Géométrie — triangles', debut: `${ny}-02-16`, fin: `${ny}-03-20`, desc: 'Pythagore, Thalès, construction' },
      { num: 7, titre: 'Statistiques et probabilités', debut: `${ny}-03-23`, fin: `${ny}-04-17`, desc: 'Fréquences, moyennes, probabilités simples' },
      { num: 8, titre: 'Puissances et notation sci.', debut: `${ny}-04-27`, fin: `${ny}-05-22`, desc: 'Exposants, écriture scientifique' },
      { num: 9, titre: 'Révisions', debut: `${ny}-05-25`, fin: `${ny}-06-19`, desc: 'Bilan et consolidation' },
    ],
    '3': [
      { num: 1, titre: 'Calcul numérique — rappels', debut: `${ay}-09-08`, fin: `${ay}-09-26`, desc: 'Priorités, fractions, puissances' },
      { num: 2, titre: 'Développement et factorisation', debut: `${ay}-09-29`, fin: `${ay}-10-24`, desc: 'Identités remarquables, ax²+bx+c' },
      { num: 3, titre: 'Équations et inéquations', debut: `${ay}-10-27`, fin: `${ay}-11-28`, desc: 'Résolution, systèmes' },
      { num: 4, titre: 'Fonctions — notion', debut: `${ay}-12-01`, fin: `${ay}-12-19`, desc: 'Représentation graphique, variations' },
      { num: 5, titre: 'Théorème de Pythagore', debut: `${ny}-01-05`, fin: `${ny}-01-30`, desc: 'Réciproque, applications' },
      { num: 6, titre: 'Théorème de Thalès', debut: `${ny}-02-02`, fin: `${ny}-02-27`, desc: 'Proportionnalité, agrandissement' },
      { num: 7, titre: 'Trigonométrie', debut: `${ny}-03-02`, fin: `${ny}-03-27`, desc: 'Sin, cos, tan dans le triangle rectangle' },
      { num: 8, titre: 'Statistiques et probabilités', debut: `${ny}-03-30`, fin: `${ny}-04-24`, desc: 'Fréquences, loi des grands nombres' },
      { num: 9, titre: 'Géométrie dans l\'espace', debut: `${ny}-04-27`, fin: `${ny}-05-22`, desc: 'Solides, sections planes, volumes' },
      { num: 10, titre: 'Révisions brevet', debut: `${ny}-05-25`, fin: `${ny}-06-26`, desc: 'Annales complètes, méthodologie' },
    ],
  };
  return (ch[niveau] || ch['4']).map((c, i) => ({
    ...c, id: Date.now() + i,
    statut: new Date(c.fin) < new Date() ? 'termine' : new Date(c.debut) <= new Date() ? 'en_cours' : 'a_venir',
  }));
}

/* ─── RENDER PROGRESSION ─── */
function renderProgression() {
  const classe = $('prog-classe-select')?.value;
  const container = $('prog-timeline-container');
  const anneeBar = $('prog-annee-bar');
  if (!container) return;

  if (!classe) {
    anneeBar && (anneeBar.style.display = 'none');
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#94A3B8">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" style="margin:0 auto 12px;display:block;opacity:.4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      <p style="font-size:14px">Sélectionnez une classe pour voir sa progression</p>
    </div>`;
    return;
  }

  const profId = currentUser?.id;
  if (!CHAPITRES_PROG[profId]) CHAPITRES_PROG[profId] = {};
  // Auto-générer si classe vide
  const annee = getAnneeScolaire();
  if (!CHAPITRES_PROG[profId][classe] || CHAPITRES_PROG[profId][classe].length === 0) {
    CHAPITRES_PROG[profId][classe] = getChapitresDefautNiveau(classe, annee.debut);
  }

  // Absences prof pour cette classe (depuis ABSENCES_PROFS)
  const absencesProfClasse = ABSENCES_PROFS
    .filter(a => a.actif || true) // toutes les absences historiques
    .map(a => ({
      debut: a.dateDebut ? a.dateDebut.split('/').reverse().join('-') : null,
      fin: a.dateFin ? a.dateFin.split('/').reverse().join('-') : null,
    }))
    .filter(a => a.debut && a.fin);

  // Décaler les chapitres en fonction des absences
  const chapitresRaw = [...CHAPITRES_PROG[profId][classe]].sort((a, b) => a.num - b.num);
  const chapitres = decalerChapitres(chapitresRaw, absencesProfClasse);

  // === BARRE ANNUELLE ===
  const anneeDebut = new Date(`${annee.debut}-09-01`);
  const anneeFin = new Date(`${annee.fin}-06-30`);
  const maintenant = new Date();
  const totalMs = anneeFin - anneeDebut;
  const ecoulee = Math.min(Math.max(maintenant - anneeDebut, 0), totalMs);
  const pctAnnee = Math.round((ecoulee / totalMs) * 100);
  const termines = chapitres.filter(c => c.statut === 'termine').length;
  const pctChap = chapitres.length ? Math.round((termines / chapitres.length) * 100) : 0;

  if (anneeBar) {
    anneeBar.style.display = 'block';
    const fill = $('prog-annee-fill');
    const cursor = $('prog-annee-cursor');
    const labelEl = $('prog-annee-label');
    const pct = $('prog-pct-global');
    const anneeEl = document.querySelector('#prog-annee-bar span:first-child');
    if (labelEl) labelEl.textContent = `${termines}/${chapitres.length} chapitres terminés`;
    if (pct) pct.textContent = pctChap + '%';
    // Mettre à jour les labels de l'année
    const spans = document.querySelectorAll('#prog-annee-bar > div:first-child span');
    if (spans[0]) spans[0].textContent = `Sept. ${annee.debut}`;
    if (spans[2]) spans[2].textContent = `Juin ${annee.fin}`;
    setTimeout(() => {
      if (fill) fill.style.width = pctChap + '%';
      if (cursor) cursor.style.left = pctAnnee + '%';
    }, 80);
  }

  if (!chapitres.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px;background:#F8FAFC;border-radius:16px;border:2px dashed #E2E8F0">
      <p style="color:#94A3B8;font-size:14px;margin-bottom:12px">Aucun chapitre pour cette classe</p>
      <button onclick="openModalAddChapitre('${classe}')" class="btn-primary" style="font-size:13px">+ Ajouter le premier chapitre</button>
    </div>`;
    return;
  }

  // === TIMELINE ===
  const colors = {
    termine: { bg: '#F0FDF4', border: '#16A34A', dot: '#16A34A', text: '#14532D', badge: '#DCFCE7', badgeText: '#15803D', icon: '✅' },
    en_cours: { bg: '#EFF6FF', border: '#2563EB', dot: '#2563EB', text: '#1E3A8A', badge: '#DBEAFE', badgeText: '#1D4ED8', icon: '⏳' },
    a_venir: { bg: '#F8FAFC', border: '#E2E8F0', dot: '#CBD5E1', text: '#64748B', badge: '#F1F5F9', badgeText: '#64748B', icon: '📅' },
  };

  let html = '<div style="position:relative;padding-left:40px">';
  html += `<div style="position:absolute;left:14px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#2563EB 0%,#7C3AED 50%,#E2E8F0 100%)"></div>`;

  chapitres.forEach((ch, i) => {
    const c = colors[ch.statut] || colors.a_venir;
    const debutDate = ch.debut ? new Date(ch.debut) : null;
    const finDate = ch.fin ? new Date(ch.fin) : null;
    const debutStr = debutDate ? debutDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '–';
    const finStr = finDate ? finDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '–';

    // Semaines
    let semainesHtml = '';
    if (debutDate && finDate) {
      const s1 = getNumSemaine(debutDate);
      const s2 = getNumSemaine(finDate);
      const nbSem = s2 - s1 + 1;
      // Générer badges semaine
      const semBadges = [];
      for (let s = s1; s <= s2; s++) {
        const lundi = getLundiDeSemaine(debutDate.getFullYear(), s);
        const vendr = new Date(lundi); vendr.setDate(lundi.getDate() + 4);
        const isNow = maintenant >= lundi && maintenant <= vendr;
        // Vérifier si cette semaine est une absence
        const semStr = lundi.toISOString().split('T')[0];
        const isAbsence = absencesProfClasse.some(a => semStr >= a.debut && semStr <= a.fin);
        semBadges.push(`<span title="Semaine ${s} — ${lundi.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} au ${vendr.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}" style="
          display:inline-flex;align-items:center;justify-content:center;
          min-width:28px;height:22px;padding:0 6px;border-radius:6px;font-size:10px;font-weight:700;
          background:${isAbsence ? '#FEF2F2' : isNow ? '#DBEAFE' : c.badge};
          color:${isAbsence ? '#DC2626' : isNow ? '#1D4ED8' : c.badgeText};
          border:1px solid ${isAbsence ? '#FECACA' : isNow ? '#93C5FD' : 'transparent'};
          text-decoration:${isAbsence ? 'line-through' : 'none'};
          cursor:default;
        ">${isAbsence ? '🚫' : ''}S${s}</span>`);
      }
      semainesHtml = `
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:6px;margin-bottom:6px">
          <span style="font-size:10px;color:#94A3B8;font-weight:600;margin-right:2px">Semaines :</span>
          ${semBadges.join('')}
          <span style="font-size:10px;color:#94A3B8;margin-left:2px">(${nbSem} sem.)</span>
          ${ch._decale ? `<span style="font-size:10px;background:#FEF9C3;color:#92400E;padding:2px 7px;border-radius:6px;border:1px solid #FDE68A;margin-left:4px" title="Décalé suite à ${ch._decale} jour(s) d'absence">⚠️ +${ch._decale}j absences</span>` : ''}
        </div>`;
    }

    // Avancement
    let pctChapInner = 0;
    if (ch.statut === 'termine') {
      pctChapInner = 100;
    } else if (ch.statut === 'en_cours' && debutDate && finDate) {
      const prog = Math.min(Math.max((maintenant - debutDate) / (finDate - debutDate), 0), 1);
      pctChapInner = Math.round(prog * 100);
    }

    html += `
    <div class="prog-chapitre-card" id="prog-ch-${ch.id}" style="
      position:relative;margin-bottom:14px;background:${c.bg};
      border:1.5px solid ${c.border};border-radius:14px;padding:16px 18px;
      transition:box-shadow .2s,transform .2s;
    ">
      <div style="position:absolute;left:-30px;top:20px;width:16px;height:16px;border-radius:50%;
        background:${c.dot};border:3px solid #fff;box-shadow:0 0 0 2px ${c.dot}"></div>

      <div style="display:flex;align-items:flex-start;gap:14px">
        <div style="min-width:38px;height:38px;border-radius:10px;background:${c.badge};
          display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:${c.badgeText};flex-shrink:0">
          ${ch.num}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
            <span style="font-weight:700;font-size:14px;color:${c.text}">${ch.titre}</span>
            <span style="background:${c.badge};color:${c.badgeText};padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600">${c.icon} ${ch.statut === 'termine' ? 'Terminé' : ch.statut === 'en_cours' ? 'En cours' : 'À venir'}</span>
          </div>
          ${ch.desc ? `<div style="font-size:12px;color:#64748B;margin-bottom:4px">${ch.desc}</div>` : ''}
          ${semainesHtml}
          <div style="height:7px;background:#E2E8F0;border-radius:20px;overflow:hidden;margin-bottom:5px">
            <div class="prog-bar-fill" data-target="${pctChapInner}" style="height:100%;background:${ch.statut === 'termine' ? '#16A34A' : ch.statut === 'en_cours' ? '#2563EB' : '#CBD5E1'};border-radius:20px;width:0%;transition:width 0.9s ease ${i * 0.1}s"></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#94A3B8">
            <span>📅 ${debutStr} → ${finStr}</span>
            <span style="font-weight:700;color:${c.text}">${pctChapInner}%</span>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button onclick="editChapitre(${ch.id},'${classe}')" title="Modifier" style="width:30px;height:30px;border-radius:8px;border:1px solid ${c.border};background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="none" stroke="${c.dot}" stroke-width="2" width="13"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onclick="deleteChapitre(${ch.id},'${classe}')" title="Supprimer" style="width:30px;height:30px;border-radius:8px;border:1px solid #FECACA;background:#FEF2F2;cursor:pointer;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" width="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  });

  html += '</div>';
  container.innerHTML = html;

  setTimeout(() => {
    container.querySelectorAll('.prog-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }, 60);
}

/* ─── MODAL ─── */
function openModalAddChapitre(classePreset) {
  const modal = $('modal-add-chapitre');
  if (!modal) return;
  modal.classList.remove('hidden');
  // Reset
  ['ch-num', 'ch-titre', 'ch-desc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  $('ch-statut').value = 'a_venir';
  $('ch-debut').value = '';
  $('ch-fin').value = '';
  // Pré-remplir classe
  const sel = $('ch-classe');
  if (sel && classePreset) sel.value = classePreset;
  else if (sel) {
    const prog = $('prog-classe-select');
    if (prog?.value) sel.value = prog.value;
  }
  // Remplir les options si vide
  if (sel && sel.options.length <= 1 && currentUser) {
    sel.innerHTML = '<option value="">— Choisir —</option>' +
      (currentUser.classes || []).map(c => `<option value="${c}">${c}</option>`).join('');
    if (classePreset) sel.value = classePreset;
  }
}
function closeModalAddChapitre() { $('modal-add-chapitre')?.classList.add('hidden'); }

function validerAddChapitre() {
  const profId = currentUser?.id;
  const classe = $('ch-classe')?.value;
  const num = parseInt($('ch-num')?.value);
  const titre = $('ch-titre')?.value?.trim();
  const debut = $('ch-debut')?.value;
  const fin = $('ch-fin')?.value;
  const statut = $('ch-statut')?.value || 'a_venir';
  const desc = $('ch-desc')?.value?.trim();

  if (!classe || !num || !titre) { showToast('⚠️ Classe, numéro et titre sont requis'); return; }

  if (!CHAPITRES_PROG[profId]) CHAPITRES_PROG[profId] = {};
  if (!CHAPITRES_PROG[profId][classe]) CHAPITRES_PROG[profId][classe] = [];

  // Edit ou ajout
  const editId = $('ch-edit-id')?.value;
  if (editId) {
    const idx = CHAPITRES_PROG[profId][classe].findIndex(c => c.id == editId);
    if (idx !== -1) CHAPITRES_PROG[profId][classe][idx] = { id: parseInt(editId), num, titre, debut, fin, statut, desc };
    if ($('ch-edit-id')) $('ch-edit-id').value = '';
  } else {
    const newId = Date.now();
    CHAPITRES_PROG[profId][classe].push({ id: newId, num, titre, debut, fin, statut, desc });
  }

  closeModalAddChapitre();
  // Sync sélecteur et affichage
  const sel = $('prog-classe-select');
  if (sel) { sel.value = classe; }
  renderProgression();
  showToast(`✅ Chapitre ${num} — "${titre}" enregistré`);
}

function editChapitre(id, classe) {
  const profId = currentUser?.id;
  const ch = (CHAPITRES_PROG[profId]?.[classe] || []).find(c => c.id === id);
  if (!ch) return;
  openModalAddChapitre(classe);
  setTimeout(() => {
    if ($('ch-num')) $('ch-num').value = ch.num;
    if ($('ch-titre')) $('ch-titre').value = ch.titre;
    if ($('ch-debut')) $('ch-debut').value = ch.debut || '';
    if ($('ch-fin')) $('ch-fin').value = ch.fin || '';
    if ($('ch-statut')) $('ch-statut').value = ch.statut;
    if ($('ch-desc')) $('ch-desc').value = ch.desc || '';
    // Stocker l'id en édition dans un champ caché
    let hidden = $('ch-edit-id');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden'; hidden.id = 'ch-edit-id';
      $('modal-add-chapitre')?.appendChild(hidden);
    }
    hidden.value = id;
    // Changer le titre de la modal
    const h3 = document.querySelector('#modal-add-chapitre .modal-header h3');
    if (h3) h3.textContent = `✏️ Modifier le chapitre ${ch.num}`;
  }, 60);
}

function deleteChapitre(id, classe) {
  const profId = currentUser?.id;
  if (!CHAPITRES_PROG[profId]?.[classe]) return;
  CHAPITRES_PROG[profId][classe] = CHAPITRES_PROG[profId][classe].filter(c => c.id !== id);
  renderProgression();
  showToast('🗑 Chapitre supprimé');
}

/* ══════════════════════════════════════════════
   PORTAIL PARENTS
   ══════════════════════════════════════════════ */

let parentEnfantActif = null; // élève actuellement affiché

/* ─── INIT ─── */
function setupParentDashboard(user) {
  $('parent-avatar').textContent = getInitials(user.prenom, user.nom);
  $('parent-fullname').textContent = `${user.prenom} ${user.nom}`;
  $('parent-date').textContent = formatDateFR();
  $('parent-welcome').textContent = `Bonjour, ${user.prenom} 👋`;

  // Récupérer les enfants
  const allUsers = Auth.getAll();
  const enfants = (user.enfants || [])
    .map(id => allUsers.find(u => u.id === id))
    .filter(Boolean);

  if (!enfants.length) {
    $('parent-enfant-card').innerHTML = `<p style="color:#fff;opacity:.7">Aucun enfant associé à ce compte.</p>`;
    return;
  }

  // Sélecteur enfants — toujours visible, boutons visuels
  const selector = $('parent-enfant-selector');
  const btnsContainer = $('parent-enfants-btns');
  if (selector && btnsContainer) {
    selector.style.display = 'block';
    renderEnfantsBtns(enfants, enfants[0].id);
  }

  parentEnfantActif = enfants[0];
  renderParentAccueil();
  renderParentNotifBadge();
}

function renderEnfantsBtns(enfants, activeId) {
  const btnsContainer = $('parent-enfants-btns');
  if (!btnsContainer) return;
  btnsContainer.innerHTML = enfants.map(e => `
    <button onclick="selectParentEnfant('${e.id}')" style="
      display:flex;align-items:center;gap:10px;width:100%;
      padding:8px 10px;border-radius:9px;border:none;cursor:pointer;
      background:${e.id === activeId ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.07)'};
      transition:background .15s;text-align:left;
    " onmouseover="if('${e.id}'!=='${activeId}')this.style.background='rgba(255,255,255,.12)'"
       onmouseout="if('${e.id}'!=='${activeId}')this.style.background='rgba(255,255,255,.07)'"
    >
      <div style="
        width:32px;height:32px;border-radius:8px;flex-shrink:0;
        background:${e.id === activeId ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.15)'};
        display:flex;align-items:center;justify-content:center;
        font-weight:800;font-size:11px;color:#fff;
      ">${getInitials(e.prenom, e.nom)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.prenom} ${e.nom}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.55);margin-top:1px">${e.classe}</div>
      </div>
      ${e.id === activeId ? '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="2.5" width="14" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
    </button>`).join('');
}

function selectParentEnfant(id) {
  const enfant = Auth.getAll().find(u => u.id === id);
  if (!enfant) return;
  parentEnfantActif = enfant;
  parentWeekOffset = 0;
  // Re-render les boutons avec le nouvel actif
  const enfants = (currentUser.enfants || []).map(eid => Auth.getAll().find(u => u.id === eid)).filter(Boolean);
  renderEnfantsBtns(enfants, id);
  renderParentAccueil();
  // Re-render la section active
  const activeSection = document.querySelector('#page-parent .dash-section.active');
  if (activeSection) {
    const id2 = activeSection.id.replace('section-', '');
    showParentSection(id2, null);
  }
}

function switchParentEnfant() {
  // Gardé pour compatibilité
}

/* ─── NAVIGATION ─── */
function showParentSection(id, linkEl) {
  document.querySelectorAll('#page-parent .dash-section').forEach(s => s.classList.remove('active'));
  $(`section-${id}`)?.classList.add('active');
  if (linkEl) {
    document.querySelectorAll('#page-parent .nav-item').forEach(n => n.classList.remove('active'));
    linkEl.classList.add('active');
  }
  const e = parentEnfantActif;
  if (!e) return;
  if (id === 'parent-accueil') renderParentAccueil();
  if (id === 'parent-notes') renderParentNotes(e);
  if (id === 'parent-absences') renderParentAbsences(e);
  if (id === 'parent-devoirs') renderParentDevoirs(e);
  if (id === 'parent-progression') renderParentProgression(e);
  if (id === 'parent-messagerie') renderParentMessagerie(e);
  if (id === 'parent-edt') renderParentEdt(e);
  // Sync notifs : marquer les notifs de cette cible comme lues
  if (currentUser && NOTIFS_PARENT[currentUser.id]) {
    NOTIFS_PARENT[currentUser.id]
      .filter(n => n.cible === id && !n.lu)
      .forEach(n => n.lu = true);
    renderParentNotifBadge();
  }
}

/* ─── ACCUEIL ─── */
function renderParentAccueil() {
  const e = parentEnfantActif;
  if (!e) return;

  // Carte enfant
  $('parent-enfant-avatar').textContent = getInitials(e.prenom, e.nom);
  $('parent-enfant-nom').textContent = `${e.prenom} ${e.nom}`;
  $('parent-enfant-info').textContent = `${e.classe} · ${e.regime || 'Externe'}`;

  const notes = DB.notes[e.id] || [];
  const devoirs = (DB.devoirs[e.id] || []).filter(d => !d.done);
  const absences = DB.absences[e.id] || [];
  const msgs = (DB.messages[e.id] || []).filter(m => !m.lu);

  const avg = notes.length
    ? (notes.reduce((s, n) => s + n.moyenne, 0) / notes.length).toFixed(1)
    : '–';

  $('parent-enfant-moy').textContent = avg;
  $('parent-stat-moy').textContent = avg;
  $('parent-stat-abs').textContent = absences.length;
  $('parent-stat-devoirs').textContent = devoirs.length;
  $('parent-stat-msg').textContent = msgs.length;

  // Badge absences non justifiées
  const nonJust = absences.filter(a => a.statut === 'En attente').length;
  const absBadge = $('parent-abs-badge');
  if (absBadge) { absBadge.textContent = nonJust; absBadge.style.display = nonJust > 0 ? 'inline-flex' : 'none'; }

  const msgBadge = $('parent-msg-badge');
  if (msgBadge) { msgBadge.textContent = msgs.length; msgBadge.style.display = msgs.length > 0 ? 'inline-flex' : 'none'; }

  // Emploi du temps du jour
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const auj = jours[new Date().getDay()];
  const edt = getEmploiEleve(e);
  const slots = (edt[auj] || edt['Lundi'] || []).filter(s => s.type === 'cours');
  const schedEl = $('parent-today-schedule');
  if (schedEl) {
    schedEl.innerHTML = slots.length ? slots.map(s => {
      const col = getMatiereColor(s.matiere);
      return `<div style="border-left:3px solid ${col.dot};background:${col.bg};border-radius:8px;padding:9px 14px;display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span style="font-size:11px;font-weight:700;color:${col.text};min-width:90px">${s.heure}</span>
        <div style="flex:1"><div style="font-weight:700;font-size:13px;color:${col.text}">${s.matiere}</div><div style="font-size:11px;color:${col.text};opacity:.7">${s.prof}</div></div>
        <span style="font-size:11px;background:${col.border};color:${col.text};padding:2px 8px;border-radius:5px">${s.salle}</span>
      </div>`;
    }).join('')
      : '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:16px">Pas de cours aujourd\'hui</p>';
  }

  // Devoirs accueil
  const devoirsEl = $('parent-home-devoirs');
  if (devoirsEl) {
    devoirsEl.innerHTML = devoirs.slice(0, 4).map(d => {
      const col = getMatiereColor(d.matiere);
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F1F5F9">
        <div style="width:8px;height:8px;border-radius:50%;background:${col.dot};flex-shrink:0"></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600;color:#0F172A">${d.titre}</div><div style="font-size:11px;color:#64748B">${d.matiere}</div></div>
        <span style="font-size:11px;color:${d.urgent ? '#DC2626' : '#94A3B8'};font-weight:${d.urgent ? 700 : 400}">Pour le ${d.dateRendu}</span>
      </div>`;
    }).join('') || '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:12px">Aucun devoir en attente 🎉</p>';
  }

  // Notes accueil
  const notesEl = $('parent-home-notes');
  if (notesEl) {
    notesEl.innerHTML = notes.map(n => {
      const col = getMatiereColor(n.matiere);
      return `<div class="note-chip" style="cursor:default"><div class="note-subject" style="color:${col.text}">${n.matiere.substring(0, 10)}</div><div class="note-value" style="color:#0F172A">${n.moyenne}</div><div class="note-over">/20</div></div>`;
    }).join('') || '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:12px">Aucune note</p>';
  }
}

/* ─── NOTES ─── */
function renderParentNotes(e) {
  const notes = DB.notes[e.id] || [];
  const periodes = getPeriodes();
  const anneeLabel = periodes.label.replace('-', '/');

  const subtitle = $('parent-notes-subtitle');
  if (subtitle) {
    const now = new Date();
    const trim = periodes.trimestres.find(t => now >= t.debut && now <= t.fin);
    subtitle.textContent = trim ? `${trim.nom.split('(')[0].trim()} — ${anneeLabel}` : `Année ${anneeLabel}`;
  }

  const avg = notes.length ? (notes.reduce((s, n) => s + n.moyenne, 0) / notes.length).toFixed(2) : '–';

  let html = `
  <div style="background:#fff;border-radius:12px;border:1px solid #E2E8F0;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between">
    <div><div style="font-size:12px;font-weight:700;color:#64748B">ÉLÈVE</div><div style="font-size:15px;font-weight:700;color:#0F172A;margin-top:2px">${e.prenom} ${e.nom} · ${e.classe}</div></div>
    <div style="text-align:right"><div style="font-size:11px;color:#64748B;font-weight:600">MOYENNE GÉNÉRALE</div><div style="font-size:28px;font-weight:800;color:#0F172A">${avg}<span style="font-size:14px;color:#94A3B8">/20</span></div></div>
  </div>
  <div class="notes-grid">`;

  notes.forEach(m => {
    const col = getMatiereColor(m.matiere);
    html += `
    <div class="notes-matiere-card" style="border-top:3px solid ${col.dot}">
      <div class="notes-matiere-header">
        <div class="notes-matiere-name" style="color:${col.text}">${m.matiere}</div>
        <div class="notes-matiere-avg" style="background:#F1F5F9;border:1px solid #E2E8F0">${m.moyenne}/20</div>
      </div>
      <div class="notes-list" style="margin-top:8px">
        ${m.evaluations.map(ev => `
          <div style="border-left:3px solid ${col.dot};background:${col.bg};padding:8px 12px;border-radius:6px;margin-bottom:5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <strong style="font-size:15px;color:#374151">${ev.note}/${ev.sur}</strong>
            <span style="flex:1;font-size:12px;color:#374151">— ${ev.titre}</span>
            <span style="font-size:10px;color:#94A3B8">${ev.date}</span>
          </div>`).join('')}
      </div>
    </div>`;
  });
  html += '</div>';
  $('parent-notes-grid').innerHTML = html;
}

/* ─── ABSENCES ─── */
function renderParentAbsences(e) {
  const absences = DB.absences[e.id] || [];
  const nonJust = absences.filter(a => a.statut === 'En attente').length;
  const subtitle = $('parent-abs-subtitle');
  if (subtitle) subtitle.textContent = `${absences.length} absence${absences.length > 1 ? 's' : ''} · ${nonJust} non justifiée${nonJust > 1 ? 's' : ''}`;

  const container = $('parent-absences-list');
  if (!container) return;

  if (!absences.length) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:#94A3B8"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" style="margin:0 auto 12px;display:block;opacity:.3"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><p style="font-size:14px">Aucune absence enregistrée 🎉</p></div>`;
    return;
  }

  container.innerHTML = absences.map(a => {
    const isJust = a.statut === 'Justifié';
    const isPend = a.statut === 'En attente';
    const bg = isJust ? '#F0FDF4' : isPend ? '#FEF2F2' : '#F8FAFC';
    const border = isJust ? '#BBF7D0' : isPend ? '#FECACA' : '#E2E8F0';
    const color = isJust ? '#14532D' : isPend ? '#991B1B' : '#334155';
    const badge = isJust ? '<span style="background:#D1FAE5;color:#065F46;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">✓ Justifiée</span>'
      : isPend ? '<span style="background:#FEE2E2;color:#DC2626;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">⚠️ Non justifiée</span>'
        : '<span style="background:#F1F5F9;color:#475569;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">● ' + a.statut + '</span>';
    return `
    <div style="background:${bg};border:1.5px solid ${border};border-radius:12px;padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;gap:16px">
      <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid ${border};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${a.type === 'abs' ? '🚫' : '⏰'}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;color:${color}">${a.date}</div>
        <div style="font-size:12px;color:#64748B;margin-top:2px">${a.detail}</div>
      </div>
      ${badge}
      ${isPend ? `<button onclick="showToast('📧 Demande de justificatif envoyée à l\\'établissement')" style="background:#fff;border:1px solid #FECACA;border-radius:8px;padding:6px 12px;cursor:pointer;color:#DC2626;font-size:12px;font-weight:600;font-family:'Sora',sans-serif">Justifier</button>` : ''}
    </div>`;
  }).join('');
}

/* ─── DEVOIRS ─── */
function renderParentDevoirs(e) {
  const devoirs = DB.devoirs[e.id] || [];
  const pending = devoirs.filter(d => !d.done);
  const done = devoirs.filter(d => d.done);
  const container = $('parent-devoirs-list');
  if (!container) return;

  const renderItem = d => {
    const col = getMatiereColor(d.matiere);
    const urgentBadge = d.urgent && !d.done
      ? `<span style="background:#FEE2E2;color:#DC2626;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700">Urgent</span>`
      : '';
    return `
    <div style="background:#fff;border-radius:12px;border:1.5px solid ${d.done ? '#BBF7D0' : '#E2E8F0'};padding:14px 18px;margin-bottom:8px;display:flex;align-items:center;gap:14px">
      <!-- Indicateur statut -->
      <div style="width:36px;height:36px;border-radius:10px;background:${d.done ? '#F0FDF4' : col.bg};border:1.5px solid ${d.done ? '#BBF7D0' : col.border};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
        ${d.done ? '✅' : '📝'}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px">
          <span style="font-size:13px;font-weight:700;color:${d.done ? '#64748B' : '#0F172A'};${d.done ? 'text-decoration:line-through' : ''}">${d.titre}</span>
          ${urgentBadge}
        </div>
        <div style="font-size:11px;color:#64748B">${d.matiere} · ${d.prof || '–'}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:12px;font-weight:700;color:${d.done ? '#16A34A' : d.urgent ? '#DC2626' : '#64748B'}">${d.done ? '✓ Fait par l\'élève' : 'Pour le ' + d.dateRendu}</div>
      </div>
    </div>`;
  };

  let html = '';
  if (!pending.length && !done.length) {
    html = '<p style="color:#94A3B8;font-size:13px;text-align:center;padding:40px">Aucun devoir enregistré</p>';
  } else {
    if (pending.length) {
      html += `<div style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">À faire (${pending.length})</div>`;
      html += pending.map(renderItem).join('');
    }
    if (done.length) {
      html += `<div style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.5px;margin:20px 0 10px">Faits par l'élève (${done.length})</div>`;
      html += done.map(renderItem).join('');
    }
  }
  container.innerHTML = html;
}

/* ─── PROGRESSION (vue parent = même que élève) ─── */
/* ─── EMPLOI DU TEMPS PARENT ─── */
let parentWeekOffset = 0;

function changeParentWeek(dir) {
  parentWeekOffset += dir;
  if (parentEnfantActif) renderParentEdt(parentEnfantActif);
}

function renderParentEdt(e) {
  const container = $('parent-edt-container');
  if (!container) return;

  const subtitle = $('parent-edt-subtitle');
  if (subtitle) subtitle.textContent = `${e.prenom} ${e.nom} · ${e.classe}`;

  const edt = getEmploiEleve(e);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + parentWeekOffset * 7);
  const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
  const fmt = d => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

  const weekLabel = $('parent-edt-week-label');
  if (weekLabel) weekLabel.textContent = `${fmt(monday)} au ${fmt(friday)}`;

  // Collecter toutes les clés dans l'ordre (référence = tous les jours)
  const allKeys = [];
  const keySet = new Set();
  jours.forEach(j => {
    (edt[j] || []).forEach(s => {
      if (!keySet.has(s.debutKey)) { keySet.add(s.debutKey); allKeys.push(s.debutKey); }
    });
  });

  // Index debutKey → slot par jour
  const idx = {};
  jours.forEach(j => {
    idx[j] = {};
    (edt[j] || []).forEach(s => { idx[j][s.debutKey] = s; });
  });

  // Rowspan : fusionner uniquement les cours identiques consécutifs, jamais les vide
  const rowspan = {};
  jours.forEach(j => {
    rowspan[j] = {};
    const skip = new Set();
    allKeys.forEach((key, ki) => {
      if (skip.has(ki)) return;
      const slot = idx[j][key];
      if (!slot || slot.type !== 'cours') { rowspan[j][ki] = 1; return; }
      let span = 1;
      for (let ni = ki + 1; ni < allKeys.length; ni++) {
        const nslot = idx[j][allKeys[ni]];
        const same = nslot && nslot.type === 'cours' && nslot.matiere === slot.matiere && nslot.prof === slot.prof;
        if (same) { span++; skip.add(ni); } else break;
      }
      rowspan[j][ki] = span;
    });
  });

  const ROW_H = 60;
  const REPAS_H = 48;
  const PAUSE_H = 22;

  let html = `<table style="width:100%;border-collapse:separate;border-spacing:3px;min-width:800px">
    <thead><tr>
      <th style="width:68px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;"></th>`;
  jours.forEach((j, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    html += `<th style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px;font-size:12px;font-weight:700;color:#64748B;text-align:center">
      ${j}<br><span style="font-size:10px;font-weight:400">${fmt(d)}</span></th>`;
  });
  html += `</tr></thead><tbody>`;

  const skipCells = {};
  jours.forEach(j => { skipCells[j] = new Set(); });

  allKeys.forEach((key, ki) => {
    const refSlot = jours.map(j => idx[j][key]).find(Boolean);
    if (!refSlot) return;

    const isRepas = refSlot.type === 'repas';
    const isPause = refSlot.type === 'pause';
    const rowH = isRepas ? REPAS_H : isPause ? PAUSE_H : ROW_H;
    const sepStyle = ki > 0 ? 'border-top:1.5px solid rgba(203,213,225,0.45);' : '';

    html += `<tr>`;

    // Colonne heure
    const tC = (isRepas || isPause) ? '#CBD5E1' : '#94A3B8';
    const tS = (isRepas || isPause) ? '9px' : '10px';
    html += `<td style="${sepStyle}text-align:right;padding-right:8px;padding-top:6px;vertical-align:top;font-size:${tS};color:${tC};font-family:'JetBrains Mono',monospace;white-space:nowrap;height:${rowH}px">${key}</td>`;

    jours.forEach(j => {
      if (skipCells[j].has(ki)) return;

      const slot = idx[j][key];
      const span = rowspan[j][ki] || 1;
      for (let s = 1; s < span; s++) skipCells[j].add(ki + s);

      const cellH = `${span * rowH}px`;
      const spanAttr = span > 1 ? ` rowspan="${span}"` : '';

      if (!slot) {
        if (isPause) {
          html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle">
            <span style="font-size:9px;color:#CBD5E1;font-style:italic">☕ Récré</span></td>`;
        } else {
          html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#F8FAFC;border-radius:8px;border:1px solid #F1F5F9"></td>`;
        }
        return;
      }
      if (slot.type === 'repas') {
        html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle">
          <span style="font-size:10px;color:#CBD5E1;font-style:italic">🍽 Déjeuner</span></td>`;
        return;
      }
      if (slot.type === 'pause') {
        html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#fff;border-radius:6px;border:1px solid #F1F5F9;text-align:center;vertical-align:middle">
          <span style="font-size:9px;color:#CBD5E1;font-style:italic">☕ Récré</span></td>`;
        return;
      }
      if (slot.type === 'vide') {
        html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:#F8FAFC;border-radius:8px;border:1px solid #F1F5F9"></td>`;
        return;
      }
      // Cours
      const col = getMatiereColor(slot.matiere);
      const badge = span >= 2 ? `<div style="font-size:9px;opacity:.5;margin-top:6px">${span}h</div>` : '';
      html += `<td${spanAttr} style="${sepStyle}height:${cellH};background:${col.bg};border-left:4px solid ${col.dot};border-radius:8px;padding:10px 12px;vertical-align:middle;cursor:pointer;transition:filter .15s"
        onmouseover="this.style.filter='brightness(0.93)'" onmouseout="this.style.filter=''">
        <div style="font-weight:700;font-size:12px;color:${col.text};margin-bottom:3px">${slot.matiere}</div>
        <div style="font-size:10px;color:${col.text};opacity:.75;margin-bottom:2px">${slot.prof}</div>
        <div style="font-size:10px;color:${col.text};opacity:.6;font-family:'JetBrains Mono',monospace">${slot.salle}</div>
        ${badge}
      </td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  // Ligne de fin de journée
  html += `<div style="display:flex;align-items:center;gap:8px;margin-top:2px">
    <div style="width:68px;text-align:right;padding-right:8px;font-size:10px;font-weight:600;color:#64748B;font-family:'JetBrains Mono',monospace;flex-shrink:0">17h40</div>
    <div style="flex:1;height:1.5px;background:rgba(203,213,225,0.5)"></div>
  </div>`;
  container.innerHTML = html;
}

function renderParentProgression(e) {
  const container = $('parent-prog-container');
  const subtitle = $('parent-prog-subtitle');
  if (!container) return;

  const annee = getAnneeScolaire();
  if (subtitle) subtitle.textContent = `${e.prenom} ${e.nom} · ${e.classe} · ${annee.label.replace('-', '/')}`;

  // Réutiliser renderEleveProgression en injectant dans le bon container
  // On crée un faux user objet avec les données de l'enfant
  const fakeUser = { ...e };
  // Temporairement rediriger le rendu
  const realContainer = $('eleve-prog-container');
  const realSubtitle = $('eleve-prog-subtitle');

  // Hack propre : rendre directement
  const classe = e.classe;
  const notes = DB.notes[e.id] || [];
  const matieres = notes.map(n => n.matiere);
  const edt = getEmploiEleve(e);
  Object.values(edt).forEach(jour => {
    (jour || []).forEach(s => { if (s.type === 'cours' && s.matiere && !matieres.includes(s.matiere)) matieres.push(s.matiere); });
  });

  const now = new Date();
  let totalPct = 0, cnt = 0;
  matieres.forEach(mat => {
    const ch = getChapitreEleveForMatiere(classe, mat);
    if (!ch) return;
    let p = ch.statut === 'termine' ? 100 : ch.statut === 'en_cours' && ch.debut && ch.fin ? Math.round(Math.min(Math.max((now - new Date(ch.debut)) / (new Date(ch.fin) - new Date(ch.debut)), 0), 1) * 100) : 0;
    totalPct += p; cnt++;
  });
  const pctGlobal = cnt ? Math.round(totalPct / cnt) : 0;

  let html = `
  <div style="background:#fff;border-radius:14px;border:1px solid #E2E8F0;padding:20px 24px;margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div><div style="font-size:13px;font-weight:700;color:#0F172A">Avancement global — ${classe}</div><div style="font-size:11px;color:#94A3B8;margin-top:2px">${matieres.length} matières</div></div>
      <div style="font-size:32px;font-weight:800;color:#7C3AED">${pctGlobal}<span style="font-size:14px;font-weight:500;color:#94A3B8">%</span></div>
    </div>
    <div style="height:10px;background:#F1F5F9;border-radius:20px;overflow:hidden">
      <div class="parent-prog-bar-global" style="height:100%;background:linear-gradient(90deg,#7C3AED,#4A1D96);border-radius:20px;width:0%;transition:width 1.2s ease" data-w="${pctGlobal}%"></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">`;

  matieres.forEach((matiere, idx) => {
    const col = getMatiereColor(matiere);
    const ch = getChapitreEleveForMatiere(classe, matiere);
    const tous = Auth.getAll();
    const profEntry = tous.find(u => u.role === 'professeur' && u.matiere === matiere && (u.classes || []).includes(classe));
    let tousChaps = profEntry ? ([...(CHAPITRES_PROG[profEntry.id]?.[classe] || [])].sort((a, b) => a.num - b.num)) : [];
    if (profEntry && !tousChaps.length) {
      if (!CHAPITRES_PROG[profEntry.id]) CHAPITRES_PROG[profEntry.id] = {};
      CHAPITRES_PROG[profEntry.id][classe] = getChapitresDefautNiveau(classe, annee.debut);
      tousChaps = [...CHAPITRES_PROG[profEntry.id][classe]].sort((a, b) => a.num - b.num);
    }
    const nbTerm = tousChaps.filter(c => c.statut === 'termine').length;
    const nbTot = tousChaps.length;
    let pct = !ch ? 0 : ch.statut === 'termine' ? 100 : ch.statut === 'en_cours' && ch.debut && ch.fin ? Math.round(Math.min(Math.max((now - new Date(ch.debut)) / (new Date(ch.fin) - new Date(ch.debut)), 0), 1) * 100) : 0;
    const sc = !ch ? '#94A3B8' : ch.statut === 'termine' ? '#16A34A' : ch.statut === 'en_cours' ? col.dot : '#94A3B8';
    const sl = !ch ? '–' : ch.statut === 'termine' ? '✅ Terminé' : ch.statut === 'en_cours' ? '⏳ En cours' : '📅 À venir';
    const dots = tousChaps.map(c => {
      const cur = ch && c.id === ch.id;
      const dc = c.statut === 'termine' ? '#16A34A' : c.statut === 'en_cours' ? col.dot : '#E2E8F0';
      return `<div style="width:${cur ? '16px' : '9px'};height:${cur ? '16px' : '9px'};border-radius:50%;background:${dc};border:${cur ? '3px solid ' + col.dot : 'none'};flex-shrink:0"></div>`;
    }).join(`<div style="flex:1;height:2px;background:#E2E8F0;align-self:center;min-width:3px"></div>`);

    html += `
    <div style="background:#fff;border-radius:14px;border:1.5px solid ${col.border};padding:18px 20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:10px;height:10px;border-radius:50%;background:${col.dot}"></div>
        <span style="font-weight:700;font-size:14px;color:${col.text};flex:1">${matiere}</span>
        <span style="font-size:11px;font-weight:700;color:#94A3B8">${nbTerm}/${nbTot} ch.</span>
      </div>
      ${nbTot > 0 ? `<div style="display:flex;align-items:center;gap:0;margin-bottom:12px;padding:0 2px">${dots}</div>` : ''}
      ${ch ? `<div style="background:${col.bg};border-radius:9px;padding:10px 12px;border-left:3px solid ${sc}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap">
          <span style="font-size:10px;font-weight:700;color:#94A3B8">Ch. ${ch.num}</span>
          <span style="font-size:12px;font-weight:700;color:${col.text};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ch.titre}</span>
          <span style="background:${sc}20;color:${sc};padding:1px 7px;border-radius:20px;font-size:10px;font-weight:700">${sl}</span>
        </div>
        <div style="height:6px;background:#E2E8F0;border-radius:20px;overflow:hidden;margin-bottom:4px">
          <div class="parent-prog-bar" data-w="${pct}%" style="height:100%;background:${sc};border-radius:20px;width:0%;transition:width 0.9s ease ${idx * 0.08}s"></div>
        </div>
        <div style="text-align:right;font-size:12px;font-weight:800;color:${sc}">${pct}%</div>
      </div>` : `<div style="font-size:12px;color:#94A3B8;text-align:center;padding:10px">Aucun chapitre</div>`}
    </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
  setTimeout(() => {
    container.querySelectorAll('.parent-prog-bar,.parent-prog-bar-global').forEach(b => { b.style.width = b.dataset.w; });
  }, 80);
}

/* ─── MESSAGERIE ─── */
const PARENT_MESSAGES = {
  parent1: [
    { id: 1, lu: false, expediteur: 'Mme Laurent (Français)', sujet: 'Résultats du contrôle — Félicitations', corps: 'Bonjour,\n\nMartin a obtenu d\'excellents résultats lors du dernier contrôle de français. Continuez à l\'encourager !\n\nCordialement,\nMme Laurent', date: '15/03/2026' },
    { id: 2, lu: true, expediteur: 'M. Vidal (CPE)', sujet: 'Absence du 06/03 — Justificatif requis', corps: 'Bonjour,\n\nL\'absence de votre enfant le jeudi 6 mars n\'a pas encore été justifiée. Merci de nous faire parvenir un justificatif.\n\nM. Vidal, CPE', date: '08/03/2026' },
    { id: 3, lu: true, expediteur: 'Direction', sujet: 'Réunion parents-professeurs — 20 mars', corps: 'Bonjour,\n\nNous vous informons que la réunion parents-professeurs aura lieu le jeudi 20 mars à 17h30.\n\nCordialement', date: '01/03/2026' },
  ],
  parent2: [
    { id: 1, lu: false, expediteur: 'M. Dupont (Mathématiques)', sujet: 'Brevet blanc — résultats', corps: 'Bonjour,\n\nSofia a bien réussi le brevet blanc. Bon travail !\n\nM. Dupont', date: '12/03/2026' },
  ],
};

function renderParentMessagerie(e) {
  const container = $('parent-msg-list');
  if (!container) return;
  const msgs = PARENT_MESSAGES[currentUser?.id] || [];
  if (!msgs.length) { container.innerHTML = `<p style="color:#94A3B8;text-align:center;padding:40px">Aucun message</p>`; return; }
  container.innerHTML = msgs.map(m => `
    <div onclick="openParentMsg(${m.id})" style="background:#fff;border-radius:12px;border:1.5px solid ${m.lu ? '#E2E8F0' : '#BFDBFE'};padding:16px 20px;cursor:pointer;transition:box-shadow .2s;display:flex;gap:14px;align-items:flex-start" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
      <div style="width:42px;height:42px;border-radius:12px;background:${m.lu ? '#F1F5F9' : '#DBEAFE'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${m.lu ? '✉️' : '📬'}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:13px;font-weight:700;color:#0F172A">${m.expediteur}</span>
          <span style="font-size:11px;color:#94A3B8">${m.date}</span>
        </div>
        <div style="font-size:13px;font-weight:${m.lu ? 400 : 700};color:${m.lu ? '#64748B' : '#0F172A'}">${m.sujet}</div>
        <div style="font-size:11px;color:#94A3B8;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.corps.split('\n')[2] || ''}</div>
      </div>
      ${!m.lu ? '<div style="width:8px;height:8px;border-radius:50%;background:#2563EB;flex-shrink:0;margin-top:6px"></div>' : ''}
    </div>`).join('');
}

function openParentMsg(id) {
  const msgs = PARENT_MESSAGES[currentUser?.id] || [];
  const m = msgs.find(x => x.id === id);
  if (!m) return;
  m.lu = true;
  renderParentMessagerie(parentEnfantActif);
  // Modal rapide
  const existing = document.getElementById('modal-parent-msg');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'modal-parent-msg';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(600px,95vw);max-height:80vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3)">
      <div style="display:flex;align-items:center;gap:14px;padding:18px 24px;border-bottom:1px solid #E2E8F0">
        <div style="flex:1"><div style="font-weight:700;font-size:15px;color:#0F172A">${m.sujet}</div><div style="font-size:12px;color:#64748B;margin-top:2px">De : ${m.expediteur} · ${m.date}</div></div>
        <button onclick="document.getElementById('modal-parent-msg').remove()" style="width:32px;height:32px;border-radius:8px;border:1px solid #E2E8F0;background:#F8FAFC;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="padding:24px;overflow-y:auto;flex:1;white-space:pre-line;font-size:14px;color:#334155;line-height:1.7">${m.corps}</div>
      <div style="padding:16px 24px;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end">
        <button onclick="showToast('✉️ Réponse envoyée');document.getElementById('modal-parent-msg').remove()" style="background:linear-gradient(135deg,#4A1D96,#7C3AED);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;cursor:pointer">↩ Répondre</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function openParentCompose() { showToast('✉️ Nouveau message — fonctionnalité disponible prochainement'); }
function openParentJustif() { showToast('📋 Justificatif — envoi en ligne disponible prochainement'); }

/* ─── NOTIFS PARENT ─── */
const NOTIFS_PARENT = {
  parent1: [
    { id: 1, lu: false, icone: '⚠️', titre: 'Absence non justifiée — Martin', detail: 'Martin — Jeudi 06/03 · Journée complète', heure: 'Il y a 2j', cible: 'parent-absences' },
    { id: 2, lu: false, icone: '⚠️', titre: 'Absence non justifiée — Emma', detail: 'Emma — Lundi 10/03 · Après-midi', heure: 'Il y a 3j', cible: 'parent-absences' },
    { id: 3, lu: false, icone: '✉️', titre: 'Message de Mme Laurent', detail: 'Résultats du contrôle de français', heure: 'Il y a 4j', cible: 'parent-messagerie' },
    { id: 4, lu: false, icone: '📝', titre: 'Nouvelles notes — Emma', detail: '3 évaluations disponibles en 6ème A', heure: 'Il y a 5j', cible: 'parent-notes' },
  ],
  parent2: [
    { id: 1, lu: false, icone: '📝', titre: 'Résultats brevet blanc', detail: 'Sofia — Mathématiques', heure: 'Il y a 1 semaine', cible: 'parent-notes' },
  ],
};

function toggleParentNotifs() {
  const panel = $('notif-panel-parent');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) renderParentNotifs();
}
function renderParentNotifs() {
  const notifs = NOTIFS_PARENT[currentUser?.id] || [];
  const list = $('notif-list-parent');
  if (!list) return;
  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.lu ? 'lu' : ''}" onclick="clickParentNotif(${n.id})" style="cursor:pointer">
      <div class="notif-icone">${n.icone}</div>
      <div class="notif-content">
        <div class="notif-titre">${n.titre}</div>
        <div class="notif-detail">${n.detail}</div>
        <div class="notif-heure">${n.heure}</div>
      </div>
      ${!n.lu ? '<div class="notif-unread-dot"></div>' : ''}
    </div>`).join('') || '<p style="text-align:center;color:#94A3B8;padding:20px;font-size:13px">Aucune notification</p>';
}
function clickParentNotif(id) {
  const n = (NOTIFS_PARENT[currentUser?.id] || []).find(x => x.id === id);
  if (!n) return;
  n.lu = true; renderParentNotifs(); renderParentNotifBadge();
  $('notif-panel-parent')?.classList.add('hidden');
  if (n.cible) { const l = document.querySelector(`#page-parent .nav-item[onclick*="${n.cible}"]`); showParentSection(n.cible, l); }
}
function clearParentNotifs() {
  (NOTIFS_PARENT[currentUser?.id] || []).forEach(n => n.lu = true);
  renderParentNotifs(); renderParentNotifBadge();
}
function renderParentNotifBadge() {
  const count = (NOTIFS_PARENT[currentUser?.id] || []).filter(n => !n.lu).length;
  const badge = $('notif-count-parent'), dot = $('notif-dot-parent');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  if (dot) { dot.style.display = count > 0 ? 'block' : 'none'; }
}
document.addEventListener('click', e => {
  const panel = $('notif-panel-parent');
  const btn = $('notif-btn-parent');
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) panel.classList.add('hidden');
});

/* ══════════════════════════════════════════════════════════════
   NOUVELLES FONCTIONNALITÉS FINALES
   ══════════════════════════════════════════════════════════════ */

/* ─── MODE SOMBRE ─── */
let _darkMode = false;
function toggleDarkMode() {
  _darkMode = !_darkMode;
  document.body.classList.toggle('dark-mode', _darkMode);
  ['btn-dark-eleve', 'btn-dark-parent', 'btn-dark-prof', 'btn-dark-admin'].forEach(id => {
    const btn = $(id); if (!btn) return;
    const icon = btn.querySelector('.dark-icon');
    const lbl = btn.querySelector('.dark-label');
    if (icon) icon.textContent = _darkMode ? '☀️' : '🌙';
    if (lbl) lbl.textContent = _darkMode ? ' Mode clair' : ' Mode sombre';
  });
  showToast(_darkMode ? '🌙 Mode sombre activé' : '☀️ Mode clair activé');
}

/* ─── BADGE NAV PROF DYNAMIQUE ─── */
function updateProfNavBadge() {
  const userId = currentUser?.id; if (!userId) return;
  const recus = (DB.messages[userId] || []).filter(m => !m.lu).length;
  const chats = ((typeof CHATS_CLASSE !== 'undefined' ? CHATS_CLASSE[userId] : null) || []).reduce((s, c) => s + c.messages.filter(m => !m.moi && !m.lu).length, 0)
    + ((typeof CHATS_PROFS !== 'undefined' ? CHATS_PROFS[userId] : null) || []).reduce((s, c) => s + c.messages.filter(m => !m.moi && !m.lu).length, 0);
  const total = recus + chats;
  const badge = $('prof-msg-nav-badge');
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline-flex' : 'none'; }
}

/* ─── SECRÉTAIRE — RESTRICTIONS ─── */
function applySecretaireRestrictions() {
  const allowed = [
    'admin-accueil', 'admin-comptes', 'admin-messagerie', 'admin-faq-messages',
    'admin-historique', 'admin-referents', 'admin-stages', 'admin-projets'
  ];
  document.querySelectorAll('#page-principal .nav-item').forEach(item => {
    const oc = item.getAttribute('onclick') || '';
    item.style.display = allowed.some(a => oc.includes(a)) ? '' : 'none';
  });
  document.querySelectorAll('.secretaire-only').forEach(el => el.style.display = '');
}

/* ─── CPE PLANNING PROFS ─── */
function initCpePlanningProfSelect() {
  const sel = $('cpe-prof-select'); if (!sel) return;
  const profs = Object.values(DB.users).filter(u => u.role === 'professeur');
  sel.innerHTML = '<option value="">— Choisir un professeur —</option>'
    + profs.map(p => `<option value="${p.id}">${p.prenom} ${p.nom} — ${p.matiere}</option>`).join('');
}

function renderCpePlanningProf() {
  const profId = $('cpe-prof-select')?.value;
  const cont = $('cpe-planning-prof-container'); if (!cont) return;
  if (!profId) { cont.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:20px;font-size:13px">Sélectionnez un professeur</p>'; return; }
  const profUser = DB.users[profId]; if (!profUser) return;
  const planning = DB.planningProf[profId] || {};
  const col = getMatiereColor(profUser.matiere || 'Mathématiques');
  cont.innerHTML =
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div style="width:38px;height:38px;border-radius:10px;background:${col.bg};border:2px solid ${col.dot};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:${col.text}">${profUser.prenom[0] + profUser.nom[0]}</div>
      <div><div style="font-weight:700;font-size:14px;color:#0F172A">${profUser.prenom} ${profUser.nom}</div><div style="font-size:12px;color:#64748B">${profUser.matiere}</div></div>
    </div>`
    + _buildProfTimetableHtml(planning, profUser, 'cpe-planning-prof-container');
}


/* ══════════════════════════════════════════════════════════════
   STATISTIQUES DIRECTION — TABLEAU DE BORD ANALYTIQUE
   ══════════════════════════════════════════════════════════════ */

async function renderStatsDirection() {
  const cont = $('stats-direction-container');
  if (!cont) return;

  /* ── Données calculées ── */
  const tousEleves = Object.values(DB.users).filter(u => u.role === 'eleve');
  const tousProfs = Object.values(DB.users).filter(u => u.role === 'professeur');
  const tousParents = Object.values(DB.users).filter(u => u.role === 'parent');
  const totalAbs = Object.values(DB.absences).flat().filter(a => a.type === 'abs').length;
  const totalRetards = Object.values(DB.absences).flat().filter(a => a.type === 'retard').length;
  const nonJust = Object.values(DB.absences).flat().filter(a => a.statut === 'En attente').length;
  const justifiees = Object.values(DB.absences).flat().filter(a => a.statut === 'Justifié').length;
  const tauxJust = totalAbs > 0 ? Math.round(justifiees / totalAbs * 100) : 0;

  /* Moyennes par classe */
  const classeStats = Object.entries(DB.classes).map(([k, c]) => {
    const avgs = c.eleves.map(e => e.avg);
    const avg = avgs.length ? (avgs.reduce((s, v) => s + v, 0) / avgs.length) : 0;
    const min = avgs.length ? Math.min(...avgs) : 0;
    const max = avgs.length ? Math.max(...avgs) : 0;
    const enDifficulte = avgs.filter(a => a < 10).length;
    const enExcellence = avgs.filter(a => a >= 16).length;
    return { nom: c.nom, niveau: c.niveau, avg: parseFloat(avg.toFixed(1)), min: parseFloat(min.toFixed(1)), max: parseFloat(max.toFixed(1)), nb: avgs.length, enDifficulte, enExcellence };
  }).sort((a, b) => {
    const niv = ['6', '5', '4', '3'];
    const na = niv.indexOf(a.niveau), nb2 = niv.indexOf(b.niveau);
    if (na !== nb2) return na - nb2;
    return a.nom.localeCompare(b.nom);
  });

  /* Moyenne générale de l'établissement */
  const allAvgs = classeStats.map(c => c.avg);
  const moyEtab = allAvgs.length ? (allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length).toFixed(1) : '—';

  /* Répartition par niveau */
  const niveaux = ['6', '5', '4', '3'];
  const niveauStats = niveaux.map(niv => {
    const classes = classeStats.filter(c => c.niveau === niv);
    const moyNiv = classes.length ? (classes.reduce((s, c) => s + c.avg, 0) / classes.length).toFixed(1) : '—';
    const nbEleves = classes.reduce((s, c) => s + c.nb, 0);
    return { label: `${niv}ème`, moy: moyNiv, nb: nbEleves, classes: classes.length };
  });

  /* Absences profs */
  const absProfsActives = (typeof ABSENCES_PROFS !== 'undefined') ? ABSENCES_PROFS.filter(a => a.actif).length : 0;

  /* Demandes en attente */
  const demandesAttente = (typeof Demandes !== 'undefined') ? (await Demandes.getAll()).filter(d => d.statut === 'en_attente').length : 0;

  cont.innerHTML = `

  <!-- ── KPIs GLOBAUX ── -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:28px">
    <div class="stat-kpi" style="border-left:4px solid #3B82F6">
      <div class="stat-kpi-value" style="color:#2563EB">${tousEleves.length}</div>
      <div class="stat-kpi-label">👨‍🎓 Élèves</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #10B981">
      <div class="stat-kpi-value" style="color:#10B981">${tousProfs.length}</div>
      <div class="stat-kpi-label">👩‍🏫 Professeurs</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #7C3AED">
      <div class="stat-kpi-value" style="color:#7C3AED">${tousParents.length}</div>
      <div class="stat-kpi-label">👨‍👩‍👧 Parents connectés</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #F59E0B">
      <div class="stat-kpi-value" style="color:#D97706">${moyEtab}</div>
      <div class="stat-kpi-label">📊 Moyenne établissement</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #EF4444">
      <div class="stat-kpi-value" style="color:#EF4444">${totalAbs}</div>
      <div class="stat-kpi-label">📅 Absences élèves</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #F97316">
      <div class="stat-kpi-value" style="color:#EA580C">${totalRetards}</div>
      <div class="stat-kpi-label">⏰ Retards élèves</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #DC2626">
      <div class="stat-kpi-value" style="color:#DC2626">${nonJust}</div>
      <div class="stat-kpi-label">⚠️ Non justifiées</div>
    </div>
    <div class="stat-kpi" style="border-left:4px solid #16A34A">
      <div class="stat-kpi-value" style="color:#16A34A">${tauxJust}%</div>
      <div class="stat-kpi-label">✅ Taux justification</div>
    </div>
  </div>

  <!-- ── DEUX COLONNES : Répartition niveaux + Absences ── -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">

    <!-- Répartition par niveau -->
    <div style="background:#fff;border-radius:14px;border:1.5px solid #E2E8F0;overflow:hidden">
      <div style="padding:14px 20px;background:linear-gradient(135deg,#1E3A8A,#3B82F6);color:#fff">
        <div style="font-weight:700;font-size:14px">📚 Répartition par niveau</div>
        <div style="font-size:11px;opacity:.8;margin-top:2px">${classeStats.reduce((s, c) => s + c.nb, 0)} élèves · ${classeStats.length} classes</div>
      </div>
      <div style="padding:14px 18px;display:flex;flex-direction:column;gap:10px">
        ${niveaux.map(niv => {
    const st = niveauStats.find(n => n.label === niv + 'ème');
    if (!st) return '';
    const pct = ((parseFloat(st.moy) || 0) / 20 * 100).toFixed(0);
    const col = parseFloat(st.moy) >= 14 ? '#16A34A' : parseFloat(st.moy) >= 12 ? '#2563EB' : parseFloat(st.moy) >= 10 ? '#D97706' : '#EF4444';
    return `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <div>
                <span style="font-weight:700;font-size:13px;color:#0F172A">${niv}ème</span>
                <span style="font-size:11px;color:#94A3B8;margin-left:6px">${st.classes} classes · ${st.nb} élèves</span>
              </div>
              <span style="font-size:15px;font-weight:800;color:${col}">${st.moy}</span>
            </div>
            <div style="height:7px;background:#F1F5F9;border-radius:20px;overflow:hidden">
              <div style="height:100%;background:${col};border-radius:20px;width:${pct}%;transition:width 1s ease"></div>
            </div>
          </div>`;
  }).join('')}
      </div>
    </div>

    <!-- Suivi absences -->
    <div style="background:#fff;border-radius:14px;border:1.5px solid #E2E8F0;overflow:hidden">
      <div style="padding:14px 20px;background:linear-gradient(135deg,#7C2D12,#DC2626);color:#fff">
        <div style="font-weight:700;font-size:14px">📅 Suivi des absences</div>
        <div style="font-size:11px;opacity:.8;margin-top:2px">${totalAbs + totalRetards} incidents au total</div>
      </div>
      <div style="padding:16px 18px;display:flex;flex-direction:column;gap:12px">
        <!-- Barre taux de justification -->
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;font-weight:600;color:#64748B">Taux de justification</span>
            <span style="font-size:13px;font-weight:800;color:${tauxJust >= 80 ? '#16A34A' : tauxJust >= 50 ? '#D97706' : '#EF4444'}">${tauxJust}%</span>
          </div>
          <div style="height:10px;background:#F1F5F9;border-radius:20px;overflow:hidden">
            <div style="height:100%;background:${tauxJust >= 80 ? '#16A34A' : tauxJust >= 50 ? '#D97706' : '#EF4444'};border-radius:20px;width:${tauxJust}%;transition:width 1.2s ease"></div>
          </div>
        </div>
        <!-- Détail -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:#FEF2F2;border-radius:10px;padding:12px;text-align:center;border:1px solid #FECACA">
            <div style="font-size:24px;font-weight:800;color:#DC2626">${totalAbs}</div>
            <div style="font-size:11px;color:#DC2626;font-weight:600;margin-top:2px">Absences</div>
          </div>
          <div style="background:#FEF9C3;border-radius:10px;padding:12px;text-align:center;border:1px solid #FDE68A">
            <div style="font-size:24px;font-weight:800;color:#D97706">${totalRetards}</div>
            <div style="font-size:11px;color:#D97706;font-weight:600;margin-top:2px">Retards</div>
          </div>
          <div style="background:#FEE2E2;border-radius:10px;padding:12px;text-align:center;border:1px solid #FECACA">
            <div style="font-size:24px;font-weight:800;color:#EF4444">${nonJust}</div>
            <div style="font-size:11px;color:#EF4444;font-weight:600;margin-top:2px">Non justifiées</div>
          </div>
          <div style="background:#DCFCE7;border-radius:10px;padding:12px;text-align:center;border:1px solid #BBF7D0">
            <div style="font-size:24px;font-weight:800;color:#16A34A">${justifiees}</div>
            <div style="font-size:11px;color:#16A34A;font-weight:600;margin-top:2px">Justifiées</div>
          </div>
        </div>
        <div style="border-top:1px solid #F1F5F9;padding-top:10px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:#64748B">Profs absents aujourd'hui</span>
          <span style="font-size:14px;font-weight:800;color:${absProfsActives > 0 ? '#EF4444' : '#16A34A'}">${absProfsActives}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ── TABLEAU MOYENNES PAR CLASSE ── -->
  <div style="background:#fff;border-radius:14px;border:1.5px solid #E2E8F0;overflow:hidden;margin-bottom:24px">
    <div style="padding:14px 20px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:700;font-size:14px;color:#0F172A">📊 Résultats par classe</div>
        <div style="font-size:11px;color:#94A3B8;margin-top:2px">Moyennes, répartition et taux de réussite</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;font-size:11px;color:#64748B">
        <span><span style="display:inline-block;width:10px;height:10px;background:#16A34A;border-radius:2px;margin-right:4px"></span>≥14</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#2563EB;border-radius:2px;margin-right:4px"></span>≥12</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#D97706;border-radius:2px;margin-right:4px"></span>≥10</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#EF4444;border-radius:2px;margin-right:4px"></span>&lt;10</span>
      </div>
    </div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#F8FAFC">
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #E2E8F0">Classe</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">Effectif</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">Moyenne</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">Min</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">Max</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#EF4444;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">En difficulté<br><span style="font-size:9px">&lt;10</span></th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;color:#16A34A;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">Excellence<br><span style="font-size:9px">≥16</span></th>
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;border-bottom:1px solid #E2E8F0">Répartition</th>
          </tr>
        </thead>
        <tbody>
          ${classeStats.map((c, i) => {
    const col = c.avg >= 14 ? '#16A34A' : c.avg >= 12 ? '#2563EB' : c.avg >= 10 ? '#D97706' : '#EF4444';
    const bg = c.avg >= 14 ? '#DCFCE7' : c.avg >= 12 ? '#DBEAFE' : c.avg >= 10 ? '#FEF3C7' : '#FEE2E2';
    const pct = (c.avg / 20 * 100).toFixed(0);
    const tauxDiff = c.nb ? Math.round(c.enDifficulte / c.nb * 100) : 0;
    const tauxExc = c.nb ? Math.round(c.enExcellence / c.nb * 100) : 0;
    return `
            <tr style="border-top:1px solid #F1F5F9;transition:background .15s" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background=''">
              <td style="padding:10px 16px;font-weight:700;font-size:13px;color:#0F172A">${c.nom}</td>
              <td style="padding:10px 12px;text-align:center;font-size:13px;color:#64748B">${c.nb}</td>
              <td style="padding:10px 12px;text-align:center">
                <span style="background:${bg};color:${col};padding:3px 10px;border-radius:20px;font-size:14px;font-weight:800">${c.avg}</span>
              </td>
              <td style="padding:10px 12px;text-align:center;font-size:12px;color:#94A3B8">${c.min}</td>
              <td style="padding:10px 12px;text-align:center;font-size:12px;color:#94A3B8">${c.max}</td>
              <td style="padding:10px 12px;text-align:center">
                ${c.enDifficulte > 0
        ? `<span style="background:#FEE2E2;color:#DC2626;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:700">${c.enDifficulte} <span style="font-weight:400;font-size:10px">(${tauxDiff}%)</span></span>`
        : `<span style="color:#94A3B8;font-size:12px">—</span>`}
              </td>
              <td style="padding:10px 12px;text-align:center">
                ${c.enExcellence > 0
        ? `<span style="background:#DCFCE7;color:#16A34A;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:700">${c.enExcellence} <span style="font-weight:400;font-size:10px">(${tauxExc}%)</span></span>`
        : `<span style="color:#94A3B8;font-size:12px">—</span>`}
              </td>
              <td style="padding:10px 16px;min-width:140px">
                <div style="height:8px;background:#F1F5F9;border-radius:20px;overflow:hidden;position:relative">
                  <div style="height:100%;background:${col};border-radius:20px;width:${pct}%;transition:width 1.2s ease ${i * 0.04}s"></div>
                </div>
                <div style="font-size:10px;color:${col};font-weight:700;margin-top:3px;text-align:right">${pct}%</div>
              </td>
            </tr>`;
  }).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#F8FAFC;border-top:2px solid #E2E8F0">
            <td style="padding:10px 16px;font-weight:700;font-size:13px;color:#0F172A">TOTAL ÉTABLISSEMENT</td>
            <td style="padding:10px 12px;text-align:center;font-weight:700;font-size:13px;color:#0F172A">${classeStats.reduce((s, c) => s + c.nb, 0)}</td>
            <td style="padding:10px 12px;text-align:center">
              <span style="background:#DBEAFE;color:#1E40AF;padding:3px 10px;border-radius:20px;font-size:14px;font-weight:800">${moyEtab}</span>
            </td>
            <td colspan="2" style="padding:10px 12px;text-align:center;font-size:11px;color:#94A3B8">${Math.min(...classeStats.map(c => c.min)).toFixed(1)} – ${Math.max(...classeStats.map(c => c.max)).toFixed(1)}</td>
            <td style="padding:10px 12px;text-align:center">
              <span style="background:#FEE2E2;color:#DC2626;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:700">${classeStats.reduce((s, c) => s + c.enDifficulte, 0)}</span>
            </td>
            <td style="padding:10px 12px;text-align:center">
              <span style="background:#DCFCE7;color:#16A34A;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:700">${classeStats.reduce((s, c) => s + c.enExcellence, 0)}</span>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <!-- ── ALERTES ET SIGNAUX FAIBLES ── -->
  <div style="background:#fff;border-radius:14px;border:1.5px solid #E2E8F0;padding:18px 20px">
    <div style="font-weight:700;font-size:14px;color:#0F172A;margin-bottom:14px">🚨 Alertes et signaux</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
      ${classeStats.filter(c => c.enDifficulte / c.nb > 0.2).map(c => `
        <div style="background:#FEF2F2;border-radius:10px;padding:12px 14px;border-left:4px solid #EF4444;display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">⚠️</span>
          <div><div style="font-weight:700;font-size:13px;color:#0F172A">${c.nom}</div>
          <div style="font-size:11px;color:#64748B">${c.enDifficulte} élèves en difficulté (${Math.round(c.enDifficulte / c.nb * 100)}% de la classe)</div></div>
        </div>`).join('') || ''}
      ${classeStats.filter(c => c.enExcellence / c.nb > 0.3).map(c => `
        <div style="background:#F0FDF4;border-radius:10px;padding:12px 14px;border-left:4px solid #16A34A;display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">🌟</span>
          <div><div style="font-weight:700;font-size:13px;color:#0F172A">${c.nom}</div>
          <div style="font-size:11px;color:#64748B">${c.enExcellence} élèves en excellence (${Math.round(c.enExcellence / c.nb * 100)}%)</div></div>
        </div>`).join('') || ''}
      ${demandesAttente > 0 ? `
        <div style="background:#FEF9C3;border-radius:10px;padding:12px 14px;border-left:4px solid #D97706;display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">📋</span>
          <div><div style="font-weight:700;font-size:13px;color:#0F172A">${demandesAttente} demande${demandesAttente > 1 ? 's' : ''} de compte</div>
          <div style="font-size:11px;color:#64748B">En attente de validation</div></div>
        </div>` : ''}
      ${nonJust > 0 ? `
        <div style="background:#FEF2F2;border-radius:10px;padding:12px 14px;border-left:4px solid #DC2626;display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">📅</span>
          <div><div style="font-weight:700;font-size:13px;color:#0F172A">${nonJust} absence${nonJust > 1 ? 's' : ''} non justifiée${nonJust > 1 ? 's' : ''}</div>
          <div style="font-size:11px;color:#64748B">À traiter avec le CPE</div></div>
        </div>` : ''}
    </div>
    ${(!classeStats.filter(c => c.enDifficulte / c.nb > 0.2).length && !demandesAttente && !nonJust)
      ? '<p style="text-align:center;color:#94A3B8;font-size:13px;padding:10px">✅ Aucune alerte en cours</p>' : ''}
  </div>`;

  // Animation des barres
  setTimeout(() => {
    cont.querySelectorAll('div[style*="transition:width"]').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => { bar.style.width = w; });
    });
  }, 50);
}



/* ══════════════════════════════════════════════════════════════
   SECRÉTARIAT — MODULE COMPLET (Cahier des charges A.4)
   ══════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────
   1. HISTORIQUE SCOLAIRE — Moyennes par semestre
   ──────────────────────────────────────────────────────────── */

/* Stockage local (en attendant les routes API) */
const HISTORIQUE_SCOLAIRE = {
  /* Exemple : { eleveId: [ { id, semestre, annee, moyenne, matieres:[], statut:'brouillon'|'valide', validePar, dateValidation } ] } */
};

const MATIERES_LISTE = [
  'Mathématiques','Français','Histoire-Géo','SVT','Anglais',
  'Physique-Chimie','Espagnol LV2','EPS','Arts Plastiques','Musique','Technologie','Latin'
];

function getAnneeCourante() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return m >= 9 ? `${y}-${y+1}` : `${y-1}-${y}`;
}

/* ─── INIT SECTION HISTORIQUE ─── */
function initSecretariatHistorique() {
  const sel = $('hist-eleve-select');
  if (!sel) return;
  const eleves = Auth.getAll().filter(u => u.role === 'eleve').sort((a,b) => a.nom.localeCompare(b.nom,'fr'));
  sel.innerHTML = '<option value="">— Choisir un élève —</option>' +
    eleves.map(e => `<option value="${e.id}">${e.nom} ${e.prenom} — ${e.classe || '?'}</option>`).join('');
  renderHistoriqueEleve();
}

function renderHistoriqueEleve() {
  const eleveId = $('hist-eleve-select')?.value;
  const container = $('hist-semestres-list');
  if (!container) return;
  if (!eleveId) {
    container.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:40px;font-size:13px">Sélectionnez un élève pour voir son historique scolaire.</p>';
    return;
  }
  const semestres = HISTORIQUE_SCOLAIRE[eleveId] || [];
  const eleve = Auth.getAll().find(u => u.id === eleveId);
  const anneeCourante = getAnneeCourante();

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div>
      <div style="font-size:15px;font-weight:700;color:#0F172A">${eleve ? eleve.prenom + ' ' + eleve.nom : eleveId}</div>
      <div style="font-size:12px;color:#64748B">${eleve?.classe || '—'} · Année ${anneeCourante}</div>
    </div>
    <button onclick="ouvrirSaisieMoyenne('${eleveId}')"
      style="background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px">
      + Saisir une moyenne
    </button>
  </div>`;

  if (!semestres.length) {
    html += '<div style="background:#F8FAFC;border-radius:12px;border:2px dashed #E2E8F0;padding:40px;text-align:center;color:#94A3B8;font-size:13px">Aucune moyenne saisie pour cet élève.</div>';
  } else {
    // Grouper par année scolaire
    const parAnnee = {};
    semestres.forEach(s => {
      if (!parAnnee[s.annee]) parAnnee[s.annee] = [];
      parAnnee[s.annee].push(s);
    });
    Object.keys(parAnnee).sort().reverse().forEach(annee => {
      html += `<div style="margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">📅 Année ${annee}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">`;
      parAnnee[annee].forEach(s => {
        const isValide = s.statut === 'valide';
        const canEdit = s.statut === 'brouillon' && currentUser?.role === 'secretaire';
        const canValider = s.statut === 'brouillon' && currentUser?.role === 'principal';
        html += `
          <div style="background:#fff;border-radius:12px;border:1.5px solid ${isValide ? '#BBF7D0' : '#E2E8F0'};padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.04)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div>
                <div style="font-weight:700;font-size:14px;color:#0F172A">Semestre ${s.semestre}</div>
                <div style="font-size:11px;color:#64748B;margin-top:2px">${s.saisieDate || '—'}</div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:22px;font-weight:800;color:${isValide ? '#16A34A' : '#2563EB'}">${s.moyenne}<span style="font-size:11px;font-weight:400;color:#94A3B8">/20</span></span>
              </div>
            </div>
            ${s.matieres && s.matieres.length ? `
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
              ${s.matieres.map(m => {
                const col = getMatiereColor(m.nom);
                return `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:${col.bg};border-radius:6px">
                  <span style="font-size:11px;font-weight:600;color:${col.text};flex:1">${m.nom}</span>
                  <span style="font-size:13px;font-weight:700;color:${col.text}">${m.note}/20</span>
                </div>`;
              }).join('')}
            </div>` : ''}
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
              <span style="background:${isValide ? '#DCFCE7' : '#FEF3C7'};color:${isValide ? '#15803D' : '#92400E'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">
                ${isValide ? '✅ Validé par ' + (s.validePar || 'le proviseur') : '⏳ En attente de validation'}
              </span>
              ${canEdit ? `<button onclick="ouvrirSaisieMoyenne('${eleveId}','${s.id}')" style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;border-radius:7px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif">✏️ Modifier</button>` : ''}
              ${canValider ? `<button onclick="validerMoyenne('${eleveId}','${s.id}')" style="background:#DCFCE7;color:#15803D;border:1px solid #BBF7D0;border-radius:7px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif">✅ Valider</button>` : ''}
            </div>
          </div>`;
      });
      html += '</div></div>';
    });
  }
  container.innerHTML = html;
}

function ouvrirSaisieMoyenne(eleveId, editId) {
  const eleve = Auth.getAll().find(u => u.id === eleveId);
  const existing = document.getElementById('modal-saisie-moyenne');
  if (existing) existing.remove();
  const semestresExistants = HISTORIQUE_SCOLAIRE[eleveId] || [];
  const editData = editId ? semestresExistants.find(s => s.id === editId) : null;
  const anneeCourante = getAnneeCourante();

  const modal = document.createElement('div');
  modal.id = 'modal-saisie-moyenne';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(600px,96vw);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3);overflow:hidden">
      <div style="padding:18px 24px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;background:#1E3A8A;color:#fff">
        <div>
          <div style="font-weight:700;font-size:15px">${editId ? '✏️ Modifier la moyenne' : '+ Saisir une moyenne'}</div>
          <div style="font-size:12px;opacity:.8">${eleve ? eleve.prenom + ' ' + eleve.nom : eleveId}</div>
        </div>
        <button onclick="document.getElementById('modal-saisie-moyenne').remove()" style="background:rgba(255,255,255,.15);border:none;border-radius:8px;width:30px;height:30px;color:#fff;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Semestre</label>
            <select id="sm-semestre" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px" ${editId && !editData?.statut !== 'valide' ? '' : ''}>
              <option value="1" ${editData?.semestre === 1 ? 'selected' : ''}>Semestre 1</option>
              <option value="2" ${editData?.semestre === 2 ? 'selected' : ''}>Semestre 2</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Année scolaire</label>
            <input type="text" id="sm-annee" value="${editData?.annee || anneeCourante}"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px" placeholder="ex: 2025-2026"/>
          </div>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Moyenne générale /20</label>
          <input type="number" id="sm-moyenne" min="0" max="20" step="0.01" value="${editData?.moyenne || ''}"
            style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px" placeholder="ex: 13.5"/>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:8px">Notes par matière <span style="font-weight:400;color:#94A3B8">(optionnel)</span></label>
          <div id="sm-matieres-list" style="display:flex;flex-direction:column;gap:6px">
            ${MATIERES_LISTE.map(m => {
              const existing = editData?.matieres?.find(x => x.nom === m);
              return `<div style="display:flex;align-items:center;gap:10px;padding:7px 10px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0">
                <span style="font-size:12px;font-weight:600;color:#374151;flex:1">${m}</span>
                <input type="number" min="0" max="20" step="0.01" value="${existing ? existing.note : ''}"
                  data-matiere="${m}" class="sm-note-input"
                  style="width:80px;padding:5px 8px;border:1.5px solid #E2E8F0;border-radius:6px;font-family:'Sora',sans-serif;font-size:13px;text-align:center"
                  placeholder="—"/>
                <span style="font-size:11px;color:#94A3B8">/20</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end;gap:8px">
        <button onclick="document.getElementById('modal-saisie-moyenne').remove()" style="padding:9px 18px;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;font-family:'Sora',sans-serif">Annuler</button>
        <button onclick="sauvegarderMoyenne('${eleveId}','${editId || ''}')" style="padding:9px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600">💾 Enregistrer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function sauvegarderMoyenne(eleveId, editId) {
  const semestre = parseInt($('sm-semestre')?.value) || 1;
  const annee = $('sm-annee')?.value.trim();
  const moyenneVal = parseFloat($('sm-moyenne')?.value);
  if (isNaN(moyenneVal) || moyenneVal < 0 || moyenneVal > 20) {
    showToast('⚠️ La moyenne doit être entre 0 et 20'); return;
  }
  if (!annee) { showToast('⚠️ Indiquez l\'année scolaire'); return; }

  // Récupérer les notes par matière
  const matieres = [];
  document.querySelectorAll('.sm-note-input').forEach(inp => {
    const val = parseFloat(inp.value);
    if (!isNaN(val)) matieres.push({ nom: inp.getAttribute('data-matiere'), note: val });
  });

  if (!HISTORIQUE_SCOLAIRE[eleveId]) HISTORIQUE_SCOLAIRE[eleveId] = [];
  const saisieDate = new Date().toLocaleDateString('fr-FR');
  if (editId) {
    const idx = HISTORIQUE_SCOLAIRE[eleveId].findIndex(s => s.id === editId);
    if (idx !== -1) {
      HISTORIQUE_SCOLAIRE[eleveId][idx] = {
        ...HISTORIQUE_SCOLAIRE[eleveId][idx],
        semestre, annee, moyenne: moyenneVal, matieres, saisieDate,
        statut: 'brouillon', // retour en brouillon après modification
      };
      showToast('✅ Moyenne modifiée — En attente de validation du proviseur');
    }
  } else {
    // Vérifier pas de doublon semestre/année
    const doublon = HISTORIQUE_SCOLAIRE[eleveId].find(s => s.semestre === semestre && s.annee === annee);
    if (doublon) { showToast('⚠️ Une moyenne existe déjà pour ce semestre/année'); return; }
    HISTORIQUE_SCOLAIRE[eleveId].unshift({
      id: `hist-${eleveId}-${Date.now()}`,
      semestre, annee, moyenne: moyenneVal, matieres, saisieDate,
      statut: 'brouillon', saisieParId: currentUser?.id,
    });
    showToast('✅ Moyenne enregistrée — En attente de validation du proviseur');
  }
  document.getElementById('modal-saisie-moyenne')?.remove();
  renderHistoriqueEleve();
}

function validerMoyenne(eleveId, histId) {
  const sem = (HISTORIQUE_SCOLAIRE[eleveId] || []).find(s => s.id === histId);
  if (!sem) return;
  if (currentUser?.role !== 'principal') { showToast('⛔ Seul le proviseur peut valider une moyenne'); return; }
  sem.statut = 'valide';
  sem.validePar = `${currentUser.prenom} ${currentUser.nom}`;
  sem.dateValidation = new Date().toLocaleDateString('fr-FR');
  renderHistoriqueEleve();
  showToast('✅ Moyenne validée et verrouillée');
}

/* ────────────────────────────────────────────────────────────
   2. PROFESSEURS RÉFÉRENTS
   ──────────────────────────────────────────────────────────── */

/* Structure : { eleveId: profId } */
const REFERENTS_MAP = {};

function initSecretariatReferents() {
  renderReferentsTable();
}

function renderReferentsTable() {
  const container = $('referents-table-body');
  if (!container) return;
  const eleves = Auth.getAll().filter(u => u.role === 'eleve').sort((a,b) => {
    if (a.classe !== b.classe) return (a.classe || '').localeCompare(b.classe || '');
    return a.nom.localeCompare(b.nom, 'fr');
  });
  const profs = Auth.getAll().filter(u => u.role === 'professeur');

  if (!eleves.length) {
    container.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94A3B8;padding:30px;font-size:13px">Aucun élève trouvé</td></tr>';
    return;
  }

  container.innerHTML = eleves.map(e => {
    const refId = REFERENTS_MAP[e.id];
    const ref = refId ? profs.find(p => p.id === refId) : null;
    return `<tr style="border-bottom:1px solid #F1F5F9">
      <td style="padding:10px 14px">
        <div style="font-weight:600;font-size:13px;color:#0F172A">${e.prenom} ${e.nom}</div>
        <div style="font-size:11px;color:#64748B">${e.classe || '—'}</div>
      </td>
      <td style="padding:10px 14px;font-size:12px;color:#64748B">${e.id}</td>
      <td style="padding:10px 14px">
        ${ref ? `<div style="display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:8px;background:#EFF6FF;border:1.5px solid #BFDBFE;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#2563EB">${ref.prenom[0]}${ref.nom[0]}</div>
          <div><div style="font-size:12px;font-weight:600;color:#0F172A">${ref.prenom} ${ref.nom}</div><div style="font-size:10px;color:#64748B">${ref.matiere || ''}</div></div>
        </div>`
        : '<span style="color:#94A3B8;font-size:12px;font-style:italic">Non affecté</span>'}
      </td>
      <td style="padding:10px 14px">
        <select onchange="affecterReferent('${e.id}', this.value)"
          style="padding:5px 8px;border:1.5px solid #E2E8F0;border-radius:7px;font-family:'Sora',sans-serif;font-size:12px;background:#fff;cursor:pointer">
          <option value="">— Choisir —</option>
          ${profs.map(p => `<option value="${p.id}" ${refId === p.id ? 'selected' : ''}>${p.prenom} ${p.nom} (${p.matiere || '?'})</option>`).join('')}
        </select>
      </td>
    </tr>`;
  }).join('');
}

function affecterReferent(eleveId, profId) {
  if (profId) {
    REFERENTS_MAP[eleveId] = profId;
    const prof = Auth.getAll().find(p => p.id === profId);
    showToast(`✅ Référent affecté : ${prof?.prenom} ${prof?.nom}`);
  } else {
    delete REFERENTS_MAP[eleveId];
  }
  renderReferentsTable();
}

function affecterRoundRobin() {
  const eleves = Auth.getAll().filter(u => u.role === 'eleve');
  const profs = Auth.getAll().filter(u => u.role === 'professeur');
  if (!profs.length) { showToast('⚠️ Aucun professeur disponible'); return; }
  let idx = 0;
  eleves.forEach(e => {
    if (!REFERENTS_MAP[e.id]) {
      REFERENTS_MAP[e.id] = profs[idx % profs.length].id;
      idx++;
    }
  });
  renderReferentsTable();
  showToast(`✅ Round-robin effectué — ${idx} élèves affectés`);
}

/* Afficher le référent côté élève/prof */
function getReferentDeEleve(eleveId) {
  const profId = REFERENTS_MAP[eleveId];
  if (!profId) return null;
  return Auth.getAll().find(u => u.id === profId) || null;
}
function getElevesReferentPour(profId) {
  return Auth.getAll().filter(u => u.role === 'eleve' && REFERENTS_MAP[u.id] === profId);
}

/* ────────────────────────────────────────────────────────────
   3. STAGES ÉLÈVES
   ──────────────────────────────────────────────────────────── */

const STAGES_DATA = {};
/* Structure stage : { id, eleveId, statut:'recherche'|'convention'|'attestation',
    entreprise, contactNom, contactEmail, contactTel,
    lettresEnvoyees, lettresRecues, entretiens:[{date,resultat}],
    convention:{ dateDebut, dateFin, signe:bool }, attestation:{ recu:bool, dateSig } } */

function initSecretariatStages() {
  const sel = $('stages-eleve-select');
  if (!sel) return;
  const eleves = Auth.getAll().filter(u => u.role === 'eleve').sort((a,b) => a.nom.localeCompare(b.nom,'fr'));
  sel.innerHTML = '<option value="">— Choisir un élève —</option>' +
    eleves.map(e => `<option value="${e.id}">${e.nom} ${e.prenom} — ${e.classe || '?'}</option>`).join('');
  renderStagesEleve();
}

function renderStagesEleve() {
  const eleveId = $('stages-eleve-select')?.value;
  const container = $('stages-list');
  if (!container) return;
  if (!eleveId) {
    container.innerHTML = '<p style="color:#94A3B8;text-align:center;padding:40px;font-size:13px">Sélectionnez un élève pour voir ses stages.</p>';
    return;
  }
  const stages = STAGES_DATA[eleveId] || [];
  const eleve = Auth.getAll().find(u => u.id === eleveId);
  const statusLabels = { recherche:'🔍 En recherche', convention:'📝 Convention', attestation:'🎓 Terminé' };
  const statusColors = { recherche:'#FEF3C7,#D97706', convention:'#DBEAFE,#2563EB', attestation:'#DCFCE7,#16A34A' };

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div style="font-size:14px;font-weight:700;color:#0F172A">${eleve ? eleve.prenom + ' ' + eleve.nom : eleveId} — Suivi des stages</div>
    <button onclick="ouvrirModalStage('${eleveId}',null)"
      style="background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;cursor:pointer">
      + Nouveau stage
    </button>
  </div>`;

  if (!stages.length) {
    html += '<div style="background:#F8FAFC;border-radius:12px;border:2px dashed #E2E8F0;padding:40px;text-align:center;color:#94A3B8;font-size:13px">Aucun stage enregistré.</div>';
  } else {
    html += stages.map(s => {
      const [sbg, scol] = (statusColors[s.statut] || '#F1F5F9,#64748B').split(',');
      return `<div style="background:#fff;border-radius:12px;border:1.5px solid #E2E8F0;padding:18px 20px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.04)">
        <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-weight:700;font-size:14px;color:#0F172A">${s.entreprise || 'Entreprise non renseignée'}</span>
              <span style="background:${sbg};color:${scol};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${statusLabels[s.statut] || s.statut}</span>
            </div>
            ${s.contactNom ? `<div style="font-size:12px;color:#64748B">👤 ${s.contactNom}${s.contactEmail ? ' · ' + s.contactEmail : ''}${s.contactTel ? ' · ' + s.contactTel : ''}</div>` : ''}
            <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap">
              <span style="font-size:12px;color:#64748B">📤 ${s.lettresEnvoyees || 0} lettres envoyées</span>
              <span style="font-size:12px;color:#64748B">📥 ${s.lettresRecues || 0} réponses</span>
              ${s.entretiens?.length ? `<span style="font-size:12px;color:#64748B">🤝 ${s.entretiens.length} entretien(s)</span>` : ''}
            </div>
            ${s.convention?.dateDebut ? `<div style="margin-top:6px;font-size:12px;color:#2563EB;font-weight:600">📋 Convention : ${s.convention.dateDebut} → ${s.convention.dateFin || '?'} ${s.convention.signe ? '✅ Signée' : '⏳ Non signée'}</div>` : ''}
            ${s.attestation?.recu ? `<div style="margin-top:4px;font-size:12px;color:#16A34A;font-weight:600">🎓 Attestation reçue — ${s.attestation.dateSig || '?'}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button onclick="ouvrirModalStage('${eleveId}','${s.id}')"
              style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif">✏️ Modifier</button>
            <button onclick="supprimerStage('${eleveId}','${s.id}')"
              style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:7px;padding:6px 10px;font-size:11px;cursor:pointer">🗑</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  container.innerHTML = html;
}

function ouvrirModalStage(eleveId, stageId) {
  const stages = STAGES_DATA[eleveId] || [];
  const s = stageId ? stages.find(x => x.id === stageId) : null;
  const existing = document.getElementById('modal-stage');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'modal-stage';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(580px,96vw);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3);overflow:hidden">
      <div style="padding:18px 24px;border-bottom:1px solid #E2E8F0;background:#1E3A8A;color:#fff;display:flex;align-items:center;justify-content:space-between">
        <div style="font-weight:700;font-size:15px">${stageId ? '✏️ Modifier le stage' : '+ Nouveau stage'}</div>
        <button onclick="document.getElementById('modal-stage').remove()" style="background:rgba(255,255,255,.15);border:none;border-radius:8px;width:30px;height:30px;color:#fff;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Entreprise</label>
            <input type="text" id="stg-entreprise" value="${s?.entreprise || ''}" placeholder="Nom de l'entreprise"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Statut</label>
            <select id="stg-statut" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px">
              <option value="recherche" ${s?.statut === 'recherche' ? 'selected' : ''}>🔍 En recherche</option>
              <option value="convention" ${s?.statut === 'convention' ? 'selected' : ''}>📝 Convention</option>
              <option value="attestation" ${s?.statut === 'attestation' ? 'selected' : ''}>🎓 Terminé</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Contact (nom)</label>
            <input type="text" id="stg-contact-nom" value="${s?.contactNom || ''}" placeholder="Prénom Nom"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Contact (email)</label>
            <input type="email" id="stg-contact-email" value="${s?.contactEmail || ''}" placeholder="email@entreprise.fr"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Téléphone</label>
            <input type="text" id="stg-contact-tel" value="${s?.contactTel || ''}"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Lettres envoyées</label>
            <input type="number" id="stg-lettres-env" min="0" value="${s?.lettresEnvoyees || 0}"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Réponses reçues</label>
            <input type="number" id="stg-lettres-rec" min="0" value="${s?.lettresRecues || 0}"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Date début stage</label>
            <input type="date" id="stg-date-debut" value="${s?.convention?.dateDebut || ''}"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Date fin stage</label>
            <input type="date" id="stg-date-fin" value="${s?.convention?.dateFin || ''}"
              style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;font-weight:600;color:#374151">
            <input type="checkbox" id="stg-convention-signe" ${s?.convention?.signe ? 'checked' : ''}> Convention signée
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;font-weight:600;color:#374151">
            <input type="checkbox" id="stg-attestation" ${s?.attestation?.recu ? 'checked' : ''}> Attestation reçue
          </label>
        </div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end;gap:8px">
        <button onclick="document.getElementById('modal-stage').remove()" style="padding:9px 18px;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;font-family:'Sora',sans-serif">Annuler</button>
        <button onclick="sauvegarderStage('${eleveId}','${stageId || ''}')" style="padding:9px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600">💾 Enregistrer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function sauvegarderStage(eleveId, stageId) {
  const entreprise = $('stg-entreprise')?.value.trim();
  if (!entreprise) { showToast('⚠️ Renseignez le nom de l\'entreprise'); return; }
  if (!STAGES_DATA[eleveId]) STAGES_DATA[eleveId] = [];
  const data = {
    entreprise, statut: $('stg-statut')?.value || 'recherche',
    contactNom: $('stg-contact-nom')?.value.trim(),
    contactEmail: $('stg-contact-email')?.value.trim(),
    contactTel: $('stg-contact-tel')?.value.trim(),
    lettresEnvoyees: parseInt($('stg-lettres-env')?.value) || 0,
    lettresRecues: parseInt($('stg-lettres-rec')?.value) || 0,
    convention: {
      dateDebut: $('stg-date-debut')?.value,
      dateFin: $('stg-date-fin')?.value,
      signe: $('stg-convention-signe')?.checked || false,
    },
    attestation: { recu: $('stg-attestation')?.checked || false, dateSig: new Date().toLocaleDateString('fr-FR') },
  };
  if (stageId) {
    const idx = STAGES_DATA[eleveId].findIndex(s => s.id === stageId);
    if (idx !== -1) STAGES_DATA[eleveId][idx] = { ...STAGES_DATA[eleveId][idx], ...data };
  } else {
    STAGES_DATA[eleveId].unshift({ id: `stg-${Date.now()}`, eleveId, ...data });
  }
  document.getElementById('modal-stage')?.remove();
  renderStagesEleve();
  showToast('✅ Stage enregistré');
}

function supprimerStage(eleveId, stageId) {
  if (!confirm('Supprimer ce stage ?')) return;
  STAGES_DATA[eleveId] = (STAGES_DATA[eleveId] || []).filter(s => s.id !== stageId);
  renderStagesEleve();
  showToast('🗑 Stage supprimé');
}

/* ────────────────────────────────────────────────────────────
   4. PROJETS ÉTABLISSEMENT
   ──────────────────────────────────────────────────────────── */

const PROJETS_ETAB = [];
/* Structure : { id, titre, description, responsableId, statut:'proposition'|'valide'|'en_cours'|'termine',
    dateCreation, participants:[{eleveId,dateDebut,dateFin}] } */

function initSecretariatProjets() {
  renderProjetsListe();
}

function renderProjetsListe() {
  const container = $('projets-liste');
  if (!container) return;
  const statusLabels = { proposition:'💡 Proposition', valide:'✅ Validé', en_cours:'⚡ En cours', termine:'🏁 Terminé' };
  const statusColors = {
    proposition:'#FEF3C7,#D97706', valide:'#DBEAFE,#2563EB',
    en_cours:'#DCFCE7,#15803D', termine:'#F1F5F9,#64748B'
  };

  if (!PROJETS_ETAB.length) {
    container.innerHTML = '<div style="background:#F8FAFC;border-radius:12px;border:2px dashed #E2E8F0;padding:40px;text-align:center;color:#94A3B8;font-size:13px">Aucun projet enregistré. Créez le premier projet !</div>';
    return;
  }

  container.innerHTML = PROJETS_ETAB.map(p => {
    const [pbg, pcol] = (statusColors[p.statut] || '#F1F5F9,#64748B').split(',');
    const resp = Auth.getAll().find(u => u.id === p.responsableId);
    const nbPart = p.participants?.length || 0;
    const canValider = currentUser?.role === 'principal' && p.statut === 'proposition';
    return `<div style="background:#fff;border-radius:12px;border:1.5px solid #E2E8F0;padding:18px 20px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.04)">
      <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-weight:700;font-size:14px;color:#0F172A">${p.titre}</span>
            <span style="background:${pbg};color:${pcol};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${statusLabels[p.statut] || p.statut}</span>
          </div>
          ${p.description ? `<div style="font-size:12px;color:#64748B;margin-bottom:6px">${p.description}</div>` : ''}
          <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#64748B">
            ${resp ? `<span>👤 Responsable : <strong>${resp.prenom} ${resp.nom}</strong></span>` : ''}
            <span>👥 ${nbPart} participant${nbPart > 1 ? 's' : ''}</span>
            <span>📅 ${p.dateCreation || '—'}</span>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap">
          ${canValider ? `<button onclick="validerProjet('${p.id}')" style="background:#DCFCE7;color:#15803D;border:1px solid #BBF7D0;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif">✅ Valider</button>` : ''}
          <button onclick="ouvrirParticipants('${p.id}')" style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif">👥 Participants</button>
          <button onclick="supprimerProjet('${p.id}')" style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:7px;padding:6px 10px;font-size:11px;cursor:pointer">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function ouvrirModalProjet() {
  const existing = document.getElementById('modal-projet');
  if (existing) existing.remove();
  const profs = Auth.getAll().filter(u => u.role === 'professeur');
  const modal = document.createElement('div');
  modal.id = 'modal-projet';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(520px,96vw);box-shadow:0 24px 64px rgba(0,0,0,.3);overflow:hidden">
      <div style="padding:18px 24px;border-bottom:1px solid #E2E8F0;background:#1E3A8A;color:#fff;display:flex;align-items:center;justify-content:space-between">
        <div style="font-weight:700;font-size:15px">+ Nouveau projet</div>
        <button onclick="document.getElementById('modal-projet').remove()" style="background:rgba(255,255,255,.15);border:none;border-radius:8px;width:30px;height:30px;color:#fff;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Titre du projet</label>
          <input type="text" id="prj-titre" placeholder="Nom du projet"
            style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px"/>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Description</label>
          <textarea id="prj-desc" rows="3" placeholder="Objectifs et contenu..."
            style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px;resize:none"></textarea>
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:#64748B;display:block;margin-bottom:5px">Responsable (prof référent)</label>
          <select id="prj-resp" style="width:100%;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:8px;font-family:'Sora',sans-serif;font-size:13px">
            <option value="">— Aucun —</option>
            ${profs.map(p => `<option value="${p.id}">${p.prenom} ${p.nom}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end;gap:8px">
        <button onclick="document.getElementById('modal-projet').remove()" style="padding:9px 18px;border-radius:8px;border:1.5px solid #E2E8F0;background:#fff;color:#64748B;cursor:pointer;font-family:'Sora',sans-serif">Annuler</button>
        <button onclick="sauvegarderProjet()" style="padding:9px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600">💾 Créer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function sauvegarderProjet() {
  const titre = $('prj-titre')?.value.trim();
  if (!titre) { showToast('⚠️ Renseignez le titre du projet'); return; }
  PROJETS_ETAB.unshift({
    id: `prj-${Date.now()}`, titre,
    description: $('prj-desc')?.value.trim(),
    responsableId: $('prj-resp')?.value || null,
    statut: 'proposition',
    dateCreation: new Date().toLocaleDateString('fr-FR'),
    participants: [],
  });
  document.getElementById('modal-projet')?.remove();
  renderProjetsListe();
  showToast('💡 Projet soumis — En attente de validation par le proviseur');
}

function validerProjet(projetId) {
  if (currentUser?.role !== 'principal') { showToast('⛔ Seul le proviseur peut valider un projet'); return; }
  const p = PROJETS_ETAB.find(x => x.id === projetId);
  if (p) { p.statut = 'en_cours'; renderProjetsListe(); showToast('✅ Projet validé et lancé'); }
}

function supprimerProjet(projetId) {
  if (!confirm('Supprimer ce projet ?')) return;
  const idx = PROJETS_ETAB.findIndex(p => p.id === projetId);
  if (idx !== -1) { PROJETS_ETAB.splice(idx, 1); renderProjetsListe(); showToast('🗑 Projet supprimé'); }
}

function ouvrirParticipants(projetId) {
  const p = PROJETS_ETAB.find(x => x.id === projetId);
  if (!p) return;
  const existing = document.getElementById('modal-participants');
  if (existing) existing.remove();
  const eleves = Auth.getAll().filter(u => u.role === 'eleve').sort((a,b) => a.nom.localeCompare(b.nom,'fr'));
  const modal = document.createElement('div');
  modal.id = 'modal-participants';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:min(560px,96vw);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.3);overflow:hidden">
      <div style="padding:18px 24px;border-bottom:1px solid #E2E8F0;background:#1E3A8A;color:#fff;display:flex;align-items:center;justify-content:space-between">
        <div><div style="font-weight:700;font-size:15px">👥 Participants — ${p.titre}</div></div>
        <button onclick="document.getElementById('modal-participants').remove()" style="background:rgba(255,255,255,.15);border:none;border-radius:8px;width:30px;height:30px;color:#fff;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="overflow-y:auto;padding:16px 20px;flex:1">
        <div style="display:flex;flex-direction:column;gap:6px">
          ${eleves.map(e => {
            const part = p.participants.find(x => x.eleveId === e.id);
            return `<div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:${part ? '#F0FDF4' : '#F8FAFC'};border-radius:9px;border:1px solid ${part ? '#BBF7D0' : '#E2E8F0'}">
              <input type="checkbox" id="part-${e.id}" ${part ? 'checked' : ''} onchange="toggleParticipant('${projetId}','${e.id}',this.checked)" style="width:16px;height:16px;cursor:pointer"/>
              <div style="flex:1"><div style="font-size:13px;font-weight:600;color:#0F172A">${e.prenom} ${e.nom}</div><div style="font-size:11px;color:#64748B">${e.classe || '—'}</div></div>
              ${part ? `<div style="display:flex;gap:8px;align-items:center">
                <input type="date" value="${part.dateDebut || ''}" onchange="setPartDate('${projetId}','${e.id}','debut',this.value)"
                  style="padding:4px 7px;border:1px solid #BBF7D0;border-radius:6px;font-size:11px;font-family:'Sora',sans-serif" placeholder="Début"/>
                <span style="font-size:10px;color:#94A3B8">→</span>
                <input type="date" value="${part.dateFin || ''}" onchange="setPartDate('${projetId}','${e.id}','fin',this.value)"
                  style="padding:4px 7px;border:1px solid #BBF7D0;border-radius:6px;font-size:11px;font-family:'Sora',sans-serif" placeholder="Fin"/>
              </div>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="padding:14px 20px;border-top:1px solid #E2E8F0;display:flex;justify-content:flex-end">
        <button onclick="document.getElementById('modal-participants').remove();renderProjetsListe()" style="padding:9px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600">✅ Fermer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function toggleParticipant(projetId, eleveId, checked) {
  const p = PROJETS_ETAB.find(x => x.id === projetId);
  if (!p) return;
  if (checked) {
    if (!p.participants.find(x => x.eleveId === eleveId))
      p.participants.push({ eleveId, dateDebut: '', dateFin: '' });
  } else {
    p.participants = p.participants.filter(x => x.eleveId !== eleveId);
  }
  // Re-render la ligne
  const row = document.getElementById('part-' + eleveId)?.closest('div[style]');
  if (row) ouvrirParticipants(projetId); // simplement rouvrir la modal à jour
}

function setPartDate(projetId, eleveId, type, val) {
  const p = PROJETS_ETAB.find(x => x.id === projetId);
  const part = p?.participants.find(x => x.eleveId === eleveId);
  if (part) part[type === 'debut' ? 'dateDebut' : 'dateFin'] = val;
}

/* ────────────────────────────────────────────────────────────
   NAVIGATION SECRÉTARIAT — init des sous-sections
   ──────────────────────────────────────────────────────────── */
function showAdminSectionWithInit(id, linkEl) {
  showAdminSection(id, linkEl);
  if (id === 'admin-historique') initSecretariatHistorique();
  if (id === 'admin-referents') initSecretariatReferents();
  if (id === 'admin-stages') initSecretariatStages();
  if (id === 'admin-projets') initSecretariatProjets();
}
