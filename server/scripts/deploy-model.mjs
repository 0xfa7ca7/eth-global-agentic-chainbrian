import { OrbisDB } from "@useorbis/db-sdk";
import { OrbisKeyDidAuth } from "@useorbis/db-sdk/auth";
import { config } from "dotenv";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

const __dirname = new URL(".", import.meta.url).pathname;
const path = join(__dirname, "..", "..", ".env");

config({
  path: path,
});
const db = new OrbisDB({
  ceramic: {
    gateway: "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/",
  },
  nodes: [
    {
      gateway: "https://studio.useorbis.com",
      env: process.env.ORBIS_ENV,
    },
  ],
});

const embeddingModel = {
  name: "EmbeddingModel",
  schema: {
    type: "object",
    properties: {
      embedding: {
        type: "array",
        items: {
          type: "number",
        },
        examples: [
          {
            "x-orbisdb": {
              postgres: {
                type: "vector(1536)",
                index: {
                  method: "ivfflat",
                  storage: "(lists = 100)",
                  predicate: "embedding IS NOT NULL",
                },
                extensions: ["vector"],
              },
            },
          },
        ],
      },
      content: {
        type: "string",
      },
      is_user: {
        type: "boolean",
      },
    },
    additionalProperties: false,
  },
  version: "2.0",
  interface: false,
  implements: [],
  description: "Embedding Test model",
  accountRelation: {
    type: "list",
  },
};

const run = async () => {
  if (!process.env.ORBIS_SEED || !process.env.ORBIS_ENV) {
    throw new Error(
      "ORBIS_SEED or ORBIS_ENV is not defined in the environment variables."
    );
  }
  const seed = new Uint8Array(JSON.parse(process.env.ORBIS_SEED));

  // Initiate the authenticator using the generated (or persisted) seed
  const auth = await OrbisKeyDidAuth.fromSeed(seed);

  // Authenticate the user
  await db.connectUser({ auth });
  const model = await db.ceramic.createModel(embeddingModel);
  console.log("Model created:", {
    model,
  });

  // read the .env file and append  or replace the ORBIS_TABLE_ID
  const file = readFileSync(path, "utf8");
  if (file.includes("ORBIS_TABLE_ID=")) {
    const newEnv = file.replace(
      /ORBIS_TABLE_ID=.*/,
      `ORBIS_TABLE_ID="${model.id}"`
    );
    writeFileSync(path, newEnv);
  } else {
    const newEnv = file + `\nORBIS_TABLE_ID="${model.id}"`;
    writeFileSync(path, newEnv);
  }
  console.log("Model saved to .env file:", path);
};
run();
