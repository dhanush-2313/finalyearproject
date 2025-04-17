import { render, screen, fireEvent } from "@testing-library/react"
import Signup from "./Signup"

describe("Signup Component", () => {
  test("renders signup form", () => {
    render(<Signup />)
    const usernameField = screen.getByPlaceholderText(/username/i)
    const emailField = screen.getByPlaceholderText(/email/i)
    const passwordField = screen.getByPlaceholderText(/password/i)
    const signupButton = screen.getByText(/sign up/i)

    expect(usernameField).toBeInTheDocument()
    expect(emailField).toBeInTheDocument()
    expect(passwordField).toBeInTheDocument()
    expect(signupButton).toBeInTheDocument()
  })

  test("handles form submission", () => {
    render(<Signup />)
    const signupButton = screen.getByText(/sign up/i)

    fireEvent.click(signupButton)

    expect(screen.getByText(/creating your account.../i)).toBeInTheDocument()
  })
})

