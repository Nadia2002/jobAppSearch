import jwt from "jsonwebtoken";
import userModel from "../../db/models/user.model.js";

export const auth = () => {
  return async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(404).json({ msg: "token not found" });
      }
      if (!token.startsWith(AUTH_TOKENSIGN)) {
        return res.status(400).json({ msg: "token not valid" });
      }
      const newToken = token.split(AUTH_TOKENSIGN)[1];

      if (!newToken) {
        return res.status(400).json({ msg: "token not found" });
      }
      const decoded = jwt.verify(newToken, "signIn");

      if (!decoded?.id) {
        return res.status(400).json({ msg: "invalid payload" });
      }

      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(409).json({ msg: "invalid user" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(400).json({ msg: "catch error", error });
    }
  };
};

export const authRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "acess denied" });
    }
    next();
  };
};
