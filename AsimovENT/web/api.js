/* ═══════════════════════════════════════════════════════════
   COLLÈGE ASIMOV — Couche API V2
   Remplace supabase.js — appelle l'API REST locale
   ═══════════════════════════════════════════════════════════ */

async function apiFetch(endpoint, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(CONFIG.API_URL + endpoint, opts);
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, msg: 'Erreur réseau. Vérifiez que l\'API est démarrée sur localhost:3000.' };
  }
}

/* ─── AUTH ─────────────────────────────────────────────── */
const SupabaseAuth = {
  async login(identifiant, motDePasse, role) {
    const data = await apiFetch('/auth/login', 'POST', { identifiant, motDePasse, role });
    return data; // { ok, user } ou { ok: false, msg }
  },
  async logout() {
    // Pas de session serveur en V2 — rien à faire
  },
};

/* ─── BASE DE DONNÉES ──────────────────────────────────── */
const SupabaseDB = {
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
};