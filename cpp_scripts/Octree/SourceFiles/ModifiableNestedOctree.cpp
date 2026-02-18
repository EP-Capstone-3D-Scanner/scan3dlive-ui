#include "Points.h"
#include "BoundingBox.h"
#include "Camera.h"
#include "ModifiableNestedOctree.h"

#include <iostream>
#include <vector>
#include <set>
#include <string>
#include <cstring>
#include <cmath>
#include <unordered_map>

/**
 * @class ModifiableNestedOctree
 * @brief ModifiableNestedOctree Class Defintions
 * */

ModifiableNestedOctree::ModifiableNestedOctree(const BoundingBox& boundingBox_): boundingBox(boundingBox_) {
    pointGridMap.reserve(GRID_CELL_COUNT);
    id = NODE_ID++;
}

ModifiableNestedOctree::ModifiableNestedOctree(const PointXYZ& minCorner_, const PointXYZ& maxCorner_): boundingBox(minCorner_, maxCorner_) {
    pointGridMap.reserve(GRID_CELL_COUNT);
    id = NODE_ID++;
}

void ModifiableNestedOctree::insertPoint(const PointXYZ& point) {
    if(!boundingBox.containsPoint(point)) {
        std::cerr << "Unable to add point to ModifiableNestedOctree instance (Point out of bounds)" << std::endl;
        return;
    }

    ModifiableNestedOctree* current = this;
    while (current->insertPointInGrid(point) == -1) {
        int childIndex = current->getPointOctant(point);
        current = current->createChild(childIndex);
    }
}

int ModifiableNestedOctree::insertPointInGrid(const PointXYZ& point) {
    int gridCell = getPointGridCell(point);

    if(pointGridMap.find(gridCell) == pointGridMap.end()) {
        pointGridMap[gridCell] = point;
        POINT_COUNT++;
        return gridCell;
    }

    return -1; // Cell already occupied
}

ModifiableNestedOctree* ModifiableNestedOctree::createChild(int childIndex) {
    if(children[childIndex]) {
        return children[childIndex].get();
    }

    const PointXYZ center = boundingBox.center;
    PointXYZ min = boundingBox.minCorner;
    PointXYZ max = boundingBox.maxCorner;

    if (childIndex & 1) min.x = center.x; else max.x = center.x;
    if (childIndex & 2) min.y = center.y; else max.y = center.y;
    if (childIndex & 4) min.z = center.z; else max.z = center.z;

    children[childIndex] = std::make_unique<ModifiableNestedOctree>(min, max);
    return children[childIndex].get();
}

ModifiableNestedOctree* ModifiableNestedOctree::getChild(int childIndex) const {
    if(childIndex >= 0 && childIndex < 8 && children[childIndex]) {
        return children[childIndex].get();
    }

    return nullptr; // Child does not exist
} 

void ModifiableNestedOctree::setChild(int childIndex, std::unique_ptr<ModifiableNestedOctree> child) {
    if(childIndex >= 0 && childIndex < 8) {
        children[childIndex] = std::move(child);
        return;
    }

    std::cerr << "Unable to set child node at index " << childIndex << std::endl;
}

int ModifiableNestedOctree::getId() const {
    return id;
}

int ModifiableNestedOctree::getPointOctant(const PointXYZ& p) const {
    int octant = 0;
    if (p.x > boundingBox.center.x) octant |= 1;
    if (p.y > boundingBox.center.y) octant |= 2;
    if (p.z > boundingBox.center.z) octant |= 4;
    return octant;
}

int ModifiableNestedOctree::getPointGridCell(const PointXYZ& p) const {
    if (!boundingBox.containsPoint(p)) return -1;

    double relX = (p.x - boundingBox.minCorner.x) / (boundingBox.maxCorner.x - boundingBox.minCorner.x);
    double relY = (p.y - boundingBox.minCorner.y) / (boundingBox.maxCorner.y - boundingBox.minCorner.y);
    double relZ = (p.z - boundingBox.minCorner.z) / (boundingBox.maxCorner.z - boundingBox.minCorner.z);

    int gridCoordX = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relX * GRID_LENGTH)));
    int gridCoordY = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relY * GRID_LENGTH)));
    int gridCoordZ = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relZ * GRID_LENGTH)));
    
    return (gridCoordZ<<(GRID_RESOLUTION*2)) | (gridCoordY<<GRID_RESOLUTION) | (gridCoordX);
}

const BoundingBox& ModifiableNestedOctree::getBoundingBox() const {
    return boundingBox;
}

