import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../prisma";
import {
  checkIfEmailExists,
  checkUsernameExists,
  createUser,
  editProfile,
  getCurrentUser,
  getUserByEmailAndPassword,
  updateProfilePicture,
  searchUsers,
} from "../services/userService";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createUserController = async (req: Request, res: Response) => {
  let { username, email, password } = req.body;

  if (!username) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  } else {
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    const isValidEmail = regexp.test(email);
    if (!isValidEmail) {
      res.status(400).json({ error: "email is invalid" });
    }
  }

  if (!password) {
    res.status(400).json({ error: "password is required" });
    return;
  }

  if (await checkIfEmailExists(email)) {
    res.status(400).json({ error: "email already exists" });
    return;
  }
  if (await checkUsernameExists(username)) {
    res.status(400).json({ error: "username already exists" });
    return;
  }

  const user = await createUser(username, email, password);
  const payload = { id: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "");

  res.json({ data: token });
};

export const signInController = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  if (!password) {
    res.status(400).json({ error: "password is required" });
    return;
  }

  const user = await getUserByEmailAndPassword(email, password);
  if (!user) {
    res.status(400).json({ error: "invalid email or password" });
    return;
  } else {
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "");
    res.json({ data: token });
  }
};

export async function updateProfileController(req: Request, res: Response) {
  const { bio, name, username, email } = req.body;
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(400).json({ error: "Non autorise" });
    return;
  }
  console.log(authorization);

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  if (!username) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  } else {
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    const isValidEmail = regexp.test(email);
    if (!isValidEmail) {
      res.status(400).json({ error: "email is invalid" });
    }
  }

  if (await checkIfEmailExists(email)) {
    res.status(400).json({ error: "email already exists" });
    return;
  }

  if (await checkUsernameExists(username)) {
    res.status(400).json({ error: "username already exists" });
    return;
  }

  interface DecodedToken {
    id: string;
  }

  const decoded = jwt.verify(
    authorization,
    process.env.JWT_SECRET || ""
  ) as DecodedToken;

  console.log(decoded);
  try {
    await editProfile(decoded.id, bio, name, username, email);
    res.json({ message: "Profile mise à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du profile" });
  }
}

export const updatePictureController = async (req: Request, res: Response) => {
  console.log("here");

  const { profilePicture } = req.body;
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(400).json({ error: "Non autorise" });
    return;
  }
  const decoded = jwt.verify(authorization, process.env.JWT_SECRET || "") as {
    id: string;
  };
  try {
    await updateProfilePicture(decoded.id, profilePicture);
    res.json({ message: "Photo de profil mise à jour avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la photo de profil" });
  }
};

export const getCurrentUserController = async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(400).json({ error: "Non autorise" });
    return;
  }
  const decoded = jwt.verify(authorization, process.env.JWT_SECRET || "") as {
    id: string;
  };
  try {
    const user = await getCurrentUser(decoded.id);
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

export const searchUsersController = async (req: Request, res: Response) => {
  const { text } = req.query;

  if (!text) {
    res.status(400).json({ error: "text is required in query" });
    return;
  }

  const users = await searchUsers(text as string);

  res.json(users);
};
