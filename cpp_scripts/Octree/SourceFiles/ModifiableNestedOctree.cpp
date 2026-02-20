#include "Points.h"
#include "BoundingBox.h"
#include "Camera.h"
#include "ModifiableNestedOctree.h"
#include "robin_hood.h"

#include <iostream>
#include <vector>
#include <string>
#include <cstring>
#include <cmath>



/**

 * @class ModifiableNestedOctree

 * @brief ModifiableNestedOctree Class Defintions

 * */


ModifiableNestedOctree::ModifiableNestedOctree(const uint32_t id_, const uint32_t parent_, const BoundingBox& boundingBox_): id(id_), parent(parent_), boundingBox(boundingBox_) {
    pointGridMap.reserve(0);
}

ModifiableNestedOctree::ModifiableNestedOctree(const uint32_t id_,const uint32_t parent_, const PointXYZ& minCorner_, const PointXYZ& maxCorner_): id(id_), parent(parent_), boundingBox(minCorner_, maxCorner_) {
    pointGridMap.reserve(0);
}


void ModifiableNestedOctree::insertPoint(const PointXYZ& point) {
    if(!boundingBox.containsPoint(point)) {
        std::cerr << "Unable to add point to ModifiableNestedOctree instance (Point out of bounds)" << std::endl;
        return;
    }
    uint32_t currentNodeId = id;
    while (MNO[currentNodeId].insertPointInGrid(point) == UINT16_MAX) {
        uint8_t childIndex = MNO[currentNodeId].getPointOctant(point);
        currentNodeId = MNO[currentNodeId].createChild(childIndex);
    }
}


uint16_t ModifiableNestedOctree::insertPointInGrid(const PointXYZ& point) {
    uint16_t gridCell = getPointGridCell(point);

    if(pointGridMap.find(gridCell) == pointGridMap.end()) {
        // Can insert point in cell if this runs
        pointGridMap[gridCell] = point;
        POINT_COUNT++;
        return gridCell;
    }

    return UINT16_MAX; // Cell already occupied
}


uint32_t ModifiableNestedOctree::createChild(const uint8_t childIndex) {
    if (children[childIndex] != UINT32_MAX) {
        return children[childIndex];
    }
    const uint32_t parentId = id; 
    const PointXYZ center = boundingBox.center;
    PointXYZ min = boundingBox.minCorner;
    PointXYZ max = boundingBox.maxCorner;

    // Calculate child bounds
    if (childIndex & 1) min.x = center.x; else max.x = center.x;
    if (childIndex & 2) min.y = center.y; else max.y = center.y;
    if (childIndex & 4) min.z = center.z; else max.z = center.z;

    uint32_t childId;
    if (!freeMNOIndices.empty()) {
        childId = freeMNOIndices.back();
        MNO[parentId].children[childIndex] = childId;
        freeMNOIndices.pop_back();
        MNO[childId] = ModifiableNestedOctree(childId, parentId, min, max);
    } 
    else {
        childId = static_cast<uint32_t>(MNO.size());
        MNO[parentId].children[childIndex] = childId;
        MNO.emplace_back(childId, parentId, min, max);
    }

    return childId;
}

uint32_t ModifiableNestedOctree::getChildId(const uint8_t childIndex) const {
    if(childIndex >= 0 && childIndex < 8 && (children[childIndex] != UINT32_MAX)) {
        return children[childIndex];
    }

    return UINT32_MAX; // Child does not exist
}

void ModifiableNestedOctree::setChildId(const uint8_t childIndex, const uint32_t childId) {
    if(childIndex >= 0 && childIndex < 8) {
        children[childIndex] = childId;
    }
    return;
}


uint32_t ModifiableNestedOctree::getId() const {
    return id;
}

uint32_t ModifiableNestedOctree::getParentId() const {
    return parent;
}

void ModifiableNestedOctree::setParentId(uint32_t parentId) {
    parent = parentId;
}


