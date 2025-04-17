import { render, screen } from "@testing-library/react"
import Home from "./Home"

test("renders Home page", () => {
  render(<Home />)
  expect(screen.getByText(/Welcome to the Decentralized Cloud Security Platform/i)).toBeInTheDocument()
})

