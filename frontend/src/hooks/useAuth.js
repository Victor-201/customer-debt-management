import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/auth.slice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, loading } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    loading,
    role: user?.role,
    isAuthenticated: !!accessToken,
    logout: () => dispatch(logout()),
  };
};
