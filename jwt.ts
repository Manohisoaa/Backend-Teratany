import jwt from "jsonwebtoken";

const secret = "mysecret";

try {
  const decoded = jwt.verify(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NviIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTc0MTc4NjE5N30.WCvGv1ZjD6hGJunjRMQw0HCExu4lIvgr534DIa9RXUw",
    secret
  );
  console.log(decoded);
} catch (error) {
  console.log("This is not a token from us");
}
