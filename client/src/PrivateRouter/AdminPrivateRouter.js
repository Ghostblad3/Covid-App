import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthenticationContext from "../Authentication/AuthenticationContext";

function AdminPrivateRouter() {
  const { authorizedAdmin } = useContext(AuthenticationContext);
  return authorizedAdmin ? <Outlet /> : <Navigate to="/" />;
}

export default AdminPrivateRouter;
