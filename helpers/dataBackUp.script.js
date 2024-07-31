const {
  MongoTransferer,
  MongoDBDuplexConnector,
  LocalFileSystemDuplexConnector,
} = require("mongodb-snapshot");
const { getCurrentDate } = require("./fn");
require("dotenv").config();

const database = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const mongo = process.env.DB_TYPE;
const user = process.env.DB_USERNAME;
const pwd = process.env.DB_PASSWORD;
let uri;
if (process.env.PROJECT_ENV === "production") {
  uri = `${mongo}://${user}:${pwd}@${host}:${port}`;
} else {
  uri = `${mongo}://${host}:${port}/${database}`;
}

/**Mongo Dump Script */
async function dumpMongo2Localfile() {
  const mongo_connector = new MongoDBDuplexConnector({
    connection: {
      uri: uri,
      dbname: database,
    },
  });

  const dt = getCurrentDate();
  const filePath = `${process.env.BACKUP_FILE}/backup${dt}.tar`;

  const localfile_connector = new LocalFileSystemDuplexConnector({
    connection: {
      path: filePath,
    },
  });

  const transferer = new MongoTransferer({
    source: mongo_connector,
    targets: [localfile_connector],
  });

  for await (const { total, write } of transferer) {
    console.log(`remaining bytes to write: ${total - write}`);
  }
}

/**Mongo Dump Restore Script */
async function restoreLocalfile2Mongo() {
  const mongo_connector = new MongoDBDuplexConnector({
    connection: {
      uri: `mongodb://localhost:27017`,
      dbname: "multimedia-content-creation-duplicate",
    },
  });

  const localfile_connector = new LocalFileSystemDuplexConnector({
    connection: {
      path: "./backup/backup.tar",
    },
  });

  const transferer = new MongoTransferer({
    source: localfile_connector,
    targets: [mongo_connector],
  });

  for await (const { total, write } of transferer) {
    console.log(`remaining bytes to write: ${total - write}`);
  }
}

module.exports = {
  dumpMongo2Localfile,
  restoreLocalfile2Mongo,
};
