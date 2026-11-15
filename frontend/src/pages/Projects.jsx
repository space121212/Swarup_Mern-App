
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import SideBar from "../components/SideBar";

function Projects() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectLoadError, setProjectLoadError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load organizations when the component loads.
  useEffect(() => {
    let ignore = false;

    async function loadOrganizations() {
      try {
        const response = await api.get("/organization");

        if (ignore) return;

        const memberships = response.data.result || [];

        setOrganizations(memberships);

        if (memberships.length > 0) {
          setIsLoadingProjects(true);

          setSelectedOrganizationId(
            memberships[0].organizationId._id
          );
        }
      } catch (err) {
        if (!ignore) {
          toast.error(
            err.response?.data?.message ||
              "Failed to load organizations."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingOrganizations(false);
        }
      }
    }

    loadOrganizations();

    return () => {
      ignore = true;
    };
  }, []);

  // Load projects whenever the organization or page changes.
  useEffect(() => {
    if (!selectedOrganizationId) return;

    let ignore = false;

    async function loadProjects() {
      setProjectLoadError("");

      try {
        const response = await api.get(
          `/organisations/${selectedOrganizationId}/projects`,
          {
            params: {
              page: currentPage,
            },
          }
        );

        if (ignore) return;

        if (response.data.success) {
          setProjects(response.data.projects || []);

          setTotalPages(
            response.data.pagination?.totalPages || 1
          );
        } else {
          setProjects([]);
          setTotalPages(1);
          setProjectLoadError("Could not load projects.");
        }
      } catch (err) {
        if (ignore) return;

        setProjects([]);
        setTotalPages(1);

        setProjectLoadError(
          err.response?.data?.message ||
            "Failed to load projects."
        );
      } finally {
        if (!ignore) {
          setIsLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      ignore = true;
    };
  }, [selectedOrganizationId, currentPage]);

  // Create a project.
  async function handleCreateProject(event) {
    event.preventDefault();

    if (!selectedOrganizationId) {
      toast.error("Please select an organization.");
      return;
    }

    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(
        `/organisations/${selectedOrganizationId}/projects`,
        {
          name: name.trim(),
          description: description.trim(),
        }
      );

      toast.success("Project created successfully.");

      setName("");
      setDescription("");
      setIsFormOpen(false);

      setProjectLoadError("");

      // If already on page 1, refresh it directly.
      if (currentPage === 1) {
        setIsLoadingProjects(true);

        try {
          const response = await api.get(
            `/organisations/${selectedOrganizationId}/projects`,
            {
              params: { page: 1 },
            }
          );

          setProjects(response.data.projects || []);

          setTotalPages(
            response.data.pagination?.totalPages || 1
          );
        } finally {
          setIsLoadingProjects(false);
        }
      } else {
        // Changing the page triggers the projects effect.
        setIsLoadingProjects(true);
        setCurrentPage(1);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create project."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete a project.
  async function handleDeleteProject(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setIsLoadingProjects(true);

    try {
      await api.delete(
        `/organisations/${selectedOrganizationId}/projects/${projectId}`
      );

      toast.success("Project deleted successfully.");

      const response = await api.get(
        `/organisations/${selectedOrganizationId}/projects`,
        {
          params: { page: currentPage },
        }
      );

      const updatedProjects = response.data.projects || [];

      const updatedTotalPages =
        response.data.pagination?.totalPages || 1;

      // If the last item on this page was deleted, go back a page.
      if (
        updatedProjects.length === 0 &&
        currentPage > updatedTotalPages
      ) {
        setCurrentPage(updatedTotalPages);
        // The effect will fetch the previous page.
      } else {
        setProjects(updatedProjects);
        setTotalPages(updatedTotalPages);
        setIsLoadingProjects(false);
      }
    } catch (err) {
      setIsLoadingProjects(false);

      toast.error(
        err.response?.data?.message ||
          "Failed to delete project."
      );
    }
  }

  // Open the edit form.
  function handleEditClick(project) {
    setEditingProjectId(project._id);
    setEditName(project.name);
    setEditDescription(project.description || "");
  }

  // Cancel editing.
  function handleCancelEdit() {
    setEditingProjectId(null);
    setEditName("");
    setEditDescription("");
  }

  // Update a project.
  async function handleUpdateProject(event) {
    event.preventDefault();

    if (!editName.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await api.put(
        `/organisations/${selectedOrganizationId}/projects/${editingProjectId}`,
        {
          name: editName.trim(),
          description: editDescription.trim(),
        }
      );

      toast.success("Project updated successfully.");

      const updatedProject =
        response.data.project || response.data.result;

      if (updatedProject) {
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project._id === editingProjectId
              ? { ...project, ...updatedProject }
              : project
          )
        );
      } else {
        const projectsResponse = await api.get(
          `/organisations/${selectedOrganizationId}/projects`,
          {
            params: { page: currentPage },
          }
        );

        setProjects(projectsResponse.data.projects || []);

        setTotalPages(
          projectsResponse.data.pagination?.totalPages || 1
        );
      }

      handleCancelEdit();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to update project."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar />

      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">

        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Projects
            </h1>

            <p className="mt-2 text-gray-600">
              Create and manage your organization projects.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen((open) => !open)}
            disabled={!selectedOrganizationId}
            className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFormOpen ? "Cancel" : "+ Create Project"}
          </button>
        </div>

        {/* Organization selector */}
        <div className="mt-6 max-w-md">
          <label
            htmlFor="organization"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select organization
          </label>

          <select
            id="organization"
            value={selectedOrganizationId}
            disabled={
              isLoadingOrganizations ||
              organizations.length === 0
            }
            onChange={(event) => {
              setIsLoadingProjects(true);
              setProjectLoadError("");
              setProjects([]);
              setTotalPages(1);

              setSelectedOrganizationId(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          >
            {isLoadingOrganizations ? (
              <option value="">Loading organizations...</option>
            ) : organizations.length === 0 ? (
              <option value="">No organizations available</option>
            ) : (
              organizations.map((membership) => (
                <option
                  key={membership.organizationId._id}
                  value={membership.organizationId._id}
                >
                  {membership.organizationId.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Create project form */}
        {isFormOpen && (
          <form
            onSubmit={handleCreateProject}
            className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Create a project
            </h2>

            <div>
              <label
                htmlFor="projectName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Project name
              </label>

              <input
                id="projectName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter project name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="projectDescription"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="projectDescription"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe this project"
                rows={3}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </form>
        )}

        {/* Projects list */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your projects
            </h2>

            {!isLoadingProjects && (
              <span className="text-sm text-gray-500">
                {projects.length} shown
              </span>
            )}
          </div>

          {isLoadingOrganizations || isLoadingProjects ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
              Loading projects...
            </div>
          ) : !selectedOrganizationId ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                No organization available
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Join or create an organization to manage projects.
              </p>
            </div>
          ) : projectLoadError ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="text-red-600">{projectLoadError}</p>

              <button
                type="button"
                onClick={() => {
                  setIsLoadingProjects(true);
                  setProjectLoadError("");

                  // Trigger a fresh request.
                  setCurrentPage((page) => page + 1);
                  setCurrentPage((page) => page - 1);
                }}
                className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                No projects found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first project to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project._id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {editingProjectId === project._id ? (
                    /* Edit project form */
                    <form
                      onSubmit={handleUpdateProject}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        Edit project
                      </h3>

                      <div>
                        <label
                          htmlFor={`edit-name-${project._id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Project name
                        </label>

                        <input
                          id={`edit-name-${project._id}`}
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`edit-description-${project._id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>

                        <textarea
                          id={`edit-description-${project._id}`}
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUpdating ? "Saving..." : "Save changes"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Project details */
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="wrap-break-word text-lg font-semibold text-gray-900">
                          {project.name}
                        </h3>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(project)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteProject(project._id)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-gray-600">
                        {project.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                        <p>
                          <span className="font-medium text-gray-700">
                            Organization:
                          </span>{" "}
                          {project.organizationId?.name || "Unknown"}
                        </p>

                        <p>
                          <span className="font-medium text-gray-700">
                            Created by:
                          </span>{" "}
                          {project.createdBy?.name || "Unknown"}
                        </p>

                        <p>
                          <span className="font-medium text-gray-700">
                            Created:
                          </span>{" "}
                          {project.createdAt
                            ? new Date(
                                project.createdAt
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoadingProjects &&
            !projectLoadError &&
            totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={
                    currentPage === 1 || isLoadingProjects
                  }
                  onClick={() => {
                    setIsLoadingProjects(true);
                    setCurrentPage((page) => page - 1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages ||
                    isLoadingProjects
                  }
                  onClick={() => {
                    setIsLoadingProjects(true);
                    setCurrentPage((page) => page + 1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default Projects;
