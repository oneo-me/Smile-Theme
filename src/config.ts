import { resolve } from "node:path";
import pkg from "../package.json";

export const root = resolve(import.meta.dir, "..");
export const source = resolve(root, "icons");
export const output = resolve(root, "dist");
export const metadata = {
  version: pkg.version,
  name: "smile-theme",
  publisher: "oneo",
  label: "Smile Icons",
  repository: "https://github.com/oneo-me/Smile-Theme",
};
