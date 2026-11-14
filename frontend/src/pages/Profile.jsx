import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import SideBar from "../components/SideBar";
 
function Profile() {
  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [members, setMembers] = useState([]);
 
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalMembership: 0,
    totalPages: 1
  });
 
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busyMembershipId, setBusyMembershipId] = useState("");
 
  async function loadOrganizations() {
    try {
      setLoadingOrganizations(true);
      const response = await api.get("/organization");
      const memberships = response.data.result || [];
      const active = memberships
        .filter((item) => item.status === "active" && item.organizationId)
        .map((item) => item.organizationId);
 
      setOrganizations(active);
      if (active.length > 0) {
        setOrganizationId((current) =>
          active.some((org) => org._id === current) ? current : active[0]._id
        );
      } else {
        setOrganizationId("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load organizations.");
    } finally {
      setLoadingOrganizations(false);
    }
  }
 
  async function loadMembers(selectedOrganizationId = organizationId, selectedPage = page) {
    if (!selectedOrganizationId) {
      setMembers([]);
      return;
    }
 
    try {
      setLoadingMembers(true);
      const response = await api.get(
        `/organization/${selectedOrganizationId}/members`,
        { params: { page: selectedPage, limit: 5 } }
      );
      setMembers(response.data.memberships || []);
      setPagination(response.data.pagination || {
        page: selectedPage, limit: 5, totalMembership: 0, totalPages: 1
      });
    } catch (error) {
      setMembers([]);
      toast.error(error.response?.data?.message || "Could not load members.");
    } finally {
      setLoadingMembers(false);
    }
  }
 
  useEffect(() => {
    loadOrganizations();
  }, []);
 
  useEffect(() => {
    setPage(1);
    loadMembers(organizationId, 1);

    console.log("Members",members)
  }, [organizationId]);
 
  async function handleAddMember(event) {
    event.preventDefault();
    if (!organizationId) {
      toast.error("Select an organization first.");
      return;
    }
    if (!email.trim()) {
      toast.error("Enter the member's email address.");
      return;
    }
 
    try {
      setAdding(true);
      await api.post(`/organization/${organizationId}/members`, {
        email: email.trim().toLowerCase(),
        role
      });
      toast.success("Member added successfully.");
      setEmail("");
      setRole("Member");
      setPage(1);
      await loadMembers(organizationId, 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add member.");
    } finally {
      setAdding(false);
    }
  }
 
  async function handleRoleChange(membership, newRole) {
    if (newRole === membership.roleId?.name) return;
 
    try {
      setBusyMembershipId(membership._id);
      await api.patch(
        `/organization/${organizationId}/members/${membership._id}/role`,
        { role: newRole }
      );
      toast.success("Member role updated.");
      await loadMembers(organizationId, page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update role.");
    } finally {
      setBusyMembershipId("");
    }
  }
 
  async function handleRemoveMember(membership) {
    const memberName = membership.userId?.name || membership.userId?.email || "this member";
    if (!window.confirm(`Remove ${memberName} from this organization?`)) return;
 
    try {
      setBusyMembershipId(membership._id);
      await api.delete(
        `/organization/${organizationId}/members/${membership._id}`
      );
      toast.success("Member removed.");
      const nextPage = members.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await loadMembers(organizationId, nextPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove member.");
    } finally {
      setBusyMembershipId("");
    }
  }
 
  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <SideBar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-slate-900">Organization members</h1>
            <p className="mt-1 text-sm text-slate-600">
              Add people to an organization and manage their roles.
            </p>
          </header>
 
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Organization
            </label>
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              disabled={loadingOrganizations || organizations.length === 0}
              className="w-full max-w-xl rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              {organizations.length === 0 && <option value="">No organizations</option>}
              {organizations.map((organization) => (
                <option key={organization._id} value={organization._id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </section>
 
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Add an existing user</h2>
            <p className="mt-1 text-sm text-slate-500">
              The person must already have registered with this application.
            </p>
            <form onSubmit={handleAddMember} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="person@example.com"
                required
                className="rounded-lg border border-slate-300 px-3 py-2.5"
              />
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5"
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={adding || !organizationId}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add member"}
              </button>
            </form>
          </section>
 
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Members</h2>
                <p className="text-sm text-slate-500">
                  {pagination.totalMembership || 0} active members
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadMembers(organizationId, page)}
                disabled={loadingMembers || !organizationId}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
              >
                Refresh
              </button>
            </div>
 
            {loadingMembers ? (
              <p className="py-8 text-center text-slate-500">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="py-8 text-center text-slate-500">No members found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {members.map((membership) => {
                  const isOwner = membership.roleId?.name === "Owner";
                  const busy = busyMembershipId === membership._id;
                  return (
                    <article
                      key={membership._id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {membership.userId?.name || "Unnamed user"}
                        </p>
                        <p className="break-all text-sm text-slate-500">
                          {membership.userId?.email || "No email"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Current role: {membership.roleId?.name || "Unknown"}
                        </p>
                      </div>
 
                      <div className="flex flex-wrap items-center gap-2">
                        {!isOwner && (
                          <>
                            <select
                              value={membership.roleId?.name || "Member"}
                              disabled={busy}
                              onChange={(event) => handleRoleChange(membership, event.target.value)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Member">Member</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleRemoveMember(membership)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </>
                        )}
                        {isOwner && (
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                            Owner
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
 
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1 || loadingMembers}
                onClick={() => {
                  const next = page - 1;
                  setPage(next);
                  loadMembers(organizationId, next);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {pagination.page || page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={page >= (pagination.totalPages || 1) || loadingMembers}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  loadMembers(organizationId, next);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
 
export default Profile;
