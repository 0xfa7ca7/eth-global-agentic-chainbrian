import NodeCache from "node-cache";

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, value: T): boolean {
    return this.cache.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public del(key: string): number {
    return this.cache.del(key);
  }
}
