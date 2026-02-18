import { buildSensorsFromConfig } from '../utils/sensorUtils'

export const SENSOR_ACTIONS = {
  SET_SENSORS: 'SET_SENSORS',
  SET_STATUS: 'SET_STATUS',
  RESET_SENSORS: 'RESET_SENSORS'
}

export const initialSensorStore = {
  sensors: buildSensorsFromConfig(),
  connectionStatus: 'inicializando'
}

export function sensorReducer(state, action) {
  switch (action.type) {
    case SENSOR_ACTIONS.SET_SENSORS:
      return {
        ...state,
        sensors: buildSensorsFromConfig(action.payload, { useOnlyPayloadKeys: true })
      }
    case SENSOR_ACTIONS.SET_STATUS:
      return {
        ...state,
        connectionStatus: action.payload
      }
    case SENSOR_ACTIONS.RESET_SENSORS:
      return {
        ...state,
        sensors: {},
        ...initialSensorStore,
        connectionStatus: 'recargando...'
      }
    default:
      return state
  }
}
