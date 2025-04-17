import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import App from "./App"

test("renders Home component", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText(/welcome to your platform/i)).toBeInTheDocument()
})

test("renders NotFound component for unknown route", () => {
  render(
    <MemoryRouter initialEntries={["/unknown"]}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByText(/page not found/i)).toBeInTheDocument()
})

