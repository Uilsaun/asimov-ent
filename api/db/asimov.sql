-- ═══════════════════════════════════════════════════════════
-- COLLÈGE ASIMOV V2 — Script MySQL complet
-- ═══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS asimov_ent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asimov_ent;

-- ─── TABLES DE RÉFÉRENCE ───────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS niveaux (
  id  INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS classes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  code      VARCHAR(10) NOT NULL UNIQUE,
  nom       VARCHAR(20) NOT NULL,
  niveau_id INT NOT NULL,
  FOREIGN KEY (niveau_id) REFERENCES niveaux(id)
);

CREATE TABLE IF NOT EXISTS matieres (
  id  INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS statuts (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS regimes (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(30) NOT NULL UNIQUE
);

-- ─── UTILISATEURS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id             VARCHAR(100) PRIMARY KEY,
  password_hash  VARCHAR(255) NOT NULL,
  role_id        INT NOT NULL,
  prenom         VARCHAR(50)  NOT NULL,
  nom            VARCHAR(50)  NOT NULL,
  avatar         VARCHAR(10),
  email          VARCHAR(100) UNIQUE,
  statut_id      INT NOT NULL DEFAULT 1,
  classe_id      INT,
  date_naissance VARCHAR(20),
  matiere_id     INT,
  poste          VARCHAR(100),
  regime_id      INT,
  tel            VARCHAR(20),
  annee_scolaire VARCHAR(10) DEFAULT '2025-2026',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id)    REFERENCES roles(id),
  FOREIGN KEY (statut_id)  REFERENCES statuts(id),
  FOREIGN KEY (classe_id)  REFERENCES classes(id),
  FOREIGN KEY (matiere_id) REFERENCES matieres(id),
  FOREIGN KEY (regime_id)  REFERENCES regimes(id)
);

-- ─── RELATIONS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS parent_eleves (
  parent_id VARCHAR(100) NOT NULL,
  eleve_id  VARCHAR(100) NOT NULL,
  lien      VARCHAR(20) DEFAULT 'parent',
  PRIMARY KEY (parent_id, eleve_id),
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (eleve_id)  REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS prof_classes (
  prof_id   VARCHAR(100) NOT NULL,
  classe_id INT NOT NULL,
  PRIMARY KEY (prof_id, classe_id),
  FOREIGN KEY (prof_id)   REFERENCES users(id),
  FOREIGN KEY (classe_id) REFERENCES classes(id)
);

-- ─── PÉDAGOGIE ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notes_matieres (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  eleve_id   VARCHAR(100) NOT NULL,
  matiere_id INT NOT NULL,
  moyenne    DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (eleve_id)   REFERENCES users(id),
  FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);

CREATE TABLE IF NOT EXISTS evaluations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  note_matiere_id INT NOT NULL,
  titre           VARCHAR(100) NOT NULL,
  note            DECIMAL(4,2) NOT NULL,
  sur             INT NOT NULL DEFAULT 20,
  date_eval       VARCHAR(20),
  FOREIGN KEY (note_matiere_id) REFERENCES notes_matieres(id)
);

CREATE TABLE IF NOT EXISTS devoirs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  eleve_id   VARCHAR(100) NOT NULL,
  matiere_id INT NOT NULL,
  titre      VARCHAR(200) NOT NULL,
  date_rendu VARCHAR(20),
  urgent     BOOLEAN NOT NULL DEFAULT FALSE,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  prof       VARCHAR(100),
  FOREIGN KEY (eleve_id)   REFERENCES users(id),
  FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);

CREATE TABLE IF NOT EXISTS planning_prof (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  prof_id   VARCHAR(100) NOT NULL,
  jour      ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
  heure     VARCHAR(30) NOT NULL,
  classe_id INT NOT NULL,
  salle     VARCHAR(20),
  FOREIGN KEY (prof_id)   REFERENCES users(id),
  FOREIGN KEY (classe_id) REFERENCES classes(id)
);

-- ─── VIE SCOLAIRE ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS absences (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  eleve_id   VARCHAR(100) NOT NULL,
  type       ENUM('abs','retard') NOT NULL,
  date_abs   VARCHAR(20) NOT NULL,
  detail     TEXT,
  statut     VARCHAR(30) NOT NULL DEFAULT 'En attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eleve_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  destinataire_id VARCHAR(100) NOT NULL,
  expediteur      VARCHAR(100) NOT NULL,
  sujet           VARCHAR(200) NOT NULL,
  corps           TEXT NOT NULL,
  lu              BOOLEAN NOT NULL DEFAULT FALSE,
  date_msg        VARCHAR(30),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destinataire_id) REFERENCES users(id)
);

