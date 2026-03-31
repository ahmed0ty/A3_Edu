import crypto from "crypto";

export const generateSignature = (...data) => {
  return crypto
    .createHash("sha256")
    .update(data.join(""))
    .digest("hex");
};