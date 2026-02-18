#include "MathTypes.h"
#include "ModifiableNestedOctree.h"
#include "Points.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <cmath>
#include <emscripten/emscripten.h>

// cd emcc -O2 SourceFiles/EmscriptenMain.cpp SourceFiles/ModifiableNestedOctree.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModulePLYInsertionTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32 -sINITIAL_MEMORY=512MB
// emcc -O3 SourceFiles/EmscriptenMain.cpp SourceFiles/ModifiableNestedOctree.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModulePLYInsertionTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32,HEAPU8 -sINITIAL_MEMORY=2048MB

auto root = std::make_unique<ModifiableNestedOctree>(PointXYZ(0, 0, 0), PointXYZ(1, 1, 1));

Matrix4x4 worldToCamera = {{
    {{1, 0, 0, 0}}, 
    {{0, 1, 0, 0}}, 
    {{0, 0, 1, 0}}, 
    {{0, 0, 0, 1}}
}};

Matrix4x4 projection = {{
    {{1, 0, 0, 0}}, 
    {{0, 1, 0, 0}}, 
    {{0, 0, 1, 0}}, 
    {{0, 0, 0, 1}}
}};

Camera c = {0, 0, 0, worldToCamera, projection, 1280, 161.0500030517578};


extern "C" {

    EMSCRIPTEN_KEEPALIVE
    void updateOctreeCamera(
        float x, float y, float z,
        float vmi11, float vmi12, float vmi13, float vmi14, 
        float vmi21, float vmi22, float vmi23, float vmi24, 
        float vmi31, float vmi32, float vmi33, float vmi34,
        float vmi41, float vmi42, float vmi43, float vmi44,
        float pm11, float pm12, float pm13, float pm14, 
        float pm21, float pm22, float pm23, float pm24,  
        float pm31, float pm32, float pm33, float pm34, 
        float pm41, float pm42, float pm43, float pm44, 
        float vppr
    ) {
        
        c.setPosition(x, y, z);

        c.setViewMatrixInverse(
            vmi11, vmi12, vmi13, vmi14,
            vmi21, vmi22, vmi23, vmi24,
            vmi31, vmi32, vmi33, vmi34,
            vmi41, vmi42, vmi43, vmi44
        );

        c.setProjectionMatrix(
            pm11, pm12, pm13, pm14, 
            pm21, pm22, pm23, pm24,  
            pm31, pm32, pm33, pm34, 
            pm41, pm42, pm43, pm44, 
            vppr
        );

        c.setProjectionViewMatrix();
    
    }

    EMSCRIPTEN_KEEPALIVE
    int loadPointsXYZFromBinaryPLY(const uint8_t* dataPtr, const int dataSize) {
        std::vector<PointXYZ> points;
        std::istringstream file(std::string(reinterpret_cast<const char*>(dataPtr), dataSize));
        std::string line;
        size_t vertexCount = 0;
        int headerSizeBytes = 0;

        // Read header
        while (std::getline(file, line)) {
            if (line.substr(0, 14) == "element vertex") {
                vertexCount = std::stoul(line.substr(15));
            }
            if (line == "end_header") {
                headerSizeBytes = (int) file.tellg();
                break;
            }
        }

        // Read vertex data
        for (size_t i = 0; i < vertexCount; ++i) {
            float x, y, z;
            int r, g, b;
            file.read(reinterpret_cast<char*>(&x), sizeof(float));
            file.read(reinterpret_cast<char*>(&y), sizeof(float));
            file.read(reinterpret_cast<char*>(&z), sizeof(float));
            file.read(reinterpret_cast<char*>(&r), sizeof(int));
            file.read(reinterpret_cast<char*>(&g), sizeof(int));
            file.read(reinterpret_cast<char*>(&b), sizeof(int));
            points.emplace_back(x, y, z);
        }

        PointXYZ minPoint = points[0];
        PointXYZ maxPoint = points[0];

        for (const auto& p : points) {
            if (p.x < minPoint.x) minPoint.x = p.x;
            if (p.y < minPoint.y) minPoint.y = p.y;
            if (p.z < minPoint.z) minPoint.z = p.z;
            if (p.x > maxPoint.x) maxPoint.x = p.x;
            if (p.y > maxPoint.y) maxPoint.y = p.y;
            if (p.z > maxPoint.z) maxPoint.z = p.z;
        }
        ModifiableNestedOctree* originalRootPtr = root.get();
        expandRoot(root, BoundingBox(minPoint, maxPoint));
        for (const auto& p : points) {
            root->insertPoint(p);
        }
        root->repairLOD(originalRootPtr);

        return headerSizeBytes;
    }

    EMSCRIPTEN_KEEPALIVE
    void insertPoints(const float * dataPtr, const int pointCount) {
        std::vector<PointXYZ> points;
        points.reserve(pointCount);
        
        PointXYZ minPoint(INFINITY, INFINITY, INFINITY);
        PointXYZ maxPoint(-INFINITY, -INFINITY, -INFINITY);
        for(int i = 0; i < pointCount; i++) {
            PointXYZ p(*(dataPtr+3*i+0), *(dataPtr+3*i+1), *(dataPtr+3*i+2));
            points.push_back(p);
            if (p.x < minPoint.x) minPoint.x = p.x;
            if (p.y < minPoint.y) minPoint.y = p.y;
            if (p.z < minPoint.z) minPoint.z = p.z;
            if (p.x > maxPoint.x) maxPoint.x = p.x;
            if (p.y > maxPoint.y) maxPoint.y = p.y;
            if (p.z > maxPoint.z) maxPoint.z = p.z;
        }
        
        ModifiableNestedOctree* originalRoot = root.get();
        BoundingBox pointInsertionBox(minPoint, maxPoint);
        expandRoot(root, pointInsertionBox);
        for(const PointXYZ& p : points) {
            root->insertPoint(p);
        }
        root->repairLOD(originalRoot);
    }

    EMSCRIPTEN_KEEPALIVE
    void * getVisibleOctreeNodes(int maxDepth, float minPixelSize) {
        return root->serializeForR3F(c, maxDepth, minPixelSize);
    }
}

