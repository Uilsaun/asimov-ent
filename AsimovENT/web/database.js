/* ══════════════════════════════════════════════════════════
   COLLÈGE ASIMOV — Base de données simulée v4.0
   Année scolaire : 2025-2026
   Dernière mise à jour : 20/03/2026
   ══════════════════════════════════════════════════════════

   RÔLES :
   • eleve         → dashboard élève
   • professeur    → dashboard professeur
   • principal     → validation comptes + direction
   • cpe           → absences, discipline
   • secretaire    → inscriptions, courriers
   • parent        → portail parents

   COMPTES DÉMO :
   ── ÉLÈVES ──
   lefebvre.martin.12032011  /  (Martin Lefebvre — 4ème B)
   benali.sofia.07092010     /  (Sofia Benali — 3ème A)
   lefebvre.emma.05112013    /  (Emma Lefebvre — 6ème A)

   ── PARENTS ──
   parent1      / parent1        (Sophie Lefebvre — Martin & Emma)
   parent2      / parent2        (Karim Benali — Sofia)

   ── PROFESSEURS ──
   prof1        / prof1            (Pierre Dupont — Mathématiques)
   prof2        / prof2            (Marie Laurent — Français)

   ── DIRECTION ──
   principal1   / principal1      (Isabelle Benoît — Direction)
   cpe1         / cpe1              (Romain Vidal — CPE)
   secretaire1  / secretaire1       (Nathalie Morin — Secrétariat)
   ══════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────
   GÉNÉRATEUR D'EMPLOI DU TEMPS PAR NIVEAU
   6ème→26h | 5ème→27h | 4ème/3ème→28h
   Mercredi : matin seulement pour tous
───────────────────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────
   GÉNÉRATEUR D'EMPLOI DU TEMPS PAR NIVEAU ET CLASSE
   Mix 1h/2h | Jusqu'à 17h30 | Profs différents par classe
───────────────────────────────────────────────────────── */
function genEmploi(niveau, classeId) {

  const letter = classeId ? String(classeId).slice(-1) : 'A';
  const off = Math.max(0, ['A', 'B', 'C', 'D'].indexOf(letter));

  // Pools profs x4 variantes par classe
  const P = {
    'Mathématiques': [['M. Dupont', 'C12'], ['M. Berger', 'C14'], ['Mme Favre', 'C11'], ['M. Simon', 'C13']][off],
    'Français': [['Mme Laurent', 'B05'], ['M. Legrand', 'B07'], ['Mme Picard', 'B06'], ['M. Roy', 'B04']][off],
    'Anglais': [['Mme Brown', 'B12'], ['M. Wells', 'B14'], ['Mme Scott', 'B11'], ['M. Clark', 'B13']][off],
    'Histoire-Géo': [['M. Martin', 'A08'], ['Mme Morin', 'A10'], ['M. Perrin', 'A09'], ['Mme Blanc', 'A07']][off],
    'SVT': [['Mme Richard', 'Labo 2'], ['M. Leroy', 'Labo 3'], ['Mme Costa', 'Labo 2'], ['M. Henry', 'Labo 4']][off],
    'EPS': [['M. Petit', 'Gymnase'], ['Mme Denis', 'Gymnase'], ['M. Renaud', 'Gymnase'], ['Mme Garnier', 'Gymnase']][off],
    'Physique-Chimie': [['M. Blanc', 'Labo 1'], ['Mme Mercier', 'Labo 5'], ['M. Thomas', 'Labo 1'], ['Mme Girard', 'Labo 6']][off],
    'Arts Plastiques': [['Mme Dubois', 'Art'], ['M. Ferrand', 'Art'], ['Mme Noel', 'Art'], ['M. Aubert', 'Art']][off],
    'Musique': [['M. Renard', 'Musique'], ['Mme Lamy', 'Musique'], ['M. Vidal', 'Musique'], ['Mme Huet', 'Musique']][off],
    'Technologie': [['M. Garcia', 'Atelier'], ['Mme Colin', 'Atelier'], ['M. Roux', 'Atelier'], ['Mme Meyer', 'Atelier']][off],
    'Latin': [['Mme Leroy', 'A10'], ['M. Duval', 'A11'], ['Mme Petit', 'A10'], ['M. André', 'A12']][off],
  };

  const c = (mat, debut, fin, duree) => {
    const ps = P[mat] || ['Prof.', 'Salle'];
    return { heure: `${debut} – ${fin}`, debutKey: debut, duree, type: 'cours', matiere: mat, prof: ps[0], salle: ps[1], couleur: 'mat-default' };
  };
  const repas = (debut, fin) => ({ heure: `${debut} – ${fin}`, debutKey: debut, duree: 1, type: 'repas', label: 'Déjeuner', matiere: null });
  const vide = (debut, fin) => ({ heure: `${debut} – ${fin}`, debutKey: debut, duree: 1, type: 'vide', matiere: null });

  const recre1 = { heure: '10h05 – 10h20', debutKey: '10h05', duree: 0.25, type: 'pause', label: 'Récréation', matiere: null };
  const recre2 = { heure: '15h35 – 15h50', debutKey: '15h35', duree: 0.25, type: 'pause', label: 'Récréation', matiere: null };

  // ══ GRILLE FIXE — tous les jours ont EXACTEMENT ces debutKey ══
  // 08h15 | 09h10 | 10h05☕ | 10h20 | 11h15
  // 12h10 | 12h50 | 13h45 | 14h40 | 15h35☕ | 15h50 | 16h45 | 17h40(fin)

  const EDT_BASE = {
    Lundi: [
      c('Français', '08h15', '09h10', 1),
      c('Français', '09h10', '10h05', 1),
      recre1,
      c('Mathématiques', '10h20', '11h15', 1),
      c('Mathématiques', '11h15', '12h10', 1),
      repas('12h10', '12h50'),
      vide('12h50', '13h45'),
      c('Musique', '13h45', '14h40', 1),
      c('Anglais', '14h40', '15h35', 1),
      recre2,
      c('Histoire-Géo', '15h50', '16h45', 1),
      vide('16h45', '17h40'),
    ],
    Mardi: [
      c('SVT', '08h15', '09h10', 1),
      c('SVT', '09h10', '10h05', 1),
      recre1,
      c('Physique-Chimie', '10h20', '11h15', 1),
      c('Physique-Chimie', '11h15', '12h10', 1),
      repas('12h10', '12h50'),
      c('Latin', '12h50', '13h45', 1),
      c('Histoire-Géo', '13h45', '14h40', 1),
      vide('14h40', '15h35'),
      recre2,
      vide('15h50', '16h45'),
      vide('16h45', '17h40'),
    ],
    Mercredi: [
      c('Français', '08h15', '09h10', 1),
      c('Français', '09h10', '10h05', 1),
      recre1,
      c('Arts Plastiques', '10h20', '11h15', 1),
      c('Arts Plastiques', '11h15', '12h10', 1),
      vide('12h10', '12h50'),
      vide('12h50', '13h45'),
      vide('13h45', '14h40'),
      vide('14h40', '15h35'),
      recre2,
      vide('15h50', '16h45'),
      vide('16h45', '17h40'),
    ],
    Jeudi: [
      c('Mathématiques', '08h15', '09h10', 1),
      c('Histoire-Géo', '09h10', '10h05', 1),
      recre1,
      c('Histoire-Géo', '10h20', '11h15', 1),
      vide('11h15', '12h10'),
      repas('12h10', '12h50'),
      c('Mathématiques', '12h50', '13h45', 1),
      c('Anglais', '13h45', '14h40', 1),
      vide('14h40', '15h35'),
      recre2,
      vide('15h50', '16h45'),
      vide('16h45', '17h40'),
    ],
    Vendredi: [
      c('Anglais', '08h15', '09h10', 1),
      c('Anglais', '09h10', '10h05', 1),
      recre1,
      c('Mathématiques', '10h20', '11h15', 1),
      c('Français', '11h15', '12h10', 1),
      repas('12h10', '12h50'),
      vide('12h50', '13h45'),
      c('EPS', '13h45', '14h40', 1),
      c('EPS', '14h40', '15h35', 1),
      recre2,
      c('EPS', '15h50', '16h45', 1),
      vide('16h45', '17h40'),
    ],
  };


  // Adapter les profs selon le niveau (matières identiques, profs du pool)
  // Pour les niveaux 6ème pas de Physique-Chimie → remplacer par SVT ou Techno
  const emploi = {};
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  jours.forEach(j => {
    emploi[j] = (EDT_BASE[j] || []).map(slot => {
      if (slot.type !== 'cours') return slot;
      // Si 6ème : pas de Physique-Chimie → remplacer par SVT
      if (niveau === '6' && slot.matiere === 'Physique-Chimie') {
        const ps = P['SVT'] || ['Prof.', 'Salle'];
        return { ...slot, matiere: 'SVT', prof: ps[0], salle: ps[1] };
      }
      // Mettre à jour le prof selon le pool de la classe
      const ps = P[slot.matiere] || [slot.prof, slot.salle];
      return { ...slot, prof: ps[0], salle: ps[1] };
    });
  });

  return emploi;
}

