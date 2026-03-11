#include "MathTypes.h"
#include "ModifiableNestedOctree.h"
#include "Points.h"
#include "tinyply.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <cmath>
#include <emscripten/emscripten.h>

// cd emcc -O2 SourceFiles/EmscriptenMain.cpp SourceFiles/ModifiableNestedOctree.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModulePLYInsertionTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32 -sINITIAL_MEMORY=512MB
// emcc -O3 SourceFiles/EmscriptenMain.cpp SourceFiles/ModifiableNestedOctree.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModulePLYInsertionTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32,HEAPU8 -sINITIAL_MEMORY=2048MB
// emcc -sENVIRONMENT=web -sMALLOC=emmalloc -O3 -flto SourceFiles/EmscriptenMain.cpp SourceFiles/ModifiableNestedOctree.cpp SourceFiles/BoundingBox.cpp SourceFiles/Camera.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModuleColorTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32,HEAPU8 -sINITIAL_MEMORY=2048MB -sALLOW_MEMORY_GROWTH=0

uint32_t load_ply(std::vector<PointXYZRGBA>& points, const uint8_t* dataPtr, size_t dataSize) {

    std::string dataStr(reinterpret_cast<const char*>(dataPtr), dataSize);
    std::istringstream mem_stream(dataStr, std::ios::binary);

    if (!mem_stream) throw std::runtime_error("Could not create memory stream");

    tinyply::PlyFile ply_file;
    if (!ply_file.parse_header(mem_stream)) {
         throw std::runtime_error("Could not parse PLY header");
    }

    // ... [Your property check logic remains the same] ...
    bool has_x = false, has_y = false, has_z = false;
    bool has_r = false, has_g = false, has_b = false, has_a = false;
    for (auto& e : ply_file.get_elements()) {
        if (e.name == "vertex") {
            for (auto& p : e.properties) {
                if (p.name == "x") has_x = true;
                if (p.name == "y") has_y = true;
                if (p.name == "z") has_z = true;
                if (p.name == "red")   has_r = true;
                if (p.name == "green") has_g = true;
                if (p.name == "blue")  has_b = true;
                if (p.name == "alpha") has_a = true;
            }
            break;
        }
    }

    std::shared_ptr<tinyply::PlyData> xyz, rgba;
    if (has_x && has_y && has_z) {
        xyz = ply_file.request_properties_from_element("vertex", { "x", "y", "z" });
    }

    std::vector<std::string> color_props;
    if (has_r && has_g && has_b) {
        color_props = { "red", "green", "blue" };
        if (has_a) color_props.push_back("alpha");
        rgba = ply_file.request_properties_from_element("vertex", color_props);
    }

    // FIX: Read from the memory stream, not the file stream
    ply_file.read(mem_stream);

    if (xyz) {
        points.reserve(xyz->count);

        const size_t pos_stride = tinyply::PropertyTable[xyz->t].stride;
        const uint8_t* pos_buf = xyz->buffer.get();
        const size_t col_stride = rgba ? tinyply::PropertyTable[rgba->t].stride : 0;
        const uint8_t* col_buf = rgba ? rgba->buffer.get() : nullptr;
        const size_t col_channels = color_props.size();

        for (size_t i = 0; i < xyz->count; ++i) {
            float x = tinyply::convert_value<float>(pos_buf + (i * 3 + 0) * pos_stride, xyz->t);
            float y = tinyply::convert_value<float>(pos_buf + (i * 3 + 1) * pos_stride, xyz->t);
            float z = tinyply::convert_value<float>(pos_buf + (i * 3 + 2) * pos_stride, xyz->t);

            uint8_t r = 0, g = 0, b = 0, a = 255;
            if (rgba) {
                r = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 0) * col_stride, rgba->t);
                g = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 1) * col_stride, rgba->t);
                b = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 2) * col_stride, rgba->t);
                if (has_a) {
                    a = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 3) * col_stride, rgba->t);
                }
            }
            points.emplace_back(x, y, z, r, g, b, a);
        }
        return static_cast<uint32_t>(xyz->count);
    }
    return 0;
}

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
    uint32_t loadPointsXYZFromBinaryPLY(const uint8_t* dataPtr, const size_t dataSize) {
        
        uint32_t vertexCount = 0;
        std::vector<PointXYZRGBA> points;
        vertexCount = load_ply(points, dataPtr, dataSize);

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
        // Combine these four lines into a single function when done this project.
        uint16_t originalRootId = ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID;
        ModifiableNestedOctree<PointXYZRGBA>::expandRoot(BoundingBox(minPoint, maxPoint));
        for (const auto& p : points) {ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].insertPoint(p);}
        ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].repairLOD(originalRootId);
        return vertexCount;
    }

    EMSCRIPTEN_KEEPALIVE
    void insertPoints(float * dataPtr, const int pointCount) {
        std::vector<PointXYZRGBA> points;
        points.reserve(pointCount);
        
        PointXYZ minPoint(INFINITY, INFINITY, INFINITY);
        PointXYZ maxPoint(-INFINITY, -INFINITY, -INFINITY);
        for(int i = 0; i < pointCount; i++) {
            uint8_t* colorPtr = reinterpret_cast<uint8_t*>(&dataPtr[4*i+3]);
            PointXYZRGBA p(*(dataPtr+4*i+0), *(dataPtr+4*i+1), *(dataPtr+4*i+2), *(colorPtr+0), *(colorPtr+1), *(colorPtr+2), 0);
            points.push_back(p);
            if (p.x < minPoint.x) minPoint.x = p.x;
            if (p.y < minPoint.y) minPoint.y = p.y;
            if (p.z < minPoint.z) minPoint.z = p.z;
            if (p.x > maxPoint.x) maxPoint.x = p.x;
            if (p.y > maxPoint.y) maxPoint.y = p.y;
            if (p.z > maxPoint.z) maxPoint.z = p.z;
        }
        
        std::cout << ModifiableNestedOctree<PointXYZRGBA>::POINT_COUNT << std::endl;
        uint16_t originalRootId = ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID;
        ModifiableNestedOctree<PointXYZRGBA>::expandRoot(BoundingBox(minPoint, maxPoint));

        for(const PointXYZRGBA& p : points) {
            ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].insertPoint(p);
        }
        ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].repairLOD(originalRootId);
        std::cout << ModifiableNestedOctree<PointXYZRGBA>::POINT_COUNT << std::endl;

    }

    EMSCRIPTEN_KEEPALIVE
    void * getVisibleOctreeNodes(int maxDepth, float minPixelSize) {
        return ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].serializeForR3F(c, maxDepth, minPixelSize);
    }
}

