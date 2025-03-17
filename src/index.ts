import express from "express";
import router from "./routes";

const app = express();
const port = process.env.PORT;

app.use(express.json()); // Pour parser le JSON
app.use("/", router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
