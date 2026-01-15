import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/auth.slice";

const PrivateRoute = ({ children }) => {
  const isAuth = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
