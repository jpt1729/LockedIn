"use client"
import { createContext, useContext, useState, useCallback } from "react"
import { nanoid } from "nanoid"

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: nanoid(),
      createdAt: Date.now(),
      ...notification,
    }
    setNotifications((prev) => [...prev, newNotification])

    if (notification.duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
      }, notification.duration)
    }
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider")
  return ctx
}
