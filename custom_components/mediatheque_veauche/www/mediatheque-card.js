class MediathequeCard extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
  }

  set hass(hass) {
    var entityId = this.config.entity;
    if (!entityId || !hass || !hass.states) return;
    var state = hass.states[entityId];
    var stateStr = state ? state.state : 'unavailable';
    if (this._stateStr === stateStr) return;
    this._stateStr = stateStr;
    this.innerHTML =
      '<ha-card style="padding:16px">' +
      '<b>Test card v1</b><br>' +
      'Entity: ' + entityId + '<br>' +
      'State: ' + stateStr +
      '</ha-card>';
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mediatheque-card', MediathequeCard);
