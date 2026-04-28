const UserModel = require('../models/UserModel');

const UserController = {

    async getAll(req, res) {
        try {
            const users = await UserModel.findAll();
            return res.json({ ok: true, users });
        } catch (err) {
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

    async getById(req, res) {
        try {
            const user = await UserModel.findById(req.params.id);
            if (!user) return res.status(404).json({ ok: false, msg: 'Utilisateur introuvable.' });
            delete user.password_hash;
            return res.json({ ok: true, user });
        } catch (err) {
            return res.status(500).json({ ok: false, msg: 'Erreur serveur.' });
        }
    },

};

module.exports = UserController;