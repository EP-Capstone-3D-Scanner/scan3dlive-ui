#include "MathTypes.h"
#include "ModifiableNestedOctree.h"
#include "Points.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>


/**
TODO: 1. Overload operators in Point struct, update code (DONE)
TODO: 2. Implement projection of Point onto screen based on camera data (DONE)
TODO: 3. Implement BoundingBox Class for Octree Nodes (DONE)
TODO: 4. Implement frustum culling of Octree Nodes based on BoundingBox coordinates (MOSTLY DONE)
TODO: 5. Implement projections of BoundingBox onto screen + BoundingBox screen size calculation (DONE)
    create node to websocket function based on screen size, not octree level (NOT DONE)
TODO: 6. Implement Octree node IDs (DONE)
TODO: 7. Clean up code and comment (DONE)
TODO: 8. Create Hashmap that tracks which nodes are to be shown in UI (UNNECCESSARY?)
TODO: 9. Update OctreeNode websocket functions to send chunked per-node data (update Header to include
    nodes that need to be removed and nodes that need to be added along with point data) (UNNECESSARY?)
TODO: 10. Update UI to have cache of nodes, pop unneeded nodes, and draw new nodes in point object
TODO: 11. Optimize code, comment everything
TODO: 12. Finish websockets + networking code. Possibly use WebAssembly?
TODO: 13. Work on finishing UI interface buttons
TODO: 14. Work on creating editing functions on point cloud in UI
TODO: 15. Integrate segmentation stuff into UI + prioritize node rendering based on position
*/


int main() {
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
    
    
    std::ifstream file("../OutputFiles/OctreeTestPoints.csv");
    if (!file.is_open()) {
        std::cerr << "Failed to open OctreeTestPoints.csv\n";
        return 1;
    }

    std::string line;
    std::vector<Point3D> points;
    points.reserve(50000); // avoid reallocations

    while (std::getline(file, line)) {
        if (line.empty()) continue;

        std::stringstream ss(line);
        std::string token;
        Point3D p;

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

    /*
    for (int i = 0; i< 11;i++) {
        std::string text = "octree_bin" + std::to_string(i) + ".bin";
        root.serializeForWebSocket(i, text);
    }
    */
    
    return 0;
}