-- ─── COMPTES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS eleves_preinscrits (
  cle            VARCHAR(100) PRIMARY KEY,
  prenom         VARCHAR(50) NOT NULL,
  nom            VARCHAR(50) NOT NULL,
  classe_id      INT NOT NULL,
  date_naissance VARCHAR(20) NOT NULL,
  annee_scolaire VARCHAR(10) DEFAULT '2025-2026',
  FOREIGN KEY (classe_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS demandes_compte (
  id              VARCHAR(50) PRIMARY KEY,
  cle             VARCHAR(100) NOT NULL,
  identifiant     VARCHAR(100) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  prenom          VARCHAR(50) NOT NULL,
  nom             VARCHAR(50) NOT NULL,
  classe_id       INT NOT NULL,
  date_naissance  VARCHAR(20) NOT NULL,
  date_demande    VARCHAR(30),
  statut          ENUM('en_attente','approuve','refuse') NOT NULL DEFAULT 'en_attente',
  commentaire     TEXT,
  date_traitement VARCHAR(30),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classe_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS menus_cantine (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  jour    VARCHAR(20) NOT NULL UNIQUE,
  entree  VARCHAR(100),
  plat    VARCHAR(100),
  dessert VARCHAR(100),
  veggie  VARCHAR(100)
);

-- ═══════════════════════════════════════════════════════════
-- DONNÉES DE RÉFÉRENCE
-- ═══════════════════════════════════════════════════════════

INSERT IGNORE INTO roles (libelle) VALUES
  ('eleve'),('professeur'),('principal'),('cpe'),('secretaire'),('parent');

INSERT IGNORE INTO niveaux (nom) VALUES ('6ème'),('5ème'),('4ème'),('3ème');

INSERT IGNORE INTO classes (code, nom, niveau_id) VALUES
  ('6A','6ème A',1),('6B','6ème B',1),('6C','6ème C',1),('6D','6ème D',1),
  ('5A','5ème A',2),('5B','5ème B',2),('5C','5ème C',2),('5D','5ème D',2),
  ('4A','4ème A',3),('4B','4ème B',3),('4C','4ème C',3),('4D','4ème D',3),
  ('3A','3ème A',4),('3B','3ème B',4),('3C','3ème C',4),('3D','3ème D',4);

INSERT IGNORE INTO matieres (nom) VALUES
  ('Mathématiques'),('Français'),('Histoire-Géo'),('SVT'),
  ('Anglais'),('Physique-Chimie'),('Espagnol LV2'),('EPS'),
  ('Arts Plastiques'),('Musique'),('Technologie'),('Latin');

INSERT IGNORE INTO statuts (libelle) VALUES ('actif'),('inactif');
INSERT IGNORE INTO regimes (libelle) VALUES ('externe'),('demi-pensionnaire'),('interne');

-- ═══════════════════════════════════════════════════════════
-- UTILISATEURS (password = placeholder, hashé par hash-passwords.js)
-- ═══════════════════════════════════════════════════════════

INSERT IGNORE INTO users (id, password_hash, role_id, prenom, nom, avatar, email, statut_id, matiere_id, poste) VALUES
  ('prof1',       'placeholder', 2, 'Pierre',   'Dupont',  'PD', 'p.dupont@asimov.edu',    1, 1, NULL),
  ('prof2',       'placeholder', 2, 'Marie',    'Laurent', 'ML', 'm.laurent@asimov.edu',   1, 2, NULL),
  ('principal1',  'placeholder', 3, 'Isabelle', 'Benoît',  'IB', 'direction@asimov.edu',   1, NULL, 'Chef d''établissement'),
  ('cpe1',        'placeholder', 4, 'Romain',   'Vidal',   'RV', 'cpe@asimov.edu',         1, NULL, 'Conseiller Principal d''Éducation'),
  ('secretaire1', 'placeholder', 5, 'Nathalie', 'Morin',   'NM', 'secretariat@asimov.edu', 1, NULL, 'Secrétaire de direction'),
  ('parent1',     'placeholder', 6, 'Sophie',   'Lefebvre','SL', 'lefebvre.parents@mail.fr',1, NULL, NULL),
  ('parent2',     'placeholder', 6, 'Karim',    'Benali',  'KB', 'benali.parents@mail.fr', 1, NULL, NULL);

INSERT IGNORE INTO users (id, password_hash, role_id, prenom, nom, avatar, email, statut_id, classe_id, date_naissance, regime_id) VALUES
  ('lefebvre.martin.12032011', 'placeholder', 1, 'Martin', 'Lefebvre', 'ML', 'lefebvre.martin.12032011@asimov.edu', 1, 10, '12/03/2011', 2),
  ('benali.sofia.07092010',    'placeholder', 1, 'Sofia',  'Benali',   'SB', 'benali.sofia.07092010@asimov.edu',    1, 13, '07/09/2010', 1),
  ('lefebvre.emma.05112013',   'placeholder', 1, 'Emma',   'Lefebvre', 'EL', 'lefebvre.emma.05112013@asimov.edu',   1,  1, '05/11/2013', 2);

INSERT IGNORE INTO parent_eleves (parent_id, eleve_id) VALUES
  ('parent1', 'lefebvre.martin.12032011'),
  ('parent1', 'lefebvre.emma.05112013'),
  ('parent2', 'benali.sofia.07092010');

INSERT IGNORE INTO prof_classes (prof_id, classe_id) VALUES
  ('prof1', 9),('prof1', 10),('prof1', 5),('prof1', 1),
  ('prof2', 9),('prof2', 10),('prof2', 5);

INSERT IGNORE INTO eleves_preinscrits (cle, prenom, nom, classe_id, date_naissance) VALUES
  ('lefebvre.martin.12032011', 'Martin', 'Lefebvre', 10, '12/03/2011'),
  ('benali.sofia.07092010',    'Sofia',  'Benali',   13, '07/09/2010'),
  ('lefebvre.emma.05112013',   'Emma',   'Lefebvre',  1, '05/11/2013');

INSERT IGNORE INTO menus_cantine (jour, entree, plat, dessert, veggie) VALUES
  ('Lundi',    'Salade niçoise',       'Poulet rôti & haricots verts', 'Yaourt nature',      'Gratin de légumes'),
  ('Mardi',    'Soupe de légumes',     'Saumon & riz pilaf',           'Compote de pommes',  'Quiche aux poireaux'),
  ('Mercredi', 'Crudités variées',     'Steak haché & pâtes',          'Fruit de saison',    'Omelette aux champignons'),
  ('Jeudi',    'Taboulé maison',       'Rôti de porc & pommes dauphine','Crème caramel',     'Lasagnes végétales'),
  ('Vendredi', 'Velouté de potimarron','Poisson pané & frites',         'Mousse au chocolat','Pizza margherita');