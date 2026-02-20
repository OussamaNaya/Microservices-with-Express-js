// ============================================================
// USER SERVICE – Port 3001
// Gère les utilisateurs (stockage en mémoire, pas de base de données)
// ============================================================

const express = require('express');
const app = express();

// Middleware pour lire le JSON dans les requêtes POST
app.use(express.json());

// ---- Base de données simulée en mémoire ----
let users = [
    { id: 1, name: 'Alice Dupont', email: 'alice@mail.com' },
    { id: 2, name: 'Bob Martin', email: 'bob@mail.com' },
];

// ---- Routes ----

// GET /users → retourne tous les utilisateurs
app.get('/users', (req, res) => {
    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});

// POST /users → ajoute un utilisateur
// Body attendu : { "name": "...", "email": "..." }
app.post('/users', (req, res) => {
    const { name, email } = req.body;

    // Validation simple
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: 'Les champs "name" et "email" sont obligatoires.',
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
    };

    users.push(newUser);

    res.status(201).json({
        success: true,
        message: 'Utilisateur ajouté avec succès.',
        data: newUser,
    });
});

// ---- Démarrage du serveur ----
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ user-service démarré sur http://localhost:${PORT}`);
});
