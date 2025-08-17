import { exec } from "child_process";
import path from "path";

export const openHtmlFile = (filePath: string) => {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);
    exec(`start "" "${absolutePath}"`, (error) => {
      if (error) {
        reject(`Error opening file: ${error.message}`);
      } else {
        resolve(`File opened successfully: ${absolutePath}`);
      }
    });
  });
};
