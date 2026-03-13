import { openDB, IDBPDatabase } from 'idb';

// Tipos para los datos almacenados
export interface PendingPesaje {
  id: string;
  codigo: string;
  especie: 'bovino' | 'porcino';
  sexo: 'H' | 'M';
  tipo_pesaje: 'medios' | 'lotes';
  capturas: Array<{ peso: number; fecha: string }>;
  peso_total: number;
  fecha: string;
  synced: boolean;
  createdAt: string;
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
}

let dbInstance: IDBPDatabase | null = null;

/**
 * Inicializa y retorna la instancia de IndexedDB
 */
export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB('sapid-db', 1, {
    upgrade(db) {
      // Store para pesajes pendientes de sincronización
      if (!db.objectStoreNames.contains('pendingPesajes')) {
        const pesajesStore = db.createObjectStore('pendingPesajes', {
          keyPath: 'id',
        });
        pesajesStore.createIndex('by-synced', 'synced');
        pesajesStore.createIndex('by-date', 'fecha');
      }

      // Store para datos cacheados
      if (!db.objectStoreNames.contains('cachedData')) {
        db.createObjectStore('cachedData', {
          keyPath: 'key',
        });
      }
    },
  });

  return dbInstance;
}

/**
 * Guarda un pesaje pendiente de sincronización
 */
export async function savePendingPesaje(pesaje: PendingPesaje) {
  const db = await getDB();
  await db.put('pendingPesajes', pesaje);
}

/**
 * Obtiene todos los pesajes pendientes de sincronización
 */
export async function getPendingPesajes(): Promise<PendingPesaje[]> {
  const db = await getDB();
  const tx = db.transaction('pendingPesajes', 'readonly');
  const index = tx.store.index('by-synced');
  const allPesajes = await index.getAll(IDBKeyRange.only(false));
  await tx.done;
  return allPesajes as PendingPesaje[];
}

/**
 * Marca un pesaje como sincronizado
 */
export async function markPesajeAsSynced(id: string) {
  const db = await getDB();
  const pesaje = await db.get('pendingPesajes', id);
  if (pesaje) {
    pesaje.synced = true;
    await db.put('pendingPesajes', pesaje);
  }
}

/**
 * Elimina un pesaje sincronizado
 */
export async function deleteSyncedPesaje(id: string) {
  const db = await getDB();
  await db.delete('pendingPesajes', id);
}

/**
 * Guarda datos en caché
 */
export async function cacheData(key: string, data: any) {
  const db = await getDB();
  await db.put('cachedData', {
    key,
    data,
    timestamp: Date.now(),
  });
}

/**
 * Obtiene datos de caché
 */
export async function getCachedData(key: string, maxAge: number = 3600000): Promise<any> {
  const db = await getDB();
  const cached = await db.get('cachedData', key) as CachedData | undefined;
  
  if (!cached) {
    return null;
  }

  // Verificar si el caché está expirado
  if (Date.now() - cached.timestamp > maxAge) {
    await db.delete('cachedData', key);
    return null;
  }

  return cached.data;
}

/**
 * Limpia datos de caché expirados
 */
export async function cleanExpiredCache(maxAge: number = 3600000) {
  const db = await getDB();
  const allCached = await db.getAll('cachedData') as CachedData[];
  const now = Date.now();

  for (const cached of allCached) {
    if (now - cached.timestamp > maxAge) {
      await db.delete('cachedData', cached.key);
    }
  }
}
