
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { BookingsChart } from "./bookings-chart"
import { CourtUtilizationChart } from "./court-utilization-chart"

const DashboardContent: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {/* Add any additional header elements here */}
      </div>

      {/* Overview Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">125</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">87</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Currently online</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">$1,250</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bookings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsChart />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Court Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <CourtUtilizationChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export { DashboardContent };
