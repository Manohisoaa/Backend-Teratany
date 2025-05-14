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
  getUserById,
} from "../services/user.services";
import { ProfileType } from "@prisma/client";
import { currentUser } from "../utils";

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
      return;
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
  try {
    const user = await currentUser(req);

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

export const searchUsersController = async (req: Request, res: Response) => {
  let { text, profileType } = req.query;

  if (!text) {
    text = "@";
  }

  if (
    profileType &&
    !Object.values(ProfileType).includes(profileType as ProfileType)
  ) {
    res.status(400).json({
      error: "Invalid profileType. Must be USER or Association or Entreprise",
    });
    return;
  }

  const users = await searchUsers(
    text as string,
    profileType as ProfileType | undefined
  );

  res.json(users);
};

export const getOneUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
};

export const getUserFollowersController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const data = await prisma.follow.findMany({
    where: { followingId: id },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          lastAction: true,
          profileType: true,
        },
      },
    },
  });
  res.json(data);
};
export const getUserFollowingController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const data = await prisma.follow.findMany({
    where: { followerId: id },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          lastAction: true,
          profileType: true,
        },
      },
    },
  });
  res.json(data);
};

export const followUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await currentUser(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const data = await prisma.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: id,
      },
    });

    if (data) {
      await prisma.follow.deleteMany({
        where: {
          followerId: user.id,
          followingId: id,
        },
      });
      res.json({ message: "User unfollowed successfully" });
    } else {
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: id,
        },
      });
      res.json({ message: "User followed successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error following user" });
  }
};
