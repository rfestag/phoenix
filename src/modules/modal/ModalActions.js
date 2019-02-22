/* Types */
export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";
export const TOGGLE_MODAL = "TOGGLE_MODAL";

/* Left panel panes */
export const SETTINGS_MODAL = "SETTINGS_MODAL";
export const FIELD_MODAL = "FIELD_MODAL";
export const GEOMETRY_MODAL = "GEOMETRY_MODAL";

/* Actions */
export const openModal = (modal, payload) => ({
  type: OPEN_MODAL,
  modal,
  payload
});
export const closeModal = modal => ({ type: CLOSE_MODAL, modal });
export const toggleModal = (modal, payload) => ({
  type: TOGGLE_MODAL,
  modal,
  payload
});
export const openSettingsModal = payload => openModal(SETTINGS_MODAL, payload);
export const closeSettingsModal = () => closeModal(SETTINGS_MODAL);
export const toggleSettingsModal = payload =>
  toggleModal(SETTINGS_MODAL, payload);

export const openFieldModal = payload => openModal(FIELD_MODAL, payload);
export const closeFieldModal = () => closeModal(FIELD_MODAL);
export const toggleFieldModal = payload => toggleModal(FIELD_MODAL, payload);

export const openGeometryModal = payload => openModal(GEOMETRY_MODAL, payload);
export const closeGeometryModal = () => closeModal(GEOMETRY_MODAL);
export const toggleGeometryModal = payload =>
  toggleModal(GEOMETRY_MODAL, payload);

/* Helpers */
export const modalOpen = modal => state => state.modal[modal];
export const modalClosed = modal => state => state.modal[modal];
export const settingsOpen = state => state.modal[SETTINGS_MODAL];
export const fieldOpen = state => state.modal[FIELD_MODAL];
export const geometryOpen = state => state.modal[GEOMETRY_MODAL];
