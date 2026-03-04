import { personInit } from "./personInit.js";
import { initialState } from "./initialState.js";

export function reducer(state, action) {
  switch (action.type) {
    case "SET_A": return { ...state, personA: { ...state.personA, [action.field]: action.value } };
    case "SET_B": return { ...state, personB: { ...state.personB, [action.field]: action.value } };
    case "SET_HIJOS": {
      const newTotal = action.value;
      const newM6 = Math.min(state.hijosM6, newTotal);
      const newJ6a15 = Math.min(state.hijos6a15, newTotal - newM6);
      return { ...state, hijos: newTotal, hijosM6: newM6, hijos6a15: newJ6a15 };
    }
    case "SET_HIJOS_M6":   return { ...state, hijosM6: action.value };
    case "SET_HIJOS_6A15": return { ...state, hijos6a15: action.value };
    case "RESET_B": return { ...state, personB: { ...personInit } };
    case "RESET": return { ...initialState };
    case "RESTORE": return { ...initialState, ...action.payload };
    default: return state;
  }
}
