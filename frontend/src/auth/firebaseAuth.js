import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "./firebaseConfig"

// Sign up with email and password
export const signUpWithEmail = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(error.message)
  }
}

export const loginWithEmail = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(error.message)
  }
}

// Logout
export const logOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(error.message)
  }
}

