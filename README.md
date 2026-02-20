# 🚀 Microservices Demo – Node.js + Express.js

Architecture microservices pédagogique avec **3 services indépendants** qui communiquent via une API Gateway.

---

## 📁 Structure du projet

```
microservices-project/
├── user-service/          ← Port 3001
│   ├── package.json
│   └── index.js
├── product-service/       ← Port 3002
│   ├── package.json
│   └── index.js
└── api-gateway/           ← Port 3000 (point d'entrée unique)
    ├── package.json
    └── index.js
```

---

## ⚙️ Installation

Dans chaque dossier de service, exécuter :

```bash
npm install
```

Ou étape par étape :

```bash
cd user-service    && npm install
cd ../product-service && npm install
cd ../api-gateway     && npm install
```

---

## ▶️ Lancement

> ⚠️ Ouvrir **3 terminaux séparés** et lancer chaque service.

**Terminal 1 – user-service**
```bash
cd user-service
node index.js
# ✅ user-service démarré sur http://localhost:3001
```

**Terminal 2 – product-service**
```bash
cd product-service
node index.js
# ✅ product-service démarré sur http://localhost:3002
```

**Terminal 3 – api-gateway**
```bash
cd api-gateway
node index.js
# ✅ api-gateway démarré sur http://localhost:3000
```

---

## 🧪 Tester avec Postman

> Utiliser toujours le port **3000** (api-gateway).  
> Dans Postman : `Body` → `raw` → `JSON` pour les requêtes POST.

### 👤 Utilisateurs

#### GET – Lister les utilisateurs
```
GET http://localhost:3000/api/v1/users
```
**Réponse :**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": 1, "name": "Alice Dupont", "email": "alice@mail.com" },
    { "id": 2, "name": "Bob Martin",   "email": "bob@mail.com"   }
  ]
}
```

#### POST – Ajouter un utilisateur
```
POST http://localhost:3000/api/v1/users
Content-Type: application/json
```
**Body :**
```json
{
  "name": "Charlie Durand",
  "email": "charlie@mail.com"
}
```

---

### 📦 Produits

#### GET – Lister les produits
```
GET http://localhost:3000/api/v1/products
```
**Réponse :**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "name": "Laptop Pro",       "price": 1200 },
    { "id": 2, "name": "Souris sans fil",  "price": 35   },
    { "id": 3, "name": "Clavier mécanique","price": 89   }
  ]
}
```

#### POST – Ajouter un produit
```
POST http://localhost:3000/api/v1/products
Content-Type: application/json
```
**Body :**
```json
{
  "name": "Écran 4K",
  "price": 450
}
```

---

## 🔍 Tests directs (sans gateway)

Les services peuvent aussi être testés directement :

| URL directe | Équivalent gateway |
|---|---|
| `http://localhost:3001/users` | `http://localhost:3000/api/v1/users` |
| `http://localhost:3002/products` | `http://localhost:3000/api/v1/products` |

---

## 🏗️ Schéma d'architecture

```
            ┌─────────────────────────────────┐
            │         Client / Postman         │
            └────────────┬────────────────────┘
                         │  port 3000
                         ▼
            ┌─────────────────────────────────┐
            │          api-gateway            │
            │       (Express + Axios)          │
            └────────┬───────────┬────────────┘
                     │           │
          port 3001  │           │  port 3002
                     ▼           ▼
          ┌──────────────┐  ┌──────────────────┐
          │ user-service │  │ product-service  │
          │  (Express)   │  │   (Express)      │
          └──────────────┘  └──────────────────┘
```

---

## 🧰 Technologies utilisées

| Outil | Rôle |
|---|---|
| Node.js | Runtime JavaScript |
| Express.js | Framework HTTP |
| Axios | Requêtes HTTP entre services |

> Aucune base de données, aucun Docker requis.  
> Les données sont stockées **en mémoire** (reset au redémarrage).
