import OctreeManager from '../modules/OctreeModuleRotDelTest.js';
// emcc -sENVIRONMENT=web -sMALLOC=emmalloc -O3 -flto -msimd128 -msse SourceFiles/EmscriptenMain.cpp SourceFiles/tinyply.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModuleClearTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32,HEAPU8 -sINITIAL_MEMORY=2048MB -sALLOW_MEMORY_GROWTH=1 -sASSERTIONS=1
const BYTES_PER_POINT = 16;
const FLOATS_PER_POINT = 4;
let OctreeHelper = null;

let lastVertexCount = 0;
let previousMaxLOD = -1;
let doneDeletion = false;
let maxPointsCapacity = 6000000;
const byteSize = maxPointsCapacity * BYTES_PER_POINT;
let sharedBuffer;
let sharedFloat32View;
let tm = 0;

OctreeManager({print: console.log})
.then((module) => {
  OctreeHelper = module;
  console.log('ran readied')
  self.postMessage({ type: 'READY' });
});

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    try {
      sharedBuffer = new SharedArrayBuffer(byteSize);
      console.log(sharedBuffer.byteLength)
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
      const arrayBuffer = await payload.file.arrayBuffer();
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
    const start = performance.now()
    const pointCount = payload.byteLength/BYTES_PER_POINT;
    const dataPtr = OctreeHelper._malloc(payload.byteLength);
    OctreeHelper.HEAPU8.set(new Uint8Array(payload), dataPtr);
    OctreeHelper._insertPoints(dataPtr, pointCount)
    OctreeHelper._free(dataPtr);
    const end = performance.now()
    //console.log(`Octree Insertion took ${end-start} milliseconds`)
    console.log(`Time elapsed ${end-start} milliseconds`)
    
    self.postMessage({
      type: 'INSERT_DONE',
    });
  }

  else if (type == 'DELETE') {
    const position = payload['position']
    const size = payload['size']
    const rot = payload['rotation']
    const minX = position[0]-size[0]/2;
    const minY = position[1]-size[1]/2;
    const minZ = position[2]-size[2]/2;
    const maxX = position[0]+size[0]/2;
    const maxY = position[1]+size[1]/2;
    const maxZ = position[2]+size[2]/2;
    const rotX = rot[0];
    const rotY = rot[1];
    const rotZ = rot[2];
    OctreeHelper._deleteOctreePoints(minX, minY, minZ, maxX, maxY, maxZ, rotX, rotY, rotZ);
    self.postMessage({
      type: 'DELETE_DONE',
    });
    doneDeletion = true;
  }

  else if (type == 'CLEAR') {
    OctreeHelper._clearOctree()
    self.postMessage({
      type: 'CLEAR_DONE',
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
    console.log(vertexCount) 
    const diff = Math.abs(vertexCount - lastVertexCount);
    const threshold = lastVertexCount / 25;

    if (doneDeletion || diff > threshold || previousMaxLOD !== maxLOD  || lastVertexCount === 0) {
      const startIndex = (dataNodePtr + 4) >> 2;
      
      sharedFloat32View.set(
        OctreeHelper.HEAPF32.subarray(startIndex, startIndex + vertexCount * FLOATS_PER_POINT)
      );

      self.postMessage({
        type: 'UPDATE_DONE',
        payload: { vertexCount }
      });
      if(doneDeletion) {
        doneDeletion = false;
      }
      lastVertexCount = vertexCount;
      previousMaxLOD = maxLOD;
    } else {
      self.postMessage({ type: 'NO_UPDATE' });
    }
    OctreeHelper._free(dataNodePtr);
  }

  else if (type === 'SAVE') {
      if (!OctreeHelper) return;
      const dataNodePtr = OctreeHelper._getOctreeBinaryPLY();
      const dataBytes = OctreeHelper.HEAPU32[dataNodePtr >> 2];
      const startIndex = dataNodePtr + 4;
      const fileData = new Uint8Array(dataBytes);
      fileData.set(OctreeHelper.HEAPU8.subarray(startIndex, startIndex + dataBytes));
      self.postMessage({ type: 'SAVE_DONE', payload: fileData });
      OctreeHelper._free(dataNodePtr);
  }
};