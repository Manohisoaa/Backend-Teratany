import { prisma } from '../prisma';

export const createUserService = async (
  username: string,
  email: string,
  password: string,
) => {
  await prisma.user.create({
    data: {
      username,
      email,
      password,
      name:"",
      image:""
    },
  });
};
