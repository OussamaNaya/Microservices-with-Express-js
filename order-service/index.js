// ============================================================
// ORDER SERVICE – Port 3003
// Gère les commandes et COMMUNIQUE avec user-service (3001)
// pour récupérer les informations de l'utilisateur concerné.
//
// Exemple de communication inter-services :
//   GET /orders/:id  →  appelle user-service pour enrichir la réponse
// ============================================================

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ---- URL du service dépendant ----
const USER_SERVICE_URL = 'http://localhost:3001';

// ---- Base de données simulée en mémoire ----
const orders = [
    { id: 101, userId: 1, product: 'Laptop', quantity: 1, price: 1200 },
    { id: 102, userId: 2, product: 'Phone', quantity: 2, price: 599 },
    { id: 103, userId: 1, product: 'Clavier mécanique', quantity: 1, price: 89 },
];

// ============================================================
// GET /orders → retourne toutes les commandes (sans détail user)
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
// 🔑 C'est ici que la communication inter-services a lieu :
//    order-service appelle user-service via HTTP (axios)
//    pour récupérer le nom et l'email de l'utilisateur.
// ============================================================
app.get('/orders/:id', async (req, res) => {
    // Étape 1 : chercher la commande localement
    const order = orders.find(o => o.id == req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: `Commande #${req.params.id} introuvable.`,
        });
    }

    try {
        // Étape 2 : appel HTTP vers user-service pour récupérer l'utilisateur
        // → communication inter-services avec axios
        const userResponse = await axios.get(`${USER_SERVICE_URL}/users/${order.userId}`);
        const user = userResponse.data;

        // Étape 3 : combiner commande + utilisateur et renvoyer
        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                product: order.product,
                quantity: order.quantity,
                price: order.price,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        // Si user-service est down ou l'utilisateur n'existe pas
        res.status(502).json({
            success: false,
            message: 'Impossible de contacter user-service.',
            detail: error.message,
        });
    }
});

// ============================================================
// POST /orders → ajoute une commande
// Body attendu : { "userId": 1, "product": "...", "quantity": 1, "price": 99 }
// ============================================================
app.post('/orders', async (req, res) => {
    const { userId, product, quantity, price } = req.body;

    if (!userId || !product || !quantity || !price) {
        return res.status(400).json({
            success: false,
            message: 'Champs requis : userId, product, quantity, price.',
        });
    }

    // Vérifier que l'utilisateur existe avant de créer la commande
    try {
        await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    } catch {
        return res.status(404).json({
            success: false,
            message: `Utilisateur #${userId} introuvable. Commande annulée.`,
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
        message: 'Commande créée avec succès.',
        data: newOrder,
    });
});

// ---- Démarrage du serveur ----
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`✅ order-service démarré sur http://localhost:${PORT}`);
    console.log(`   → communique avec user-service sur ${USER_SERVICE_URL}`);
});
