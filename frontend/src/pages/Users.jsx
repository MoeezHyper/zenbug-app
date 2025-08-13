import React, { useState, useEffect } from "react";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState({});
  const [projectNames, setProjectNames] = useState(["all"]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out admin users
        const filteredUsers = data.data.filter(
          (user) => user.username !== "admin"
        );
        setUsers(filteredUsers);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Update user project
  const updateUserProject = async (userId, newProject) => {
    setUpdatingUser(userId);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/auth/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project: newProject }),
      });

      if (response.ok) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, project: newProject } : user
          )
        );

        // Show success message
        setSuccessMessage((prev) => ({ ...prev, [userId]: true }));
        setTimeout(() => {
          setSuccessMessage((prev) => ({ ...prev, [userId]: false }));
        }, 3000);
      } else {
        console.error("Failed to update user project");
      }
    } catch (error) {
      console.error("Error updating user project:", error);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Handle project change
  const handleProjectChange = (userId, newProject) => {
    updateUserProject(userId, newProject);
  };

  // Fetch project names from reports
  const fetchProjectNames = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/feedback/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjectNames(data.data);
      } else {
        console.error("Failed to fetch project names");
      }
    } catch (error) {
      console.error("Error fetching project names:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjectNames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, project: "all" }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ username: "", email: "", password: "" });
        setTimeout(() => {
          setIsSuccess(false);
          setIsModalOpen(false);
          // Refresh users list
          fetchUsers();
        }, 2000);
      } else {
        console.error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setFormData({ username: "", email: "", password: "" });
  };

  return (
    <div className="text-white mx-20 py-8">
      <div className="flex justify-end items-center mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus size={20} />
          Add New User
        </button>
      </div>

      {/* Users List */}
      <div className="bg-neutral-800 rounded-lg ml-20 p-5 border border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>

        {loadingUsers ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-neutral-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-neutral-400 text-center py-8">No users found</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg border border-neutral-600">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{user.username}</h3>
                    <p className="text-sm text-neutral-400">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-300">Project:</span>
                    <select
                      value={user.project || "all"}
                      onChange={(e) =>
                        handleProjectChange(user._id, e.target.value)
                      }
                      disabled={updatingUser === user._id}
                      className="bg-neutral-600 border cursor-pointer border-neutral-500 rounded px-1 py-1 text-white focus:outline-none focus:border-neutral-400 disabled:opacity-50"
                    >
                      {projectNames.map((project) => (
                        <option key={project} value={project}>
                          {project.charAt(0).toUpperCase() + project.slice(1)}
                        </option>
                      ))}
                    </select>

                    {updatingUser === user._id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                  </div>
                </div>

                {successMessage[user._id] && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <FiCheck size={16} className="text-green-500" />
                    <p className="text-sm text-green-500">
                      Project assignment updated successfully!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4 border border-neutral-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>

            {isSuccess ? (
              <div className="text-center py-8">
                <FiCheck size={48} className="text-green-500 mx-auto mb-4" />
                <p className="text-green-500 text-lg">
                  User created successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 items-center">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-2"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-neutral-300 disabled:bg-neutral-700 text-black py-2 px-3 rounded-lg flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
