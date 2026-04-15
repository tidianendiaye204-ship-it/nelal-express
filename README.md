# 🚀 Nelal Express

Service de livraison organisé entre **Dakar**, sa **banlieue** et les villes de l'**intérieur du Sénégal**.

---

## Stack

- **Next.js 15** (App Router + Server Actions)
- **Supabase** (Auth + PostgreSQL + RLS)
- **Tailwind CSS** (Syne + DM Sans)
- **Vercel** (déploiement)
- **Twilio WhatsApp** (notifications, optionnel)

---

## Installation

```bash
# 1. Cloner et installer
git clone ...
cd nelal-express
npm install

# 2. Variables d'environnement
cp .env.local.example .env.local
# Remplir avec vos clés Supabase

# 3. Base de données
# Exécuter schema.sql dans Supabase SQL Editor

# 4. Lancer
npm run dev
```

---

## Structure

```
app/
  page.tsx                        → Landing page publique
  suivi/[id]/page.tsx             → Suivi commande (public, sans login)
  auth/
    login/page.tsx                → Connexion
    signup/page.tsx               → Inscription
  dashboard/
    layout.tsx                    → Sidebar commune
    page.tsx                      → Redirect selon rôle
    client/
      page.tsx                    → Mes commandes
      nouvelle-commande/page.tsx  → Créer une commande
    livreur/
      page.tsx                    → Livraisons assignées + actions
    admin/
      page.tsx                    → Toutes commandes + assignation
      livreurs/page.tsx           → Gestion livreurs
      zones/page.tsx              → Gestion tarifs par zone

actions/
  auth.ts                         → signUp, signIn, signOut
  orders.ts                       → createOrder, assignLivreur, updateOrderStatus...

lib/
  supabase/client.ts              → Browser client
  supabase/server.ts              → Server client + getProfile()
  types.ts                        → Types TypeScript
  whatsapp.ts                     → Notifications WhatsApp
```

---

## Rôles

| Rôle | Accès |
|------|-------|
| `client` | Créer/voir/annuler ses commandes |
| `livreur` | Voir ses livraisons, changer les statuts |
| `admin` | Tout voir, assigner livreurs, gérer zones |

> Pour créer un admin : créer un compte normal puis changer `role = 'admin'` dans la table `profiles` via Supabase.

---

## Zones couvertes

- **Dakar Centre** : Plateau, Médina, Yoff, Almadies... (1 000 – 1 500 FCFA)
- **Banlieue** : Pikine, Guédiawaye, Parcelles, Rufisque, Keur Massar... (2 000 – 3 000 FCFA)
- **Intérieur** : Saint-Louis, Ndioum, Podor, Matam, Thiès, Touba, Kaolack, Ziguinchor (6 000 – 15 000 FCFA)

---

## WhatsApp Notifications

Les notifications sont envoyées automatiquement à chaque changement de statut :
- ✅ Commande confirmée (livreur assigné)
- 🚴 Colis pris en charge
- 🎉 Livraison confirmée
- ❌ Commande annulée

En développement : les messages sont loggés dans la console.
En production : activer Twilio dans `.env.local`.

---

## Déploiement Vercel

```bash
vercel deploy
# Ajouter les variables d'env dans le dashboard Vercel
```

---

## Intégration Fii-rek (future)

Nelal Express est conçu pour s'intégrer avec **Fii-rek** :
- Un vendeur Fii-rek crée une commande → Nelal la livre
- API endpoint prévu : `POST /api/orders` (avec clé API)
