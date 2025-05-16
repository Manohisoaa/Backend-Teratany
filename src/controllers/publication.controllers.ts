import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Reaction, type Location, type User } from "@prisma/client";
import { prisma } from "../prisma";

import { currentUser } from "../utils";
import { incrementHeat } from "../services/map.services";
import {
  publish,
  sharePublication,
  translateToAll,
} from "../services/publication.services";

export const publishController = async (req: Request, res: Response) => {
  const user = await currentUser(req);
  const { content, categories, media, type, videoUrl, location } = req.body;

  if (typeof content !== "string") {
    res.status(400).json({ error: "Content must be a string" });
    return;
  }

  if (
    !Array.isArray(categories) ||
    !categories.every((cat) => typeof cat === "string")
  ) {
    res.status(400).json({ error: "Categories must be an array of strings" });
    return;
  }

  if (!Array.isArray(media) || !media.every((m) => typeof m === "string")) {
    res.status(400).json({ error: "Media must be an array of strings" });
    return;
  }

  if (typeof type !== "string") {
    res.status(400).json({ error: "Type must be a string" });
    return;
  }

  if (typeof videoUrl !== "string") {
    res.status(400).json({ error: "Video URL must be a string" });
    return;
  }

  if (location) {
    if (typeof location.lat !== "string") {
      res.status(400).json({ error: "Location latitude must be a string" });
      return;
    }
    if (typeof location.lon !== "string") {
      res.status(400).json({ error: "Location longitude must be a string" });
      return;
    }
    if (typeof location.name !== "string") {
      res.status(400).json({ error: "Location name must be a string" });
      return;
    }
    if (typeof location.display_name !== "string") {
      res.status(400).json({ error: "Location display name must be a string" });
      return;
    }
    if (!location.place_id) {
      res.status(400).json({ error: "Location place ID must be a number" });
      return;
    }
    if (typeof location.type !== "string") {
      res.status(400).json({ error: "Location type must be a string" });
      return;
    }
  }

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await publish(
    user.id,
    media,
    categories,
    content,
    type,
    videoUrl,
    location as Location | null
  );
  res.json({
    message: "Publication created",
  });
};

export const sharePublicationController = async (
  req: Request,
  res: Response
) => {
  const user = await currentUser(req);
  const { publicationId } = req.params;
  const { content } = req.body;

  if (typeof content !== "string") {
    res.status(400).json({ error: "Content must be a string" });
    return;
  }

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const sharedPublication = await sharePublication(
      user.id,
      publicationId,
      content
    );
    res.json({
      message: "Publication shared",
      publicationId: sharedPublication.id,
    });
  } catch (error) {
    res.status(404).json({ message: "Publication not found" });
  }
};

export const commentPublicatonController = async (
  req: Request,
  res: Response
) => {
  const user = await currentUser(req);
  const { publicationId } = req.params;
  const { content } = req.body;

  if (typeof content !== "string") {
    res.status(400).json({ error: "Content must be a string" });
    return;
  }

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const publication = await prisma.publication.findUnique({
    where: { id: publicationId },
  });

  if (!publication) {
    res.status(404).json({ error: "Publication not found" });
    return;
  }

  const newComment = await prisma.publicationComment.create({
    data: {
      userId: user.id,
      publicationId: publicationId,
      content,
    },
  });
  res.json({
    message: "Comment added",
    comment: newComment,
  });
};

export const reactPublicatonController = async (
  req: Request,
  res: Response
) => {
  const { publicationId } = req.params;
  const user = await currentUser(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const data = await prisma.publicationReaction.findFirst({
      where: {
        publicationId: publicationId,
        userId: user.id,
      },
    });

    if (data) {
      await prisma.publicationReaction.deleteMany({
        where: {
          publicationId: publicationId,
          userId: user.id,
        },
      });
      res.json({ message: "Publication unlike" });
    } else {
      await prisma.publicationReaction.create({
        data: {
          publicationId: publicationId,
          userId: user.id,
          reaction: Reaction.LIKE,
        },
      });
      res.json({ message: "Publication like" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getPublicationController = async (req: Request, res: Response) => {
  const { publicationId } = req.params;
  const user = await currentUser(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const publication = await prisma.publication.findUnique({
    where: { id: publicationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          lastAction: true,
          profileType: true,
        },
      },
      _count: {
        select: {
          PublicationComment: true,
          reactions: true,
        },
      },
    },
  });

  if (!publication) {
    res.status(404).json({ error: "Publication not found" });
    return;
  }

  res.json(publication);
};

export const getCommentsController = async (req: Request, res: Response) => {
  const { publicationId } = req.params;
  const user = await currentUser(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const comments = await prisma.publicationComment.findMany({
      where: { publicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            lastAction: true,
            profileType: true,
          },
        },
        _count: {
          select: {
            reaction: true,
          },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments" });
  }
};

export const reactCommentController = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const user = await currentUser(req);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const data = await prisma.commentReaction.findFirst({
      where: {
        publicationCommentId: commentId,
        userId: user.id,
      },
    });

    if (data) {
      await prisma.commentReaction.deleteMany({
        where: {
          publicationCommentId: commentId,
          userId: user.id,
        },
      });
      res.json({ message: "Comment unlike" });
    } else {
      await prisma.commentReaction.create({
        data: {
          publicationCommentId: commentId,
          userId: user.id,
          reaction: Reaction.LIKE,
        },
      });
      res.json({ message: "Comment like" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUserPublicatonsController = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  const user = await currentUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const data = await prisma.publication.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            lastAction: true,
            profileType: true,
          },
        },
        _count: {
          select: {
            PublicationComment: true,
            reactions: true,
          },
        },
      },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching publications" });
    return;
  }
};

export const getReactsPublicationController = async (
  req: Request,
  res: Response
) => {
  const { publicationId } = req.params;

  try {
    const data = await prisma.publicationReaction.findMany({
      where: {
        publicationId: publicationId,
      },
      select: {
        user: {
          select: {
            username: true,
            id: true,
            image: true,
          },
        },
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getReactsCommentController = async (
  req: Request,
  res: Response
) => {
  const { commentId } = req.params;
  try {
    const data = await prisma.commentReaction.findMany({
      where: {
        publicationCommentId: commentId,
      },
      select: {
        user: {
          select: {
            username: true,
            id: true,
            image: true,
          },
        },
      },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getAllPublicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const publications = await prisma.publication.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            lastAction: true,
            profileType: true,
          },
        },
        _count: {
          select: {
            PublicationComment: true,
            reactions: true,
          },
        },
      },
    });
    res.json(publications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching publications" });
  }
};
