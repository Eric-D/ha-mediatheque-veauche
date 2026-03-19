# Médiathèque de Veauche - Home Assistant

Intégration Home Assistant pour afficher les emprunts de la [médiathèque de Veauche](https://mediatheque.veauche.fr) (Joomla + MicroBib).

## Fonctionnalités

- Connexion automatique au compte de la médiathèque
- Récupération des emprunts du titulaire et de la famille
- Sensor avec le nombre total d'emprunts
- Carte Lovelace avec affichage par membre, couvertures, dates et statuts
- Intervalle de mise à jour configurable
- Compatible HACS

## Installation

### Manuelle

1. Copier le dossier `custom_components/mediatheque_veauche/` dans votre dossier `config/custom_components/`
2. Copier `www/mediatheque-card.js` dans votre dossier `config/www/`
3. Redémarrer Home Assistant

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

Ajouter la ressource JavaScript dans **Paramètres > Tableaux de bord > Ressources** :

```
URL : /local/mediatheque-card.js
Type : Module JavaScript
```

### Carte Lovelace

```yaml
type: custom:mediatheque-card
entity: sensor.emprunts_mediatheque
title: Médiathèque de Veauche  # optionnel
```

## Structure du sensor

Le sensor `sensor.emprunts_mediatheque` expose :

- **state** : nombre total d'emprunts
- **attributes** :

```json
{
  "compte": "Jean",
  "total": 5,
  "membres": {
    "Jean": [
      {
        "titre": "Le Petit Prince",
        "book_id": "12345",
        "due_date": "2024-03-15",
        "due_date_display": "15 mars 2024",
        "days_left": 7,
        "can_extend": true,
        "extend_url": "https://mediatheque.veauche.fr/...",
        "cover_url": "https://mediatheque.veauche.fr/images/covers/...",
        "emprunteur": "Jean"
      }
    ],
    "Lucas": [...]
  }
}
```

## Licence

MIT
