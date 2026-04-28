const bcrypt = require('bcrypt');
const DemandeModel = require('../models/DemandeModel');
const ElevePreinscritModel = require('../models/ElevePreinscritModel');
const UserModel = require('../models/UserModel');

const DemandeController = {

    async getAll(req, res) {
        try {
            const { statut } = req.query;
            const demandes = await DemandeModel.getAll(statut || null);
            return res.json({ ok: true, demandes });
        } catch (err) {
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

    async soumettre(req, res) {
        try {
            const { identifiant, motDePasse } = req.body;
            const regex = /^[a-zA-ZÀ-ÿ]+\.[a-zA-ZÀ-ÿ]+\.\d{8}$/;

            if (!regex.test(identifiant)) {
                return res.status(400).json({ ok: false, msg: 'Format invalide. Attendu : nom.prenom.JJMMAAAA' });
            }
            if (!motDePasse || motDePasse.length < 6) {
                return res.status(400).json({ ok: false, msg: 'Mot de passe trop court (min 6 caractères).' });
            }

            const cle = identifiant.toLowerCase();
            const eleve = await ElevePreinscritModel.findByCle(cle);
            if (!eleve) return res.status(404).json({ ok: false, msg: 'Aucun élève trouvé. Contactez le secrétariat.' });

            const dejaAttente = await DemandeModel.findByCle(cle);
            if (dejaAttente) return res.status(409).json({ ok: false, msg: 'Une demande est déjà en cours.' });

            const dejaActif = await UserModel.findById(cle);
            if (dejaActif) return res.status(409).json({ ok: false, msg: 'Un compte est déjà actif pour cet élève.' });

            const password_hash = await bcrypt.hash(motDePasse, 10);
            await DemandeModel.create({
                cle, identifiant: cle, password_hash,
                prenom: eleve.prenom, nom: eleve.nom,
                classe_id: eleve.classe_id,
                date_naissance: eleve.date_naissance,
                date_demande: new Date().toLocaleString('fr-FR'),
            });

            return res.json({ ok: true, eleve });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

    async approuver(req, res) {
        try {
            const demande = await DemandeModel.findById(req.params.id);
            if (!demande) return res.status(404).json({ ok: false, msg: 'Demande introuvable.' });
            if (demande.statut === 'approuve') return res.status(409).json({ ok: false, msg: 'Déjà approuvée.' });

            await UserModel.create({
                id: demande.identifiant,
                password_hash: demande.password_hash,
                role_id: 1,
                prenom: demande.prenom,
                nom: demande.nom,
                avatar: (demande.prenom[0] + demande.nom[0]).toUpperCase(),
                email: demande.identifiant + '@asimov.edu',
                classe_id: demande.classe_id_val,
                date_naissance: demande.date_naissance,
                regime_id: 1,
                annee_scolaire: '2025-2026',
            });

            await DemandeModel.updateStatut(req.params.id, 'approuve');
            return res.json({ ok: true, msg: `Compte créé pour ${demande.prenom} ${demande.nom}.` });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

    async refuser(req, res) {
        try {
            const { commentaire } = req.body;
            await DemandeModel.updateStatut(req.params.id, 'refuse', commentaire || '');
            return res.json({ ok: true });
        } catch (err) {
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

};

module.exports = DemandeController;