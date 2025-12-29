#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include "ModifiableNestedOctree.h"
#include "Points.h"


/**
TODO: 1. Overload operators in Point struct, update code (DONE)
TODO: 2. Implement projection of Point onto screen based on camera data (DONE)
TODO: 3. Implement BoundingBox Class for Octree Nodes (DONE)
TODO: 4. Implement frustum culling of Octree Nodes based on BoundingBox coordinates (MOSTLY DONE)
TODO: 5. Implement projections of BoundingBox onto screen + BoundingBox screen size calculation (DONE)
    create node to websocket function based on screen size, not octree level (NOT DONE)
TODO: 6. Implement Octree node IDs (DONE)
TODO: 7. Clean up code and comment (DONE)
TODO: 8. Create Hashmap that tracks which nodes are to be shown in UI
TODO: 9. Update OctreeNode websocket functions to send chunked per-node data (update Header to include
    nodes that need to be removed and nodes that need to be added along with point data)
TODO: 10. Update UI to have cache of nodes, pop unneeded nodes, and draw new nodes in point object
TODO: 11. Optimize code, comment everything
TODO: 12. Finish websockets + networking code. Possibly use WebAssembly?
TODO: 13. Work on finishing UI interface buttons
TODO: 14. Work on creating editing functions on point cloud in UI
TODO: 15. Integrate segmentation stuff into UI + prioritize node rendering based on position
*/


int main() {
    Point3D root_tl = {-5, -5, -5};
    Point3D root_br = {5, 5, 5};
    Point3D world_point = {2, 1, 1};

    Matrix4x4 worldToCamera = {{
        {{1, 0, 0, 0}}, 
        {{0, 0.9922778767136676, -0.12403473458920855, -2.220446049250313e-16}}, 
        {{0, 0.12403473458920855, 0.9922778767136676, -12.093386622447824}}, 
        {{0, 0, 0, 1}}
    }};

    Matrix4x4 projection = {{
        {{0.16397222677594092, 0, 0, 0}}, 
        {{0, 1.3032253728412058, 0, 0}}, 
        {{0, 0, -1.0002000200020003, -0.20002000200020004}}, 
        {{0, 0, -1, 0}}
    }};

    Camera c = {worldToCamera, projection, 1280, 161.0500030517578};

    ModifiableNestedOctree root(root_tl, root_br);
    BoundingBox bb = root.getBoundingBox();
    std::array<Point4D, 8> bbNDC = bb.getCornersNDC(c);
    for (Point4D corner : bbNDC) {
        corner.toScreenCoordinates(c);
    }


    //std::cout << "Size:" << bb.getScreenProjectedSize(c) << std::endl;

    /*
    std::ifstream file("OctreeTestPoints.csv");
    if (!file.is_open()) {
        std::cerr << "Failed to open OctreeTestPoints.csv\n";
        return 1;
    }

    std::string line;
    std::vector<Point> points;
    points.reserve(50000); // avoid reallocations

    while (std::getline(file, line)) {
        if (line.empty()) continue;

        std::stringstream ss(line);
        std::string token;
        Point p;

        std::getline(ss, token, ',');
        p.x = std::stod(token);

        std::getline(ss, token, ',');
        p.y = std::stod(token);

        std::getline(ss, token, ',');
        p.z = std::stod(token);

        points.push_back(p);
    }

    file.close();

    std::cout << "Loaded " << points.size() << " points\n";

    for (const auto& p : points) {
        root.insertPoint(p);
    }
    root.printNode();
    for (int i = 0; i< 11;i++) {
        std::string text = "octree_bin" + std::to_string(i) + ".bin";
        root.serializeForWebSocket(i, text);
    }
    */
    return 0;
}