BoundingBox ModifiableNestedOctree::getGridCellBoundingBox(int gridCellIndex) const {
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

void expandRoot(std::unique_ptr<ModifiableNestedOctree>& root, const BoundingBox& box) {
    if (!root) return;

    auto currentRoot = std::move(root);
    ModifiableNestedOctree* currentRootPtr = currentRoot.get();

     // Check if current root contains the box, if not, expand root until it does
     if (currentRootPtr->getBoundingBox().containsPoint(box.minCorner) && currentRootPtr->getBoundingBox().containsPoint(box.maxCorner)) {
         root = std::move(currentRoot);
         return;
     }
    PointXYZ min = currentRoot->getBoundingBox().getMinCorner();
    PointXYZ max = currentRoot->getBoundingBox().getMaxCorner();

    while (box.minCorner.x < min.x || box.maxCorner.x > max.x ||
           box.minCorner.y < min.y || box.maxCorner.y > max.y ||
           box.minCorner.z < min.z || box.maxCorner.z > max.z) {
        
        float centerX = (min.x + max.x) * 0.5f;
        float centerY = (min.y + max.y) * 0.5f;
        float centerZ = (min.z + max.z) * 0.5f;

        int childIdx = 0;
        if (box.center.x > centerX) childIdx |= 1;
        if (box.center.y > centerY) childIdx |= 2;
        if (box.center.z > centerZ) childIdx |= 4;

        // The current root will become the child of the new parent.
        // The "expansion direction" is the opposite of where the current root will sit.
        int posInParent = childIdx ^ 7; 

        float sizeX = max.x - min.x;
        float sizeY = max.y - min.y;
        float sizeZ = max.z - min.z;

        if (childIdx & 1) max.x += sizeX; else min.x -= sizeX;
        if (childIdx & 2) max.y += sizeY; else min.y -= sizeY;
        if (childIdx & 4) max.z += sizeZ; else min.z -= sizeZ;

        auto parent = std::make_unique<ModifiableNestedOctree>(min, max);
        parent->setChild(posInParent, std::move(currentRoot));
        currentRoot = std::move(parent);
    }

    root = std::move(currentRoot);
}

void ModifiableNestedOctree::repairLOD(ModifiableNestedOctree* originalRoot) {
    
    if((this == originalRoot) || originalRoot->pointGridMap.empty()) return;
    
    // Locate gridCells in the current node that can be filled by points from old root
    std::set<int> fillableCells;
    for (const auto& [gridCell, point] : originalRoot->pointGridMap) {
        int cell = insertPointInGrid(point);
        if(cell != -1) {
            fillableCells.insert(cell);
            pointGridMap.erase(cell);
        }
    }

    
    for(const auto& cell : fillableCells) {
        ModifiableNestedOctree* parentNode = this;
        ModifiableNestedOctree* leafNode = this;
        const BoundingBox cellBoundingBox = getGridCellBoundingBox(cell);
        int leafNodeParentIndex = -1;
        
        // Determine which child octant the center of the grid cell belongs to relative to the leaf node
        int childIndex = leafNode->getPointOctant(cellBoundingBox.center);
        
        // For each grid cell that needs to be filled, find a leaf node that contains its center
        while (leafNode->getChild(childIndex)) {
            parentNode = leafNode;
            leafNode = leafNode->getChild(childIndex);
            leafNodeParentIndex = childIndex;
            childIndex = leafNode->getPointOctant(cellBoundingBox.center);
        }
        
        // Check if leaf node has any children 
        bool leafNodeHasChildren = false;
        for (int i = 0; i < 8; ++i) {
            if(leafNode->getChild(i)) {
                leafNodeHasChildren = true;
                break;
            }
        }

        // If leaf node has no children, find point in its grid and add to cell for this node and delete from leaf node
        if(!leafNodeHasChildren) {
            for (const auto& [gridCell, point] : leafNode->pointGridMap) {
                if (cellBoundingBox.containsPoint(point)) {
                    insertPointInGrid(point);
                    leafNode->pointGridMap.erase(gridCell);
                    if(leafNode->pointGridMap.empty()) {
                        parentNode->setChild(leafNodeParentIndex, nullptr);
                    }
                    break;
                }
            }
        }
    }

    PointXYZ originalRootCenter = originalRoot->getBoundingBox().center;
    for (int i = 0; i < 8; ++i) {
        if (children[i] && children[i]->getBoundingBox().containsPoint(originalRootCenter) && children[i].get() != originalRoot) {
            children[i]->repairLOD(originalRoot);
        }
    }

}

void* ModifiableNestedOctree::serializeForR3F(const Camera& c, int maxDepth, float minPixelSize) const {
    std::vector<float> positions;
    positions.reserve(POINT_COUNT*3);

    compileR3FTree(positions, c, 0, maxDepth, minPixelSize);

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
        if (children[i]) {
            children[i]->compileR3FTree(out, c, depth+1, maxDepth, minPixelSize);
        }
    }
}

// Print out Information on single Octree Node
void ModifiableNestedOctree::printNode() const {
    std::cout << "ID:" << id << std::endl;
    std::cout << "MinCorner:" << boundingBox.minCorner << std::endl;
    std::cout << "MaxCorner:" << boundingBox.maxCorner << std::endl;
    
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
        if (children[i]) {
            children[i]->printTreeToFileHelper(out, depth + 1);
        }
    }
}