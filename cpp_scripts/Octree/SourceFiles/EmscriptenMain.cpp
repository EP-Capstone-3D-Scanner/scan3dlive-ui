#include "MathTypes.h"
#include "ModifiableNestedOctree.h"
#include "Points.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <emscripten/emscripten.h>

// emcc SourceFiles/EmscriptenMain.cpp SourceFiles/ModifiableNestedOctree.cpp SourceFiles/Points.cpp -I HeaderFiles -o OctreeModuleCamTest.js -sEXPORT_ES6 -sEXPORTED_FUNCTIONS=_malloc,_free -sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU32 -sINITIAL_MEMORY=64MB

Point3D root_tl = {-1, -6, -1};
Point3D root_br = {15, 4, 5};
Point3D world_point = {2, 1, 1};

Matrix4x4 worldToCamera = {{
    {{0.6132673774338434, 2.775557561562892e-17, -0.7898753849661453, -5.329070518200753e-15}}, 
    {{-0.3707579367545945, 0.8829920797773887, -0.2878602775373465, -5.329070518200753e-15}}, 
    {{0.6974537089362219, 0.4693878854959958, 0.5415102370599341, -80.68160734792751}}, 
    {{0, 0, 0, 1.0000000000000002}}
}};

Matrix4x4 projection = {{
    {{0.16397222677594092, 0, 0, 0}}, 
    {{0, 1.3032253728412058, 0, 0}}, 
    {{0, 0, -1.0002000200020003, -0.20002000200020004}}, 
    {{0, 0, -1, 0}}
}};

Matrix4x4 Identity = {{
    {{1, 2, 0, 0}}, 
    {{0, 1, 0, 0}}, 
    {{0, 0, 1, 0}}, 
    {{0, 0, 0, 1}}
}};

Camera c = {worldToCamera, projection, 1280, 161.0500030517578};
ModifiableNestedOctree root(root_tl, root_br);
BoundingBox bb = root.getBoundingBox();
std::array<Point3D, 8> bbNDC = bb.getCorners();


extern "C" {

    EMSCRIPTEN_KEEPALIVE
    void printCorners() {
        for (Point3D corner : bbNDC) {
            std::cout<< "(screenX,screenY) = " 
            << corner.getScreenCoordinates(c) 
            << std::endl; 
        }
        std::cout << "Size:" << bb.getScreenProjectedSize(c) << std::endl;
    };

    EMSCRIPTEN_KEEPALIVE
    void updateOctreeCamera(
        float vmi11, float vmi12, float vmi13, float vmi14, 
        float vmi21, float vmi22, float vmi23, float vmi24, 
        float vmi31, float vmi32, float vmi33, float vmi34,
        float vmi41, float vmi42, float vmi43, float vmi44,
        float pm11, float pm12, float pm13, float pm14, 
        float pm21, float pm22, float pm23, float pm24,  
        float pm31, float pm32, float pm33, float pm34, 
        float pm41, float pm42, float pm43, float pm44, 
        float vppr
    ) { //vppr = viewport pixel ratio

        //std::cout << "Printing Camera:" << std::endl;
        //std::cout << "View Matrix Inverse" << std::endl;
        c.setViewMatrixInverse(
            vmi11, vmi12, vmi13, vmi14,
            vmi21, vmi22, vmi23, vmi24,
            vmi31, vmi32, vmi33, vmi34,
            vmi41, vmi42, vmi43, vmi44
        );
        //printMatrix4x4(c.viewMatrixInverse);

        //std::cout << "Projection Matrix" << std::endl;
        c.setProjectionMatrix(
            pm11, pm12, pm13, pm14, 
            pm21, pm22, pm23, pm24,  
            pm31, pm32, pm33, pm34, 
            pm41, pm42, pm43, pm44, 
            vppr
        );
        //printMatrix4x4(c.projection);
    
    }

    EMSCRIPTEN_KEEPALIVE
    void insertPoints(
        const float * dataPtr, 
        const int pointCount
    ) {
        
        std::cout << "[EMSCRIPTEN]: Inserting Points Start" << std::endl;
        for(int i = 0; i < pointCount*3; i+=3) {
            Point3D dataPoint = {*(dataPtr+i), *(dataPtr+i+1), *(dataPtr+i+2)};
            root.insertPoint(dataPoint);
        }
        std::cout << "[EMSCRIPTEN]: Inserting Points End" << std::endl;
        std::cout << root.NODE_ID << std::endl;
        std::cout << root.POINT_COUNT << std::endl;
        
    }

    EMSCRIPTEN_KEEPALIVE
    void * getVisibleOctreeNodes(int maxDepth, float minPixelSize) {
        return root.serializeForR3F(c, maxDepth, minPixelSize); // Better Naming conventions???
    }

    EMSCRIPTEN_KEEPALIVE
    void * getVisibleOctreeNodes2(int maxDepth, float minPixelSize) {
        return root.serializeForR3F2(c, maxDepth, minPixelSize); // Better Naming conventions???
    }
}

