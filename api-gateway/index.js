// ============================================================
// API GATEWAY – Port 3000
// Point d'entrée unique : redirige les requêtes vers les bons services
//
//   /api/v1/users    →  user-service    (http://localhost:3001)
//   /api/products →  product-service (http://localhost:3002)
// ============================================================

const express = require('express');
const axios = require('axios');

const app = express();

// Middleware pour lire le JSON dans les requêtes POST
app.use(express.json());

// ---- URLs des microservices ----
const USER_SERVICE_URL = 'http://localhost:3001';
const PRODUCT_SERVICE_URL = 'http://localhost:3002';
const ORDER_SERVICE_URL = 'http://localhost:3003';


// ============================================================
// ROUTES – USERS  (proxy vers user-service)
// ============================================================

// GET /api/v1/users → récupère tous les utilisateurs
app.get('/api/v1/users', async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/users`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le user-service.',
            detail: error.message,
        });
    }
});

// POST /api/v1/users → crée un utilisateur
// Body attendu : { "name": "...", "email": "..." }
app.post('/api/v1/users', async (req, res) => {
    try {
        const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        // Si le service retourne une erreur de validation, on la propage
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le user-service.',
            detail: error.message,
        });
    }
});

// ============================================================
// ROUTES – PRODUCTS  (proxy vers product-service)
// ============================================================

// GET /api/products → récupère tous les produits
app.get('/api/v1/products', async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le product-service.',
            detail: error.message,
        });
    }
});

// POST /api/v1/products → crée un produit
// Body attendu : { "name": "...", "price": 99 }
app.post('/api/v1/products', async (req, res) => {
    try {
        const response = await axios.post(`${PRODUCT_SERVICE_URL}/products`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le product-service.',
            detail: error.message,
        });
    }
});

// ============================================================
// ROUTE – DASHBOARD  (communication entre les deux services)
// Appelle user-service ET product-service en PARALLÈLE
// et retourne les données combinées en une seule réponse.
// ============================================================

// GET /api/v1/dashboard → agrège users + products
app.get('/api/v1/dashboard', async (req, res) => {
    try {
        // Promise.all lance les deux requêtes simultanément (plus rapide qu'en séquence)
        const [usersResponse, productsResponse] = await Promise.all([
            axios.get(`${USER_SERVICE_URL}/users`),
            axios.get(`${PRODUCT_SERVICE_URL}/products`),
        ]);

        // On combine les deux réponses en un seul objet JSON
        res.json({
            success: true,
            dashboard: {
                users: {
                    count: usersResponse.data.count,
                    data: usersResponse.data.data,
                },
                products: {
                    count: productsResponse.data.count,
                    data: productsResponse.data.data,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur : un ou plusieurs services sont inaccessibles.',
            detail: error.message,
        });
    }
});

// ============================================================
// ROUTES – ORDERS  (proxy vers order-service)
// ============================================================

// GET /api/v1/orders → liste toutes les commandes
app.get('/api/v1/orders', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le order-service.',
            detail: error.message,
        });
    }
});

// GET /api/v1/orders/:id → commande enrichie avec infos utilisateur
// 🔑 order-service appelle lui-même user-service en interne
app.get('/api/v1/orders/:id', async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le order-service.',
            detail: error.message,
        });
    }
});

// POST /api/v1/orders → crée une commande
// Body attendu : { "userId": 1, "product": "...", "quantity": 1, "price": 99 }
app.post('/api/v1/orders', async (req, res) => {
    try {
        const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({
            success: false,
            message: 'Erreur : impossible de joindre le order-service.',
            detail: error.message,
        });
    }
});

// ---- Route racine : vérification rapide de l'état de la gateway ----
app.get('/', (req, res) => {
    res.json({
        message: '🚪 API Gateway opérationnelle',
        routes: {
            users: ['GET /api/v1/users', 'POST /api/v1/users', 'GET /api/v1/users/:id'],
            products: ['GET /api/v1/products', 'POST /api/v1/products'],
            orders: ['GET /api/v1/orders', 'GET /api/v1/orders/:id', 'POST /api/v1/orders'],
            dashboard: ['GET /api/v1/dashboard  ← agrège users + products en parallèle'],
        },
    });
});

// ---- Démarrage du serveur ----
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ api-gateway démarré sur http://localhost:${PORT}`);
    console.log(`   → /api/v1/users    proxie vers ${USER_SERVICE_URL}`);
    console.log(`   → /api/v1/products proxie vers ${PRODUCT_SERVICE_URL}`);
    console.log(`   → /api/v1/orders   proxie vers ${ORDER_SERVICE_URL}`);
});
