import { login, signup } from "./auth"
import { postData } from "../api/api"

// Mock postData
jest.mock("../api/api")

describe("auth logic tests", () => {
  test("should login successfully", async () => {
    const mockResponse = { message: "Login successful" }
    postData.mockResolvedValue(mockResponse)

    const result = await login("test@example.com", "password123")
    expect(result).toEqual(mockResponse)
  })

  test("should handle login error", async () => {
    postData.mockRejectedValue(new Error("Login Error"))

    await expect(login("test@example.com", "wrongpassword")).rejects.toThrow("Login Error")
  })

  test("should signup successfully", async () => {
    const mockResponse = { message: "Signup successful" }
    postData.mockResolvedValue(mockResponse)

    const result = await signup("test@example.com", "password123", "John Doe")
    expect(result).toEqual(mockResponse)
  })

  test("should handle signup error", async () => {
    postData.mockRejectedValue(new Error("Signup Error"))

    await expect(signup("test@example.com", "password123", "John Doe")).rejects.toThrow("Signup Error")
  })

  test("should fail with missing email or password", async () => {
    await expect(login("", "")).rejects.toThrow("Email and password are required")
  })

  test("should fail with missing email, password, or name in signup", async () => {
    await expect(signup("", "", "")).rejects.toThrow("Email, password, and name are required")
  })
})

