import { useEffect, useReducer } from 'react'
import { SENSOR_CONFIG_STORAGE_KEY, SENSOR_CONFIG_URL, WS_URL } from '../config/sensorsConfig'
import { initialSensorStore, sensorReducer, SENSOR_ACTIONS } from '../redux/sensorReducer'

export function useSensorRealtime() {
  const [store, dispatch] = useReducer(sensorReducer, initialSensorStore)

  useEffect(() => {
    let isCancelled = false

    async function loadInitialConfig() {
      const cached = localStorage.getItem(SENSOR_CONFIG_STORAGE_KEY)

      if (cached) {
        try {
          const cachedConfig = JSON.parse(cached)
          if (!isCancelled) {
            dispatch({ type: SENSOR_ACTIONS.SET_INITIAL_CONFIG, payload: cachedConfig })
          }
          return
        } catch (error) {
          console.warn('Cache de configuración inválida, se recargará desde API:', error)
        }
      }

      const response = await fetch(SENSOR_CONFIG_URL)
      const payload = await response.json()
      localStorage.setItem(SENSOR_CONFIG_STORAGE_KEY, JSON.stringify(payload))

      if (!isCancelled) {
        dispatch({ type: SENSOR_ACTIONS.SET_INITIAL_CONFIG, payload })
      }
    }

    loadInitialConfig().catch((error) => {
      console.error('No se pudo cargar la configuración inicial:', error)
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
