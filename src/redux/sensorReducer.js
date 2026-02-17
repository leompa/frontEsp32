import { mergeBaseWithLimits, applyRealtimePayload } from '../utils/sensorUtils'

export const SENSOR_ACTIONS = {
  SET_LIMITS: 'SET_LIMITS',
  SET_STATUS: 'SET_STATUS',
  APPLY_REALTIME: 'APPLY_REALTIME'
}

export const initialSensorStore = {
  sensors: mergeBaseWithLimits(),
  connectionStatus: 'conectando'
}

export function sensorReducer(state, action) {
  switch (action.type) {
    case SENSOR_ACTIONS.SET_LIMITS:
      return {
        ...state,
        sensors: mergeBaseWithLimits(action.payload)
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
