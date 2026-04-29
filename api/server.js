const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const usersRoutes    = require('./routes/users');
const demandesRoutes = require('./routes/demandes');
const errorHandler   = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/demandes', demandesRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, version: '2.0.0' }));

// 404
app.use((req, res) => res.status(404).json({ ok: false, msg: `Route ${req.path} introuvable.` }));

// Erreurs
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n✅ API Asimov V2 démarrée sur http://localhost:${PORT}`);
    console.log(`   Health : http://localhost:${PORT}/api/health\n`);
});
