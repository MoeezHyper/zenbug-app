import React, { useState, useEffect } from "react";
import { FiPlus, FiX, FiCheck, FiEdit2 } from "react-icons/fi";

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserProjects, setSelectedUserProjects] = useState([]);
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
  const updateUserProject = async (userId, newProjects) => {
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
        body: JSON.stringify({ projects: newProjects }),
      });

      if (response.ok) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, projects: newProjects } : user
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
  const handleProjectChange = (userId, newProjects) => {
    updateUserProject(userId, newProjects);
    setIsProjectModalOpen(false);
  };

  // Open project modal
  const openProjectModal = (userId, currentProjects) => {
    setSelectedUserId(userId);
    // Ensure we always work with an array
    const projects = Array.isArray(currentProjects)
      ? currentProjects
      : currentProjects
        ? [currentProjects]
        : ["all"];
    setSelectedUserProjects(projects);
    setIsProjectModalOpen(true);
  };

  // Close project modal
  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserProjects([]);
  };

  // Toggle project selection
  const toggleProjectSelection = (project) => {
    setSelectedUserProjects((prev) => {
      if (project === "all") {
        // If "all" is selected, clear all other selections and only select "all"
        if (prev.includes("all")) {
          // If "all" was already selected, unselect it
          return prev.filter((p) => p !== "all");
        } else {
          // Select only "all" and clear everything else
          return ["all"];
        }
      } else {
        // If any other project is selected, remove "all" from selection
        let newProjects = prev.filter((p) => p !== "all");

        if (newProjects.includes(project)) {
          // Remove the project if it's already selected
          newProjects = newProjects.filter((p) => p !== project);
        } else {
          // Add the project if it's not selected
          newProjects = [...newProjects, project];
        }

        return newProjects;
      }
    });
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
        body: JSON.stringify({ ...formData, projects: ["all"] }),
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-300">
                        Projects:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {user.projects && user.projects.length > 0 ? (
                          user.projects.map((project, index) => (
                            <span
                              key={index}
                              className="text-xs text-white px-2 py-1 bg-neutral-600 rounded"
                            >
                              {project.charAt(0).toUpperCase() +
                                project.slice(1)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white px-2 py-1 bg-neutral-600 rounded">
                            All
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          openProjectModal(user._id, user.projects)
                        }
                        disabled={updatingUser === user._id}
                        className="text-neutral-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                        title="Edit projects"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>

                    {updatingUser === user._id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                  </div>
                </div>

                {successMessage[user._id] && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <FiCheck size={16} className="text-green-500" />
                    <p className="text-sm text-green-500">
                      Project assignments updated successfully!
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

      {/* Project Selection Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4 border border-neutral-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Project List</h2>
              <button
                onClick={closeProjectModal}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {projectNames.map((project) => {
                const isSelected = selectedUserProjects.includes(project);
                const isAllSelected = selectedUserProjects.includes("all");
                const isDisabled = isAllSelected && project !== "all";

                return (
                  <div
                    key={project}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      isDisabled
                        ? "bg-neutral-600 border border-neutral-500 cursor-not-allowed opacity-50"
                        : isSelected
                          ? "bg-blue-600/20 border border-blue-500/50 cursor-pointer"
                          : "bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 cursor-pointer"
                    }`}
                    onClick={() =>
                      !isDisabled && toggleProjectSelection(project)
                    }
                  >
                    <span
                      className={`${isDisabled ? "text-neutral-400" : "text-white"}`}
                    >
                      {project.charAt(0).toUpperCase() + project.slice(1)}
                    </span>
                    {isSelected && (
                      <FiCheck
                        size={18}
                        className={
                          isDisabled ? "text-neutral-400" : "text-blue-500"
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {selectedUserProjects.length > 0 && (
              <div className="mt-4 p-3 bg-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-300 mb-2">
                  Selected projects:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUserProjects.map((project, index) => (
                    <span
                      key={index}
                      className="text-xs text-white px-2 py-1 bg-blue-600 rounded"
                    >
                      {project.charAt(0).toUpperCase() + project.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeProjectModal}
                className="flex-1 px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleProjectChange(selectedUserId, selectedUserProjects)
                }
                disabled={
                  updatingUser === selectedUserId ||
                  selectedUserProjects.length === 0
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
              >
                {updatingUser === selectedUserId ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
