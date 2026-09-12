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

> **Prérequis** : Home Assistant **2024.11** ou plus récent.

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

La carte est déclarée automatiquement comme **ressource Lovelace** par l'intégration. C'est volontairement le seul mécanisme utilisé : Home Assistant charge `@webcomponents/scoped-custom-element-registry`, qui remplace `window.customElements` par sa propre implémentation sans jamais consulter le registre natif. Un script injecté dans le document (`add_extra_js_url`) est évalué *avant* ce remplacement, et sa définition reste alors invisible à Home Assistant, qui affiche « Custom element doesn't exist » de façon définitive. Les ressources Lovelace, elles, sont chargées par le panneau, donc après l'installation du polyfill.

En mode YAML, la collection de ressources n'est pas modifiable par une intégration : l'intégration retombe sur `add_extra_js_url` en le signalant dans les logs, et il vaut mieux déclarer la ressource vous-même dans `configuration.yaml`. En mode interface, si elle n'apparaît pas, ajoutez-la manuellement dans **Paramètres > Tableaux de bord > Ressources** :

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
| `mode`    | string | `list`          | `list` (groupée par membre) ou `covers` (grille de couvertures à rendre)   |
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
| `unknown`        | Date d'échéance illisible sur le site source   | —              | Gris      |

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

#### Mode `covers` (grille de couvertures)

Affiche une grille de miniatures avec un badge jours-restants superposé en haut à droite. Idéal pour identifier *en un coup d'œil* les livres à rendre. Tap sur une couverture → modal de détail (titre, ISBN, prolonger).

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_a_rendre_cette_semaine
mode: covers
```

Combinable avec `badges` pour filtrer (ex. ne montrer que les retards et urgents).

> **Compat** : les anciens noms `all` et `grid` sont normalisés silencieusement vers `list` et `covers`. Le mode `due` (cassé) a été retiré en v3.2.0.

## Identifiants refusés

Si la médiathèque refuse vos identifiants — mot de passe changé sur leur site, compte suspendu — Home Assistant affiche une notification **« Reconfigurer »** sur l'intégration et vous demande le mot de passe à jour. La synchronisation reprend dès qu'il est accepté.

Tant que ce n'est pas fait, les capteurs deviennent indisponibles plutôt que de continuer à servir les données du cache : des emprunts affichés comme à jour alors qu'ils ne le sont plus seraient pires que pas de données du tout. La carte affiche alors un message explicite, et non le dernier rendu figé.

Deux conséquences à connaître :

- **La synchronisation ne redémarre pas toute seule.** Home Assistant cesse de replanifier les mises à jour jusqu'à ce que la reconnexion aboutisse — c'est voulu, réessayer avec un mot de passe refusé ne sert à rien et risquerait de faire bloquer le compte.
- **Les cinq capteurs deviennent indisponibles**, y compris « Fin cotisation » et « Dernière MAJ », qui ne dépendent pourtant pas des identifiants. Une automatisation qui lit `sensor.emprunts_mediatheque` échouera pendant cette période : pensez à la protéger par `has_value()` ou `states(...) not in ['unavailable', 'unknown']`.

Si c'est votre **identifiant** qui a changé — carte renouvelée, numéro différent — le formulaire de reconnexion ne suffira pas : il ne demande que le mot de passe. Passez par **Reconfigurer** dans le menu de l'intégration, qui accepte les deux.

## Changer d'identifiant ou de mot de passe

**Reconfigurer** dans le menu de l'intégration accepte les deux champs, et **l'historique des capteurs est conservé** même si l'identifiant change : leurs identifiants internes ne dépendent pas du login. Le tableau de bord, les automatisations et les statistiques continuent de fonctionner sans rien modifier.

Un identifiant déjà utilisé par un autre compte configuré est refusé.

Les autres pannes — site injoignable, portail en maintenance, page de connexion modifiée — ne déclenchent **pas** cette demande : elles sont réessayées, et les données du cache restent affichées avec un bandeau d'avertissement si elles datent d'un jour antérieur.

## Structure des sensors

### `sensor.emprunts_mediatheque`

- **state** : nombre total d'emprunts
- **attributes** :

```json
{
  "compte": "Jean",
  "total": 5,
  "card_id": "123456",
  "last_success": "2024-03-08T07:30:00+00:00",
  "fetch_ok": true,
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

`last_success` et `fetch_ok` sont également présents sur `sensor.emprunts_a_rendre_cette_semaine` et `sensor.emprunts_en_retard`, avec `card_id`. `fetch_ok: false` signifie que la dernière synchronisation a échoué et que les données affichées viennent du cache : si elles datent d'un jour antérieur, la carte affiche un bandeau d'avertissement car les délais `days_left` sont alors décalés.

`days_left` vaut `null` quand la date d'échéance est illisible sur le site source. La carte affiche alors le badge `unknown` plutôt qu'un délai inventé.

## Licence

MIT
