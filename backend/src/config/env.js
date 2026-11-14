const requiredVariables = [
  "MONGO_DB_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];
 
function validateEnvironment() {
  const missing = requiredVariables.filter(
    (name) => !process.env[name]
  );
 
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
 
  if (
    process.env.JWT_ACCESS_SECRET ===
    process.env.JWT_REFRESH_SECRET
  ) {
    throw new Error(
      "Access and refresh JWT secrets must be different."
    );
  }
}
