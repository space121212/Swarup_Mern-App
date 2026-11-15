
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import SideBar from "../components/SideBar";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    const success = await logout();

    if (success) {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              WorkSpace Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome, {user?.name || "User"}!
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-fit rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Log Out
          </button>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Projects
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              0
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Projects in your workspace
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              My Tasks
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              0
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Tasks assigned to you
            </p>
          </div>
        </div>
        
{/* Recent Activity */}
<section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
  <div className="mb-5">
    <h2 className="text-lg font-semibold text-gray-900">
      Recent Activity
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Keep track of what's happening in your workspace.
    </p>
  </div>

  <div className="flex flex-col items-center justify-center py-10 text-center">
    <p className="text-gray-500">
      No recent activity yet.
    </p>

    <p className="mt-2 text-sm text-gray-400">
      Your project and task updates will appear here.
    </p>
  </div>
</section>



      </main>
    </div>
  );
}

export default Dashboard;
