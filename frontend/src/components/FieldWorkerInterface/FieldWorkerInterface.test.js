import { render, screen } from "@testing-library/react"
import FieldWorkerInterface from "./FieldWorkerInterface"

test("renders Field Worker Dashboard", () => {
  render(<FieldWorkerInterface />)
  const heading = screen.getByText(/Field Worker Dashboard/i)
  expect(heading).toBeInTheDocument()
})

test("displays the task list", () => {
  render(<FieldWorkerInterface />)
  const tasksHeading = screen.getByText(/Your Tasks/i)
  expect(tasksHeading).toBeInTheDocument()
})

