import { render, screen, waitFor } from "@testing-library/react"
import AdminDashboard from "./AdminDashboard"
import { fetchDashboardData } from "../../api/api"

// Mock the API function to simulate a response
jest.mock("../../api/api", () => ({
  fetchDashboardData: jest.fn(),
}))

describe("AdminDashboard", () => {
  it("should render loading state initially", () => {
    render(<AdminDashboard />)
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument()
  })

  it("should render dashboard data after fetching", async () => {
    const mockData = {
      donors: 1200,
      refugees: 5000,
      fieldWorkers: 300,
      donations: 1500000,
    }

    fetchDashboardData.mockResolvedValue(mockData)

    render(<AdminDashboard />)

    await waitFor(() => expect(screen.getByText(/1200 Donors/i)).toBeInTheDocument())
    expect(screen.getByText(/5000 Refugees/i)).toBeInTheDocument()
    expect(screen.getByText(/300 Field Workers/i)).toBeInTheDocument()
    expect(screen.getByText(/\$1500000/i)).toBeInTheDocument()
  })

  it("should handle errors gracefully", async () => {
    fetchDashboardData.mockRejectedValue(new Error("Failed to fetch data"))

    render(<AdminDashboard />)

    await waitFor(() => expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument())
  })
})

