/* ═══════════════════════════════════════════════════════════
   hash-passwords.js — À exécuter UNE SEULE FOIS après import SQL
   node hash-passwords.js
   ═══════════════════════════════════════════════════════════ */
const bcrypt = require('bcrypt');
const db     = require('./db/connection');

const USERS = [
    { id: 'prof1',                       pwd: 'prof1' },
    { id: 'prof2',                       pwd: 'prof2' },
    { id: 'principal1',                  pwd: 'principal1' },
    { id: 'cpe1',                        pwd: 'cpe1' },
    { id: 'secretaire1',                 pwd: 'secretaire1' },
    { id: 'parent1',                     pwd: 'parent1' },
    { id: 'parent2',                     pwd: 'parent2' },
    { id: 'lefebvre.martin.12032011',    pwd: 'lefebvre.martin.12032011' },
    { id: 'benali.sofia.07092010',       pwd: 'benali.sofia.07092010' },
    { id: 'lefebvre.emma.05112013',      pwd: 'lefebvre.emma.05112013' },
];

async function run() {
    console.log('🔐 Hashage des mots de passe...');
    for (const u of USERS) {
        const hash = await bcrypt.hash(u.pwd, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, u.id]);
        console.log(`  ✅ ${u.id}`);
    }
    console.log('\n✅ Tous les mots de passe ont été hashés.\n');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
