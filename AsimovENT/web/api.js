/* ═══════════════════════════════════════════════════════════
   COLLÈGE ASIMOV — Couche API REST
   Toutes les communications passent par l'API locale (Node/Express)
   ═══════════════════════════════════════════════════════════ */

async function apiFetch(endpoint, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(CONFIG.API_URL + endpoint, opts);
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, msg: 'Erreur réseau. Vérifiez que l\'API est démarrée.' };
  }
}

/* ─── AUTH ─────────────────────────────────────────────── */
const AsimovAuth = {
  async login(identifiant, motDePasse, role) {
    return apiFetch('/auth/login', 'POST', { identifiant, motDePasse, role });
  },
  async logout() {
    // Pas de session serveur — rien à faire
  },
};

/* ─── BASE DE DONNÉES ──────────────────────────────────── */
const AsimovDB = {
  async getUsers() {
    const data = await apiFetch('/users');
    return data.users || [];
  },

  async getUserById(id) {
    const data = await apiFetch(`/users/${id}`);
    return data.user || null;
  },

  async getDemandesCompte(statut = 'en_attente') {
    const data = await apiFetch(`/demandes?statut=${statut}`);
    return data.demandes || [];
  },

  async approuverDemande(id) {
    return apiFetch(`/demandes/${id}/approuver`, 'PUT');
  },

  async refuserDemande(id, commentaire = '') {
    return apiFetch(`/demandes/${id}/refuser`, 'PUT', { commentaire });
  },

  async soumettreDemandeCompte(identifiant, motDePasse) {
    return apiFetch('/demandes', 'POST', { identifiant, motDePasse });
  },

  /* ─── MESSAGERIE ─────────────────────────────────────── */
  async envoyerMessage(expediteurId, destinataireId, sujet, corps) {
    return apiFetch('/messages', 'POST', { expediteurId, destinataireId, sujet, corps });
  },

  async getMessages(userId) {
    const data = await apiFetch(`/messages/${userId}`);
    return data.messages || [];
  },

  /* ─── HISTORIQUE SCOLAIRE ────────────────────────────── */
  async getSemestres(eleveId) {
    const data = await apiFetch(`/historique/${eleveId}`);
    return data.semestres || [];
  },

  async saisirMoyenne(eleveId, semestre, annee, moyenne, matieres) {
    return apiFetch('/historique', 'POST', { eleveId, semestre, annee, moyenne, matieres });
  },

  async validerMoyenne(historiqueId) {
    return apiFetch(`/historique/${historiqueId}/valider`, 'PUT');
  },

  /* ─── RÉFÉRENTS ──────────────────────────────────────── */
  async getReferents() {
    const data = await apiFetch('/referents');
    return data.referents || [];
  },

  async affecterReferent(eleveId, profId) {
    return apiFetch('/referents', 'POST', { eleveId, profId });
  },

  async affecterRoundRobin(classeId) {
    return apiFetch('/referents/round-robin', 'POST', { classeId });
  },

  /* ─── STAGES ─────────────────────────────────────────── */
  async getStages(eleveId) {
    const data = await apiFetch(`/stages/${eleveId}`);
    return data.stages || [];
  },

  async creerStage(eleveId, data) {
    return apiFetch('/stages', 'POST', { eleveId, ...data });
  },

  async mettreAJourStage(stageId, data) {
    return apiFetch(`/stages/${stageId}`, 'PUT', data);
  },

  /* ─── PROJETS ÉTABLISSEMENT ──────────────────────────── */
  async getProjets() {
    const data = await apiFetch('/projets');
    return data.projets || [];
  },

  async creerProjet(data) {
    return apiFetch('/projets', 'POST', data);
  },

  async participerProjet(projetId, eleveId, dateDebut) {
    return apiFetch(`/projets/${projetId}/participer`, 'POST', { eleveId, dateDebut });
  },
};