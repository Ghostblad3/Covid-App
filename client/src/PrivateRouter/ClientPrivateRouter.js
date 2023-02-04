import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthenticationContext from "../Authentication/AuthenticationContext";

function ClientPrivateRouter() {
  const { authorizedUser } = useContext(AuthenticationContext);
  return authorizedUser ? <Outlet /> : <Navigate to="/" />;
}

export default ClientPrivateRouter;
