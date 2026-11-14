
import { useEffect, useState } from "react";
import { Link, useParams,useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import SideBar from "../components/SideBar";

function TaskDetails() {
  const { organizationId, projectId, taskId } = useParams();

  const navigate=useNavigate();


   
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [members, setMembers] = useState([]);
const [isLoadingMembers, setIsLoadingMembers] = useState(false);
 
const [form, setForm] = useState({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignedTo: ""
});


  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  function openEditForm() {
  const assignedUserId =
    typeof task.assignedTo === "object"
      ? task.assignedTo?._id
      : task.assignedTo;
 
  setForm({
    title: task.title || "",
    description: task.description || "",
    status: task.status || "todo",
    priority: task.priority || "medium",
    assignedTo: assignedUserId || ""
  });
 
  setIsEditing(true);
}
 
function updateForm(field, value) {
  setForm((current) => ({
    ...current,
    [field]: value
  }));
}
 
function cancelEdit() {
  setIsEditing(false);
}

useEffect(() => {
  let cancelled = false;
 
  async function loadMembers() {
    try {
      setIsLoadingMembers(true);
 
      const response = await api.get(
        `/organization/${organizationId}/members`,
        { params: { page: 1, limit: 100 } }
      );
 
      if (!cancelled) {
        setMembers(response.data.memberships || []);
      }
    } catch (error) {
      if (!cancelled) {
        setMembers([]);
        toast.error(
          error.response?.data?.message ||
            "Could not load organization members."
        );
      }
    } finally {
      if (!cancelled) {
        setIsLoadingMembers(false);
      }
    }
  }
 
  loadMembers();
 
  return () => {
    cancelled = true;
  };
}, [organizationId]);



  useEffect(() => {
    let cancelled = false;

    async function loadTaskDetails() {
      try {
        setLoading(true);

        const [taskResponse, projectResponse, organizationResponse] =
          await Promise.all([
            api.get(
              `/organisations/${organizationId}/projects/${projectId}/tasks/${taskId}`
            ),
            api.get(
              `/organisations/${organizationId}/projects`
            ),
            api.get("/organization"),
          ]);

        if (cancelled) return;

        setTask(taskResponse.data.task);

        const projects = projectResponse.data.projects || [];
        setProject(
          projects.find((item) => item._id === projectId) || null
        );

        const memberships = organizationResponse.data.result || [];
        const membership = memberships.find(
          (item) => item.organizationId?._id === organizationId
        );

        setOrganization(membership?.organizationId || null);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load task details."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTaskDetails();

    return () => {
      cancelled = true;
    };
  }, [organizationId, projectId, taskId]);

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }


  async function handleUpdateTask(event) {
  event.preventDefault();
 
  if (form.title.trim().length < 2) {
    toast.error("Task title must contain at least 2 characters.");
    return;
  }
 
  if (form.description.trim().length === 1) {
    toast.error("Description must be empty or contain at least 2 characters.");
    return;
  }
 
  try {
    setIsSaving(true);
 
    const response = await api.put(
      `/organisations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
      {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null
      }
    );
 
    setTask(response.data.task);
    setIsEditing(false);
    toast.success("Task updated successfully.");
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to update task."
    );
  } finally {
    setIsSaving(false);
  }
}

async function handleDeleteTask() {
  const confirmed = window.confirm(
    `Delete task "${task.title}"? This cannot be undone.`
  );
 
  if (!confirmed) return;
 
  try {
    await api.delete(
      `/organisations/${organizationId}/projects/${projectId}/tasks/${taskId}`
    );
 
    toast.success("Task deleted successfully.");
    navigate("/tasks");
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to delete task."
    );
  }
}



  function getStatusLabel(status) {
    const labels = {
      todo: "To Do",
      in_progress: "In Progress",
      completed: "Completed",
    };

    return labels[status] || "To Do";
  }

  function getPersonName(person) {
    if (!person) return "Unassigned";

    if (typeof person === "string") return person;

    return person.name || person.email || "Unknown";
  }

  const priorityStyles = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  };

  const statusStyles = {
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-indigo-50 text-indigo-700",
    completed: "bg-emerald-50 text-emerald-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 md:flex">
        <SideBar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl animate-pulse space-y-5">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-12 w-2/3 rounded bg-slate-200" />
            <div className="h-64 rounded-2xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-100 md:flex">
        <SideBar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Task not found
            </h1>
            <p className="mt-2 text-slate-500">
              The task could not be loaded. It may not exist or you may not
              have permission to view it.
            </p>
            <Link
              to="/tasks"
              className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Back to Tasks
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const status = task.status || "todo";
  const priority = task.priority || "medium";

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <SideBar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link
              to="/projects"
              className="hover:text-indigo-600"
            >
              Projects
            </Link>
            <span>/</span>
            <span className="text-indigo-600">
              {project?.name || "Project"}
            </span>
            <span>/</span>
            <Link to="/tasks" className="hover:text-indigo-600">
              Tasks
            </Link>
            <span>/</span>
            <span className="max-w-48 truncate font-medium text-slate-800">
              {task.title}
            </span>
          </nav>

          {/* Edit and delete section*/}

          {isEditing && (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <h2 className="text-xl font-bold text-slate-900">
      Edit task
    </h2>
 
    <form onSubmit={handleUpdateTask} className="mt-5 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Task title
        </label>
        <input
          value={form.title}
          onChange={(event) => updateForm("title", event.target.value)}
          minLength={2}
          maxLength={150}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
        />
      </div>
 
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
        />
      </div>
 
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            value={form.status}
            onChange={(event) => updateForm("status", event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
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
            value={form.priority}
            onChange={(event) => updateForm("priority", event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
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
          value={form.assignedTo}
          onChange={(event) => updateForm("assignedTo", event.target.value)}
          disabled={isLoadingMembers}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
        >
          <option value="">Unassigned</option>
          {members.map((membership) => (
            <option
              key={membership.userId?._id || membership._id}
              value={membership.userId?._id || ""}
            >
              {membership.userId?.name || membership.userId?.email || "Member"}
            </option>
          ))}
        </select>
        {isLoadingMembers && (
          <p className="mt-1 text-xs text-slate-500">Loading members...</p>
        )}
      </div>
 
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={isSaving}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
)}


          {/* Task heading */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <span aria-hidden="true">←</span>
                Back to Tasks
              </Link>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openEditForm}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Edit
                </button>
                
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>


              </div>
            </div>

            <h1 className="mt-6 wrap-break-word text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {task.title}
            </h1>

            <p className="mt-3 whitespace-pre-wrap wrap-break-word text-base leading-7 text-slate-600">
              {task.description || "No description provided."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  statusStyles[status] || statusStyles.todo
                }`}
              >
                {getStatusLabel(status)}
              </span>

              <span
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  priorityStyles[priority] || priorityStyles.medium
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)} priority
              </span>
            </div>
          </section>

          {/* Main details and sidebar */}
          <div className="grid items-start gap-6 lg:grid-cols-3">
            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Description
                </h2>
              </div>

              <div className="min-h-40 px-5 py-6 sm:px-6">
                <p className="whitespace-pre-wrap wrap-break-word leading-7 text-slate-700">
                  {task.description || "No description has been added yet."}
                </p>
              </div>
            </section>

            {/* Task information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Task details
              </h2>

              <div className="mt-5 space-y-5">
                <DetailRow
                  label="Assignee"
                  value={getPersonName(task.assignedTo)}
                />

                <DetailRow
                  label="Created by"
                  value={getPersonName(task.createdBy)}
                />

                <DetailRow
                  label="Project"
                  value={project?.name || "Unknown project"}
                />

                <DetailRow
                  label="Organization"
                  value={organization?.name || "Unknown organization"}
                />

                <div className="border-t border-slate-100 pt-4">
                  <DetailRow
                    label="Created"
                    value={formatDate(task.createdAt)}
                  />
                </div>

                <DetailRow
                  label="Last updated"
                  value={formatDate(task.updatedAt)}
                />
              </div>
            </section>
          </div>

          {/* Related links */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Related links
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                View projects →
              </Link>

              <Link
                to="/tasks"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                View all tasks →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 wrap-break-word text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default TaskDetails;
