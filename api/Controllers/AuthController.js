const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const ROLES_ADMIN = ['principal', 'cpe', 'secretaire'];

const AuthController = {

    async login(req, res) {
        try {
            const { identifiant, motDePasse, role } = req.body;

            if (!identifiant || !motDePasse || !role) {
                return res.status(400).json({ ok: false, msg: 'Champs manquants.' });
            }

            const id = identifiant.toLowerCase().trim();
            const user = await UserModel.findById(id);

            if (!user) {
                return res.status(401).json({ ok: false, msg: 'Identifiant ou mot de passe incorrect.' });
            }

            if (user.statut === 'inactif') {
                return res.status(403).json({ ok: false, msg: 'Ce compte est désactivé.' });
            }

            const match = await bcrypt.compare(motDePasse, user.password_hash);
            if (!match) {
                return res.status(401).json({ ok: false, msg: 'Identifiant ou mot de passe incorrect.' });
            }

            // Vérification rôle vs onglet
            if (role === 'parent' && user.role !== 'parent') {
                return res.status(403).json({ ok: false, msg: "Ce compte n'est pas un compte parent." });
            }
            if (user.role === 'parent' && role !== 'parent') {
                return res.status(403).json({ ok: false, msg: "Utilisez l'onglet Parent pour ce compte." });
            }
            if (role === 'administratif' && !ROLES_ADMIN.includes(user.role)) {
                return res.status(403).json({ ok: false, msg: "Ce compte n'est pas un compte administratif." });
            }
            if (role !== 'administratif' && role !== 'parent' && ROLES_ADMIN.includes(user.role)) {
                return res.status(403).json({ ok: false, msg: "Utilisez l'onglet Direction pour ce compte." });
            }
            if (role !== 'administratif' && role !== 'parent' && user.role !== role) {
                return res.status(403).json({ ok: false, msg: 'Rôle incorrect pour ce compte.' });
            }

            delete user.password_hash;

            if (user.role === 'parent') {
                user.enfants = await UserModel.getEnfants(id);
            }
            if (user.role === 'professeur') {
                user.classes = await UserModel.getClasses(id);
            }

            return res.json({ ok: true, user });

        } catch (err) {
            console.error('Erreur login:', err);
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

};

module.exports = AuthController;