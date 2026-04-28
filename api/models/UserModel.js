const db = require('../db/connection');

const UserModel = {

    async findById(id) {
        const [rows] = await db.query(`
      SELECT u.id, u.password_hash, r.libelle AS role, u.prenom, u.nom,
             u.avatar, u.email, s.libelle AS statut,
             c.code AS classe_code, c.nom AS classe,
             u.date_naissance, m.nom AS matiere, u.poste,
             reg.libelle AS regime, u.tel, u.annee_scolaire
      FROM users u
      JOIN roles   r ON u.role_id   = r.id
      JOIN statuts s ON u.statut_id = s.id
      LEFT JOIN classes  c   ON u.classe_id  = c.id
      LEFT JOIN matieres m   ON u.matiere_id = m.id
      LEFT JOIN regimes  reg ON u.regime_id  = reg.id
      WHERE u.id = ?
    `, [id]);
        return rows[0] || null;
    },

    async findAll() {
        const [rows] = await db.query(`
      SELECT u.id, r.libelle AS role, u.prenom, u.nom,
             u.email, s.libelle AS statut,
             c.nom AS classe, m.nom AS matiere, u.poste
      FROM users u
      JOIN roles   r ON u.role_id   = r.id
      JOIN statuts s ON u.statut_id = s.id
      LEFT JOIN classes  c ON u.classe_id  = c.id
      LEFT JOIN matieres m ON u.matiere_id = m.id
    `);
        return rows;
    },

    async getEnfants(parentId) {
        const [rows] = await db.query(`
      SELECT u.id FROM parent_eleves pe
      JOIN users u ON pe.eleve_id = u.id
      WHERE pe.parent_id = ?
    `, [parentId]);
        return rows.map(r => r.id);
    },

    async getClasses(profId) {
        const [rows] = await db.query(`
      SELECT c.nom FROM prof_classes pc
      JOIN classes c ON pc.classe_id = c.id
      WHERE pc.prof_id = ?
    `, [profId]);
        return rows.map(r => r.nom);
    },

    async create(data) {
        const { id, password_hash, role_id, prenom, nom, avatar,
            email, classe_id, date_naissance, matiere_id,
            poste, regime_id, annee_scolaire } = data;
        await db.query(`
      INSERT INTO users
        (id, password_hash, role_id, prenom, nom, avatar, email,
         statut_id, classe_id, date_naissance, matiere_id, poste,
         regime_id, annee_scolaire)
      VALUES (?,?,?,?,?,?,?,1,?,?,?,?,?,?)
    `, [id, password_hash, role_id, prenom, nom, avatar, email,
            classe_id || null, date_naissance || null,
            matiere_id || null, poste || null,
            regime_id || null, annee_scolaire || '2025-2026']);
        return this.findById(id);
    },

};

module.exports = UserModel;