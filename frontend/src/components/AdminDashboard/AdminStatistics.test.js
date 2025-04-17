import { render, screen } from "@testing-library/react"
import AdminStatistics from "./AdminStatistics"

describe("AdminStatistics", () => {
  const mockStatistics = {
    totalDonors: 1200,
    totalRefugees: 5000,
    totalFieldWorkers: 300,
    totalDonations: 1500000,
  }

  it("should display statistics correctly", () => {
    render(<AdminStatistics statistics={mockStatistics} />)

    expect(screen.getByText(/1200 Donors/i)).toBeInTheDocument()
    expect(screen.getByText(/5000 Refugees/i)).toBeInTheDocument()
    expect(screen.getByText(/300 Workers/i)).toBeInTheDocument()
    expect(screen.getByText(/\$1500000/i)).toBeInTheDocument()
  })

  it("should display growth information", () => {
    render(<AdminStatistics statistics={mockStatistics} />)

    expect(screen.getByText(/+5% from last month/i)).toBeInTheDocument()
    expect(screen.getByText(/+10% from last month/i)).toBeInTheDocument()
    expect(screen.getByText(/+8% from last month/i)).toBeInTheDocument()
    expect(screen.getByText(/+12% from last month/i)).toBeInTheDocument()
  })
})

