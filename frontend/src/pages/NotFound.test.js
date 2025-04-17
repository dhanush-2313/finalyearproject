import { render, screen } from "@testing-library/react"
import NotFound from "./NotFound"

describe("NotFound Component", () => {
  test("renders 404 message", () => {
    render(<NotFound />)
    const notFoundMessage = screen.getByText(/404 - page not found/i)

    expect(notFoundMessage).toBeInTheDocument()
  })

  test("provides link to go back home", () => {
    render(<NotFound />)
    const homeLink = screen.getByText(/go back home/i)

    expect(homeLink).toBeInTheDocument()
  })
})

