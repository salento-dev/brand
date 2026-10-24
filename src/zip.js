// Scrittore ZIP minimale, senza dipendenze: deflate (zlib di Node) se conviene, altrimenti "store".
// Basta per il kit del brand (pochi file, < 4 GB, niente ZIP64, nomi UTF-8).
import zlib from 'node:zlib';

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Data e ora in formato DOS (risoluzione 2 s, ora locale "ingenua": usiamo i campi UTC per avere byte stabili). */
function dosDateTime(date) {
  const d = new Date(Math.max(date.getTime(), Date.UTC(1980, 0, 1)));
  return {
    time: (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | Math.floor(d.getUTCSeconds() / 2),
    date: ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate(),
  };
}

/**
 * Crea un archivio ZIP.
 * @param {{ name: string, data: Buffer|string }[]} entries  percorsi con "/" (le cartelle sono implicite)
 * @param {{ date?: Date }} [options]  data dei file (fissa = archivio riproducibile)
 * @returns {Buffer}
 */
export function createZip(entries, { date = new Date() } = {}) {
  const { time, date: day } = dosDateTime(date);
  const locals = [];
  const centrals = [];
  let offset = 0;
  const names = new Set();

  for (const entry of entries) {
    if (!entry.name || entry.name.startsWith('/') || entry.name.split('/').includes('..')) {
      throw new Error(`Percorso non valido nello zip: ${entry.name}`);
    }
    if (names.has(entry.name)) throw new Error(`File duplicato nello zip: ${entry.name}`);
    names.add(entry.name);

    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const name = Buffer.from(entry.name, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); // firma local file header
    local.writeUInt16LE(20, 4); // versione necessaria (2.0)
    local.writeUInt16LE(0x0800, 6); // flag: nomi in UTF-8
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); // firma central directory
    central.writeUInt16LE(0x0314, 4); // creato da: Unix, 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(useDeflate ? 8 : 0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(((0o100644 << 16) >>> 0), 38); // permessi Unix rw-r--r--
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + body.length;
  }

  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // fine della central directory
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

/** Legge un ZIP prodotto da createZip (per i test): [{ name, data }]. */
export function readZip(buf) {
  const endAt = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (endAt < 0) throw new Error('Fine della central directory non trovata');
  const count = buf.readUInt16LE(endAt + 10);
  let p = buf.readUInt32LE(endAt + 16);
  const files = [];
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('Central directory non valida');
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8');
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const body = buf.subarray(start, start + size);
    const data = method === 8 ? zlib.inflateRawSync(body) : Buffer.from(body);
    if (crc32(data) !== crc) throw new Error(`CRC errato: ${name}`);
    files.push({ name, data });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}
