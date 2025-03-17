import { prisma } from "../prisma";

export const createUserService = async (
  username: string,
  email: string,
  password: string,
  name: string,
  image: string
) => {
  await prisma.user.create({
    data: {
      username,
      name,
      email,
      password,
      image,
    },
  });
};
