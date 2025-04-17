import { render, fireEvent } from "@testing-library/react"
import ConfirmationModal from "./ConfirmationModal"

describe("ConfirmationModal", () => {
  it("renders correctly when open", () => {
    const { getByText } = render(
      <ConfirmationModal isOpen={true} message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(getByText("Are you sure?")).toBeInTheDocument()
    expect(getByText("Confirm")).toBeInTheDocument()
    expect(getByText("Cancel")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    const { queryByText } = render(
      <ConfirmationModal isOpen={false} message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(queryByText("Are you sure?")).toBeNull()
  })

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirmMock = jest.fn()
    const { getByText } = render(
      <ConfirmationModal isOpen={true} message="Are you sure?" onConfirm={onConfirmMock} onCancel={() => {}} />,
    )
    fireEvent.click(getByText("Confirm"))
    expect(onConfirmMock).toHaveBeenCalledTimes(1)
  })

  it("calls onCancel when cancel button is clicked", () => {
    const onCancelMock = jest.fn()
    const { getByText } = render(
      <ConfirmationModal isOpen={true} message="Are you sure?" onConfirm={() => {}} onCancel={onCancelMock} />,
    )
    fireEvent.click(getByText("Cancel"))
    expect(onCancelMock).toHaveBeenCalledTimes(1)
  })
})

