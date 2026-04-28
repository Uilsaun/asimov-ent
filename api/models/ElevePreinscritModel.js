const db = require('../db/connection');

const ElevePreinscritModel = {

    async findByCle(cle) {
        const [rows] = await db.query(`
      SELECT ep.cle, ep.prenom, ep.nom, ep.date_naissance,
             c.nom AS classe, c.id AS classe_id
      FROM eleves_preinscrits ep
      JOIN classes c ON ep.classe_id = c.id
      WHERE ep.cle = ?
    `, [cle]);
        return rows[0] || null;
    },

};

module.exports = ElevePreinscritModel;