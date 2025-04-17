"use client"

import { useState } from "react"
import PropTypes from "prop-types"

const RefugeeProfile = ({ data, onUpdate }) => {
  const [editable, setEditable] = useState(false)
  const [formData, setFormData] = useState(data)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(formData)
    setEditable(false)
  }

  return (
    <div className="refugee-profile">
      {editable ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <label>Age:</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditable(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <p>Name: {data.name}</p>
          <p>Age: {data.age}</p>
          <button onClick={() => setEditable(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  )
}

RefugeeProfile.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
}

export default RefugeeProfile

