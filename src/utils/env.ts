import dotenv from "dotenv";

let initialized = false;

if (!initialized) {
  dotenv.config();
  initialized = true;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue || "";
  }
  return value;
};

export default getEnv;
