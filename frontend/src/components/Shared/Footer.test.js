import { render } from "@testing-library/react"
import Footer from "./Footer"

describe("Footer", () => {
  it("renders copyright and links correctly", () => {
    const { getByText } = render(<Footer />)
    expect(getByText(/©️/i)).toBeInTheDocument()
    expect(getByText("Privacy Policy")).toBeInTheDocument()
    expect(getByText("Terms of Service")).toBeInTheDocument()
    expect(getByText("Contact Us")).toBeInTheDocument()
  })
})

