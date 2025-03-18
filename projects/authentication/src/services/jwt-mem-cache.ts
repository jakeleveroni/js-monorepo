// todo: this will be moved to redis or the db but for now im just using an object to cache jwtid's
const jwtMemoryCache: Record<string, string> = {};

export function addJetIdToCache(jwtid: string) {
  jwtMemoryCache[jwtid] = jwtid;
}

export function removeJetIdFromCache(jwtid: string) {
  delete jwtMemoryCache[jwtid];
}

export function isJwtIdValid(jwtid?: string) {
  return jwtid && !!jwtMemoryCache[jwtid];
}