uint8_t ModifiableNestedOctree::getPointOctant(const PointXYZ& p) const {
    uint8_t octant = 0;

    if (p.x > boundingBox.center.x) octant |= 1;
    if (p.y > boundingBox.center.y) octant |= 2;
    if (p.z > boundingBox.center.z) octant |= 4;

    return octant;
}


uint16_t ModifiableNestedOctree::getPointGridCell(const PointXYZ& p) const {
    if (!boundingBox.containsPoint(p)) return UINT16_MAX;
 
    double relX = (p.x - boundingBox.minCorner.x) / (boundingBox.maxCorner.x - boundingBox.minCorner.x);
    double relY = (p.y - boundingBox.minCorner.y) / (boundingBox.maxCorner.y - boundingBox.minCorner.y);
    double relZ = (p.z - boundingBox.minCorner.z) / (boundingBox.maxCorner.z - boundingBox.minCorner.z);

    uint16_t gridCoordX = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relX * GRID_LENGTH)));
    uint16_t gridCoordY = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relY * GRID_LENGTH)));
    uint16_t gridCoordZ = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relZ * GRID_LENGTH)));

    return (gridCoordZ<<(GRID_RESOLUTION*2)) | (gridCoordY<<GRID_RESOLUTION) | (gridCoordX);
}


const BoundingBox& ModifiableNestedOctree::getBoundingBox() const {
    return boundingBox;
}


BoundingBox ModifiableNestedOctree::getGridCellBoundingBox(const uint16_t gridCellIndex) const {

    int gridCoordX = gridCellIndex & (GRID_LENGTH - 1);
    int gridCoordY = (gridCellIndex >> GRID_RESOLUTION) & (GRID_LENGTH - 1);
    int gridCoordZ = (gridCellIndex >> (2 * GRID_RESOLUTION)) & (GRID_LENGTH - 1);

    float cellSizeX = (boundingBox.maxCorner.x - boundingBox.minCorner.x) / GRID_LENGTH;
    float cellSizeY = (boundingBox.maxCorner.y - boundingBox.minCorner.y) / GRID_LENGTH;
    float cellSizeZ = (boundingBox.maxCorner.z - boundingBox.minCorner.z) / GRID_LENGTH;

    PointXYZ cellMin(
        boundingBox.minCorner.x + gridCoordX * cellSizeX,
        boundingBox.minCorner.y + gridCoordY * cellSizeY,
        boundingBox.minCorner.z + gridCoordZ * cellSizeZ
    );

    PointXYZ cellMax(
        cellMin.x + cellSizeX,
        cellMin.y + cellSizeY,
        cellMin.z + cellSizeZ
    );

    return BoundingBox(cellMin, cellMax);
}


