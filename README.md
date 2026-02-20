# 🚀 Microservices with Express.js

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat&logo=axios&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

> Projet de démonstration d'une **architecture microservices** avec Node.js et Express.js.  
> Trois services indépendants communiquent via une **API Gateway** centralisée — sans Docker, sans base de données.

---

## 🏗️ Architecture

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

## 📁 Structure du projet

```
Microservices/
├── api-gateway/           ← Port 3000 – point d'entrée unique
│   ├── index.js
│   └── package.json
├── user-service/          ← Port 3001 – gestion des utilisateurs
│   ├── index.js
│   └── package.json
├── product-service/       ← Port 3002 – gestion des produits
│   ├── index.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/OussamaNaya/Microservices-with-Express-js.git
cd Microservices-with-Express-js

# 2. Installer les dépendances de chaque service
cd user-service     && npm install && cd ..
cd product-service  && npm install && cd ..
cd api-gateway      && npm install && cd ..
```

---

## ▶️ Lancement

> ⚠️ Ouvrir **3 terminaux séparés** et lancer chaque service.

```bash
# Terminal 1 – user-service
cd user-service && node index.js
# ✅ user-service démarré sur http://localhost:3001

# Terminal 2 – product-service
cd product-service && node index.js
# ✅ product-service démarré sur http://localhost:3002

# Terminal 3 – api-gateway
cd api-gateway && node index.js
# ✅ api-gateway démarré sur http://localhost:3000
```

---

## 🧪 Endpoints (via API Gateway – port 3000)

### 👤 Users

| Méthode | Endpoint | Description |
|:-------:|----------|-------------|
| `GET` | `/api/v1/users` | Retourne la liste des utilisateurs |
| `POST` | `/api/v1/users` | Ajoute un nouvel utilisateur |

**GET** `/api/v1/users`
```bash
curl http://localhost:3000/api/v1/users
```

**POST** `/api/v1/users`
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Dupont", "email": "alice@mail.com"}'
```

---

### 📦 Products

| Méthode | Endpoint | Description |
|:-------:|----------|-------------|
| `GET` | `/api/v1/products` | Retourne la liste des produits |
| `POST` | `/api/v1/products` | Ajoute un nouveau produit |

**GET** `/api/v1/products`
```bash
curl http://localhost:3000/api/v1/products
```

**POST** `/api/v1/products`
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Pro", "price": 1200}'
```

---

## 🧰 Stack technique

| Technologie | Rôle |
|-------------|------|
| **Node.js** | Runtime JavaScript côté serveur |
| **Express.js** | Framework HTTP pour chaque service |
| **Axios** | Communication HTTP entre la gateway et les services |

---

## 📝 Notes

- Les données sont stockées **en mémoire** → elles se réinitialisent au redémarrage
- Les services peuvent être testés **directement** (sans gateway) sur leurs ports respectifs
- Le préfixe `/api/v1/` permet le **versioning** de l'API

---

## 👤 Auteur

**Oussama Naya** – [GitHub](https://github.com/OussamaNaya)
