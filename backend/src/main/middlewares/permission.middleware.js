import { ROLE_PERMISSIONS } from "../../shared/constants/roles.js";

const permissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }

    const permissions = ROLE_PERMISSIONS[user.role];

    if (!permissions) {
      return res.status(403).json({
        message: "Role has no permissions",
      });
    }

    if (permissions.includes("*")) {
      return next();
    }

    const allowed = requiredPermissions.some((p) =>
      permissions.includes(p)
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    next();
  };
};

export default permissionMiddleware;
