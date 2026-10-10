#!/usr/bin/env python3
"""Faux portail de médiathèque, pour les captures du tutoriel.

Sert exactement les pages que `scraper.py` sait lire, avec des échéances
calculées par rapport à aujourd'hui : les badges de la carte montrent donc un
retard, un « aujourd'hui » et plusieurs délais, au lieu de dates figées qui
seraient toutes périmées à la capture suivante.

Aucune donnée réelle : ni compte, ni identifiant, ni couverture distante.
"""
from __future__ import annotations

import datetime as dt
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

PORT = 8099
CSRF = "0123456789abcdef0123456789abcdef"

# Couverture inlinée : aucune requête ne sort de la machine.
COVER_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="176">'
    '<rect width="120" height="176" fill="{bg}"/>'
    '<rect x="8" y="8" width="104" height="160" fill="none" stroke="#ffffff55"/>'
    '<text x="60" y="84" text-anchor="middle" font-family="sans-serif" '
    'font-size="13" fill="#fff">{l1}</text>'
    '<text x="60" y="104" text-anchor="middle" font-family="sans-serif" '
    'font-size="13" fill="#fff">{l2}</text></svg>'
)

def due(days: int) -> str:
    # astimezone() plutôt que date.today() : le conteneur Home Assistant tourne
    # sur Europe/Paris, et une date calculée dans un autre fuseau décalerait les
    # badges d'un jour — exactement le défaut que `dates.py` corrige côté
    # intégration.
    today = dt.datetime.now().astimezone().date()
    return (today + dt.timedelta(days=days)).strftime("%d-%m-%Y")

# (id, titre, jours, emprunteur, prolongeable, couleur, l1, l2)
BOOKS = [
    ("100", "L'Odyssée d'Hakim", -2, None, True, "#8e44ad", "L'Odyssée", "d'Hakim"),
    ("101", "Le Petit Prince", 0, None, True, "#2980b9", "Le Petit", "Prince"),
    ("102", "Astérix le Gaulois", 2, None, False, "#c0392b", "Astérix", "le Gaulois"),
    ("103", "Le Chat du Rabbin", 6, None, True, "#16a085", "Le Chat", "du Rabbin"),
    ("104", "Les Cités d'Or", 20, None, True, "#d35400", "Les Cités", "d'Or"),
    ("200", "Tintin au Tibet", 3, "Lucas", True, "#27ae60", "Tintin", "au Tibet"),
    ("201", "Mortelle Adèle", 9, "Lucas", True, "#e67e22", "Mortelle", "Adèle"),
    ("202", "Anatole Latuile", 13, "Chloé", True, "#2c3e50", "Anatole", "Latuile"),
]

def rows(books) -> str:
    out = []
    for bid, titre, days, emp, can, *_ in books:
        emp_cell = f"<td>DUPONT {emp}</td>" if emp else ""
        link = (f'<a href="/extend/{bid}">Prolonger</a>' if can
                else '<a href="/extend/x" class="disabled">Prolonger</a>')
        out.append(
            f'<tr><td><a href="/index.php?view=Book&id={bid}">{titre}</a></td>'
            f'<td>Veauche</td>{emp_cell}'
            f'<td><span class="badge">{due(days)}</span></td>'
            f'<td>{link}</td></tr>'
        )
    return "".join(out)

BORROWINGS = """<html><head><meta charset="utf-8"><title>Mon profil</title></head><body>
<div id="profile_borrowed"><h2>DUPONT Jean</h2></div>
<a href="/index.php?option=com_users&task=user.logout">Déconnexion</a>
<div id="user_borrow"><table><tbody>%s</tbody></table></div>
<div id="family_borrow"><table><tbody>%s</tbody></table></div>
</body></html>"""

LOGIN = f"""<html><head><meta charset="utf-8"><title>Connexion</title></head><body>
<form method="post"><input type="text" name="username"><input type="password" name="password">
<input type="hidden" name="{CSRF}" value="1"></form></body></html>"""

PROFILE_EDIT = """<html><head><meta charset="utf-8"></head><body>
<input name="jform[name]" value="DUPONT Jean">
<input id="jform_name" name="name" value="DUPONT Jean"></body></html>"""

INFOS = f"""<html><head><meta charset="utf-8"></head><body><div id="profile_status">
<table><tbody><tr><td>Adhésion</td><td>Jusqu'au {due(195)}</td></tr></tbody></table>
</div></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):  # silence
        pass

    def _send(self, body: str, ctype="text/html; charset=utf-8"):
        raw = body.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        self.rfile.read(length)
        self._send(LOGIN)

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        view = (q.get("view") or [""])[0]
        layout = (q.get("layout") or [""])[0]

        if "/images/covers/" in u.path:
            bid = u.path.rsplit("/", 1)[-1].replace(".svg", "")
            for b in BOOKS:
                if b[0] == bid:
                    return self._send(
                        COVER_SVG.format(bg=b[5], l1=b[6], l2=b[7]),
                        "image/svg+xml",
                    )
            return self._send(COVER_SVG.format(bg="#555", l1="?", l2=""), "image/svg+xml")

        if view == "Book":
            bid = (q.get("id") or [""])[0]
            return self._send(
                f'<html><body><img src="/images/covers/{bid}.svg">'
                f'<input type="hidden" id="BW_id_isbn" value="978-2-{bid}-0000-1">'
                f'</body></html>'
            )
        if view == "Profile" and layout == "borrowings":
            mine = [b for b in BOOKS if b[3] is None]
            fam = [b for b in BOOKS if b[3] is not None]
            return self._send(BORROWINGS % (rows(mine), rows(fam)))
        if view == "Profile" and layout == "edit_profile":
            return self._send(PROFILE_EDIT)
        if view == "Profile" and layout == "infos-user":
            return self._send(INFOS)
        return self._send(LOGIN)


if __name__ == "__main__":
    print(f"faux portail sur http://0.0.0.0:{PORT}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
