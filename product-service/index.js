// ============================================================
// PRODUCT SERVICE – Port 3002
// Gère les produits (stockage en mémoire, pas de base de données)
// ============================================================

const express = require('express');
const app = express();

// Middleware pour lire le JSON dans les requêtes POST
app.use(express.json());

// ---- Base de données simulée en mémoire ----
let products = [
    { id: 1, name: 'Laptop Pro', price: 1200 },
    { id: 2, name: 'Souris sans fil', price: 35 },
    { id: 3, name: 'Clavier mécanique', price: 89 },
];

// ---- Routes ----

// GET /products → retourne tous les produits
app.get('/products', (req, res) => {
    res.status(200).json({
        success: true,
        count: products.length,
        data: products,
    });
});

// POST /products → ajoute un produit
// Body attendu : { "name": "...", "price": 99 }
app.post('/products', (req, res) => {
    const { name, price } = req.body;

    // Validation simple
    if (!name || price === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Les champs "name" et "price" sont obligatoires.',
        });
    }

    const newProduct = {
        id: products.length + 1,
        name,
        price: Number(price),
    };

    products.push(newProduct);

    res.status(201).json({
        success: true,
        message: 'Produit ajouté avec succès.',
        data: newProduct,
    });
});

// ---- Démarrage du serveur ----
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`✅ product-service démarré sur http://localhost:${PORT}`);
});
