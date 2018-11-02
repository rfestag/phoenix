/* Types */
export const OPEN_MODAL = "OPEN_MODAL";
export const CLOSE_MODAL = "CLOSE_MODAL";
export const TOGGLE_MODAL = "TOGGLE_MODAL";

/* Left panel panes */
export const SETTINGS_MODAL = "SETTINGS_MODAL";
export const QUERY_MODAL = "QUERY_MODAL";

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
export const openQueryModal = payload => openModal(QUERY_MODAL, payload);
export const closeQueryModal = () => closeModal(QUERY_MODAL);
export const toggleQueryModal = payload => toggleModal(QUERY_MODAL, payload);

/* Helpers */
export const modalOpen = modal => state => state.modal[modal];
export const modalClosed = modal => state => state.modal[modal];
export const settingsOpen = state => state.modal[SETTINGS_MODAL];
export const queryOpen = state => state.modal[QUERY_MODAL];
