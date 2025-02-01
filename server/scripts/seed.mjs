import { OrbisKeyDidAuth } from "@useorbis/db-sdk/auth";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const __dirname = new URL(".", import.meta.url).pathname;
const path = join(__dirname, "..", "..", ".env");

const run = async () => {
  const seed = await OrbisKeyDidAuth.generateSeed();
  console.log("Seed generated:", {
    seed,
  });
  // read the .env file and append  or replace the ORBIS_SEED
  const file = readFileSync(path, "utf8");
  if (file.includes("ORBIS_SEED=")) {
    const newEnv = file.replace(
      /ORBIS_SEED=.*/,
      `ORBIS_SEED="${JSON.stringify(Array.from(seed))}"`
    );
    writeFileSync(path, newEnv);
  } else {
    const newEnv = file + `\nORBIS_SEED="${JSON.stringify(Array.from(seed))}"`;
    writeFileSync(path, newEnv);
  }
  console.log("Seed saved to .env file:", path);
};
run().catch(console.error);
