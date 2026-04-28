const db = require('../db/connection');

const DemandeModel = {

    async getAll(statut = null) {
        let query = `
      SELECT d.id, d.cle, d.identifiant, d.prenom, d.nom,
             c.nom AS classe, d.date_naissance,
             d.date_demande, d.statut, d.commentaire, d.date_traitement
      FROM demandes_compte d
      JOIN classes c ON d.classe_id = c.id
    `;
        const params = [];
        if (statut) { query += ' WHERE d.statut = ?'; params.push(statut); }
        query += ' ORDER BY d.created_at DESC';
        const [rows] = await db.query(query, params);
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query(`
      SELECT d.*, c.nom AS classe_nom, c.id AS classe_id_val
      FROM demandes_compte d
      JOIN classes c ON d.classe_id = c.id
      WHERE d.id = ?
    `, [id]);
        return rows[0] || null;
    },

    async create(data) {
        const id = Date.now().toString();
        await db.query(`
      INSERT INTO demandes_compte
        (id, cle, identifiant, password_hash, prenom, nom,
         classe_id, date_naissance, date_demande, statut)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `, [id, data.cle, data.identifiant, data.password_hash,
            data.prenom, data.nom, data.classe_id,
            data.date_naissance, data.date_demande, 'en_attente']);
        return this.findById(id);
    },

    async updateStatut(id, statut, commentaire = '') {
        const date = new Date().toLocaleString('fr-FR');
        await db.query(`
      UPDATE demandes_compte
      SET statut = ?, commentaire = ?, date_traitement = ?
      WHERE id = ?
    `, [statut, commentaire, date, id]);
    },

    async findByCle(cle) {
        const [rows] = await db.query(
            `SELECT id FROM demandes_compte WHERE cle = ? AND statut = 'en_attente'`,
            [cle]
        );
        return rows[0] || null;
    },

};

module.exports = DemandeModel;