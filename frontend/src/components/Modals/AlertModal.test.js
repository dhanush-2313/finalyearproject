"use client"
import { render, fireEvent } from "@testing-library/react"
import AlertModal from "./AlertModal"

describe("AlertModal", () => {
  it("renders correctly when open", () => {
    const { getByText } = render(<AlertModal isOpen={true} message="Test Alert" onClose={() => {}} />)
    expect(getByText("Test Alert")).toBeInTheDocument()
    expect(getByText("Close")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    const { queryByText } = render(<AlertModal isOpen={false} message="Test Alert" onClose={() => {}} />)
    expect(queryByText("Test Alert")).toBeNull()
  })

  it("calls onClose when close button is clicked", () => {
    const onCloseMock = jest.fn()
    const { getByText } = render(<AlertModal isOpen={true} message="Test Alert" onClose={onCloseMock} />)
    fireEvent.click(getByText("Close"))
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })
})

