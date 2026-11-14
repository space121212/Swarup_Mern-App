import React, { useEffect, useState } from "react";
import { CgOrganisation } from "react-icons/cg";
import { toast } from "sonner";

import "../css/Members.css";
import api from "../api/axios";
import SideBar from "../components/SideBar";

const Members = () => {
  const [orgnisations, setOrganisations] = useState([]);
  const [orgnisationId, setOrganisationId] = useState("");

  const [loadingOrganisationProcess, setLoadingOrganisationProcess] =
    useState(false);

  const [Members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [refreshMembers, setRefreshMembers] = useState(0);

  const [newMemberEmail,setNewMemberEmail]=useState("");

  const[newMemberRole,setNewMemberRole]=useState("Admin");

  // STEP 1: Fetch organisations
  useEffect(() => {
    async function getOrganisations() {
      setLoadingOrganisationProcess(true);

      try {
        const response = await api.get("/organization/");

        const responseData = response.data.result || [];

        console.log("ORGANISATION API RESPONSE:", responseData);

        // Get active organisations with populated organizationId
        const active = responseData.filter(
          (org) => org.status === "active" && org.organizationId?._id,
        );

        setOrganisations(active);
        console.log("active", active);

        // Preserve selected organisation or select the first one
        setOrganisationId((currentId) => {
          const exists = active.some(
            (org) => org.organizationId._id === currentId,
          );

          if (exists) {
            return currentId;
          }

          return active[0]?.organizationId?._id || "";
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Some error occurred while loading organisations",
        );
      } finally {
        setLoadingOrganisationProcess(false);
      }
    }

    getOrganisations();
  }, []);

  // STEP 2: Log selected organisation
  useEffect(() => {
    console.log("Selected organisation:", orgnisationId);
  }, [orgnisationId]);

  // STEP 3: Fetch members whenever organisation changes
  useEffect(() => {
    if (!orgnisationId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setIsLoadingMembers(true);

      try {
        console.log("MEMBERS EFFECT ID:", orgnisationId);

        const url = `/organization/${orgnisationId}/members`;

        console.log("REQUEST URL:", url);

        const response = await api.get(url);

        console.log("MEMBERS API RESPONSE:", response.data);

        setMembers(response.data.memberships || []);
      } catch (error) {
        console.error(
          "Error fetching members:",
          error.response?.data || error.message,
        );

        setMembers([]);

        toast.error(error.response?.data?.message || "Failed to load members");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [orgnisationId, refreshMembers]);

  // STEP 4: Refresh members manually
  const handleRefreshMembers = () => {
    setRefreshMembers((previous) => previous + 1);
  };

  async function deleteSelectedmember(membershipId, organisationID) {
    try {
      const response = await api.delete(
        `/orgnisation/${organisationID}/members12/${membershipId}`,
      );

      if (response && response.data.data.status == "suspended") {
        toast.success(
          `User ${response.data.data?.user?.name} deleted successfully.`,
        );
      }
      setRefreshMembers((previous) => previous + 1);
    } catch (error) {
      toast.error(error.response.data?.message);
    }
  }

  async function handleUpdateMember(selectedValue,organisationID,membershipId) {

    try {

        const response=await api.patch( `/organization/${organisationID}/members/${membershipId}/role`,
            {
                role:selectedValue
            }
        )

        if(response){

          toast.success(`User role updated successfully`)

            
        }
        
    } catch (error) {

      toast.error(error.response.data.error);
        
    }







  }


  async function handleAddMember(){

     if(!newMemberEmail.trim()){

      toast.error("Kindly put email address..")
      return;
    }


    try {
     


    const response=await api.post(`/organization/${orgnisationId}/members`,{

      email:newMemberEmail,
      role:newMemberRole
    })

    if(response){

      toast.success("Member added successfully")
    }
      
    


    

    } 

    catch (error) {

         toast.error(
        error.response?.data?.message || "Something went wrong"
    );
      
    }




  }

  return (
    <div className="members-page">
      <SideBar />

      <div className="members-content">
        {/* Page heading */}
        <div className="members-header">
          <h1>Organization members</h1>

          <p>Add people to organisations and manage their roles</p>
        </div>

        {/* Organisation selection card */}
        <div className="organisation-card">
          <div className="organisation-heading">
            <CgOrganisation className="organisation-icon" />

            <h5>Organisation</h5>
          </div>

          <select
            className="organisation-select"
            value={orgnisationId}
            onChange={(event) => setOrganisationId(event.target.value)}
            disabled={loadingOrganisationProcess || orgnisations.length === 0}
          >
            {loadingOrganisationProcess ? (
              <option value="">Loading organisations...</option>
            ) : orgnisations.length === 0 ? (
              <option value="">No organisation available</option>
            ) : (
              <>
                <option value="" disabled>
                  Select Organisation
                </option>

                {orgnisations.map((org) => (
                  <option
                    key={org.organizationId._id}
                    value={org.organizationId._id}
                  >
                    {org.organizationId.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Add existing user card */}
        <div className="existing-user-card">
          <div className="existing-header">
            <h1>Add an existing user</h1>

            <p>
              The person must already have registered with this application.
            </p>
          </div>

          <div className="existing-user-add">
            <div className="input-bar">
              <input
                className="input-user"
                id="input-user"
                required
                type="email"
                value={newMemberEmail}
                onChange={(event)=>setNewMemberEmail(event.target.value)}
                placeholder="Enter user's email"
              />
            </div>

            <select className="select-bar" value={newMemberRole} onChange={(event)=>setNewMemberRole(event.target.value)}>
              <option value="admin">Admin</option>

              <option value="member">Member</option>

              <option value="viewer">Viewer</option>
            </select>

            <button className="button" onClick={handleAddMember}>Add Member</button>
          </div>
        </div>

        {/* View members card */}
        <div className="main-view-members-card">
          <div className="view-members-content">
            <div className="view-members-heading">
              <h1>Members</h1>

              <p>Active members</p>
            </div>

            <div className="view-members-button">
              <button
                onClick={handleRefreshMembers}
                disabled={!orgnisationId || isLoadingMembers}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="view-members-information">
            {isLoadingMembers ? (
              <p>Loading Members...</p>
            ) : Members.length === 0 ? (
              <p>No Members Found</p>
            ) : (
              Members.map((items) => (
                <div key={items._id} className="view-members-infromation-card">
                  <div className="view-members-details">
                    <p className="view-members-name">{items.userId.name}</p>

                    <p>{items.userId.email}</p>

                    <p>Current Role: {items.roleId.name}</p>
                  </div>

                  <div className="members-update-delete">
                    {items.roleId.name == "Owner" ? (
                      <div className="members-role-tag">
                        {items.roleId.name}
                      </div>
                    ) : (
                      <div className="member-update-delete-card">
                        <select
                          onChange={(event) =>
                            handleUpdateMember(event.target.value,items.organizationId,items._id)
                          }
                        >
                          <option>Admin</option>
                          <option>Member</option>
                          <option>Viewer</option>
                        </select>

                        <button
                          onClick={() =>
                            deleteSelectedmember(
                              items._id,
                              items.organizationId,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
