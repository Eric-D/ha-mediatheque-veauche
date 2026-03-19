"""Constants for the Médiathèque de Veauche integration."""

DOMAIN = "mediatheque_veauche"

CONF_USERNAME = "username"
CONF_PASSWORD = "password"
CONF_SCAN_INTERVAL = "scan_interval"

DEFAULT_SCAN_INTERVAL = 60  # minutes

BASE_URL = "https://mediatheque.veauche.fr"
LOGIN_URL = f"{BASE_URL}/index.php"
BORROWINGS_URL = f"{BASE_URL}/index.php/mon-profil?view=Profile&layout=borrowings"
BOOK_URL = f"{BASE_URL}/index.php/mon-profil?view=Book&id="
PROFILE_EDIT_URL = f"{BASE_URL}/index.php/mon-profil?view=Profile&layout=edit_profile"
INFOS_USER_URL = f"{BASE_URL}/index.php/mon-profil?view=Profile&layout=infos-user"
