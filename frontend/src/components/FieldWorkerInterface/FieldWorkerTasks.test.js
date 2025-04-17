import { render, screen } from "@testing-library/react"
import FieldWorkerTasks from "./FieldWorkerTasks"

test("renders the tasks list", () => {
  render(<FieldWorkerTasks />)
  const tasksHeading = screen.getByText(/Your Tasks/i)
  expect(tasksHeading).toBeInTheDocument()
})

test("displays mock tasks", async () => {
  render(<FieldWorkerTasks />)
  const taskItems = await screen.findAllByText(
    /Deliver Supplies to Zone A|Survey Refugees in Zone B|Report Water Supply Issues in Zone C/,
  )
  expect(taskItems.length).toBeGreaterThan(0)
})

