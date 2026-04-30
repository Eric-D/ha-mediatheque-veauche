# Médiathèque de Veauche - Home Assistant

Intégration Home Assistant pour afficher les emprunts de la [médiathèque de Veauche](https://mediatheque.veauche.fr) (Joomla + MicroBib).

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Eric-D&repository=ha-mediatheque-veauche&category=integration)

## Fonctionnalités

- Connexion automatique au compte de la médiathèque
- Récupération des emprunts du titulaire et de la famille
- Sensor avec le nombre total d'emprunts
- Carte Lovelace avec affichage par membre, couvertures, dates et statuts
- Filtrage des livres par statut d'urgence (retard, urgent, bientôt, etc.)
- Code-barres de la carte de bibliothèque
- Prolongation des emprunts depuis la carte
- Intervalle de mise à jour configurable
- Compatible HACS

## Installation

### Manuelle

1. Copier le dossier `custom_components/mediatheque_veauche/` dans votre dossier `config/custom_components/`
2. Redémarrer Home Assistant

### HACS

1. Ajouter ce dépôt comme dépôt personnalisé dans HACS (catégorie : Intégration)
2. Installer "Médiathèque de Veauche"
3. Redémarrer Home Assistant

## Configuration

### Intégration

1. Aller dans **Paramètres > Appareils et services > Ajouter une intégration**
2. Chercher "Médiathèque de Veauche"
3. Entrer vos identifiants de la médiathèque
4. L'intervalle de mise à jour est configurable (défaut : 60 minutes)

### Ressource Lovelace

La ressource JavaScript est enregistrée automatiquement par l'intégration. Si elle n'apparaît pas, ajoutez-la manuellement dans **Paramètres > Tableaux de bord > Ressources** :

```
URL : /mediatheque_veauche/mediatheque-card.js
Type : Module JavaScript
```

### Carte Lovelace

#### Options de configuration

| Option    | Type   | Défaut          | Description                                                   |
|-----------|--------|-----------------|---------------------------------------------------------------|
| `entity`  | string | **obligatoire** | Entité sensor à utiliser                                      |
| `title`   | string | *(auto)*        | Titre personnalisé de la carte                                |
| `mode`    | string | `all`           | `all` (par membre), `due` (liste à rendre), `grid` (grille de couvertures) |
| `badges`  | list   | *(tous)*        | Filtre les livres par type de statut                          |
| `card_id` | string | *(auto)*        | Identifiant carte pour le code-barres                         |

#### Utilisation de base

Affiche tous les emprunts groupés par membre de la famille :

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque
```

#### Filtrage par badges

Par défaut, tous les livres sont affichés. Si vous configurez `badges`, seuls les livres correspondant aux types listés seront affichés (filtre OR) :

| Badge            | Description                                    | Jours restants | Apparence |
|------------------|------------------------------------------------|----------------|-----------|
| `overdue`        | En retard                                      | < 0            | Rouge     |
| `today`          | A rendre aujourd'hui                           | 0              | Orange    |
| `urgent`         | Retour imminent                                | 1 à 3          | Orange    |
| `soon`           | Retour proche                                  | 4 à 7          | Jaune     |
| `ok`             | Pas de retour imminent                         | > 7            | Vert      |
| `not_extendable` | Emprunt déjà prolongé (non prolongeable)       | —              | Violet    |

Exemple pour n'afficher que les livres à rendre dans la semaine :

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque
title: A rendre cette semaine
badges:
  - overdue
  - today
  - urgent
  - soon
```

Le compteur dans l'en-tête reflète le nombre de livres filtrés.

#### Mode grille (couvertures uniquement)

Variante visuelle du mode `due` : affiche une grille de miniatures de couvertures avec un badge jours-restants superposé en haut à droite. Idéal pour identifier *en un coup d'œil* ce qui est à rendre. Tap sur une couverture → modal de détail (titre, ISBN, prolonger).

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque_due_week
mode: grid
```

Combinable avec `badges` pour filtrer (ex. ne montrer que les retards et urgents).

## Structure des sensors

### `sensor.emprunts_mediatheque`

- **state** : nombre total d'emprunts
- **attributes** :

```json
{
  "compte": "Jean",
  "total": 5,
  "card_id": "123456",
  "membres": {
    "Jean": [
      {
        "titre": "Le Petit Prince",
        "book_id": "12345",
        "due_date": "2024-03-15",
        "due_date_display": "15 mars 2024",
        "days_left": 7,
        "can_extend": true,
        "extended": false,
        "extend_url": "https://mediatheque.veauche.fr/...",
        "cover_url": "https://mediatheque.veauche.fr/images/covers/...",
        "isbn": "978-2-07-036294-0",
        "emprunteur": "Jean"
      }
    ],
    "Lucas": [...]
  }
}
```

## Licence

MIT