/* ════════════════════════════════════════════════════════
   BASE DE DONNÉES PRINCIPALE
════════════════════════════════════════════════════════ */
const DB = {

  /* ── COMPTES ── */
  /* ⚠️ Aucun mot de passe ici */
  users: {
    /* ── ÉLÈVES — id = nom.prenom.JJMMAAAA ── */
    'lefebvre.martin.12032011': { id: 'lefebvre.martin.12032011', role: 'eleve', prenom: 'Martin', nom: 'Lefebvre', classe: '4ème B', dateNaissance: '12/03/2011', avatar: 'ML', email: 'lefebvre.martin.12032011@asimov.edu', statut: 'actif', regime: 'demi-pensionnaire' },
    'benali.sofia.07092010': { id: 'benali.sofia.07092010', role: 'eleve', prenom: 'Sofia', nom: 'Benali', classe: '3ème A', dateNaissance: '07/09/2010', avatar: 'SB', email: 'benali.sofia.07092010@asimov.edu', statut: 'actif', regime: 'externe' },
    'lefebvre.emma.05112013': { id: 'lefebvre.emma.05112013', role: 'eleve', prenom: 'Emma', nom: 'Lefebvre', classe: '6ème A', dateNaissance: '05/11/2013', avatar: 'EL', email: 'lefebvre.emma.05112013@asimov.edu', statut: 'actif', regime: 'demi-pensionnaire' },
    /* ── PROFESSEURS ── */
    prof1: { id: 'prof1', role: 'professeur', prenom: 'Pierre', nom: 'Dupont', matiere: 'Mathématiques', avatar: 'PD', email: 'p.dupont@asimov.edu', classes: ['6ème A', '6ème B', '6ème C', '6ème D', '5ème A', '5ème B', '5ème C', '5ème D', '4ème A', '4ème B', '4ème C', '4ème D', '3ème A', '3ème B', '3ème C', '3ème D'] },
    prof2: { id: 'prof2', role: 'professeur', prenom: 'Marie', nom: 'Laurent', matiere: 'Français', avatar: 'ML', email: 'm.laurent@asimov.edu', classes: ['4ème B', '5ème A', '6ème A'] },
    /* ── DIRECTION ── */
    principal1: { id: 'principal1', role: 'principal', prenom: 'Isabelle', nom: 'Benoît', poste: "Chef d'établissement", avatar: 'IB', email: 'direction@asimov.edu', droits: ['valider_comptes', 'gerer_personnel', 'conseil_classe'] },
    cpe1: { id: 'cpe1', role: 'cpe', prenom: 'Romain', nom: 'Vidal', poste: "Conseiller Principal d'Éducation", avatar: 'RV', email: 'cpe@asimov.edu', droits: ['gerer_absences', 'gerer_sanctions'] },
    secretaire1: { id: 'secretaire1', role: 'secretaire', prenom: 'Nathalie', nom: 'Morin', poste: 'Secrétaire de direction', avatar: 'NM', email: 'secretariat@asimov.edu', droits: ['gerer_inscriptions', 'courriers'] },
    /* ── PARENTS ── */
    parent1: { id: 'parent1', role: 'parent', prenom: 'Sophie', nom: 'Lefebvre', avatar: 'SL', email: 'lefebvre.parents@mail.fr', enfants: ['lefebvre.martin.12032011', 'lefebvre.emma.05112013'], tel: '06 12 34 56 78' },
    parent2: { id: 'parent2', role: 'parent', prenom: 'Karim', nom: 'Benali', avatar: 'KB', email: 'benali.parents@mail.fr', enfants: ['benali.sofia.07092010'], tel: '06 98 76 54 32' },
  },

  /* ── ÉLÈVES PRÉ-INSCRITS (annuaire école) ──
     Clé : "nom.prenom.JJMMAAAA"
  */
  elevesPreinscrits: {
    'moreau.theo.15092013': { prenom: 'Théo', nom: 'Moreau', classe: '6ème A', dateNaissance: '15/09/2013' },
    'martin.lea.22042013': { prenom: 'Léa', nom: 'Martin', classe: '6ème A', dateNaissance: '22/04/2013' },
    'chen.yuki.03012013': { prenom: 'Yuki', nom: 'Chen', classe: '6ème A', dateNaissance: '03/01/2013' },
    'bernard.emma.17072013': { prenom: 'Emma', nom: 'Bernard', classe: '6ème A', dateNaissance: '17/07/2013' },
    'petit.julien.29112013': { prenom: 'Julien', nom: 'Petit', classe: '6ème A', dateNaissance: '29/11/2013' },
    'rousseau.clara.08032013': { prenom: 'Clara', nom: 'Rousseau', classe: '6ème B', dateNaissance: '08/03/2013' },
    'blanc.hugo.14052013': { prenom: 'Hugo', nom: 'Blanc', classe: '6ème B', dateNaissance: '14/05/2013' },
    'garcia.ines.30082013': { prenom: 'Inès', nom: 'Garcia', classe: '6ème B', dateNaissance: '30/08/2013' },
    'robin.maxime.11102013': { prenom: 'Maxime', nom: 'Robin', classe: '6ème B', dateNaissance: '11/10/2013' },
    'lambert.chloe.25062013': { prenom: 'Chloé', nom: 'Lambert', classe: '6ème B', dateNaissance: '25/06/2013' },
    'faure.baptiste.19042012': { prenom: 'Baptiste', nom: 'Faure', classe: '5ème A', dateNaissance: '19/04/2012' },
    'andre.camille.07082012': { prenom: 'Camille', nom: 'André', classe: '5ème A', dateNaissance: '07/08/2012' },
    'mercier.romain.14122012': { prenom: 'Romain', nom: 'Mercier', classe: '5ème A', dateNaissance: '14/12/2012' },
    'fontaine.lisa.02032012': { prenom: 'Lisa', nom: 'Fontaine', classe: '5ème A', dateNaissance: '02/03/2012' },
    'chevalier.nathan.27072012': { prenom: 'Nathan', nom: 'Chevalier', classe: '5ème A', dateNaissance: '27/07/2012' },
    'muller.alice.10012012': { prenom: 'Alice', nom: 'Muller', classe: '5ème B', dateNaissance: '10/01/2012' },
    'henry.louis.28052012': { prenom: 'Louis', nom: 'Henry', classe: '5ème B', dateNaissance: '28/05/2012' },
    'aubert.nina.16092012': { prenom: 'Nina', nom: 'Aubert', classe: '5ème B', dateNaissance: '16/09/2012' },
    'girard.pierre.05112012': { prenom: 'Pierre', nom: 'Girard', classe: '5ème B', dateNaissance: '05/11/2012' },
    'bonnet.sarah.21022012': { prenom: 'Sarah', nom: 'Bonnet', classe: '5ème B', dateNaissance: '21/02/2012' },
    'vincent.theo.13062011': { prenom: 'Théo', nom: 'Vincent', classe: '4ème A', dateNaissance: '13/06/2011' },
    'morel.jade.09102011': { prenom: 'Jade', nom: 'Morel', classe: '4ème A', dateNaissance: '09/10/2011' },
    'colin.axel.31012011': { prenom: 'Axel', nom: 'Colin', classe: '4ème A', dateNaissance: '31/01/2011' },
    'renaud.eva.18042011': { prenom: 'Eva', nom: 'Renaud', classe: '4ème A', dateNaissance: '18/04/2011' },
    'simon.paul.24082011': { prenom: 'Paul', nom: 'Simon', classe: '4ème A', dateNaissance: '24/08/2011' },
    'lefebvre.martin.12032011': { prenom: 'Martin', nom: 'Lefebvre', classe: '4ème B', dateNaissance: '12/03/2011' },
    'durand.lea.07112011': { prenom: 'Léa', nom: 'Durand', classe: '4ème B', dateNaissance: '07/11/2011' },
    'moreau.antoine.20052011': { prenom: 'Antoine', nom: 'Moreau', classe: '4ème B', dateNaissance: '20/05/2011' },
    'leclerc.zoe.03092011': { prenom: 'Zoé', nom: 'Leclerc', classe: '4ème B', dateNaissance: '03/09/2011' },
    'garnier.lucas.16022011': { prenom: 'Lucas', nom: 'Garnier', classe: '4ème C', dateNaissance: '16/02/2011' },
    'guerin.manon.29072011': { prenom: 'Manon', nom: 'Guérin', classe: '4ème C', dateNaissance: '29/07/2011' },
    'boyer.enzo.11122011': { prenom: 'Enzo', nom: 'Boyer', classe: '4ème C', dateNaissance: '11/12/2011' },
    'gauthier.maelys.04042011': { prenom: 'Maëlys', nom: 'Gauthier', classe: '4ème C', dateNaissance: '04/04/2011' },
    'benali.sofia.07092010': { prenom: 'Sofia', nom: 'Benali', classe: '3ème A', dateNaissance: '07/09/2010' },
    'roux.tom.23012010': { prenom: 'Tom', nom: 'Roux', classe: '3ème A', dateNaissance: '23/01/2010' },
    'nicolas.lucie.12062010': { prenom: 'Lucie', nom: 'Nicolas', classe: '3ème A', dateNaissance: '12/06/2010' },
    'perrin.ethan.08112010': { prenom: 'Ethan', nom: 'Perrin', classe: '3ème A', dateNaissance: '08/11/2010' },
    'morin.anaelle.27032010': { prenom: 'Anaëlle', nom: 'Morin', classe: '3ème A', dateNaissance: '27/03/2010' },
    'picard.kilian.15072010': { prenom: 'Kilian', nom: 'Picard', classe: '3ème A', dateNaissance: '15/07/2010' },
    'brun.inaya.02052010': { prenom: 'Inaya', nom: 'Brun', classe: '3ème B', dateNaissance: '02/05/2010' },
    'schmitt.mathis.19082010': { prenom: 'Mathis', nom: 'Schmitt', classe: '3ème B', dateNaissance: '19/08/2010' },
    'olivier.roxane.30102010': { prenom: 'Roxane', nom: 'Olivier', classe: '3ème B', dateNaissance: '30/10/2010' },
    'martinez.killian.14022010': { prenom: 'Killian', nom: 'Martinez', classe: '3ème B', dateNaissance: '14/02/2010' },
    'david.amelie.06012010': { prenom: 'Amélie', nom: 'David', classe: '3ème B', dateNaissance: '06/01/2010' },
    'lefevre.charlie.22092010': { prenom: 'Charlie', nom: 'Lefèvre', classe: '3ème B', dateNaissance: '22/09/2010' },

    /* ── ÉLÈVE AJOUTÉ MANUELLEMENT ── */
    'pingou.tinou.01012006': { prenom: 'Tinou', nom: 'Pingou', classe: '3ème A', dateNaissance: '01/01/2006' },
  },

  /* ── EMPLOIS DU TEMPS PAR CLASSE ── */
  emploiDuTemps: {
    '6ème A': genEmploi('6', 'A'), '6ème B': genEmploi('6', 'B'), '6ème C': genEmploi('6', 'C'), '6ème D': genEmploi('6', 'D'),
    '5ème A': genEmploi('5', 'A'), '5ème B': genEmploi('5', 'B'), '5ème C': genEmploi('5', 'C'), '5ème D': genEmploi('5', 'D'),
    '4ème A': genEmploi('4', 'A'), '4ème B': genEmploi('4', 'B'), '4ème C': genEmploi('4', 'C'), '4ème D': genEmploi('4', 'D'),
    '3ème A': genEmploi('3', 'A'), '3ème B': genEmploi('3', 'B'), '3ème C': genEmploi('3', 'C'), '3ème D': genEmploi('3', 'D'),
  },

  /* ── NOTES ── */
  notes: {
    'lefebvre.martin.12032011': [
      {
        matiere: 'Mathématiques', moyenne: 15.5, couleur: '#3B82F6', evaluations: [
          { titre: 'DS n°1 — Fractions', note: 14, sur: 20, date: '15/01/2026' },
          { titre: 'Interro — Équations', note: 17, sur: 20, date: '22/01/2026' },
          { titre: 'DS n°2 — Géométrie', note: 15.5, sur: 20, date: '05/02/2026' }]
      },
      {
        matiere: 'Français', moyenne: 13.0, couleur: '#EC4899', evaluations: [
          { titre: 'Rédaction', note: 13, sur: 20, date: '10/01/2026' },
          { titre: 'Dictée n°3', note: 11, sur: 20, date: '20/01/2026' },
          { titre: 'Exposé oral', note: 15, sur: 20, date: '03/02/2026' }]
      },
      {
        matiere: 'Histoire-Géo', moyenne: 14.8, couleur: '#F59E0B', evaluations: [
          { titre: 'Contrôle — Moyen-Âge', note: 15, sur: 20, date: '12/01/2026' },
          { titre: 'Croquis géo.', note: 14, sur: 20, date: '02/02/2026' },
          { titre: 'Oral', note: 15.5, sur: 20, date: '14/02/2026' }]
      },
      {
        matiere: 'SVT', moyenne: 16.2, couleur: '#10B981', evaluations: [
          { titre: 'TP — Cellule végétale', note: 17, sur: 20, date: '08/01/2026' },
          { titre: 'Contrôle', note: 16, sur: 20, date: '29/01/2026' },
          { titre: 'DS n°2', note: 15.5, sur: 20, date: '12/02/2026' }]
      },
      {
        matiere: 'Anglais', moyenne: 15.0, couleur: '#14B8A6', evaluations: [
          { titre: 'Contrôle écrit', note: 15, sur: 20, date: '16/01/2026' },
          { titre: 'Expression orale', note: 16, sur: 20, date: '06/02/2026' },
          { titre: 'Dictée', note: 14, sur: 20, date: '20/02/2026' }]
      },
    ],
    'benali.sofia.07092010': [
      {
        matiere: 'Mathématiques', moyenne: 14.0, couleur: '#3B82F6', evaluations: [
          { titre: 'Brevet blanc', note: 14, sur: 20, date: '10/02/2026' },
          { titre: 'Interro Pythagore', note: 15, sur: 20, date: '24/01/2026' }]
      },
      {
        matiere: 'Français', moyenne: 16.0, couleur: '#EC4899', evaluations: [
          { titre: 'Commentaire', note: 16, sur: 20, date: '08/02/2026' },
          { titre: 'Dictée', note: 15, sur: 20, date: '20/01/2026' }]
      },
    ],
    'lefebvre.emma.05112013': [
      {
        matiere: 'Mathématiques', moyenne: 13.5, couleur: '#3B82F6', evaluations: [
          { titre: 'Contrôle nombres entiers', note: 14, sur: 20, date: '15/01/2026' },
          { titre: 'Interro géométrie', note: 13, sur: 20, date: '05/02/2026' }]
      },
      {
        matiere: 'Français', moyenne: 15.0, couleur: '#EC4899', evaluations: [
          { titre: 'Dictée n°2', note: 16, sur: 20, date: '12/01/2026' },
          { titre: 'Rédaction', note: 14, sur: 20, date: '02/02/2026' }]
      },
      {
        matiere: 'Histoire-Géo', moyenne: 14.5, couleur: '#F59E0B', evaluations: [
          { titre: 'Contrôle Antiquité', note: 15, sur: 20, date: '20/01/2026' },
          { titre: 'Exposé oral', note: 14, sur: 20, date: '10/02/2026' }]
      },
    ],
  },

  /* ── DEVOIRS ── */
  devoirs: {
    'lefebvre.martin.12032011': [
      { id: 1, matiere: 'Mathématiques', titre: 'Exercices p.87 n°5 à 12', dateRendu: '24/03/2026', urgent: true, done: false, prof: 'M. Dupont' },
      { id: 2, matiere: 'Français', titre: 'Lire chapitre 5 + résumé', dateRendu: '23/03/2026', urgent: true, done: false, prof: 'Mme Laurent' },
      { id: 3, matiere: 'Histoire-Géo', titre: 'Apprendre dates Moyen-Âge', dateRendu: '26/03/2026', urgent: false, done: false, prof: 'M. Martin' },
      { id: 4, matiere: 'SVT', titre: 'Schéma cellule animale', dateRendu: '27/03/2026', urgent: false, done: true, prof: 'Mme Richard' },
      { id: 5, matiere: 'Anglais', titre: 'Traduire texte p.64', dateRendu: '25/03/2026', urgent: false, done: false, prof: 'Mme Brown' },
    ],
    'benali.sofia.07092010': [
      { id: 1, matiere: 'Mathématiques', titre: 'Brevet blanc — sujet complet', dateRendu: '25/03/2026', urgent: true, done: false, prof: 'M. Dupont' },
      { id: 2, matiere: 'Français', titre: 'Commentaire composé', dateRendu: '24/03/2026', urgent: true, done: false, prof: 'Mme Laurent' },
    ],
    'lefebvre.emma.05112013': [
      { id: 1, matiere: 'Mathématiques', titre: 'Exercices p.34 n°1 à 8', dateRendu: '25/03/2026', urgent: false, done: false, prof: 'M. Dupont' },
      { id: 2, matiere: 'Français', titre: 'Lire pages 45-52 + questions', dateRendu: '23/03/2026', urgent: true, done: false, prof: 'Mme Laurent' },
      { id: 3, matiere: 'Histoire-Géo', titre: 'Fiche mémo — l\'Antiquité', dateRendu: '26/03/2026', urgent: false, done: true, prof: 'M. Martin' },
    ],
  },

  /* ── MESSAGERIE ── */
  messages: {
    'lefebvre.martin.12032011': [
      {
        id: 1, lu: false, expediteur: 'M. Dupont (Mathématiques)', sujet: 'Résultats DS n°2 — Félicitations',
        corps: 'Bonjour Martin,\n\nTrès bon devoir, continuez ainsi !\n\nM. Dupont', date: '18/03/2026 – 09h15'
      },
      {
        id: 2, lu: false, expediteur: 'Vie scolaire', sujet: 'Absence du 16/03 — Justificatif requis',
        corps: 'Bonjour,\n\nL\'absence du lundi 16 mars n\'a pas été justifiée.\n\nVie scolaire', date: '17/03/2026 – 11h30'
      },
    ],
    'benali.sofia.07092010': [
      {
        id: 1, lu: false, expediteur: 'M. Dupont (Mathématiques)', sujet: 'Brevet blanc — résultats',
        corps: 'Bonjour Sofia,\n\nBon travail sur le brevet blanc.\n\nM. Dupont', date: '19/03/2026 – 08h00'
      },
    ],
    prof1: [
      {
        id: 1, lu: false, expediteur: 'Mme Benoît (Direction)', sujet: 'Conseil de classe 4ème B — Rappel',
        corps: 'Bonjour,\n\nRappel : conseil de classe 4ème B le 25 mars à 17h30.\n\nMme Benoît', date: '18/03/2026 – 08h00'
      },
    ],
    principal1: [
      {
        id: 1, lu: false, expediteur: 'Académie de Paris', sujet: 'Circulaire n°2026-04',
        corps: 'Madame,\n\nVeuillez trouver la circulaire relative aux évaluations nationales.\n\nAcadémie de Paris', date: '16/03/2026 – 09h00'
      },
    ],
    cpe1: [
      {
        id: 1, lu: false, expediteur: 'M. Dupont (Mathématiques)', sujet: 'Comportement élève 4ème A',
        corps: 'Bonjour,\n\nJe signale un problème de comportement de Théo Vincent.\n\nM. Dupont', date: '19/03/2026 – 12h30'
      },
    ],
    secretaire1: [],
  },

  /* ── ABSENCES ── */
  absences: {
    'lefebvre.martin.12032011': [
      { id: 1, type: 'abs', date: 'Lundi 16/03/2026', detail: 'Journée complète', statut: 'En attente' },
      { id: 2, type: 'retard', date: 'Mercredi 11/03/2026', detail: '15 min — Français', statut: 'Justifié' },
    ],
    'benali.sofia.07092010': [
      { id: 1, type: 'abs', date: 'Mardi 10/03/2026', detail: 'Matin complet', statut: 'Justifié' },
    ],
    'lefebvre.emma.05112013': [
      { id: 1, type: 'retard', date: 'Mercredi 11/03/2026', detail: '20 min — Mathématiques', statut: 'Justifié' },
      { id: 2, type: 'abs', date: 'Lundi 09/03/2026', detail: 'Après-midi', statut: 'En attente' },
    ],
  },

  /* ── DEMANDES D'ABSENCE ── */
  demandesAbsence: {
    'lefebvre.martin.12032011': [
      { id: 1, dateDebut: '16/03/2026', dateFin: '16/03/2026', motif: 'Rendez-vous médical', statut: 'validée', modifiable: false },
      { id: 2, dateDebut: '25/03/2026', dateFin: '26/03/2026', motif: 'Compétition sportive', statut: 'en attente', modifiable: true },
    ],
    'benali.sofia.07092010': [],
  },

  /* ── MENUS CANTINE ── */
  menusCantine: {
    'Lundi 23/03': { entree: 'Salade de carottes', plat: 'Poulet rôti / Haricots verts', dessert: 'Fromage / Compote', veggie: 'Gratin de légumes' },
    'Mardi 24/03': { entree: 'Taboulé', plat: 'Steak haché / Frites', dessert: 'Yaourt / Fruit', veggie: 'Quiche lorraine' },
    'Mercredi 25/03': { entree: 'Soupe de légumes', plat: 'Poisson / Riz', dessert: 'Mousse chocolat', veggie: 'Omelette' },
    'Jeudi 26/03': { entree: 'Betteraves', plat: 'Rôti de porc / Purée', dessert: 'Tarte aux pommes', veggie: 'Lasagnes végétales' },
    'Vendredi 27/03': { entree: 'Crudités', plat: 'Escalope / Pâtes', dessert: 'Crème caramel', veggie: 'Pizza margherita' },
  },

  /* ── RESSOURCES ── */
  ressources: [
    { icon: '📘', titre: 'Manuels numériques', desc: 'Accès à tous vos manuels en ligne' },
    { icon: '🎓', titre: 'Khan Academy', desc: 'Exercices interactifs toutes matières' },
    { icon: '📝', titre: 'Leçons en PDF', desc: 'Téléchargez vos cours partagés' },
    { icon: '🔬', titre: 'Labos virtuels', desc: 'Simulations de TP scientifiques' },
    { icon: '🗺️', titre: 'Atlas numérique', desc: 'Cartes interactives géographie' },
    { icon: '📚', titre: 'Bibliothèque', desc: 'Livres numériques disponibles' },
    { icon: '🎵', titre: 'Partitions & cours', desc: 'Ressources éducation musicale' },
    { icon: '🖥️', titre: 'Outils numériques', desc: 'Suite bureautique scolaire' },
  ],

  /* ── CLASSES PROF ── */
  classes: {
    /* ──── 6ème ──── */
    '6A': {
      nom: '6ème A', niveau: '6', eleves: [
        { nom: 'Moreau Théo', prenom: 'Théo', avg: 13.5 }, { nom: 'Martin Léa', prenom: 'Léa', avg: 15.0 },
        { nom: 'Chen Yuki', prenom: 'Yuki', avg: 17.2 }, { nom: 'Bernard Emma', prenom: 'Emma', avg: 12.8 },
        { nom: 'Petit Julien', prenom: 'Julien', avg: 11.4 }, { nom: 'Fontaine Jade', prenom: 'Jade', avg: 14.6 },
        { nom: 'Arnaud Lukas', prenom: 'Lukas', avg: 10.9 }, { nom: 'Vidal Camille', prenom: 'Camille', avg: 16.1 },
        { nom: 'Dupuis Axel', prenom: 'Axel', avg: 13.0 }, { nom: 'Leroux Nina', prenom: 'Nina', avg: 14.8 },
        { nom: 'Tran Manon', prenom: 'Manon', avg: 15.5 }, { nom: 'Gilles Baptiste', prenom: 'Baptiste', avg: 12.3 },
        { nom: 'Michon Clara', prenom: 'Clara', avg: 16.7 }, { nom: 'Perrot Enzo', prenom: 'Enzo', avg: 11.8 },
        { nom: 'Aubert Lisa', prenom: 'Lisa', avg: 14.2 },
      ]
    },
    '6B': {
      nom: '6ème B', niveau: '6', eleves: [
        { nom: 'Rousseau Hugo', prenom: 'Hugo', avg: 14.0 }, { nom: 'Blanc Inès', prenom: 'Inès', avg: 15.6 },
        { nom: 'Garcia Maxime', prenom: 'Maxime', avg: 12.2 }, { nom: 'Robin Chloé', prenom: 'Chloé', avg: 16.4 },
        { nom: 'Lambert Arthur', prenom: 'Arthur', avg: 11.0 }, { nom: 'Simon Zoé', prenom: 'Zoé', avg: 13.7 },
        { nom: 'Leclerc Sacha', prenom: 'Sacha', avg: 15.9 }, { nom: 'Garnier Maëlys', prenom: 'Maëlys', avg: 10.5 },
        { nom: 'Guérin Nolan', prenom: 'Nolan', avg: 14.3 }, { nom: 'Boyer Lola', prenom: 'Lola', avg: 17.0 },
        { nom: 'Gauthier Paul', prenom: 'Paul', avg: 12.8 }, { nom: 'Roux Alicia', prenom: 'Alicia', avg: 13.5 },
        { nom: 'Picard Noah', prenom: 'Noah', avg: 15.2 }, { nom: 'Brun Inaya', prenom: 'Inaya', avg: 11.6 },
        { nom: 'Schmitt Léo', prenom: 'Léo', avg: 14.9 },
      ]
    },
    '6C': {
      nom: '6ème C', niveau: '6', eleves: [
        { nom: 'Olivier Tom', prenom: 'Tom', avg: 13.8 }, { nom: 'Martinez Lucie', prenom: 'Lucie', avg: 16.0 },
        { nom: 'David Ethan', prenom: 'Ethan', avg: 11.5 }, { nom: 'Lefèvre Anaëlle', prenom: 'Anaëlle', avg: 14.4 },
        { nom: 'Vincent Kilian', prenom: 'Kilian', avg: 15.3 }, { nom: 'Morel Roxane', prenom: 'Roxane', avg: 12.7 },
        { nom: 'Colin Mathis', prenom: 'Mathis', avg: 10.8 }, { nom: 'Renaud Amélie', prenom: 'Amélie', avg: 16.9 },
        { nom: 'Faure Charlie', prenom: 'Charlie', avg: 13.1 }, { nom: 'André Titouan', prenom: 'Titouan', avg: 15.8 },
        { nom: 'Mercier Léonie', prenom: 'Léonie', avg: 14.0 }, { nom: 'Chevalier Noa', prenom: 'Noa', avg: 12.5 },
        { nom: 'Muller Adèle', prenom: 'Adèle', avg: 17.1 }, { nom: 'Henry Théodore', prenom: 'Théodore', avg: 11.2 },
        { nom: 'Bonnet Romane', prenom: 'Romane', avg: 13.9 },
      ]
    },
    '6D': {
      nom: '6ème D', niveau: '6', eleves: [
        { nom: 'Neveu Angèle', prenom: 'Angèle', avg: 14.7 }, { nom: 'Pasquier Rémi', prenom: 'Rémi', avg: 13.3 },
        { nom: 'Girard Yasmine', prenom: 'Yasmine', avg: 15.1 }, { nom: 'Perrin Loïc', prenom: 'Loïc', avg: 12.0 },
        { nom: 'Morin Elsa', prenom: 'Elsa', avg: 16.5 }, { nom: 'Charpentier Lou', prenom: 'Lou', avg: 11.7 },
        { nom: 'Vasseur Mattéo', prenom: 'Mattéo', avg: 14.8 }, { nom: 'Joubert Célia', prenom: 'Célia', avg: 15.4 },
        { nom: 'Carpentier Yann', prenom: 'Yann', avg: 10.6 }, { nom: 'Ferrand Amélia', prenom: 'Amélia', avg: 16.3 },
        { nom: 'Breton Raphaël', prenom: 'Raphaël', avg: 13.6 }, { nom: 'Collet Clémence', prenom: 'Clémence', avg: 14.1 },
        { nom: 'Lemaire Florian', prenom: 'Florian', avg: 11.9 }, { nom: 'Renard Estelle', prenom: 'Estelle', avg: 15.7 },
        { nom: 'Dupont Lina', prenom: 'Lina', avg: 12.4 },
      ]
    },

    /* ──── 5ème ──── */
    '5A': {
      nom: '5ème A', niveau: '5', eleves: [
        { nom: 'Faure Baptiste', prenom: 'Baptiste', avg: 13.4 }, { nom: 'André Camille', prenom: 'Camille', avg: 15.2 },
        { nom: 'Mercier Romain', prenom: 'Romain', avg: 12.1 }, { nom: 'Fontaine Lisa', prenom: 'Lisa', avg: 16.3 },
        { nom: 'Chevalier Nathan', prenom: 'Nathan', avg: 14.8 }, { nom: 'Muller Alice', prenom: 'Alice', avg: 11.7 },
        { nom: 'Henry Louis', prenom: 'Louis', avg: 13.9 }, { nom: 'Aubert Nina', prenom: 'Nina', avg: 15.6 },
        { nom: 'Girard Pierre', prenom: 'Pierre', avg: 10.5 }, { nom: 'Bonnet Sarah', prenom: 'Sarah', avg: 17.2 },
        { nom: 'Tissot Camille', prenom: 'Camille', avg: 14.0 }, { nom: 'Poncet Adrien', prenom: 'Adrien', avg: 12.6 },
        { nom: 'Roussel Océane', prenom: 'Océane', avg: 15.8 }, { nom: 'Masson Kevin', prenom: 'Kevin', avg: 11.3 },
        { nom: 'Legros Inès', prenom: 'Inès', avg: 14.5 },
      ]
    },
    '5B': {
      nom: '5ème B', niveau: '5', eleves: [
        { nom: 'Morel Jade', prenom: 'Jade', avg: 14.1 }, { nom: 'Colin Axel', prenom: 'Axel', avg: 16.0 },
        { nom: 'Renaud Eva', prenom: 'Eva', avg: 13.6 }, { nom: 'Simon Paul', prenom: 'Paul', avg: 11.8 },
        { nom: 'Leclerc Zoé', prenom: 'Zoé', avg: 14.7 }, { nom: 'Lambert Hugo', prenom: 'Hugo', avg: 15.3 },
        { nom: 'Vallet Noémie', prenom: 'Noémie', avg: 12.4 }, { nom: 'Jacquet Théo', prenom: 'Théo', avg: 16.8 },
        { nom: 'Bourgeois Lea', prenom: 'Léa', avg: 10.9 }, { nom: 'Besse Yannick', prenom: 'Yannick', avg: 14.2 },
        { nom: 'Noël Juliette', prenom: 'Juliette', avg: 15.7 }, { nom: 'Meyer Damien', prenom: 'Damien', avg: 13.0 },
        { nom: 'Lebrun Alicia', prenom: 'Alicia', avg: 11.5 }, { nom: 'Grandjean Axel', prenom: 'Axel', avg: 16.2 },
        { nom: 'Hardy Maëva', prenom: 'Maëva', avg: 12.9 },
      ]
    },
    '5C': {
      nom: '5ème C', niveau: '5', eleves: [
        { nom: 'Guérin Manon', prenom: 'Manon', avg: 15.0 }, { nom: 'Boyer Enzo', prenom: 'Enzo', avg: 13.5 },
        { nom: 'Gauthier Maëlys', prenom: 'Maëlys', avg: 11.2 }, { nom: 'Picard Noah', prenom: 'Noah', avg: 14.6 },
        { nom: 'Brun Inaya', prenom: 'Inaya', avg: 16.1 }, { nom: 'Schmitt Mathis', prenom: 'Mathis', avg: 12.8 },
        { nom: 'Lavigne Corentin', prenom: 'Corentin', avg: 13.9 }, { nom: 'Caron Hortense', prenom: 'Hortense', avg: 15.4 },
        { nom: 'Poulain Rémi', prenom: 'Rémi', avg: 10.7 }, { nom: 'Lecomte Pauline', prenom: 'Pauline', avg: 16.5 },
        { nom: 'Tessier Bastien', prenom: 'Bastien', avg: 13.2 }, { nom: 'Bruneau Célia', prenom: 'Célia', avg: 14.8 },
        { nom: 'Tanguy Eliot', prenom: 'Eliot', avg: 11.6 }, { nom: 'Delorme Chiara', prenom: 'Chiara', avg: 15.9 },
        { nom: 'Vidal Alexis', prenom: 'Alexis', avg: 12.3 },
      ]
    },
    '5D': {
      nom: '5ème D', niveau: '5', eleves: [
        { nom: 'Neveu Clémence', prenom: 'Clémence', avg: 14.3 }, { nom: 'Pasquier Tom', prenom: 'Tom', avg: 15.6 },
        { nom: 'Moulin Lola', prenom: 'Lola', avg: 12.0 }, { nom: 'Perrot Quentin', prenom: 'Quentin', avg: 16.7 },
        { nom: 'Benoist Mia', prenom: 'Mia', avg: 11.8 }, { nom: 'Lagrange Arthur', prenom: 'Arthur', avg: 13.7 },
        { nom: 'Dupuis Elodie', prenom: 'Elodie', avg: 15.1 }, { nom: 'Ferron Killian', prenom: 'Killian', avg: 12.5 },
        { nom: 'Bertrand Agathe', prenom: 'Agathe', avg: 14.9 }, { nom: 'Nicolet Cyril', prenom: 'Cyril', avg: 11.0 },
        { nom: 'Arnoux Noémie', prenom: 'Noémie', avg: 16.4 }, { nom: 'Bouchet Edouard', prenom: 'Edouard', avg: 13.8 },
        { nom: 'Collin Ambre', prenom: 'Ambre', avg: 15.3 }, { nom: 'Ricard Dylan', prenom: 'Dylan', avg: 10.5 },
        { nom: 'Lefebvre Emma', prenom: 'Emma', avg: 14.6 },
      ]
    },

    /* ──── 4ème ──── */
    '4A': {
      nom: '4ème A', niveau: '4', eleves: [
        { nom: 'Vincent Théo', prenom: 'Théo', avg: 12.8 }, { nom: 'Morel Jade', prenom: 'Jade', avg: 14.1 },
        { nom: 'Colin Axel', prenom: 'Axel', avg: 16.0 }, { nom: 'Renaud Eva', prenom: 'Eva', avg: 13.6 },
        { nom: 'Simon Paul', prenom: 'Paul', avg: 11.8 }, { nom: 'Leclerc Zoé', prenom: 'Zoé', avg: 14.7 },
        { nom: 'Garnier Lucas', prenom: 'Lucas', avg: 15.4 }, { nom: 'Guérin Manon', prenom: 'Manon', avg: 10.9 },
        { nom: 'Boyer Enzo', prenom: 'Enzo', avg: 13.2 }, { nom: 'Gauthier Maëlys', prenom: 'Maëlys', avg: 16.3 },
        { nom: 'Tissot Ambre', prenom: 'Ambre', avg: 12.5 }, { nom: 'Pons Yanis', prenom: 'Yanis', avg: 14.8 },
        { nom: 'Ferraro Léana', prenom: 'Léana', avg: 15.7 }, { nom: 'Deshayes Florian', prenom: 'Florian', avg: 11.4 },
        { nom: 'Bouchard Nora', prenom: 'Nora', avg: 13.9 },
      ]
    },
    '4B': {
      nom: '4ème B', niveau: '4', eleves: [
        { nom: 'Lefebvre Martin', prenom: 'Martin', avg: 14.2 }, { nom: 'Durand Léa', prenom: 'Léa', avg: 13.9 },
        { nom: 'Moreau Antoine', prenom: 'Antoine', avg: 10.2 }, { nom: 'Chen Yuki', prenom: 'Yuki', avg: 17.1 },
        { nom: 'Bernard Emma', prenom: 'Emma', avg: 16.4 }, { nom: 'Petit Julien', prenom: 'Julien', avg: 12.7 },
        { nom: 'Rousseau Clara', prenom: 'Clara', avg: 14.5 }, { nom: 'Blanc Hugo', prenom: 'Hugo', avg: 9.8 },
        { nom: 'Garcia Inès', prenom: 'Inès', avg: 15.1 }, { nom: 'Robin Maxime', prenom: 'Maxime', avg: 13.3 },
        { nom: 'Lambert Chloé', prenom: 'Chloé', avg: 16.9 }, { nom: 'Simon Paul', prenom: 'Paul', avg: 11.8 },
        { nom: 'Leclerc Zoé', prenom: 'Zoé', avg: 14.7 }, { nom: 'Martin Thomas', prenom: 'Thomas', avg: 11.5 },
        { nom: 'Benali Sofia', prenom: 'Sofia', avg: 15.8 },
      ]
    },
    '4C': {
      nom: '4ème C', niveau: '4', eleves: [
        { nom: 'Faure Baptiste', prenom: 'Baptiste', avg: 13.4 }, { nom: 'André Camille', prenom: 'Camille', avg: 15.2 },
        { nom: 'Mercier Romain', prenom: 'Romain', avg: 12.1 }, { nom: 'Fontaine Lisa', prenom: 'Lisa', avg: 16.3 },
        { nom: 'Chevalier Nathan', prenom: 'Nathan', avg: 14.8 }, { nom: 'Muller Alice', prenom: 'Alice', avg: 11.7 },
        { nom: 'Henry Louis', prenom: 'Louis', avg: 13.9 }, { nom: 'Aubert Nina', prenom: 'Nina', avg: 15.6 },
        { nom: 'Girard Pierre', prenom: 'Pierre', avg: 10.5 }, { nom: 'Bonnet Sarah', prenom: 'Sarah', avg: 17.2 },
        { nom: 'Morel Jade', prenom: 'Jade', avg: 14.1 }, { nom: 'Colin Axel', prenom: 'Axel', avg: 16.0 },
        { nom: 'Renaud Eva', prenom: 'Eva', avg: 13.6 }, { nom: 'Jacquet Léo', prenom: 'Léo', avg: 12.3 },
        { nom: 'Morand Elisa', prenom: 'Elisa', avg: 15.0 },
      ]
    },
    '4D': {
      nom: '4ème D', niveau: '4', eleves: [
        { nom: 'Moulin Arthur', prenom: 'Arthur', avg: 14.0 }, { nom: 'Perrot Lola', prenom: 'Lola', avg: 13.5 },
        { nom: 'Benoist Rémi', prenom: 'Rémi', avg: 15.8 }, { nom: 'Lagrange Clémence', prenom: 'Clémence', avg: 11.3 },
        { nom: 'Dupuis Tom', prenom: 'Tom', avg: 16.2 }, { nom: 'Ferron Alicia', prenom: 'Alicia', avg: 12.7 },
        { nom: 'Bertrand Noa', prenom: 'Noa', avg: 14.5 }, { nom: 'Nicolet Mathis', prenom: 'Mathis', avg: 10.8 },
        { nom: 'Arnoux Jade', prenom: 'Jade', avg: 15.3 }, { nom: 'Bouchet Lina', prenom: 'Lina', avg: 13.1 },
        { nom: 'Collin Sacha', prenom: 'Sacha', avg: 16.6 }, { nom: 'Ricard Éléonore', prenom: 'Éléonore', avg: 12.4 },
        { nom: 'Lefèvre Axel', prenom: 'Axel', avg: 14.9 }, { nom: 'Vallet Coralie', prenom: 'Coralie', avg: 11.6 },
        { nom: 'Jacquet Romain', prenom: 'Romain', avg: 15.1 },
      ]
    },

    /* ──── 3ème ──── */
    '3A': {
      nom: '3ème A', niveau: '3', eleves: [
        { nom: 'Benali Sofia', prenom: 'Sofia', avg: 15.8 }, { nom: 'Roux Tom', prenom: 'Tom', avg: 13.0 },
        { nom: 'Nicolas Lucie', prenom: 'Lucie', avg: 14.9 }, { nom: 'Perrin Ethan', prenom: 'Ethan', avg: 17.5 },
        { nom: 'Morin Anaëlle', prenom: 'Anaëlle', avg: 12.3 }, { nom: 'Picard Kilian', prenom: 'Kilian', avg: 10.9 },
        { nom: 'Brun Inaya', prenom: 'Inaya', avg: 15.7 }, { nom: 'Schmitt Mathis', prenom: 'Mathis', avg: 13.8 },
        { nom: 'Olivier Roxane', prenom: 'Roxane', avg: 16.2 }, { nom: 'Martinez Killian', prenom: 'Killian', avg: 9.5 },
        { nom: 'David Amélie', prenom: 'Amélie', avg: 14.3 }, { nom: 'Lefèvre Charlie', prenom: 'Charlie', avg: 13.2 },
        { nom: 'Dumont Raphaël', prenom: 'Raphaël', avg: 15.6 }, { nom: 'Peinture Chloé', prenom: 'Chloé', avg: 11.8 },
        { nom: 'Garros Antoine', prenom: 'Antoine', avg: 14.7 },
      ]
    },
    '3B': {
      nom: '3ème B', niveau: '3', eleves: [
        { nom: 'Brun Inaya', prenom: 'Inaya', avg: 14.0 }, { nom: 'Schmitt Mathis', prenom: 'Mathis', avg: 12.5 },
        { nom: 'Olivier Roxane', prenom: 'Roxane', avg: 15.3 }, { nom: 'Martinez Killian', prenom: 'Killian', avg: 11.0 },
        { nom: 'David Amélie', prenom: 'Amélie', avg: 16.4 }, { nom: 'Lefèvre Charlie', prenom: 'Charlie', avg: 13.7 },
        { nom: 'Moulin Lola', prenom: 'Lola', avg: 14.9 }, { nom: 'Perrot Quentin', prenom: 'Quentin', avg: 10.3 },
        { nom: 'Benoist Mia', prenom: 'Mia', avg: 15.6 }, { nom: 'Lagrange Arthur', prenom: 'Arthur', avg: 12.8 },
        { nom: 'Dupuis Elodie', prenom: 'Elodie', avg: 17.0 }, { nom: 'Ferron Killian', prenom: 'Killian', avg: 13.5 },
        { nom: 'Bertrand Agathe', prenom: 'Agathe', avg: 14.2 }, { nom: 'Nicolet Cyril', prenom: 'Cyril', avg: 11.4 },
        { nom: 'Arnoux Noémie', prenom: 'Noémie', avg: 16.1 },
      ]
    },
    '3C': {
      nom: '3ème C', niveau: '3', eleves: [
        { nom: 'Collin Ambre', prenom: 'Ambre', avg: 13.8 }, { nom: 'Ricard Dylan', prenom: 'Dylan', avg: 15.2 },
        { nom: 'Lefebvre Emma', prenom: 'Emma', avg: 12.6 }, { nom: 'Neveu Clémence', prenom: 'Clémence', avg: 14.7 },
        { nom: 'Pasquier Tom', prenom: 'Tom', avg: 16.0 }, { nom: 'Moulin Lola', prenom: 'Lola', avg: 11.5 },
        { nom: 'Perrot Quentin', prenom: 'Quentin', avg: 13.3 }, { nom: 'Benoist Mia', prenom: 'Mia', avg: 15.9 },
        { nom: 'Lagrange Arthur', prenom: 'Arthur', avg: 12.1 }, { nom: 'Dupuis Elodie', prenom: 'Elodie', avg: 14.5 },
        { nom: 'Ferron Killian', prenom: 'Killian', avg: 16.8 }, { nom: 'Bertrand Agathe', prenom: 'Agathe', avg: 10.7 },
        { nom: 'Nicolet Cyril', prenom: 'Cyril', avg: 13.9 }, { nom: 'Arnoux Noémie', prenom: 'Noémie', avg: 15.4 },
        { nom: 'Bouchet Edouard', prenom: 'Edouard', avg: 11.9 },
      ]
    },
    '3D': {
      nom: '3ème D', niveau: '3', eleves: [
        { nom: 'Tissot Camille', prenom: 'Camille', avg: 14.6 }, { nom: 'Poncet Adrien', prenom: 'Adrien', avg: 13.1 },
        { nom: 'Roussel Océane', prenom: 'Océane', avg: 16.3 }, { nom: 'Masson Kevin', prenom: 'Kevin', avg: 11.7 },
        { nom: 'Legros Inès', prenom: 'Inès', avg: 15.0 }, { nom: 'Vallet Noémie', prenom: 'Noémie', avg: 12.4 },
        { nom: 'Jacquet Théo', prenom: 'Théo', avg: 14.3 }, { nom: 'Bourgeois Léa', prenom: 'Léa', avg: 16.7 },
        { nom: 'Besse Yannick', prenom: 'Yannick', avg: 10.8 }, { nom: 'Noël Juliette', prenom: 'Juliette', avg: 15.5 },
        { nom: 'Meyer Damien', prenom: 'Damien', avg: 13.6 }, { nom: 'Lebrun Alicia', prenom: 'Alicia', avg: 14.9 },
        { nom: 'Grandjean Axel', prenom: 'Axel', avg: 12.0 }, { nom: 'Hardy Maëva', prenom: 'Maëva', avg: 15.8 },
        { nom: 'Lavigne Corentin', prenom: 'Corentin', avg: 11.2 },
      ]
    },
  },

  /* ── PLANNING PROF ── */
  planningProf: {
    prof1: {
      Lundi: [
        { heure: '08h00 – 09h00', classe: '6ème A', salle: 'C12', couleur: 'mat-maths' },
        { heure: '09h00 – 10h00', classe: '4ème B', salle: 'C12', couleur: 'mat-maths' },
        { heure: '10h15 – 11h15', classe: '5ème A', salle: 'C12', couleur: 'mat-maths' },
        { heure: '11h15 – 12h15', classe: '3ème A', salle: 'C10', couleur: 'mat-maths' },
        { heure: '14h00 – 15h00', classe: '4ème C', salle: 'C12', couleur: 'mat-maths' },
        { heure: '15h00 – 16h00', classe: '6ème B', salle: 'C12', couleur: 'mat-maths' },
      ],
      Mardi: [
        { heure: '08h00 – 09h00', classe: '5ème B', salle: 'C12', couleur: 'mat-maths' },
        { heure: '09h00 – 10h00', classe: '3ème B', salle: 'C10', couleur: 'mat-maths' },
        { heure: '10h15 – 11h15', classe: '6ème C', salle: 'C12', couleur: 'mat-maths' },
        { heure: '14h00 – 15h00', classe: '4ème D', salle: 'C12', couleur: 'mat-maths' },
        { heure: '15h00 – 16h00', classe: '5ème C', salle: 'C12', couleur: 'mat-maths' },
      ],
      Mercredi: [
        { heure: '08h00 – 09h00', classe: '6ème D', salle: 'C12', couleur: 'mat-maths' },
        { heure: '09h00 – 10h00', classe: '3ème C', salle: 'C10', couleur: 'mat-maths' },
        { heure: '10h15 – 11h15', classe: '4ème A', salle: 'C12', couleur: 'mat-maths' },
      ],
      Jeudi: [
        { heure: '08h00 – 09h00', classe: '5ème D', salle: 'C12', couleur: 'mat-maths' },
        { heure: '09h00 – 10h00', classe: '3ème D', salle: 'C10', couleur: 'mat-maths' },
        { heure: '10h15 – 11h15', classe: '6ème A', salle: 'C12', couleur: 'mat-maths' },
        { heure: '11h15 – 12h15', classe: '4ème B', salle: 'C12', couleur: 'mat-maths' },
        { heure: '14h00 – 15h00', classe: '5ème A', salle: 'C12', couleur: 'mat-maths' },
        { heure: '15h00 – 16h00', classe: '3ème A', salle: 'C10', couleur: 'mat-maths' },
      ],
      Vendredi: [
        { heure: '08h00 – 09h00', classe: '6ème B', salle: 'C12', couleur: 'mat-maths' },
        { heure: '09h00 – 10h00', classe: '5ème B', salle: 'C12', couleur: 'mat-maths' },
        { heure: '10h15 – 11h15', classe: '3ème B', salle: 'C10', couleur: 'mat-maths' },
        { heure: '14h00 – 15h00', classe: '4ème C', salle: 'C12', couleur: 'mat-maths' },
        { heure: '15h00 – 16h00', classe: '6ème C', salle: 'C12', couleur: 'mat-maths' },
      ],
    },
  },

  /* ── DEVOIRS PROF ── */
  devoirsProf: {
    prof1: [
      { id: 1, classe: '4ème B', matiere: 'Mathématiques', titre: 'Exercices p.87 n°5 à 12', dateRendu: '24/03/2026' },
      { id: 2, classe: '4ème C', matiere: 'Mathématiques', titre: 'Interro : Triangles', dateRendu: '25/03/2026' },
      { id: 3, classe: '3ème A', matiere: 'Mathématiques', titre: 'Problème Pythagore', dateRendu: '26/03/2026' },
    ],
  },

  /* ── ACTIVITÉ PROF ── */
  activite: {
    prof1: [
      { texte: 'Notes saisies — 4ème B (DS n°2)', heure: "Aujourd'hui 11h42", couleur: '#10B981' },
      { texte: 'Devoir ajouté — 4ème C (Interro)', heure: "Aujourd'hui 09h15", couleur: '#3B82F6' },
      { texte: 'Appel validé — 4ème B (08h00)', heure: "Aujourd'hui 08h05", couleur: '#6366F1' },
      { texte: 'Message envoyé à Martin Lefebvre', heure: 'Hier 17h30', couleur: '#F59E0B' },
    ],
  },
};

