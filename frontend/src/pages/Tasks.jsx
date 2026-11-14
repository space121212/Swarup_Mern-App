
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import SideBar from "../components/SideBar";

function Tasks() {
  // Organization, project, member and task data
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Search and filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalTasks: 0,
    totalPages: 1,
  });

  // Loading states
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Create task form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");

  // Edit task form
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("todo");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  // 1. Load organizations when the page opens
  useEffect(() => {
    async function loadOrganizations() {
      try {
        setIsLoadingOrganizations(true);

        const response = await api.get("/organization");
        const memberships = response.data.result || [];

        const activeOrganizations = memberships
          .filter(
            (membership) =>
              membership.status === "active" && membership.organizationId
          )
          .map((membership) => membership.organizationId);

        setOrganizations(activeOrganizations);

        if (activeOrganizations.length > 0) {
          setSelectedOrganizationId(activeOrganizations[0]._id);
        } else {
          setSelectedOrganizationId("");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load organizations."
        );
      } finally {
        setIsLoadingOrganizations(false);
      }
    }

    loadOrganizations();
  }, []);

  // 2. Load projects whenever the selected organization changes
  useEffect(() => {
    async function loadProjects() {
      if (!selectedOrganizationId) {
        setProjects([]);
        setSelectedProjectId("");
        setTasks([]);
        setPagination({
          page: 1,
          limit: 10,
          totalTasks: 0,
          totalPages: 1,
        });
        return;
      }

      try {
        setIsLoadingProjects(true);
        setProjects([]);
        setSelectedProjectId("");
        setTasks([]);
        setPage(1);

        const response = await api.get(
          `/organisations/${selectedOrganizationId}/projects`
        );

          
          const projectList = response.data.projects || [];
          setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0]._id);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load projects."
        );
      } finally {
        setIsLoadingProjects(false);
      }
    }

    loadProjects();
  }, [selectedOrganizationId]);

  // 3. Load organization members for task assignment
  useEffect(() => {
    async function loadMembers() {
      if (!selectedOrganizationId) {
        setMembers([]);
        return;
      }

      try {
        setIsLoadingMembers(true);

        const response = await api.get(
          `/organization/${selectedOrganizationId}/members?limit=100`
        );

        setMembers(response.data.memberships || []);
      } catch (error) {
        setMembers([]);
        toast.error(
          error.response?.data?.message || "Failed to load organization members."
        );
      } finally {
        setIsLoadingMembers(false);
      }
    }

    loadMembers();
  }, [selectedOrganizationId]);

  // 4. Load tasks for the selected project and page
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      if (!selectedOrganizationId || !selectedProjectId) {
        setTasks([]);
        setPagination({
          page: 1,
          limit: 10,
          totalTasks: 0,
          totalPages: 1,
        });
        return;
      }

      try {
        setIsLoadingTasks(true);

        const response = await api.get(
          `/organisations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks`,
          {
            params: {
              page,
              limit: 10,
            },
          }
        );

        if (cancelled) return;

        setTasks(response.data.tasks || []);

        setPagination(
          response.data.pagination || {
            page,
            limit: 10,
            totalTasks: (response.data.tasks || []).length,
            totalPages: 1,
          }
        );
      } catch (error) {
        if (!cancelled) {
          setTasks([]);
          toast.error(
            error.response?.data?.message || "Failed to load tasks."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTasks(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId, selectedProjectId, page]);

  // Reset pagination when switching projects or organizations
  function handleOrganizationChange(event) {
    setSelectedOrganizationId(event.target.value);
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setPage(1);
    cancelEditing();
  }

  function handleProjectChange(event) {
    setSelectedProjectId(event.target.value);
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setPage(1);
    cancelEditing();
  }

  // 5. Create a task
  async function handleCreateTask(event) {
    event.preventDefault();

    if (!selectedOrganizationId || !selectedProjectId) {
      toast.error("Please select an organization and project.");
      return;
    }

    if (title.trim().length < 2) {
      toast.error("Task title must contain at least 2 characters.");
      return;
    }

    if (description.trim().length === 1) {
      toast.error("Description must be empty or contain at least 2 characters.");
      return;
    }

    try {
      setIsCreating(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedTo: assignedTo || null,
      };

      await api.post(
        `/organisations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks`,
        payload
      );

      toast.success("Task created successfully.");

      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo("");

      // Return to page 1 so the new task is visible
      setPage(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create task."
      );
    } finally {
      setIsCreating(false);
    }
  }

  // 6. Start editing a task
  function startEditing(task) {
    setEditingTaskId(task._id);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditStatus(task.status || "todo");

    const currentAssignee =
      typeof task.assignedTo === "object"
        ? task.assignedTo?._id
        : task.assignedTo;

    setEditAssignedTo(currentAssignee || "");
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("medium");
    setEditStatus("todo");
    setEditAssignedTo("");
  }

  // 7. Save task changes
  async function handleUpdateTask(event, taskId) {
    event.preventDefault();

    if (editTitle.trim().length < 2) {
      toast.error("Task title must contain at least 2 characters.");
      return;
    }

    if (editDescription.trim().length === 1) {
      toast.error("Description must be empty or contain at least 2 characters.");
      return;
    }

    try {
      setIsUpdating(true);

      await api.put(
        `/organisations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${taskId}`,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
          status: editStatus,
          assignedTo: editAssignedTo || null,
        }
      );

      toast.success("Task updated successfully.");
      cancelEditing();

      // The task list refreshes automatically if its page is unchanged
      if (page === pagination.page) {
        const response = await api.get(
          `/organisations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks`,
          { params: { page, limit: 10 } }
        );

        setTasks(response.data.tasks || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update task."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  // 8. Delete a task
  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/organisations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${taskId}`
      );

      toast.success("Task deleted successfully.");

      const remainingTasks = tasks.filter((task) => task._id !== taskId);

      // If the last task on a page is deleted, go to the previous page
      if (remainingTasks.length === 0 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setTasks(remainingTasks);
        setPagination((current) => ({
          ...current,
          totalTasks: Math.max(0, current.totalTasks - 1),
        }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete task."
      );
    }
  }

  // 9. Search and filter the tasks currently loaded on this page
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (task.title || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "all" || (task.status || "todo") === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      (task.priority || "medium") === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  function getStatusLabel(status) {
    const labels = {
      todo: "To Do",
      in_progress: "In Progress",
      completed: "Completed",
    };

    return labels[status] || "To Do";
  }

  function getPriorityLabel(value) {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    return labels[value] || "Medium";
  }

  function getMemberName(user) {
    if (!user) return "Unknown member";

    return user.name || user.email || "Unknown member";
  }

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <SideBar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page heading */}
          <header>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Workspace management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Tasks
            </h1>
            <p className="mt-2 text-slate-600">
              Create, assign, organize and track your project tasks.
            </p>
          </header>

          {/* Organization and project selection */}
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
            <div>
              <label
                htmlFor="organization"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Organization
              </label>
              <select
                id="organization"
                value={selectedOrganizationId}
                onChange={handleOrganizationChange}
                disabled={isLoadingOrganizations}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">
                  {isLoadingOrganizations
                    ? "Loading organizations..."
                    : "Select organization"}
                </option>
                {organizations.map((organization) => (
                  <option key={organization._id} value={organization._id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="project"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Project
              </label>
              <select
                id="project"
                value={selectedProjectId}
                onChange={handleProjectChange}
                disabled={!selectedOrganizationId || isLoadingProjects}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">
                  {isLoadingProjects ? "Loading projects..." : "Select project"}
                </option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {!isLoadingOrganizations && organizations.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              You do not belong to any active organizations.
            </div>
          )}

          {selectedOrganizationId &&
            !isLoadingProjects &&
            projects.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                No projects found in this organization. Create a project first
                on the Projects page.
              </div>
            )}

          {/* Create task */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Create a task
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a task to the selected project.
              </p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Task title
                </label>
                <input
                  id="task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Build the login page"
                  required
                  minLength={2}
                  maxLength={150}
                  disabled={!selectedProjectId || isCreating}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe what needs to be done..."
                  maxLength={1000}
                  rows={3}
                  disabled={!selectedProjectId || isCreating}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    disabled={!selectedProjectId || isCreating}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="task-assignee"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Assign to
                  </label>
                  <select
                    id="task-assignee"
                    value={assignedTo}
                    onChange={(event) => setAssignedTo(event.target.value)}
                    disabled={
                      !selectedProjectId || isCreating || isLoadingMembers
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Unassigned</option>
                    {members.map((membership) => (
                      <option
                        key={membership.userId?._id || membership._id}
                        value={membership.userId?._id || ""}
                      >
                        {getMemberName(membership.userId)}
                        {membership.userId?.email
                          ? ` (${membership.userId.email})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedProjectId || isCreating}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create task"}
              </button>
            </form>
          </section>

          {/* Task list and filters */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Project tasks
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {pagination.totalTasks} task
                  {pagination.totalTasks === 1 ? "" : "s"} in this project
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setPage(1);
                }}
                className="self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
              >
                Clear filters
              </button>
            </div>

            {/* Search */}
            <div className="mt-5">
              <label
                htmlFor="task-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search by title
              </label>
              <input
                id="task-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Status and priority filters */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="status-filter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Filter by status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority-filter"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Filter by priority
                </label>
                <select
                  id="priority-filter"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Task cards */}
            <div className="mt-6 space-y-4">
              {isLoadingTasks ? (
                <p className="py-8 text-center text-slate-500">
                  Loading tasks...
                </p>
              ) : !selectedProjectId ? (
                <p className="py-8 text-center text-slate-500">
                  Select a project to view its tasks.
                </p>
              ) : filteredTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                  <h3 className="font-semibold text-slate-800">
                    No matching tasks
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters, or create a task.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <article
                    key={task._id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 sm:p-5"
                  >
                    {editingTaskId === task._id ? (
                      <form
                        onSubmit={(event) =>
                          handleUpdateTask(event, task._id)
                        }
                        className="space-y-4"
                      >
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Title
                          </label>
                          <input
                            value={editTitle}
                            onChange={(event) =>
                              setEditTitle(event.target.value)
                            }
                            required
                            minLength={2}
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Description
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(event) =>
                              setEditDescription(event.target.value)
                            }
                            maxLength={1000}
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                              Status
                            </label>
                            <select
                              value={editStatus}
                              onChange={(event) =>
                                setEditStatus(event.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                              Priority
                            </label>
                            <select
                              value={editPriority}
                              onChange={(event) =>
                                setEditPriority(event.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Assign to
                          </label>
                          <select
                            value={editAssignedTo}
                            onChange={(event) =>
                              setEditAssignedTo(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                          >
                            <option value="">Unassigned</option>
                            {members.map((membership) => (
                              <option
                                key={membership.userId?._id || membership._id}
                                value={membership.userId?._id || ""}
                              >
                                {getMemberName(membership.userId)}
                                {membership.userId?.email
                                  ? ` (${membership.userId.email})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isUpdating ? "Saving..." : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isUpdating}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="wrap-break-word text-lg font-bold text-slate-900">

                              
                              <Link
  to={`/organisations/${selectedOrganizationId}/projects/${selectedProjectId}/tasks/${task._id}`}
  className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
>
  {task.title}
</Link>
                            </h3>
                            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-slate-600">
                              {task.description || "No description provided."}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {getStatusLabel(task.status || "todo")}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "low"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {getPriorityLabel(task.priority)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                          <div>
                            <span className="text-slate-500">Assigned to</span>
                            <p className="mt-1 font-medium text-slate-800">
                              {task.assignedTo
                                ? getMemberName(task.assignedTo)
                                : "Unassigned"}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">Created by</span>
                            <p className="mt-1 font-medium text-slate-800">
                              {getMemberName(task.createdBy)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(task)}
                            className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task._id)}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoadingTasks && selectedProjectId && (
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page || page} of{" "}
                  {Math.max(1, pagination.totalPages || 1)}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          pagination.totalPages || 1,
                          current + 1
                        )
                      )
                    }
                    disabled={page >= (pagination.totalPages || 1)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Tasks;
