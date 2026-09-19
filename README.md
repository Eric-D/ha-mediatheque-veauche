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
- Marquage des livres lus, avec badge et retour en arrière
- Intervalle de mise à jour configurable
- Compatible HACS

> **Prérequis** : Home Assistant **2026.1** ou plus récent.

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
| `mode`    | string | `list`          | `list` (groupée par membre), `covers` (grille de couvertures) ou `carousel` (bande basse) |
| `badges`  | list   | *(tous)*        | Filtre les livres par type de statut                          |
| `card_id` | string | *(auto)*        | Identifiant carte pour le code-barres                         |
| `cover_height` | int | `76`           | Mode `carousel` : hauteur des couvertures en px (56–120). La largeur suit le ratio du livre |
| `hide_ok_badges` | bool | `false`      | Mode `carousel` : masque le badge des livres à plus de 7 jours |

`title` est **sans effet en mode `carousel`**, qui n'a pas d'en-tête.

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

#### Mode `carousel` (bande de couvertures)

Une bande horizontale défilante des couvertures, triée par échéance, **sans
en-tête**, avec à droite un bouton fixe qui ouvre le code-barres de la carte de
bibliothèque. Conçu pour un tableau de bord mural où la hauteur est la ressource
rare : une centaine de pixels, contre plus du double pour le mode `covers`.

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque
mode: carousel
# cover_height: 76
# hide_ok_badges: false
```

Le défilement est natif : au doigt sur tablette, à la molette horizontale sur
desktop. Aucune barre de défilement n'est affichée ; la dernière couverture est
volontairement coupée quand il y en a plus que la largeur n'en montre, ce qui
signale qu'on peut faire défiler.

Tap sur une couverture → fiche détaillée (titre, ISBN, prolonger, marquer lu).
La bascule « lu » n'est pas sur la vignette, trop petite pour qu'on la vise sans
se tromper : elle reste dans la fiche. Un livre lu porte un liseré vert.

Les badges reprennent les seuils des autres modes, avec une palette plus dense —
fonds pleins et texte clair, un pastel de 10 px ne se détachant pas d'une
couverture :

| Statut | Badge |
|---|---|
| En retard | `Retard` sur rouge |
| À rendre aujourd'hui | `Auj.` sur orange |
| 1 à 7 jours | `N j` sur orange puis jaune |
| Plus de 7 jours | `N j` sur vert — masquable avec `hide_ok_badges` |
| Non prolongeable | `N j` sur violet, seulement au-delà de 7 jours : en deçà, l'urgence garde sa couleur |
| Date illisible | `?` sur gris |

Le bouton code-barres porte une **bulle** avec le nombre de livres affichés —
ceux qui restent après le filtre `badges`, pas le total du capteur. Elle
disparaît quand il n'y en a aucun, le message le disant déjà.

Sans `card_id`, la tuile code-barres disparaît — et sa bulle avec elle — et la
bande occupe toute la largeur. Sans aucun livre à afficher, un message remplace la bande mais la tuile
code-barres reste — c'est au moment d'emprunter qu'on en a besoin.

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
        "emprunteur": "Jean",
        "read": false,
        "read_key": "id:12345"
      }
    ],
    "Lucas": [...]
  }
}
```

`last_success` et `fetch_ok` sont également présents sur `sensor.emprunts_a_rendre_cette_semaine` et `sensor.emprunts_en_retard`, avec `card_id`. `fetch_ok: false` signifie que la dernière synchronisation a échoué et que les données affichées viennent du cache : si elles datent d'un jour antérieur, la carte affiche un bandeau d'avertissement car les délais `days_left` sont alors décalés.

`days_left` vaut `null` quand la date d'échéance est illisible sur le site source. La carte affiche alors le badge `unknown` plutôt qu'un délai inventé.

## Livres lus

Chaque livre porte un bouton de bascule : la pastille en bas à gauche de la
tuile en mode `covers`, le bouton rond en bout de ligne en mode `list`, et
« Marquer comme lu » dans la fiche détaillée. Un livre marqué porte un badge
« ✓ Lu » et un liseré vert.

L'état est **partagé par tout le foyer**, pas par membre : un livre que deux
enfants ont emprunté bascule pour les deux. Il est conservé après le retour du
livre, pendant deux ans — réemprunter un titre déjà lu réaffiche donc le badge,
ce qui évite de le relire par mégarde.

Il est stocké côté Home Assistant, dans `.storage`, et non dans le navigateur :
marquer un livre sur la tablette le marque aussi sur le téléphone, et une
automatisation peut le lire.

### Service `mediatheque_veauche.set_read`

| Champ      | Type    | Description                                            |
| ---------- | ------- | ------------------------------------------------------ |
| `read_key` | string  | La clé du livre, lue dans l'attribut `read_key` du prêt |
| `read`     | boolean | `true` pour marquer lu, `false` pour revenir en arrière |

La carte le renseigne seule. `read_key` dérive de l'identifiant du catalogue
(`id:12345`), qui survit au retour puis au réemprunt ; il retombe sur le titre
normalisé (`titre:le petit prince`) pour les rares livres dont le titre n'est
pas un lien. Un livre sans aucune clé exploitable n'affiche pas le contrôle,
plutôt qu'un bouton dont le clic échouerait.

`read` et `read_key` sont dérivés au moment de servir, comme `days_left` : le
cache disque n'en garde aucune trace, sinon une journée d'indisponibilité du
portail resservirait l'état de lecture de la veille.

## Licence

MIT
