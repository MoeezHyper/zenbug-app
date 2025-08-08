import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 15;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      try {
        const res = await fetch(`${apiUrl}/feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();
        setReports(data.data);
      } catch (err) {
        console.error("Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, severityFilter]);

  const filteredReports = reports.filter((report) => {
    const statusMatch =
      statusFilter === "all" || report.status === statusFilter;
    const severityMatch =
      severityFilter === "all" || report.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  return (
    <div className="flex flex-col md:flex-row md:pl-[100px]">
      <div className="flex flex-1 flex-col justify-center items-center overflow-x-auto min-h-screen px-4 py-8 max-md:py-18">
        <div className="bg-zinc-800/80 md:min-h-[90%] flex flex-col w-full max-w-7xl px-4 sm:px-10 py-6 sm:py-10 rounded-2xl">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-6">
            <p className="font-bold font-varela">Filter Options: </p>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 rounded bg-zinc-700 text-white font-varela border-b"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2 py-1 rounded bg-zinc-700 text-white font-varela border-b"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full text-white border-white border-4 outline-2 outline-white rounded-md shadow-md">
              <thead className="bg-gray-100 text-left text-[14px] sm:text-[16px] font-medium font-varela">
                <tr>
                  <th className="px-4 py-2 min-w-[300px] sm:min-w-[400px] text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-2 text-gray-700">Status</th>
                  <th className="px-4 py-2 text-gray-700">Severity</th>
                  <th className="px-4 py-2 text-gray-700">Created At</th>
                  <th className="px-4 py-2 text-gray-700">Updated At</th>
                </tr>
              </thead>
              <tbody className="font-montserrat text-sm">
                {currentReports.map((report) => (
                  <tr
                    key={report._id}
                    onClick={() => navigate(`/report/${report._id}`)}
                    className="border-t cursor-pointer hover:bg-gray-800/90"
                  >
                    <td className="px-4 py-2">{report.title}</td>
                    <td
                      className={`px-4 py-2 font-bold capitalize ${
                        report.status === "open"
                          ? "text-red-500"
                          : report.status === "in-progress"
                            ? "text-yellow-500"
                            : "text-green-500"
                      }`}
                    >
                      {report.status}
                    </td>
                    <td
                      className={`px-4 py-2 font-bold capitalize ${
                        report.severity === "high"
                          ? "text-red-500"
                          : report.severity === "medium"
                            ? "text-yellow-500"
                            : "text-white"
                      }`}
                    >
                      {report.severity}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {(() => {
                        const createdAt = new Date(report.createdAt);
                        const now = new Date();
                        const diffMs = now - createdAt;
                        const diffMins = Math.floor(diffMs / (1000 * 60));
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

                        if (diffMins < 1) return "Just now";
                        if (diffMins < 60)
                          return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
                        if (diffHours < 24)
                          return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

                        return createdAt.toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        });
                      })()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {report.createdAt === report.updatedAt
                        ? null
                        : (() => {
                            const updatedAt = new Date(report.updatedAt);
                            const now = new Date();
                            const diffMs = now - updatedAt;
                            const diffMins = Math.floor(diffMs / (1000 * 60));
                            const diffHours = Math.floor(
                              diffMs / (1000 * 60 * 60)
                            );

                            if (diffMins < 1) return "Just now";
                            if (diffMins < 60)
                              return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
                            if (diffHours < 24)
                              return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

                            return updatedAt.toLocaleString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            });
                          })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex xl:fixed xl:bottom-[10%] xl:left-[50%] justify-center mt-6 flex-wrap gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-1 rounded border border-white text-sm ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-700 text-white hover:bg-zinc-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
