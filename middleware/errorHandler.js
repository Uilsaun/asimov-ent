function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ ok: false, msg: 'Erreur serveur interne.' });
}

module.exports = errorHandler;