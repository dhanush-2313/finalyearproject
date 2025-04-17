import { render, screen } from "@testing-library/react"
import DonorDetails from "./DonorDetails"

test("renders the donations list", () => {
  render(<DonorDetails />)
  const donationsHeading = screen.getByText(/Your Donations/i)
  expect(donationsHeading).toBeInTheDocument()
})

test("displays mock donations", async () => {
  render(<DonorDetails />)
  const donationItems = await screen.findAllByText(/Food Supplies|Medical Kits|Clothing/)
  expect(donationItems.length).toBeGreaterThan(0)
})

