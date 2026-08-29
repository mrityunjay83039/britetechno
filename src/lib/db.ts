import mongoose from 'mongoose';
import dns from 'dns';

function applyPublicDns() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore if restricted
  }
}

applyPublicDns();

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (uri) return uri;
  return 'mongodb://mrityunjay83039_db_user:olKfREBnZmCBAazd@ac-otgbnhj-shard-00-01.ccoevf6.mongodb.net:27017,ac-otgbnhj-shard-00-02.ccoevf6.mongodb.net:27017,ac-otgbnhj-shard-00-00.ccoevf6.mongodb.net:27017/?ssl=true&authSource=admin';
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

const cache = cached!;

async function resolveConnectionString(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  applyPublicDns();
  try {
    const rawUrl = uri.replace('mongodb+srv://', 'http://');
    const parsed = new URL(rawUrl);
    const host = parsed.hostname;
    const auth = parsed.username ? `${parsed.username}:${parsed.password}@` : '';
    const dbName = parsed.pathname.slice(1);
    const searchParams = parsed.search;

    const srvRecord = `_mongodb._tcp.${host}`;
    const addresses = await new Promise<dns.SrvRecord[]>((resolve, reject) => {
      dns.resolveSrv(srvRecord, (err, addrs) => {
        if (err || !addrs || addrs.length === 0) return reject(err);
        resolve(addrs);
      });
    });

    const hostList = addresses.map((a) => `${a.name}:${a.port}`).join(',');
    const queryJoin = searchParams ? `${searchParams}&` : '?';
    const directUri = `mongodb://${auth}${hostList}/${dbName}${queryJoin}ssl=true&authSource=admin`;
    return directUri;
  } catch {
    return 'mongodb://mrityunjay83039_db_user:olKfREBnZmCBAazd@ac-otgbnhj-shard-00-01.ccoevf6.mongodb.net:27017,ac-otgbnhj-shard-00-02.ccoevf6.mongodb.net:27017,ac-otgbnhj-shard-00-00.ccoevf6.mongodb.net:27017/?ssl=true&authSource=admin';
  }
}

async function dbConnect() {
  applyPublicDns();

  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  const targetUri = getMongoUri();

  if (!cache.promise || mongoose.connection.readyState === 0) {
    const opts = {
      bufferCommands: false,
    };

    cache.promise = (async () => {
      try {
        const resolved = await resolveConnectionString(targetUri);
        return await mongoose.connect(resolved, opts);
      } catch (err: unknown) {
        const errorObj = err as { code?: string; syscall?: string };
        if (errorObj?.code === 'ECONNREFUSED' || errorObj?.syscall === 'querySrv') {
          console.warn('MongoDB querySrv failed. Resolving direct cluster seedlist URI...');
          const directUri = await resolveConnectionString(targetUri);
          return await mongoose.connect(directUri, opts);
        }
        throw err;
      }
    })();
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    cache.conn = null;
    throw e;
  }

  return cache.conn;
}

export default dbConnect;