/* ════════════════════════════════════════════════════════
   AUTHENTIFICATION
   ⚠️  Auth est délégué aux API backend — voir api.js
   Les fonctions ci-dessous sont gardées pour compatibilité
   avec le reste du code mais ne font plus de vérif de mdp
════════════════════════════════════════════════════════ */
const Auth = {
  find(username) {
    const lower = username.toLowerCase();
    if (DB.users[lower]) return DB.users[lower];
    return Object.values(DB.users).find(u => {
      if (!u.dateNaissance) return false;
      const [jour, mois, annee] = u.dateNaissance.split('/');
      const cle = `${u.nom.toLowerCase()}.${u.prenom.toLowerCase()}.${jour}${mois}${annee}`;
      return cle === lower;
    }) || null;
  },

  /* Retourne tous les users (ou filtrés par rôle) */
  getAll(role = null) {
    const all = Object.values(DB.users);
    return role ? all.filter(u => u.role === role) : all;
  },
};

/* ════════════════════════════════════════════════════════
   DEMANDES DE COMPTE
   ⚠️  Délégué aux API backend — voir api.js
   Ce bloc est gardé pour compatibilité uniquement
════════════════════════════════════════════════════════ */
const Demandes = {
  /* Récupère toutes les demandes (avec filtre optionnel) */
  async getAll(statut = null) {
    const url = statut && statut !== 'toutes' ? `?statut=${statut}` : '';
    const data = await apiFetch('/demandes' + url);
    return data.demandes || [];
  },

  /* Approuve une demande par son id */
  async approuver(id) {
    return await apiFetch(`/demandes/${id}/approuver`, 'PUT');
  },

  /* Refuse une demande par son id */
  async refuser(id, commentaire = '') {
    return await apiFetch(`/demandes/${id}/refuser`, 'PUT', { commentaire });
  },

  /* Nombre de demandes en attente */
  async nbEnAttente() {
    const demandes = await this.getAll('en_attente');
    return demandes.length;
  },
};

/* ════════════════════════════════════════════════════════
   UTILITAIRE
════════════════════════════════════════════════════════ */
function getEmploiEleve(user) {
  const classe = user?.classe || '4ème B';
  return DB.emploiDuTemps[classe] || DB.emploiDuTemps['4ème B'];
}