import type JSZip from 'jszip';

export interface ExpansionBudget { remaining: number }
// JSZip 3 exposes internalStream in zipObject.js; its shipped declarations omit it.
type StreamingEntry = JSZip.JSZipObject & {
  internalStream(type: 'uint8array'): JSZip.JSZipStreamHelper<Uint8Array>;
};

export function readBoundedZipEntry(entry: JSZip.JSZipObject, budget: ExpansionBudget, metadata = false): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const stream = (entry as StreamingEntry).internalStream('uint8array');
    let chunks: Uint8Array[] = [];
    let size = 0, stopped = false;
    const fail = (error: Error) => {
      if (stopped) return;
      stopped = true;
      stream.pause();
      chunks = [];
      reject(error);
    };
    stream.on('data', chunk => {
      if (stopped) return;
      if (chunk.byteLength > budget.remaining) {
        fail(new Error('Expanded package exceeds 100 MB'));
        return;
      }
      if (metadata && size + chunk.byteLength > 1024 * 1024) {
        fail(new Error('Package metadata exceeds 1 MB'));
        return;
      }
      budget.remaining -= chunk.byteLength;
      size += chunk.byteLength;
      chunks.push(chunk);
    }).on('error', fail).on('end', () => {
      if (stopped) return;
      stopped = true;
      const content = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { content.set(chunk, offset); offset += chunk.byteLength; }
      chunks = [];
      resolve(content);
    }).resume();
  });
}
