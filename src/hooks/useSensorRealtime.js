import { useEffect, useReducer } from 'react'
import { LIMITS_STORAGE_KEY, LIMITS_URL, WS_URL } from '../config/sensorsConfig'
import { parseLimits } from '../utils/sensorUtils'
import { initialSensorStore, sensorReducer, SENSOR_ACTIONS } from '../redux/sensorReducer'

export function useSensorRealtime() {
  const [store, dispatch] = useReducer(sensorReducer, initialSensorStore)

  useEffect(() => {
    let isCancelled = false

    async function loadLimits() {
      const cached = localStorage.getItem(LIMITS_STORAGE_KEY)

      if (cached) {
        try {
          const cachedLimits = JSON.parse(cached)
          if (!isCancelled) {
            dispatch({ type: SENSOR_ACTIONS.SET_LIMITS, payload: cachedLimits })
          }
          return
        } catch (error) {
          console.warn('Cache de límites inválida, se recargará desde API:', error)
        }
      }

      const response = await fetch(LIMITS_URL)
      const payload = await response.json()
      const fetchedLimits = parseLimits(payload)
      localStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(fetchedLimits))

      if (!isCancelled) {
        dispatch({ type: SENSOR_ACTIONS.SET_LIMITS, payload: fetchedLimits })
      }
    }

    loadLimits().catch((error) => {
      console.error('No se pudieron cargar límites iniciales:', error)
    })

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    let socket
    let reconnectTimer
    let unmounted = false

    const connectSocket = () => {
      dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'conectando' })
      socket = new WebSocket(WS_URL)

      socket.onopen = () => {
        if (!unmounted) {
          dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'en línea' })
        }
      }

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          dispatch({ type: SENSOR_ACTIONS.APPLY_REALTIME, payload })
        } catch (error) {
          console.error('Mensaje WS inválido:', error)
        }
      }

      socket.onerror = () => {
        if (!unmounted) {
          dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'error' })
        }
      }

      socket.onclose = () => {
        if (!unmounted) {
          dispatch({ type: SENSOR_ACTIONS.SET_STATUS, payload: 'reconectando...' })
          reconnectTimer = setTimeout(connectSocket, 2000)
        }
      }
    }

    connectSocket()

    return () => {
      unmounted = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [])

  return store
}
