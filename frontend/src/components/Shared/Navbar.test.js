import { render } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import Navbar from "./Navbar"

describe("Navbar", () => {
  it("renders all the links correctly", () => {
    const { getByText } = render(
      <Router>
        <Navbar />
      </Router>,
    )
    expect(getByText("AidSecure")).toBeInTheDocument()
    expect(getByText("Dashboard")).toBeInTheDocument()
    expect(getByText("Donor Tracking")).toBeInTheDocument()
    expect(getByText("Refugee Access")).toBeInTheDocument()
    expect(getByText("Field Workers")).toBeInTheDocument()
    expect(getByText("Admin")).toBeInTheDocument()
    expect(getByText("Login")).toBeInTheDocument()
  })
})

