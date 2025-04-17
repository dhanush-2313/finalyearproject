import { render, screen } from "@testing-library/react"
import Dashboard from "./Dashboard"

describe("Dashboard Component", () => {
  test("renders dashboard with widgets", () => {
    render(<Dashboard />)
    const welcomeMessage = screen.getByText(/welcome to your dashboard/i)
    const statsSection = screen.getByText(/statistics/i)

    expect(welcomeMessage).toBeInTheDocument()
    expect(statsSection).toBeInTheDocument()
  })

  test("displays recent activities", () => {
    render(<Dashboard />)
    const activitiesSection = screen.getByText(/recent activities/i)

    expect(activitiesSection).toBeInTheDocument()
  })
})

