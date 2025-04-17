import { fetchData, postData } from "./api"
import axios from "axios"

// Mock axios
jest.mock("axios")

describe("API tests", () => {
  test("should fetch data successfully", async () => {
    const mockResponse = { data: { message: "Success" } }
    axios.get.mockResolvedValue(mockResponse)

    const result = await fetchData("/endpoint")
    expect(result).toEqual(mockResponse.data)
  })

  test("should handle fetch data error", async () => {
    axios.get.mockRejectedValue(new Error("Fetch Error"))

    await expect(fetchData("/endpoint")).rejects.toThrow("Fetch Error")
  })

  test("should post data successfully", async () => {
    const mockResponse = { data: { message: "Data posted successfully" } }
    axios.post.mockResolvedValue(mockResponse)

    const result = await postData("/endpoint", { name: "John" })
    expect(result).toEqual(mockResponse.data)
  })

  test("should handle post data error", async () => {
    axios.post.mockRejectedValue(new Error("Post Error"))

    await expect(postData("/endpoint", { name: "John" })).rejects.toThrow("Post Error")
  })

  test("should handle missing endpoint", async () => {
    axios.get.mockRejectedValue(new Error("Endpoint not found"))
    await expect(fetchData("")).rejects.toThrow("Endpoint not found")
  })

  test("should handle invalid data in post request", async () => {
    axios.post.mockRejectedValue(new Error("Invalid data"))
    await expect(postData("/endpoint", {})).rejects.toThrow("Invalid data")
  })
})

