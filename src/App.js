import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Aside from "./components/Aside";
import Auth from "./components/Auth";
import OwnerDetails from "./components/OwnerDetails";
import TenantDetails from "./components/TenantDetails";
import CreatingOwner from "./components/CreatingOwner";
import CreatingParkingSlot from "./components/CreatingParkingSlot";
import ComplaintsViewer from "./components/ComplaintsViewer";
import RaisingComplaints from "./components/RaisingComplaints";
import ParkingSlot from "./components/ParkingSlot";
import PayMaintenance from "./components/PayMaintenance";
import CreatingTenant from "./components/CreatingTenant";
import RoomDetails from "./components/RoomDetails";
import ErrorPage from "./ErrorPage";
import ComplaintsViewerOwner from "./components/ComplaintsViewerOwner";
import RoomDetailsOwner from "./components/RoomDetailsOwner";
import AdminBlockDetails from "./components/AdminBlockDetails";
import EmployeeSupervisors from "./components/EmployeeSupervisors"; 
import AverageOwnerAge from "./components/OwnerAge";
import UserCount from "./components/UserCount";

// Sidebar items for different roles
const forAdmin = [
  { name: "Tenant Details", path: "/admin/tenantdetails" },
  { name: "Owner Details", path: "/admin/ownerdetails" },
  { name: "Create owner", path: "/admin/createowner" },
  { name: "Allotting Parking slot", path: "/admin/allottingparkingslot" },
  { name: "Complaints", path: "/admin/complaints" },
  { name: "Admin Block Details", path: "/admin/adminblockdetails" },
  { name: "User Count", path: "/admin/usercount" },

];
const forEmployee = [
  { name: "Complaints", path: "/employee/complaints" },
  { name: "Employee Supervisors", path: "/employee/supervisors" }
];
const forTenant = [
  { name: "Raising Complaints", path: "/tenant/raisingcomplaints" },
  { name: "Alloted Parking slot", path: "/tenant/allotedparkingslot" },
  { name: "Pay maintenance", path: "/tenant/paymaintenance" },
];
const forOwner = [
  { name: "Tenant details", path: "/owner/tenantdetails" },
  { name: "Complaint", path: "/owner/complaint" },
  { name: "Create Tenant", path: "/owner/createtenant" },
  { name: "Room Details", path: "/owner/roomdetails" },
  { name: "Age of the Owner", path: "/owner/averageownerage"},
];

// Layout component to reduce repetition
const Layout = ({ headerItems, asideItems, children }) => (
  <main>
    <Header forHam={[...headerItems, "Logout"]} />
    <section className="flex">
      <Aside forHam={asideItems} />
      {children}
    </section>
  </main>
);

function App() {
  return (
    <div className="App font-mons bg-white">
      <Routes>
        <Route path="/" element={<Auth />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/admin/ownerdetails"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <OwnerDetails />
            </Layout>
          }
        />
        <Route
          path="/admin/tenantdetails"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <TenantDetails />
            </Layout>
          }
        />
        <Route
          path="/admin/createowner"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <CreatingOwner />
            </Layout>
          }
        />
        <Route
          path="/admin/allottingparkingslot"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <CreatingParkingSlot />
            </Layout>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <ComplaintsViewer />
            </Layout>
          }
        />
        <Route
          path="/admin/adminblockdetails"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <AdminBlockDetails />
            </Layout>
          }
        />
        <Route
          path="/admin/usercount"
          element={
            <Layout headerItems={forAdmin} asideItems={forAdmin}>
              <UserCount />
            </Layout>
          }
        />
       
        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <Layout headerItems={forEmployee} asideItems={forEmployee}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/employee/complaints"
          element={
            <Layout headerItems={forEmployee} asideItems={forEmployee}>
              <ComplaintsViewer />
            </Layout>
          }
        />
        <Route
          path="/employee/supervisors"
          element={
            <Layout headerItems={forEmployee} asideItems={forEmployee}>
              <EmployeeSupervisors />
            </Layout>
          }
        />

        {/* Tenant Routes */}
        <Route
          path="/tenant"
          element={
            <Layout headerItems={forTenant} asideItems={forTenant}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/tenant/raisingcomplaints"
          element={
            <Layout headerItems={forTenant} asideItems={forTenant}>
              <RaisingComplaints />
            </Layout>
          }
        />
        <Route
          path="/tenant/allotedparkingslot"
          element={
            <Layout headerItems={forTenant} asideItems={forTenant}>
              <ParkingSlot />
            </Layout>
          }
        />
        <Route
          path="/tenant/paymaintenance"
          element={
            <Layout headerItems={forTenant} asideItems={forTenant}>
              <PayMaintenance />
            </Layout>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner"
          element={
            <Layout headerItems={forOwner} asideItems={forOwner}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/owner/tenantdetails"
          element={
            <Layout headerItems={forOwner} asideItems={forOwner}>
              <RoomDetailsOwner />
            </Layout>
          }
        />
        <Route
          path="/owner/complaint"
          element={
            <Layout headerItems={forOwner} asideItems={forOwner}>
              <ComplaintsViewerOwner />
            </Layout>
          }
        />
        <Route
          path="/owner/createtenant"
          element={
            <Layout headerItems={forOwner} asideItems={forOwner}>
              <CreatingTenant />
            </Layout>
          }
        />
        <Route
          path="/owner/roomdetails"
          element={
            <Layout headerItems={forOwner} asideItems={forOwner}>
              <RoomDetails />
            </Layout>
          }
        />
        <Route
          path="/owner/averageownerage"
          element={
            <Layout headerItems={forOwner} asideItems={forOwner}>
              <AverageOwnerAge />
            </Layout>
          }
        />

        {/* Catch-all Route for Error Page */}
        <Route
          path="/*"
          element={
            <main>
              <ErrorPage />
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
