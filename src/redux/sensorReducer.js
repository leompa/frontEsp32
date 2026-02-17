import { buildSensorsFromConfig, applyRealtimePayload } from '../utils/sensorUtils'

export const SENSOR_ACTIONS = {
  SET_INITIAL_CONFIG: 'SET_INITIAL_CONFIG',
  SET_STATUS: 'SET_STATUS',
  APPLY_REALTIME: 'APPLY_REALTIME'
}

export const initialSensorStore = {
  sensors: buildSensorsFromConfig(),
  connectionStatus: 'conectando'
}

export function sensorReducer(state, action) {
  switch (action.type) {
    case SENSOR_ACTIONS.SET_INITIAL_CONFIG:
      return {
        ...state,
        sensors: buildSensorsFromConfig(action.payload)
      }
    case SENSOR_ACTIONS.SET_STATUS:
      return {
        ...state,
        connectionStatus: action.payload
      }
    case SENSOR_ACTIONS.APPLY_REALTIME:
      return {
        ...state,
        sensors: applyRealtimePayload(state.sensors, action.payload)
      }
    default:
      return state
  }
}
