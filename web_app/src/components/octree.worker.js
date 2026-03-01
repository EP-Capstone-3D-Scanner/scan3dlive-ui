//emcc -sENVIRONMENT=web -sMALLOC=emmalloc -O3 -flto SourceFiles/EmscriptenMain.cpp SourceFiles/tinyply.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModuleProfiledTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32,HEAPU8 -sINITIAL_MEMORY=4096MB -sALLOW_MEMORY_GROWTH=0 -sASSERTIONS=1
import OctreeManager from '../modules/OctreeModuleProfiledTest.js';

const BYTES_PER_POINT = 16;
const FLOATS_PER_POINT = 4;
let OctreeHelper = null;

let lastVertexCount = 0;
let previousMaxLOD = -1;
let maxPointsCapacity = 10000000;
const byteSize = maxPointsCapacity * BYTES_PER_POINT;
let sharedBuffer;
let sharedFloat32View;

// 1. Initialize Wasm
OctreeManager({
  print: console.log,
}).then((module) => {
  OctreeHelper = module;
  console.log('ran readied')
  self.postMessage({ type: 'READY' });
});

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    try {
      sharedBuffer = new SharedArrayBuffer(byteSize);
      sharedFloat32View = new Float32Array(sharedBuffer);
      self.postMessage({ 
        type: 'INIT_DONE', 
        payload: { sharedBuffer } 
      });
    } catch (err) {
      console.error("Worker Init Error:", err);
    }
  }

  
  else if (type === 'LOAD') {
    try {
      console.log(payload.file)
      const arrayBuffer = await payload.file.arrayBuffer();
      console.log(arrayBuffer)
      const dataPtr = OctreeHelper._malloc(arrayBuffer.byteLength);
      OctreeHelper.HEAPU8.set(new Uint8Array(arrayBuffer), dataPtr);
      maxPointsCapacity = OctreeHelper._loadPointsXYZFromBinaryPLY(dataPtr, arrayBuffer.byteLength); // TODO: Update this function to return the number of points
      OctreeHelper._free(dataPtr);
      
      self.postMessage({ 
        type: 'LOAD_DONE', 
      });
    } 
    
    catch (err) {
      console.error("Worker Load File Error:", err);
    }
  }
  

  else if (type == 'INSERT') {
    const pointCount = payload.byteLength/BYTES_PER_POINT;
    const dataPtr = OctreeHelper._malloc(payload.byteLength);
    OctreeHelper.HEAPU8.set(new Uint8Array(payload), dataPtr);
    const start = performance.now()
    OctreeHelper._insertPoints(dataPtr, pointCount)
    const end = performance.now()
    console.log(`Octree Insertion took ${end-start} milliseconds`)
    OctreeHelper._free(dataPtr);
    
    self.postMessage({
      type: 'INSERT_DONE',
    });
  }

  else if (type === 'UPDATE') {
    if (!OctreeHelper || !sharedFloat32View) return; // Ensure view exists

    const { pos, vmi, pm, aspectRatio, maxLOD } = payload; 
    OctreeHelper._updateOctreeCamera(
      pos.x, pos.y, pos.z,
      vmi[0], vmi[4], vmi[8], vmi[12], 
      vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14], 
      vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12], 
      pm[1], pm[5], pm[9], pm[13], 
      pm[2], pm[6], pm[10], pm[14], 
      pm[3], pm[7], pm[11], pm[15],
      aspectRatio
    );

    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes(maxLOD, 1);
    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2];
    const vertexCount = Math.min(Math.floor(dataBytes / BYTES_PER_POINT), maxPointsCapacity); 
    const diff = Math.abs(vertexCount - lastVertexCount);
    const threshold = lastVertexCount / 25;

    if (diff > threshold || previousMaxLOD !== maxLOD  || lastVertexCount === 0) {
      const startIndex = (dataNodePtr + 4) >> 2;
      
      sharedFloat32View.set(
        OctreeHelper.HEAPF32.subarray(startIndex, startIndex + vertexCount * FLOATS_PER_POINT)
      );

      self.postMessage({
        type: 'UPDATE_DONE',
        payload: { vertexCount }
      });

      lastVertexCount = vertexCount;
      previousMaxLOD = maxLOD;
    } else {
      self.postMessage({ type: 'NO_UPDATE' });
    }
    OctreeHelper._free(dataNodePtr);
  }

  /*
  if (type === 'UPDATE') {
    if (!OctreeHelper || !buffer) return;

    const { pos, vmi, pm, aspectRatio, maxLOD } = payload; 
    OctreeHelper._updateOctreeCamera(
      pos.x, pos.y, pos.z,
      vmi[0], vmi[4], vmi[8], vmi[12], 
      vmi[1], vmi[5], vmi[9], vmi[13],
      vmi[2], vmi[6], vmi[10], vmi[14], 
      vmi[3], vmi[7], vmi[11], vmi[15],
      pm[0], pm[4], pm[8], pm[12], 
      pm[1], pm[5], pm[9], pm[13], 
      pm[2], pm[6], pm[10], pm[14], 
      pm[3], pm[7], pm[11], pm[15],
      aspectRatio
    );

    const start = performance.now()
    const dataNodePtr = OctreeHelper._getVisibleOctreeNodes(maxLOD, 1);
    const end = performance.now()
    
    //console.log(`Octree Get Visible Nodes took ${end-start} milliseconds`)
    const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2];
    //console.log(`Bytes: ${dataBytes/BYTES_PER_POINT}`)
    const vertexCount = Math.min(Math.floor(dataBytes/BYTES_PER_POINT), maxPointsCapacity); // Need to fix this line -> Return # of points inside dataPtr buffer
    //console.log(`Vertex Count: ${vertexCount}`)
    const diff = Math.abs(vertexCount - lastVertexCount);
    const threshold = lastVertexCount / 25;

    if (diff > threshold || previousMaxLOD !== maxLOD  || lastVertexCount === 0) {
      const dst = new Float32Array(buffer);
      const startIndex = (dataNodePtr + 4) >> 2;
      dst.set(OctreeHelper.HEAPF32.subarray(startIndex, startIndex +  vertexCount * FLOATS_PER_POINT));

      self.postMessage({
        type: 'UPDATE_DONE',
        payload: { vertexCount },
        buffer: buffer
      }, [buffer]);

      lastVertexCount = vertexCount;
      previousMaxLOD = maxLOD;
    } 
    else {
      self.postMessage({ type: 'NO_UPDATE', buffer: buffer }, [buffer]);
    }
    OctreeHelper._free(dataNodePtr);
  }
    */

};