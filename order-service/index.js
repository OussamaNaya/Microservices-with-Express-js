const express = require('express');
const { Kafka } = require('kafkajs');
const app = express();
app.use(express.json());

// ============================================================
// CONFIGURATION KAFKA (Consumer)
// ============================================================
const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'order-group' });

// ---- Cache local des utilisateurs (alimenté par Kafka) ----
let users = [
    { id: 1, name: 'Alice Dupont', email: 'alice@mail.com' },
    { id: 2, name: 'Bob Martin', email: 'bob@mail.com' },
];

const initKafka = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'user-created', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const newUser = JSON.parse(message.value.toString());
                console.log(`📥 Kafka: Nouvel utilisateur reçu : ${newUser.name}`);

                // Mettre à jour le cache local s'il n'existe pas déjà
                if (!users.find(u => u.id === newUser.id)) {
                    users.push(newUser);
                }
            },
        });
        console.log('✅ Kafka Consumer connecté et écoute le topic "user-created"');
    } catch (error) {
        console.error('❌ Erreur Kafka Consumer:', error.message);
    }
};

initKafka();

// ---- Base de données simulée en mémoire pour les commandes ----
const orders = [
    { id: 101, userId: 1, product: 'Laptop', quantity: 1, price: 1200 },
    { id: 102, userId: 2, product: 'Phone', quantity: 2, price: 599 },
    { id: 103, userId: 1, product: 'Clavier mécanique', quantity: 1, price: 89 },
];

// ============================================================
// GET /orders → retourne toutes les commandes
// ============================================================
app.get('/orders', (req, res) => {
    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
    });
});

// ============================================================
// GET /orders/:id → retourne UNE commande + infos de l'utilisateur
//
// 🚀 ARCHITECTURE ÉVÉNEMENTIELLE :
//    On n'utilise plus Axios ! On regarde dans notre CACHE LOCAL 'users'
//    qui est maintenu à jour par Kafka.
// ============================================================
app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id == req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: `Commande #${req.params.id} introuvable.`,
        });
    }

    // On cherche l'utilisateur dans le cache local (plus d'appel HTTP !)
    const user = users.find(u => u.id === order.userId);

    res.status(200).json({
        success: true,
        data: {
            orderId: order.id,
            product: order.product,
            quantity: order.quantity,
            price: order.price,
            user: user ? {
                id: user.id,
                name: user.name,
                email: user.email,
            } : 'Utilisateur inconnu (en attente de synchronisation Kafka)',
        },
    });
});

// ============================================================
// POST /orders → ajoute une commande
// ============================================================
app.post('/orders', (req, res) => {
    const { userId, product, quantity, price } = req.body;

    if (!userId || !product || !quantity || !price) {
        return res.status(400).json({
            success: false,
            message: 'Champs requis : userId, product, quantity, price.',
        });
    }

    // Vérifier l'utilisateur dans le cache local
    const userExists = users.find(u => u.id == userId);
    if (!userExists) {
        return res.status(404).json({
            success: false,
            message: `Utilisateur #${userId} introuvable dans le cache local. Commande impossible.`,
        });
    }

    const newOrder = {
        id: 100 + orders.length + 1,
        userId: Number(userId),
        product,
        quantity: Number(quantity),
        price: Number(price),
    };

    orders.push(newOrder);

    res.status(201).json({
        success: true,
        message: 'Commande créée avec succès (via cache local Kafka).',
        data: newOrder,
    });
});

// ---- Démarrage du serveur ----
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`✅ order-service démarré sur http://localhost:${PORT}`);
    console.log(`   → utilise Kafka pour synchroniser les utilisateurs`);
});
