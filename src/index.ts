import express from "express";
import userRouter from "./routes/user.routes";
import publicationRouter from "./routes/publication.routes";
import morgan from "morgan";
import compression from "compression";
const app = express();
const port = process.env.PORT;

app.use(express.json()); // Pour parser le JSON
app.use(
  compression({
    threshold: 0, // Compress all responses regardless of size
  })
);
app.use(morgan("dev"));

app.use("/publication", publicationRouter);
app.use("/", userRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
