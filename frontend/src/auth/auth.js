import { postData } from "../api/api"

// Login function
export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }
  const data = { email, password }
  const result = await postData("/login", data)
  return result
}

export const signup = async (email, password, name) => {
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required")
  }
  const data = { email, password, name }
  const result = await postData("/signup", data)
  return result
}

