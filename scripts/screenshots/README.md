# Captures du tutoriel

`run.sh` régénère les images de [`docs/INSTALLATION.md`](../../docs/INSTALLATION.md).

```
scripts/screenshots/run.sh
```

## Ce que ça fait

1. lance un **faux portail de médiathèque** (`fake_portal.py`) qui sert
   exactement les pages que `scraper.py` sait lire ;
2. monte une instance **Home Assistant jetable** dans Docker, avec
   l'intégration installée et `BASE_URL` pointée sur ce faux portail ;
3. passe l'onboarding par l'API ;
4. pilote l'interface avec Playwright et écrit les PNG dans `docs/img/`.

Le conteneur et le dossier temporaire sont supprimés à la sortie, y compris en
cas d'erreur.

## Pourquoi un faux portail

Pour que les captures soient **reproductibles et sans donnée personnelle**.
Aucun compte de médiathèque n'est employé, aucun mot de passe réel, aucune
couverture n'est téléchargée depuis le site de la médiathèque : les vignettes
sont des SVG générés localement.

Les échéances sont calculées **par rapport au jour de l'exécution** — deux
jours de retard, une échéance du jour, puis plusieurs délais. Les captures
montrent donc tous les badges, et ne vieillissent pas : une date figée aurait
fait apparaître « 300j de retard » six mois plus tard.

## Ce qui n'est pas simulé

Tout le reste. L'intégration tourne telle quelle, scraper compris, dans une
vraie instance de Home Assistant, et la carte est rendue par un vrai Chromium.
La seule ligne modifiée est `BASE_URL`, et elle l'est dans une copie jetable —
jamais dans le dépôt.

**Les étapes HACS ne sont pas capturées** : l'installation de HACS exige une
authentification GitHub interactive, qu'on ne peut pas scripter sans porter de
vrais identifiants. Ces étapes restent décrites par le texte.

## Dépendances

`docker`, `node`, `python3`, et un accès réseau pour l'image Home Assistant,
Chromium et la police Noto Color Emoji — sans cette dernière, Chromium rend
l'icône de membre en carré vide. Elle est installée dans un `XDG_DATA_HOME`
temporaire : l'environnement de la machine n'est pas modifié.
