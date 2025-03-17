import { type Request, type Response } from "express";
import { prisma } from "../prisma";
import { createUserService } from "../services/userService";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createUserController = async (req: Request, res: Response) => {
  let { username, email, password, name, image } = req.body;
  if (!username) {
    res.status(400).json({ error: "username is required" });
  }
  if (!email) {
    res.status(400).json({ error: "email is required" });
  } else {
    const regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    const isValidEmail = regexp.test(email);
    if (!isValidEmail) {
      res.status(400).json({ error: "email is invalid" });
    } else {
      res.status(200).json({ message: "email is valid" });
    }
  }
  if (!password) {
    res.status(400).json({ error: "password is required" });
  }
  if (!name) {
    res.status(400).json({ error: "name is required" });
  }
  if (!image) {
    image = "image par defaut.png";
  }
  await createUserService(username, email, password, name, image);
  res.json({ data: "ok" });
};
