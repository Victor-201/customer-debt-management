import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { forceLogout, refreshTokenAsync } from "./store/auth.slice";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = async () => {
      try {
        await dispatch(refreshTokenAsync()).unwrap();
      } catch {
        dispatch(forceLogout());
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [dispatch]);

  return <AppRoutes />;
};

export default App;
