import bcrypt from 'bcryptjs';

import { prisma } from '../prisma';

export const createUser = async (
  username: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  let user = await prisma.user.create({
    data: {
      username,
      email,
      hashedPassword,
      name: username,
      image:
        "https://api.dicebear.com/8.x/notionists-neutral/svg?seed=" + email,
    },
  });

  await prisma.server.update({
    where: {
      id: '66f4025a709a35b3df90a9f4',
    },
    data: {
      members: {
        create: [
          {
            userId: user.id,
          },
        ],
      },
    },
  });

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      serverId: process.env.MAINSERVERID || '66f4025a709a35b3df90a9f4',
    },
  });
  if (member) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        generalServerId: member.id,
      },
    });
  }

  // TODO : faire un getClientIp ici pour avoir l'IP de l'utilisateur
  // TODO : get la localisation long lat de l'utilisateur
  // TODO : incrementer la heatmap

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
  // TO DO : hashena amin'ny bcrypt ilay password dia ilay resultat no atao parametre ana rehcerche ao amin'ny findFirst fa tsy password intsony
  // TO DO : bun install bcryptjs
  const user = await prisma.user.findFirst({
    where: {
      email,
      password,
    },
  });

  return user;
};
