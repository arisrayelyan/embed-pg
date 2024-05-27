/* eslint-disable no-console */
import { UserService } from "@services/UserService";
import { select, input } from "@inquirer/prompts";
import dbConnection from "@database/index";

(async () => {
  // Display a selection menu for expiration options.
  const expiresAfter = await select({
    message: "Expires after:",
    choices: [
      { value: 365, name: "1 year" },
      { value: 180, name: "6 months" },
      { value: 90, name: "3 months" },
      { value: 30, name: "1 month" },
      { value: null, name: "custom" },
      { value: 0, name: "never" },
    ],
  });

  let days = 0;

  // Handle custom expiration input.
  if (expiresAfter === null) {
    let isValid = false;
    while (!isValid) {
      const customExpiresAfter = await input({
        message: "Custom expires after (days):",
      });
      const customInput = parseInt(customExpiresAfter, 10);

      if (Number.isInteger(customInput) && customInput > 0) {
        days = customInput;
        isValid = true; // Valid input received, exit the loop.
      } else {
        console.log("Invalid input, please enter a positive integer.");
      }
    }
  } else {
    days = expiresAfter;
  }

  // Log the result based on the input.
  if (days === 0) {
    console.log("Creating API key that never expires.");
  } else {
    console.log(`Creating API key that expires after ${days} days.`);
  }
  const orm = await dbConnection(undefined, true);
  const em = orm.em.fork();
  const userService = new UserService({ em });
  const user = await userService.create(days);
  if (user.key && user.secretKey) {
    console.log("API key created successfully.");
    // base64 encode the key and secretKey
    console.log(
      `key: ${Buffer.from(`${user.key}:${user.secretKey}`).toString("base64")}`
    );
  }
  orm.close();
})();
