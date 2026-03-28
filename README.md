# Médiathèque de Veauche - Home Assistant

Intégration Home Assistant pour afficher les emprunts de la [médiathèque de Veauche](https://mediatheque.veauche.fr) (Joomla + MicroBib).

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Eric-D&repository=ha-mediatheque-veauche&category=integration)

## Fonctionnalités

- Connexion automatique au compte de la médiathèque
- Récupération des emprunts du titulaire et de la famille
- Sensor avec le nombre total d'emprunts
- Carte Lovelace unifiée avec deux modes d'affichage (tous les emprunts / à rendre cette semaine)
- Badges de statut configurables (retard, urgent, bientôt, etc.)
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

La carte `mediatheque-card` propose deux modes d'affichage via l'option `mode`.

#### Options de configuration

| Option         | Type     | Défaut                      | Description                                      |
|----------------|----------|-----------------------------|--------------------------------------------------|
| `entity`       | string   | **obligatoire**             | Entité sensor à utiliser                         |
| `mode`         | string   | `all`                       | Mode d'affichage : `all` ou `due`                |
| `title`        | string   | *(selon le mode)*           | Titre personnalisé de la carte                   |
| `badges`       | list     | *(tous)*                    | Types de badges à afficher (voir ci-dessous)     |
| `card_id`      | string   | *(auto)*                    | Identifiant carte pour le code-barres            |
| `total_entity` | string   | *(auto)*                    | Entité du total (mode `due` uniquement)          |

#### Mode `all` (défaut)

Affiche tous les emprunts groupés par membre de la famille.

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque
title: Médiathèque de Veauche  # optionnel
```

#### Mode `due`

Affiche uniquement les livres à rendre dans les 7 prochains jours, sous forme de liste plate.

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_due_week
mode: due
title: A rendre cette semaine  # optionnel
```

#### Badges

Par défaut, tous les badges sont affichés. Vous pouvez choisir lesquels afficher via l'option `badges` :

| Badge            | Description                                    | Apparence       |
|------------------|------------------------------------------------|-----------------|
| `overdue`        | En retard (jours négatifs)                     | Rouge           |
| `today`          | A rendre aujourd'hui                           | Orange          |
| `urgent`         | 1 à 3 jours restants                          | Orange          |
| `soon`           | 4 à 7 jours restants                          | Jaune           |
| `ok`             | Plus de 7 jours restants                       | Vert            |
| `not_extendable` | Emprunt déjà prolongé (non prolongeable)       | Violet          |

Exemple pour n'afficher que les badges d'alerte :

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque
badges:
  - overdue
  - today
  - urgent
```

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

### `sensor.emprunts_due_week`

- **state** : nombre de livres à rendre dans les 7 jours
- **attributes** :

```json
{
  "livres": [
    {
      "titre": "Le Petit Prince",
      "due_date_display": "15 mars 2024",
      "days_left": 3,
      "can_extend": true,
      "extended": false,
      "emprunteur": "Jean",
      "cover_url": "...",
      "isbn": "...",
      "extend_url": "..."
    }
  ]
}
```

## Licence

MIT
