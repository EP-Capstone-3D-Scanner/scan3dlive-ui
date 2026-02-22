import OctreeManager from '../modules/OctreeModuleLinearTest.js';

let OctreeHelper = null;
let lastVertexCount = 0;
let previousMaxLOD = -1;
let maxPointsCapacity = 0;

// 1. Initialize Wasm
OctreeManager({
  print: console.log,
}).then((module) => {
  OctreeHelper = module;
  self.postMessage({ type: 'READY' });
});

self.onmessage = async (e) => {
  const { type, payload, buffer } = e.data;

// INITIAL LOAD
// octree.worker.js

if (type === 'INIT') {
  try {
    const res = await fetch(payload.url);
    const arrayBuffer = await res.arrayBuffer();
    const dataPtr = OctreeHelper._malloc(arrayBuffer.byteLength);
    OctreeHelper.HEAPU8.set(new Uint8Array(arrayBuffer), dataPtr);

    const headerSize = OctreeHelper._loadPointsXYZFromBinaryPLY(
     dataPtr, 
     arrayBuffer.byteLength
    );

    maxPointsCapacity = Math.floor((arrayBuffer.byteLength - headerSize) / 12); 
    OctreeHelper._free(dataPtr);

    
    self.postMessage({ 
      type: 'INIT_DONE', 
      payload: { maxPoints: maxPointsCapacity } 
    });
  } catch (err) {
    console.error("Worker Init Error:", err);
  }
}


  // PER-FRAME UPDATE
  if (type === 'UPDATE') {
    if (!OctreeHelper || !buffer) return;

    const { pos, vmi, pm, aspectRatio, maxLOD } = payload;
    
    OctreeHelper._updateOctreeCamera(
      pos.x, pos.y, pos.z,
      vmi[0], vmi[4], vmi[8], vmi[12], vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14], vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12], pm[1], pm[5], pm[9], pm[13],
      pm[2], pm[6], pm[10], pm[14], pm[3], pm[7], pm[11], pm[15],
      aspectRatio
    );

    const start = performance.now()
    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes(maxLOD, 1);
    const end = performance.now()
    console.log(`Execution time was ${end-start} milliseconds`)

    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2];
    const vertexCount = Math.min(Math.floor((dataBytes / 4) / 3), maxPointsCapacity);
    console.log(`Vertex Count: ${vertexCount}`)
    const toCopy = vertexCount * 3;
    const startIndex = (dataNodePtr + 4) >> 2;

    const diff = Math.abs(vertexCount - lastVertexCount);
    const threshold = lastVertexCount / 100;

    // Only update if change is significant or LOD changed
    if (previousMaxLOD !== maxLOD  || lastVertexCount === 0) {
      const dst = new Float32Array(buffer);
      dst.set(OctreeHelper.HEAPF32.subarray(startIndex, startIndex + toCopy));

      self.postMessage({
        type: 'UPDATE_DONE',
        payload: { vertexCount },
        buffer: buffer
      }, [buffer]);

      lastVertexCount = vertexCount;
      previousMaxLOD = maxLOD;
    } else {
      self.postMessage({ type: 'NO_UPDATE', buffer: buffer }, [buffer]);
    }

    OctreeHelper._free(dataNodePtr);
  }

};