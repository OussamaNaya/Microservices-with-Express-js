const express = require('express');
const { Kafka } = require('kafkajs');
const app = express();

// Middleware pour lire le JSON dans les requêtes POST
app.use(express.json());

// ============================================================
// CONFIGURATION KAFKA (Producer)
// ============================================================
const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['localhost:9092'], // Adresse du broker Kafka
});

const producer = kafka.producer();
const admin = kafka.admin();

const initKafka = async () => {
    try {
        // 🛠️ Créer le topic explicitement s'il n'existe pas
        await admin.connect();
        await admin.createTopics({
            topics: [{ topic: 'user-created', numPartitions: 1 }],
        });
        await admin.disconnect();
        console.log('✅ Kafka Topic "user-created" vérifié/créé');

        await producer.connect();
        console.log('✅ Kafka Producer connecté');
    } catch (error) {
        console.error('❌ Erreur Kafka Producer/Admin:', error.message);
    }
};

initKafka();

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

// GET /users/:id → retourne UN utilisateur par son id
// (utilisé par order-service pour enrichir les commandes)
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: `Utilisateur #${req.params.id} introuvable.`,
        });
    }

    res.status(200).json(user);
});


// POST /users → ajoute un utilisateur
// Body attendu : { "name": "...", "email": "..." }
app.post('/users', async (req, res) => {
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

    // 📣 ÉVÉNEMENT KAFKA : On publie la création de l'utilisateur
    try {
        await producer.send({
            topic: 'user-created',
            messages: [
                { value: JSON.stringify(newUser) },
            ],
        });
        console.log(`📣 Événement 'user-created' envoyé pour : ${newUser.name}`);
    } catch (error) {
        console.error('❌ Impossible d\'envoyer l\'événement Kafka:', error.message);
    }

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
