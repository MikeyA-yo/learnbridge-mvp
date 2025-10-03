"use client"

import type { User } from "./types"

const USER_KEY = "learnbridge_user"

export function login(email: string, password: string): boolean {
  // Dummy authentication - accepts any email/password
  if (email && password) {
    const existingUser = getUser()
    if (!existingUser || existingUser.email !== email) {
      // Create new user
      const newUser: User = {
        email,
        language: "hausa",
        progress: {},
        settings: {
          dyslexiaFont: false,
          audioSpeed: "normal",
          audioPitch: "normal",
          subtitles: true,
          audioNavigation: false,
        },
      }
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    }
    return true
  }
  return false
}

export function signup(email: string, password: string): boolean {
  return login(email, password)
}

export function logout(): void {
  localStorage.removeItem(USER_KEY)
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export function updateUser(updates: Partial<User>): void {
  const user = getUser()
  if (user) {
    const updatedUser = { ...user, ...updates }
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}
