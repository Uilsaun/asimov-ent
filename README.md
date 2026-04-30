# asimov-ent

This project contains the ENT platform developed for Asimov College, designed to provide a dedicated and exclusive digital environment. Access is restricted to users registered by the college administration. The interface replicates a modern and well-known ENT to ensure a familiar and intuitive experience.

This project is used in the BTS SIO program at Louise Michel Grenoble as part of the E6 exams.

> 🎓 BTS SIO project — Lycée Louise Michel, Grenoble

---

## Features

- **Authentication** — login and registration with password hashing (bcrypt)
- **User management** — create, read, update and delete users
- **Student management** — manage pre-enrolled students (`ElevePreinscrit`)
- **Request management** — handle school requests (`Demande`)
- **Error handling** — centralized error middleware
- **UML diagram** — use case diagram (draw.io)

---

## Tech Stack

| Component    | Technology           |
|--------------|----------------------|
| Language     | JavaScript (Node.js) |
| Framework    | Express.js           |
| Architecture | MVC                  |
| Database     | MySQL (local)        |
| Auth         | bcrypt               |
| Config       | dotenv               |
| Dev tool     | nodemon              |

---

## Project Structure

```
College-asimov-V2/
├── controllers/
│   ├── Authcontroller.js         # Login & registration
│   ├── Demandecontroller.js      # Demande (request) logic
│   └── Usercontroller.js         # User CRUD logic
├── db/
│   ├── asimov.sql                # Database schema
│   └── connection.js             # MySQL connection
├── diagramme UML/
│   └── diagramme_cas_utilisation.drawio
├── middleware/
│   └── errorHandler.js           # Global error handler
├── models/
│   ├── DemandeModel.js
│   ├── Elevepreinscritmodel.js
│   └── UserModel.js
├── routes/                       # Express routes
├── .env                          # Environment variables
├── .gitignore
├── api.js                        # Express app entry point
├── config.js
├── package.json
└── package-lock.json
```

---

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/) v18+
- MySQL (local)
- Visual Studio Code

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Uilsaun/College-asimov-V2.git
   cd College-asimov-V2
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure the `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=asimov_ent
   PORT=3000
   ```

5. Start command 
   ```
   cd .\api\
   npm run desktop
   ```
---

## Demo Accounts
 
> ⚠️ These are fictional accounts for demonstration purposes only.
 
### Students
 
| Username | Password | Name | Class |
|---|---|---|---|
| `lefebvre.martin.12032011` | *auto* | Martin Lefebvre | 4ème B |
| `benali.sofia.07092010` | *auto* | Sofia Benali | 3ème A |
| `lefebvre.emma.05112013` | *auto* | Emma Lefebvre | 6ème A |
 
### Parents
 
| Username | Password | Name | Children |
|---|---|---|---|
| `parent1` | `parent123` | Sophie Lefebvre | Martin & Emma |
| `parent2` | `parent456` | Karim Benali | Sofia |
 
### Teachers
 
| Username | Password | Name | Subject |
|---|---|---|---|
| `prof1` | `prof123` | Pierre Dupont | Mathématiques |
| `prof2` | `prof456` | Marie Laurent | Français |
 
### Administration
 
| Username | Password | Name | Role |
|---|---|---|---|
| `principal1` | `admin123` | Isabelle Benoît | Direction |
| `cpe1` | `cpe123` | Romain Vidal | CPE |
| `secretaire1` | `sec123` | Nathalie Morin | Secrétariat |
 
---
 
## Authors
 
BTS SIO students — Lycée Louise Michel, Grenoble