import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../prisma";
import {
  checkIfEmailExists,
  checkUsernameExists,
  createUser,
  getUserByEmailAndPassword,
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
