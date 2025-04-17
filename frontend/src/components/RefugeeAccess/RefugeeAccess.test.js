import { render, screen, waitFor } from "@testing-library/react"
import RefugeeAccess from "./RefugeeAccess"
import { fetchRefugeeData } from "../../api/api"

jest.mock("../../api/api")

describe("RefugeeAccess Component", () => {
  it("renders loading state initially", () => {
    render(<RefugeeAccess />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("renders refugee data when fetched successfully", async () => {
    fetchRefugeeData.mockResolvedValueOnce({ name: "John Doe", age: 30 })
    render(<RefugeeAccess />)
    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })
  })

  it("displays error message on fetch failure", async () => {
    fetchRefugeeData.mockRejectedValueOnce(new Error("Failed to fetch"))
    render(<RefugeeAccess />)
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})

