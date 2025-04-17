import { render, screen } from "@testing-library/react"
import DonorTracking from "./DonorTracking"

test("renders Donor Tracking Dashboard", () => {
  render(<DonorTracking />)
  const heading = screen.getByText(/Donor Tracking Dashboard/i)
  expect(heading).toBeInTheDocument()
})

