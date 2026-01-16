# Mécanisme Droits d'auteur / Droits voisins

> Document de référence pour Proofy V3 - Gestion des droits musicaux

## Principe fondamental

**Les droits d'auteur et les droits voisins sont deux "poches" SÉPARÉES.**

Un auteur/compositeur qui détient 100% de ses droits d'auteur peut signer avec un label qui prend 50% des droits voisins : on ne mélange pas les pourcentages.

La répartition des royalties se fait sur **deux flux distincts** :
- **Droit d'auteur** → SACEM, éditeur, auteur/compositeur
- **Droits voisins** → Producteur/label et artistes-interprètes

---

## 1. Droit d'auteur vs Droits voisins

### Droit d'auteur (100% max)
- **Protège** : L'œuvre elle-même (composition, texte, musique)
- **Bénéficiaires** : Auteur, Compositeur, Éditeur
- **Collecte** : SACEM (France)
- **Répartition** : Définie entre auteur/compositeur/éditeur

### Droits voisins (100% max, séparé)
- **Protège** : L'enregistrement et l'interprétation (master)
- **Bénéficiaires** : Producteur phonographique (label), Artistes-interprètes
- **Collecte** : SPRE → ADAMI/SPEDIDAM (interprètes) + SCPP/SPPF (producteurs)
- **Répartition légale France** : 50% interprètes / 50% producteurs

---

## 2. Structure des droits voisins

### Deux sous-flux distincts :

#### a) Exploitations commerciales (streaming, ventes, synchro)
- La plateforme verse au distributeur/label
- Contrat de royalties : ex. 20% artiste / 80% label
- Négociable selon le contrat

#### b) Rémunération équitable (radios, lieux publics)
- SPRE collecte et répartit
- **50% aux producteurs** (SCPP/SPPF)
- **50% aux artistes-interprètes** (ADAMI/SPEDIDAM)

---

## 3. Exemple chiffré

### Situation :
- Artiste = auteur/compositeur + interprète
- Label prend 50% des droits voisins (producteur)

### Sur 100€ de droits voisins générés :

| Bénéficiaire | Part | Montant |
|--------------|------|---------|
| Interprète (artiste) | 50% | 50€ |
| Producteur (label 50%) | 25% | 25€ |
| Producteur (artiste 50%) | 25% | 25€ |
| **Total artiste** | | **75€** |
| **Total label** | | **25€** |

**+ Les droits d'auteur à 100% séparément** (SACEM)

---

## 4. Implémentation Proofy V3

### Étape Droits d'auteur (100% total)
```
┌─────────────────────────────────────────┐
│ DROITS D'AUTEUR (Œuvre)                 │
│ Total = 100%                            │
├─────────────────────────────────────────┤
│ 📝 Auteur(s) - paroliers, textes        │
│    [Nom] ────────────────── [___%]      │
│                                         │
│ 🎵 Compositeur(s) - musique             │
│    [Nom] ────────────────── [___%]      │
│                                         │
│ 📑 Éditeur(s) - droits d'édition        │
│    [Nom] ────────────────── [___%]      │
│                                         │
│ ✅ Total des droits d'auteur: 100%      │
└─────────────────────────────────────────┘
```

### Étape Droits voisins (optionnel, 100% total)
```
┌─────────────────────────────────────────┐
│ DROITS VOISINS (Enregistrement/Master)  │
│ Total = 100% (limité à 50% par rôle)    │
├─────────────────────────────────────────┤
│ ❓ Voulez-vous enregistrer des droits   │
│    voisins ?  [Oui] [Non]               │
├─────────────────────────────────────────┤
│ 🎚️ Producteur(s) phonographique         │
│    [Nom] ────────────────── [___%]      │
│                                         │
│ 🎤 Artiste(s)-interprète(s)             │
│    [Nom] ────────────────── [___%]      │
│                                         │
│ 🏷️ Label(s)                             │
│    [Nom] ────────────────── [___%]      │
│                                         │
│ 👥 Autre(s)                             │
│    [Nom] [Rôle] ─────────── [___%]      │
│                                         │
│ ✅ Total des droits voisins: 100%       │
└─────────────────────────────────────────┘
```

---

## 5. Points de vigilance

1. **Ne jamais mélanger** les % de droits d'auteur et droits voisins
2. **Chaque catégorie = 100%** indépendamment
3. **Droits voisins = optionnels** (pas tous les artistes en ont besoin)
4. **Permettre la modification** des droits après dépôt initial

---

## Sources

- [Sécu Artistes-Auteurs](https://www.secu-artistes-auteurs.fr/mag-droits-auteurs-voisins)
- [Wikipedia - Droits voisins](https://fr.wikipedia.org/wiki/Droits_voisins_du_droit_d'auteur_en_France)
- [Bridger - Les droits voisins](https://www.bridgermusic.io/fr/blog/master-rights)
- [MusicTeam - Rémunération équitable](https://musicteam.com/fr/les-droits-voisins-en-musique-la-remuneration-equitable/)
- [Cézame - Le droit voisin](https://www.cezamemusic.com/blog/le-droit-voisin/)
- [SPEDIDAM - Quels sont mes droits](https://spedidam.fr/artistes-interpretes/quels-sont-mes-droits/)
- [Culture.gouv.fr - Chiffres clés](https://www.culture.gouv.fr/Media/medias-creation-rapide/Chiffres-cles-2022-Droits-d-auteur-et-droits-voisins-Fiche.pdf)
