import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getCurrentUser } from "../services/user.services";

export const currentUser = async (req: Request) => {
  const { authorization } = req.headers;
  console.log("authorization", authorization);

  if (!authorization) {
    throw new Error("Authorization header is missing");
  }
  const decoded = jwt.verify(authorization, process.env.JWT_SECRET || "") as {
    id: string;
  };
  try {
    const user = await getCurrentUser(decoded.id);
    return user;
  } catch (error) {
    throw new Error("Error fetching user data");
  }
};
