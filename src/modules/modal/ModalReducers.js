import { OPEN_MODAL, CLOSE_MODAL, TOGGLE_MODAL } from "./ModalActions";
const initialState = {};
export default function(state = initialState, action) {
  switch (action.type) {
    case OPEN_MODAL:
      console.log("OPEN", action);
      //Cheap way of getting data into modal for help rendering
      return { ...state, [action.modal]: action.payload || true };
    case CLOSE_MODAL:
      console.log("CLOSE", action);
      return { ...state, [action.modal]: false };
    case TOGGLE_MODAL:
      console.log("TOGGLE", action);
      const open = !state[action.modal];
      return {
        ...state,
        [action.modal]: open ? action.payload || true : false
      };
    default:
      return state;
  }
}
