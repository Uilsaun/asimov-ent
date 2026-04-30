const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const demandesRoutes = require('./routes/demandes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/demandes', demandesRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, version: '2.0.0' }));

// Fichiers statiques — ENT web (AsimovENT/web/)
app.use(express.static(path.join(__dirname, '..', 'AsimovENT', 'web')));

// Fallback → ent.html pour toutes les routes non-API
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'AsimovENT', 'web', 'ent.html'));
});

// Erreurs
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\n✅ API Asimov V2 démarrée sur http://localhost:${PORT}`);
    console.log(`   Health : http://localhost:${PORT}/api/health`);
    console.log(`   ENT    : http://localhost:${PORT}\n`);
});