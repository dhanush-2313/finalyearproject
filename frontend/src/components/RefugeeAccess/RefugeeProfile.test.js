import { render, screen, fireEvent } from "@testing-library/react"
import RefugeeProfile from "./RefugeeProfile"

const mockData = { name: "Jane Doe", age: 25 }
const mockOnUpdate = jest.fn()

describe("RefugeeProfile Component", () => {
  it("renders profile data", () => {
    render(<RefugeeProfile data={mockData} onUpdate={mockOnUpdate} />)
    expect(screen.getByText(/jane doe/i)).toBeInTheDocument()
    expect(screen.getByText(/25/i)).toBeInTheDocument()
  })

  it("allows editing of profile data", () => {
    render(<RefugeeProfile data={mockData} onUpdate={mockOnUpdate} />)
    fireEvent.click(screen.getByText(/edit profile/i))
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "John Smith" } })
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: "30" } })
    fireEvent.click(screen.getByText(/save/i))
    expect(mockOnUpdate).toHaveBeenCalledWith({ name: "John Smith", age: 30 })
  })
})

