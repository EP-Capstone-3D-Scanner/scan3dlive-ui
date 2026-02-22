#include "MathTypes.h"
#include "ModifiableNestedOctree.h"
#include "Points.h"
#include "Camera.h"
#include "BoundingBox.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include "robin_hood.h"



/**
TODO: 1. Overload operators in Point struct, update code (DONE)
TODO: 2. Implement projection of Point onto screen based on camera data (DONE)
TODO: 3. Implement BoundingBox Class for Octree Nodes (DONE)
TODO: 4. Implement frustum culling of Octree Nodes based on BoundingBox coordinates (MOSTLY DONE)
TODO: 5. Implement projections of BoundingBox onto screen + BoundingBox screen size calculation (DONE)
    create node to websocket function based on screen size, not octree level (NOT DONE)
TODO: 6. Implement Octree node IDs (DONE)
TODO: 7. Clean up code and comment (DONE)
TODO: 8. Create Hashmap that tracks which nodes are to be shown in UI (UNNECCESSARY)
TODO: 9. Update OctreeNode websocket functions to send chunked per-node data (update Header to include
    nodes that need to be removed and nodes that need to be added along with point data) (UNNECESSARY)
TODO: 10. Update UI to have cache of nodes, pop unneeded nodes, and draw new nodes in point object (UNNECESSARY)
TODO: 11. Optimize code, comment everything
TODO: 12. Finish websockets + networking code. Possibly use WebAssembly? (DONE)
TODO: 13. Work on finishing UI interface buttons (DONE)
TODO: 14. Work on creating editing functions on point cloud in UI
TODO: 15. Integrate segmentation stuff into UI + prioritize node rendering based on position
*/

void loadPointsFromCSV(std::vector<std::unique_ptr<PointXYZ>>& points, const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Failed to open " << filename << "\n";
    }

    std::string line;

    while (std::getline(file, line)) {
        if (line.empty()) continue;

        std::stringstream ss(line);
        std::string token;

        std::getline(ss, token, ',');
        float x = (float) std::stod(token);

        std::getline(ss, token, ',');
        float y = (float) std::stod(token);

        std::getline(ss, token, ',');
        float z = (float) std::stod(token);

        points.push_back(std::make_unique<PointXYZ>(x, y, z));
    }

    file.close();
    std::cout << "Loaded " << points.size() << " points\n";
}
void loadPointsXYZFromBinaryPLY(std::vector<std::unique_ptr<PointXYZ>>& points, const std::string& filename) {
    std::ifstream file(filename, std::ios::binary);
    if (!file.is_open()) {
        std::cerr << "Failed to open " << filename << "\n";
    }
    std::string line;
    size_t vertexCount = 0;
    // Read header
    while (std::getline(file, line)) {
        if (line.substr(0, 14) == "element vertex") {
            vertexCount = std::stoul(line.substr(15));
        }
        if (line == "end_header") {
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
        points.push_back(std::make_unique<PointXYZ>(x, y, z));
    }
    file.close();
    std::cout << "Loaded " << points.size() << " points from binary PLY"<< std::endl;
}


int main() {
    BoundingBox bb = BoundingBox(PointXYZ(-6, -11, 2), PointXYZ(4, 12, 3));

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
    
    std::vector<std::unique_ptr<PointXYZ>> points;
    points.reserve(5000001);
    loadPointsXYZFromBinaryPLY(points, "../assets/oak_5M.ply");

    //Get bounding box of all points
    PointXYZ minPoint = *(points[0]);
    PointXYZ maxPoint = *(points[0]);

    for (const auto& p : points) {
        if (p->x < minPoint.x) minPoint.x = p->x;
        if (p->y < minPoint.y) minPoint.y = p->y;
        if (p->z < minPoint.z) minPoint.z = p->z;
        if (p->x > maxPoint.x) maxPoint.x = p->x;
        if (p->y > maxPoint.y) maxPoint.y = p->y;
        if (p->z > maxPoint.z) maxPoint.z = p->z;
    }

    std::cout << "Min Point: " << minPoint << std::endl;
    std::cout << "Max Point: " << maxPoint << std::endl;
    
    uint16_t originalRootId = ModifiableNestedOctree::ROOT_ID;
    ModifiableNestedOctree::expandRoot(BoundingBox(minPoint, maxPoint));

    for (const auto& p : points) {
        ModifiableNestedOctree::MNO[ModifiableNestedOctree::ROOT_ID].insertPoint(*p);
    }

    ModifiableNestedOctree::MNO[ModifiableNestedOctree::ROOT_ID].repairLOD(originalRootId);
    ModifiableNestedOctree::MNO[ModifiableNestedOctree::ROOT_ID].printNode();
    
    std::cout << sizeof(ModifiableNestedOctree) * ModifiableNestedOctree::MNO.size() << std::endl;
    std::cout << sizeof(PointXY)*ModifiableNestedOctree::POINT_COUNT << std::endl;
    std::cout << sizeof(robin_hood::unordered_flat_map<uint16_t, PointXYZ>) << std::endl;

    return 0;
}

/*
    /*
    for (int i = 0; i< 11;i++) {
        std::string text = "octree_bin" + std::to_string(i) + ".bin";
        root.serializeForWebSocket(i, text);
    }
    */