void ModifiableNestedOctree::expandRoot(const BoundingBox& box) {
    if(MNO.size() == 0) {
        MNO.reserve(10000);
        ModifiableNestedOctree::MNO.emplace_back(ModifiableNestedOctree::ROOT_ID, UINT16_MAX, PointXYZ(0, 0, 0), PointXYZ(1, 1, 1));
    }
    // Check if current root contains the box, if not, expand root until it does
    if ((ROOT_ID == UINT32_MAX) || (MNO[ROOT_ID].getBoundingBox().containsPoint(box.minCorner) && MNO[ROOT_ID].getBoundingBox().containsPoint(box.maxCorner))) {
        return;
    }

    PointXYZ min = MNO[ROOT_ID].getBoundingBox().getMinCorner();
    PointXYZ max = MNO[ROOT_ID].getBoundingBox().getMaxCorner();

    while (box.minCorner.x < min.x || box.maxCorner.x > max.x ||
           box.minCorner.y < min.y || box.maxCorner.y > max.y ||
           box.minCorner.z < min.z || box.maxCorner.z > max.z) {

        float centerX = (min.x + max.x) * 0.5f;
        float centerY = (min.y + max.y) * 0.5f; // Clean this up. Add MNO{ROOT_ID}.bb as variable
        float centerZ = (min.z + max.z) * 0.5f;

        uint8_t childIdx = 0;
        if (box.center.x > centerX) childIdx |= 1;
        if (box.center.y > centerY) childIdx |= 2;
        if (box.center.z > centerZ) childIdx |= 4;

        // The current root will become the child of the new parent.
        // The "expansion direction" is the opposite of where the current root will sit.

        uint8_t posInParent = childIdx ^ 7;

        float sizeX = max.x - min.x;
        float sizeY = max.y - min.y;
        float sizeZ = max.z - min.z;

        if (childIdx & 1) max.x += sizeX; else min.x -= sizeX;
        if (childIdx & 2) max.y += sizeY; else min.y -= sizeY;
        if (childIdx & 4) max.z += sizeZ; else min.z -= sizeZ;
        
        uint32_t parentId = MNO.size();
        if(!freeMNOIndices.empty()) {
            parentId = freeMNOIndices.back();
            freeMNOIndices.pop_back();
            MNO[parentId] = ModifiableNestedOctree(parentId, UINT32_MAX, min, max);
        }
        else {
            MNO.emplace_back(parentId, UINT32_MAX, min, max);
        }

        MNO[ROOT_ID].setParentId(parentId);
        MNO[parentId].setChildId(posInParent, ROOT_ID);
        ROOT_ID = parentId;
        min = MNO[ROOT_ID].getBoundingBox().getMinCorner();
        max = MNO[ROOT_ID].getBoundingBox().getMaxCorner();
    }
}


void ModifiableNestedOctree::repairLOD(uint32_t originalRootId) {
    if((id == originalRootId) || MNO[originalRootId].pointGridMap.empty()) return;

    // Locate gridCells in the current node that can be filled by points from old root
    robin_hood::unordered_flat_set<uint16_t> fillableCells;
    for (const auto& [gridCell, point] : MNO[originalRootId].pointGridMap) {
        uint16_t cell = insertPointInGrid(point);
        if(cell != UINT16_MAX) {
            fillableCells.insert(cell);
            pointGridMap.erase(cell);
        }
    }

    for(const auto& cell : fillableCells) {
        uint32_t parentNodeId = id;
        uint32_t leafNodeId = id;

        const BoundingBox cellBoundingBox = getGridCellBoundingBox(cell);
        uint8_t leafNodeParentIndex = UINT8_MAX;
        uint8_t childIndex = MNO[leafNodeId].getPointOctant(cellBoundingBox.center); // Determine which child octant the center of the grid cell belongs to relative to the leaf node

        // For each grid cell that needs to be filled, find a leaf node that contains its center
        while (MNO[leafNodeId].getChildId(childIndex) != UINT32_MAX) {
            parentNodeId = leafNodeId;
            leafNodeId = MNO[parentNodeId].getChildId(childIndex);
            leafNodeParentIndex = childIndex;
            childIndex = MNO[leafNodeId].getPointOctant(cellBoundingBox.center);
        }

        // Check if leaf node has any children
        bool leafNodeHasChildren = false;
        for (int i = 0; i < 8; ++i) {
            if(MNO[leafNodeId].getChildId(i) != UINT32_MAX) {
                leafNodeHasChildren = true;
                break;
            }
        }

        // If leaf node has no children, find point in its grid and add to cell for this node and delete from leaf node
        if(!leafNodeHasChildren && (leafNodeId != id)) {
            for (const auto& [gridCell, point] : MNO[leafNodeId].pointGridMap) {
                if (cellBoundingBox.containsPoint(point)) {
                    insertPointInGrid(point);
                    MNO[leafNodeId].pointGridMap.erase(gridCell);
                    if(MNO[leafNodeId].pointGridMap.empty()) {
                        freeMNOIndices.emplace_back(leafNodeId);
                        MNO[parentNodeId].setChildId(leafNodeParentIndex, UINT32_MAX);
                    }
                    break;
                }
            }
        }
    }

    PointXYZ originalRootCenter = MNO[originalRootId].getBoundingBox().center;
    for (int i = 0; i < 8; ++i) {
        if ((children[i] != UINT32_MAX) && MNO[children[i]].getBoundingBox().containsPoint(originalRootCenter) && MNO[children[i]].getId() != originalRootId) {
            MNO[children[i]].repairLOD(originalRootId);
        }
    }

}

