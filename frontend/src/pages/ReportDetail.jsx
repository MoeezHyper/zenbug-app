import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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

        if (res.status === 401) {
          setUnauthorized(true);
          localStorage.removeItem("token");
          return;
        }

        const data = await res.json();
        const foundReport = data.data.find((r) => r._id === id);

        if (foundReport) {
          setReport(foundReport);
          setNewStatus(foundReport.status);
        }
      } catch (err) {
        console.error("Fetch failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    setUpdateMessage("");

    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const text = await res.text();

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/", {
          state: { message: "Please login again" },
          replace: true,
        });
        return;
      }

      if (!res.ok) throw new Error("Failed to update status");

      const updated = JSON.parse(text);
      setReport((prev) => ({ ...prev, status: updated.data.status }));
      setUpdateMessage("Status updated successfully");
    } catch (err) {
      console.error("Update error:", err.message);
      setUpdateMessage("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  if (unauthorized) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/90">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-white text-center mt-10">⚠️ Report not found.</div>
    );
  }

  const {
    title,
    description,
    email,
    imageUrl,
    videoUrl,
    severity,
    status,
    createdAt,
    updatedAt,
    metadata,
    name,
  } = report;

  return (
    <div className="flex md:pl-[100px] max-md:pl-4 max-md:pr-4 max-md:py-10 pr-5 ml-5 overflow-auto">
      <div className="flex flex-1 justify-center items-start pt-10 text-white font-montserrat w-full">
        <div className="bg-neutral-900 my-5 p-10 rounded-2xl flex flex-col md:flex-row justify-between gap-10 w-full max-w-[85%] min-h-[700px]">
          {/* LEFT SIDE */}
          <div className="flex flex-col justify-between w-full md:w-1/2">
            <div>
              <h1 className="text-2xl font-bold mb-5">Title</h1>
              <p className="text-xl break-words">{title}</p>
            </div>

            <div className="mt-6">
              <p className="py-1">
                <strong>Description:</strong> {description}
              </p>
              <p className="py-1">
                <strong>Reporter Name:</strong> {name || "N/A"}
              </p>
              <p className="py-1">
                <strong>Reporter Email:</strong> {email || "N/A"}
              </p>
              <p className="py-1">
                <strong>Status:</strong>{" "}
                <span
                  className={`capitalize ${
                    status === "open"
                      ? "text-red-500"
                      : status === "in-progress"
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {status}
                </span>
              </p>
              <p className="py-1">
                <strong>Severity:</strong>{" "}
                <span
                  className={`capitalize ${
                    severity === "high"
                      ? "text-red-500"
                      : severity === "medium"
                        ? "text-yellow-500"
                        : "text-white"
                  }`}
                >
                  {severity}
                </span>
              </p>
              <p className="py-1">
                <strong>Created At:</strong>{" "}
                {new Date(createdAt).toLocaleString()}
              </p>
              {updatedAt !== createdAt && (
                <p className="py-1">
                  <strong>Updated At:</strong>{" "}
                  {new Date(updatedAt).toLocaleString()}
                </p>
              )}

              {/* Update Status */}
              <div className="mt-4">
                <label className="block mb-2 font-semibold">
                  Update Status:
                </label>
                <div className="flex flex-wrap gap-4 items-center">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    className="bg-neutral-800 px-4 py-1 rounded hover:bg-neutral-700 cursor-pointer transition-all duration-200"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Submit"}
                  </button>
                </div>
                {updateMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      updateMessage.includes("successfully")
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {updateMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-6">
              <strong>Metadata:</strong>
              <ul className="list-disc list-inside ml-2 sm:ml-4">
                <li>
                  <strong>URL:</strong>{" "}
                  <a
                    href={metadata.url}
                    className="text-blue-400 underline break-all"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {metadata.url}
                  </a>
                </li>
                <li>
                  <strong>Browser:</strong> {metadata.browser}
                </li>
                <li>
                  <strong>OS:</strong> {metadata.os}
                </li>
                <li>
                  <strong>Viewport:</strong> {metadata.viewport}
                </li>
                <li>
                  <strong>IP Address:</strong> {metadata.ip || "N/A"}
                </li>
                <li>
                  <strong>Location:</strong> {metadata.location || "N/A"}
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE - ATTACHMENT (Video or Screenshot) */}
          {(videoUrl || imageUrl) && (
            <div className="flex flex-col items-center w-full">
              <strong className="text-2xl font-bold mb-4">
                {videoUrl ? "Video" : "Screenshot"}
              </strong>

              {videoUrl ? (
                <video className="rounded-lg w-full" controls src={videoUrl} />
              ) : (
                <>
                  {imageLoading && !imageError && (
                    <div className="flex items-center justify-center w-full ">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {!imageError && (
                    <img
                      src={imageUrl}
                      alt="Report Screenshot"
                      className={`rounded-lg w-full object-contain ${
                        imageLoading ? "hidden" : "block"
                      }`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  )}

                  {imageError && (
                    <p className="mt-4 text-red-500">
                      ⚠️ Failed to load screenshot.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
