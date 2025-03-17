import jwt from "jsonwebtoken";

const secret = "mysecret";

const payload = {
  id: "123456",
  name: "John Doe",
};

const token = jwt.sign(payload, secret);

console.log(token);
