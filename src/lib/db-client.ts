import { MongoClient } from 'mongodb';

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createMongoClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

/**
 * Lazy singleton connection promise to avoid unhandled top-level connection
 * rejections crashing the dev server before routes are invoked.
 */
export function getMongoClientPromise() {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createMongoClientPromise().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  return createMongoClientPromise();
}
