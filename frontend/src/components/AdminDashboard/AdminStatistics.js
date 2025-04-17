import "./AdminStatistics.css"

const AdminStatistics = ({ statistics }) => {
  return (
    <div className="admin-statistics">
      <h2>Admin Statistics Overview</h2>
      <div className="statistics-cards">
        <div className="statistics-card">
          <h3>Donor Growth</h3>
          <p>{statistics.totalDonors} Donors</p>
          <p className="growth-info">+5% from last month</p>
        </div>
        <div className="statistics-card">
          <h3>Refugee Assistance</h3>
          <p>{statistics.totalRefugees} Refugees</p>
          <p className="growth-info">+10% from last month</p>
        </div>
        <div className="statistics-card">
          <h3>Field Worker Engagement</h3>
          <p>{statistics.totalFieldWorkers} Workers</p>
          <p className="growth-info">+8% from last month</p>
        </div>
        <div className="statistics-card">
          <h3>Total Donations</h3>
          <p>${statistics.totalDonations}</p>
          <p className="growth-info">+12% from last month</p>
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics

