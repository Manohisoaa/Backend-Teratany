import { prisma } from "../prisma";

export const createUser = async (
  username: string,
  email: string,
  password: string
) => {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      name: username,
      image:
        "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=" + email,
    },
  });

  return user;
};

export const checkIfEmailExists = async (email: string) => {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) return true;
  return false;
};

export const checkUsernameExists = async (username: string) => {
  const user = await prisma.user.findFirst({
    where: { username },
  });
  if (user) return true;
  return false;
};

export const getUserByEmailAndPassword = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      password,
    },
  });

  return user;
};
