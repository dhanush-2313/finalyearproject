import { render, screen, fireEvent } from "@testing-library/react"
import Login from "./Login"

test("renders Login page", () => {
  render(<Login />)
  expect(screen.getByText(/Login/i)).toBeInTheDocument()
})

test("handles email input", () => {
  render(<Login />)
  const emailInput = screen.getByLabelText(/Email:/i)
  fireEvent.change(emailInput, { target: { value: "test@example.com" } })
  expect(emailInput.value).toBe("test@example.com")
})