void* ModifiableNestedOctree::serializeForR3F(const Camera& c, int maxDepth, float minPixelSize) const {
    std::vector<float> positions;
    positions.reserve(POINT_COUNT*3);

    compileR3FTree(positions, c, 0, maxDepth, minPixelSize); // CONVERT TO BFS

    uint32_t payloadBytes = positions.size() * sizeof(float);
    uint32_t totalBytes = sizeof(uint32_t) + payloadBytes;
    uint8_t* buffer = (uint8_t*)malloc(totalBytes);

    std::memcpy(buffer, &payloadBytes, sizeof(uint32_t));
    std::memcpy(buffer + sizeof(uint32_t), positions.data(), payloadBytes);

    return buffer;
}


 // Helper function to compile MNO into binary point cloud stream /*Need to cleanup this function*/

void ModifiableNestedOctree::compileR3FTree(std::vector<float>& out, const Camera& c, int depth, int maxDepth, float minPixelSize) const {
    
    if ((depth > maxDepth) || !boundingBox.inCameraFrustum(c) || (boundingBox.getScreenProjectedSize(c) < minPixelSize)) return;

    // Add points from this node's grid
    for (const auto& points : pointGridMap) {
        const PointXYZ& p = points.second;
        out.push_back(p.x);
        out.push_back(p.y);
        out.push_back(p.z);
    }

    // Recurse into children
    for (int i = 0; i < 8; ++i) {
        if (children[i] != UINT32_MAX) {
            MNO[children[i]].compileR3FTree(out, c, depth+1, maxDepth, minPixelSize);
        }
    }
}


// Print out Information on single Octree Node

void ModifiableNestedOctree::printNode() const {
    std::cout << "ID:" << id << std::endl;
    std::cout << "MinCorner:" << boundingBox.minCorner << std::endl;
    std::cout << "MaxCorner:" << boundingBox.maxCorner << std::endl;
    std::cout << "Chilren: ";
    for (int i = 0; i < 8; i++) {
        std::cout << children[i] << " ";
    }
    std::cout << std::endl;

    for (const auto& points : pointGridMap) {
        std::cout << "\tPoint (" << points.first <<"):" << points.second << std::endl;
    }
}


// Wrapper to open file and start recursion

void ModifiableNestedOctree::printTreeToFile() const {
    std::cout << "Printing Octree" << std::endl;
    std::ofstream out("octree_output.txt");   

    if (!out.is_open()) {
        std::cerr << "Failed to open octree_output.txt\n";
        return;
    }

    printTreeToFileHelper(out, 0);
    out.close();
}


void ModifiableNestedOctree::printTreeToFileHelper(std::ofstream& out, int depth = 0) const {
    std::string indent(depth * 2, ' ');

    // Print node bounding box

    out << indent << "Node Depth " << depth << ":\n";
    out << indent << "  MinCorner: " << boundingBox.minCorner << "\n";
    out << indent << "  MaxCorner: " << boundingBox.maxCorner << "\n";

    // Print points in the node's grid
    for (const auto& points : pointGridMap) {
        std::cout << "\tPoint (" << points.first <<"):" << points.second << std::endl;
    }


    // Recurse into children
    for (int i = 0; i < 8; ++i) {
        if (children[i] != UINT32_MAX) {
            MNO[children[i]].printTreeToFileHelper(out, depth + 1);
        }
    }
} 