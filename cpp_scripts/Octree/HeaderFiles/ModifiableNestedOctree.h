#pragma once

#include "Points.h"
#include "BoundingBox.h"
#include "Camera.h"
#include "robin_hood.h"

#include <array>
#include <memory>
#include <vector>
#include <fstream>
#include <string>
#include <sstream>
#include <algorithm>


/** 
 * @class ModifiableNestedOctree
 * @brief MNO object to handle point cloud octrees
 * */
template <typename PointT>
class ModifiableNestedOctree {
private:

    /** Resolution of MNO Grid */
    static const int GRID_RESOLUTION = 5;
    static const int GRID_LENGTH = 1 << GRID_RESOLUTION;
    static constexpr float INV_GRID_LENGTH = 1.0f / static_cast<float>(GRID_LENGTH);
    static const int GRID_CELL_COUNT = GRID_LENGTH*GRID_LENGTH*GRID_LENGTH;
    inline static std::vector<uint32_t> freeMNOIndices;

    /** Id of MNO object */
    uint32_t id;

    /** Bounding box of the MNO node*/
    BoundingBox boundingBox;

    /** Point grid occupation array */
    robin_hood::unordered_flat_map<uint16_t, PointT> pointGridMap = {};

    /** Children of the MNO node*/
    std::array<uint32_t, 8> children = {UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX};

    /** Parent of the MNO node*/
    uint32_t parent = 0;



public:
    inline static uint32_t ROOT_ID = 0;
    inline static int POINT_COUNT = 0;
    inline static std::vector<ModifiableNestedOctree> MNO;
    static void expandRoot(const BoundingBox& box);
    static void clear();

    /**
     * @brief MNO constructor functions
     */
    ModifiableNestedOctree(const uint32_t id_, const uint32_t parent_, const BoundingBox& boundingBox_);
    ModifiableNestedOctree(const uint32_t id_, const uint32_t parent_, const PointXYZ& minCorner_, const PointXYZ& maxCorner_);

    /**
    * Inserts PointXYZ into a MNO node (grid)
    *
    * @param p Point to be inserted
    * @note if the MNO grid is full, this function is recursively called on MNO children
    */
    void insertPoint(const PointT& p);
    uint16_t insertPointInGrid(const PointT& p);
    void repairLOD(uint32_t originalRoot);

    /**
    * Prints information on a single MNO node to the console
    * 
    * @note This function does not print into on MNO node children
    */
    void printNode() const;

    /**
    * Returns MNO node as text file object
    */
    void printTreeToFile() const;
    void printTreeToFileHelper(std::ofstream& out, int depth) const;

    /**
    * Compiles MNO into binary object to be used in JS/Emscripten interface
    * This method does not return bounding box, only points
    *
    * @param camera The camera object representing the current scene
    * @param maxDepth The maximum depth to traverse into the MNO
    * @param minPixelSize The minimum pixel size for MNO node to display
    */
    uint8_t* serializeForR3F(const Camera& c, int maxDepth, float minPixelSize) const;
    uint8_t* serializeFullOctreeToPLY();

    /**
    * Compiles MNO node into output buffer (float)
    *
    * @param out Float buffer of MNO points
    * @param currentDepth Current depth into MNO traversal
    * @param maxDepth Max depth to traverse into MNO
    */
    void compileTree(std::vector<float>& out, int currentDepth, int maxDepth) const;
    void compileR3FTree(std::vector<float>& out, const Camera& c, int depth, int maxDepth, float minPixelSize) const;
    
    /**
     * @brief Getters functions for MNO class
     */
    uint32_t getId() const;
    uint32_t getParentId() const;
    void setParentId(uint32_t parentId);
    uint8_t getPointOctant(const PointT& p) const;
    uint16_t getPointGridCell(const PointT& p) const;
    const BoundingBox& getBoundingBox() const;
    BoundingBox getGridCellBoundingBox(const uint16_t gridCellIndex) const;

    uint32_t getChildId(const uint8_t childIndex) const;
    uint32_t createChild(const uint8_t childIndex); 
    void setChildId(const uint8_t childIndex, const uint32_t childId);
};

template <typename PointT>
ModifiableNestedOctree<PointT>::ModifiableNestedOctree(const uint32_t id_, const uint32_t parent_, const BoundingBox& boundingBox_): id(id_), parent(parent_), boundingBox(boundingBox_) {
    pointGridMap.reserve(0);
}

template <typename PointT>
ModifiableNestedOctree<PointT>::ModifiableNestedOctree(const uint32_t id_,const uint32_t parent_, const PointXYZ& minCorner_, const PointXYZ& maxCorner_): id(id_), parent(parent_), boundingBox(minCorner_, maxCorner_) {
    pointGridMap.reserve(0);
}

template <typename PointT>
void ModifiableNestedOctree<PointT>::clear() {
    MNO.clear();
    freeMNOIndices.clear();
    ROOT_ID = 0;
    POINT_COUNT = 0;
}

template <typename PointT>
void ModifiableNestedOctree<PointT>::insertPoint(const PointT& point) {
    if(!boundingBox.containsPoint(point)) {
        std::cerr << "Unable to add point to ModifiableNestedOctree instance (Point out of bounds)" << std::endl;
        return;
    }
    uint32_t currentNodeId = id;
    //uint32_t count = 0;
    while ((MNO[currentNodeId].insertPointInGrid(point) == UINT16_MAX) /*&& count< 2*/) {
        //count +=1;
        uint8_t childIndex = MNO[currentNodeId].getPointOctant(point);
        currentNodeId = MNO[currentNodeId].createChild(childIndex);
    }
}

template <typename PointT>
uint16_t ModifiableNestedOctree<PointT>::insertPointInGrid(const PointT& point) {
    uint16_t gridCell = getPointGridCell(point);

    // One lookup to rule them all
    auto [it, inserted] = pointGridMap.try_emplace(gridCell, point);

    if (inserted) {
        POINT_COUNT++;
        return gridCell;
    }

    return UINT16_MAX; 
}

template <typename PointT>
uint32_t ModifiableNestedOctree<PointT>::createChild(const uint8_t childIndex) {
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

template <typename PointT>
uint32_t ModifiableNestedOctree<PointT>::getChildId(const uint8_t childIndex) const {
    if(childIndex >= 0 && childIndex < 8 && (children[childIndex] != UINT32_MAX)) {
        return children[childIndex];
    }

    return UINT32_MAX; // Child does not exist
}

template <typename PointT>
void ModifiableNestedOctree<PointT>::setChildId(const uint8_t childIndex, const uint32_t childId) {
    if(childIndex >= 0 && childIndex < 8) {
        children[childIndex] = childId;
    }
    return;
}

template <typename PointT>
uint32_t ModifiableNestedOctree<PointT>::getId() const {
    return id;
}

template <typename PointT>
uint32_t ModifiableNestedOctree<PointT>::getParentId() const {
    return parent;
}

template <typename PointT>
void ModifiableNestedOctree<PointT>::setParentId(uint32_t parentId) {
    parent = parentId;
}

template <typename PointT>
uint8_t ModifiableNestedOctree<PointT>::getPointOctant(const PointT& p) const {
    uint8_t octant = 0;

    if (p.x > boundingBox.center.x) octant |= 1;
    if (p.y > boundingBox.center.y) octant |= 2;
    if (p.z > boundingBox.center.z) octant |= 4;

    return octant;
}

template <typename PointT>
uint16_t ModifiableNestedOctree<PointT>::getPointGridCell(const PointT& p) const {
    if (!boundingBox.containsPoint(p)) return UINT16_MAX;
 
    double relX = (p.x - boundingBox.minCorner.x) * boundingBox.inv_length;
    double relY = (p.y - boundingBox.minCorner.y) * boundingBox.inv_width;
    double relZ = (p.z - boundingBox.minCorner.z) * boundingBox.inv_height;

    uint16_t gridCoordX = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relX * GRID_LENGTH)));
    uint16_t gridCoordY = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relY * GRID_LENGTH)));
    uint16_t gridCoordZ = std::min(GRID_LENGTH-1, static_cast<int>(std::floor(relZ * GRID_LENGTH)));

    return (gridCoordZ<<(GRID_RESOLUTION*2)) | (gridCoordY<<GRID_RESOLUTION) | (gridCoordX);
}

template <typename PointT>
const BoundingBox& ModifiableNestedOctree<PointT>::getBoundingBox() const {
    return boundingBox;
}

template <typename PointT>
BoundingBox ModifiableNestedOctree<PointT>::getGridCellBoundingBox(const uint16_t gridCellIndex) const {

    int gridCoordX = gridCellIndex & (GRID_LENGTH - 1);
    int gridCoordY = (gridCellIndex >> GRID_RESOLUTION) & (GRID_LENGTH - 1);
    int gridCoordZ = (gridCellIndex >> (2 * GRID_RESOLUTION)) & (GRID_LENGTH - 1);

    float cellSizeX = boundingBox.length * INV_GRID_LENGTH;
    float cellSizeY = boundingBox.width * INV_GRID_LENGTH;
    float cellSizeZ = boundingBox.height * INV_GRID_LENGTH;

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

template <typename PointT>
void ModifiableNestedOctree<PointT>::expandRoot(const BoundingBox& box) {
    if(MNO.size() == 0) {
        MNO.reserve(10000);
        ModifiableNestedOctree<PointT>::MNO.emplace_back(
            ModifiableNestedOctree<PointT>::ROOT_ID, UINT16_MAX, PointXYZ(0, 0, 0), PointXYZ(1, 1, 1)
        );
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

template <typename PointT>
void ModifiableNestedOctree<PointT>::repairLOD(uint32_t originalRootId) {
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

// Need to create function that will automatially serialize points
template <typename PointT>
uint8_t* ModifiableNestedOctree<PointT>::serializeForR3F(const Camera& c, int maxDepth, float minPixelSize) const {
    // 1. First Pass: Collect visible nodes and count total points
    std::vector<const ModifiableNestedOctree*> visibleNodes;
    size_t totalPoints = 0;

    struct NodeState { const ModifiableNestedOctree* node; int depth; };
    std::vector<NodeState> queue;
    queue.push_back({this, 0});
    
    size_t head = 0;
    while (head < queue.size()) {
        const NodeState current = queue[head++];
        const ModifiableNestedOctree* currNode = current.node;

        if (current.depth > maxDepth || 
            !currNode->boundingBox.inCameraFrustum(c) || 
            (currNode->boundingBox.getScreenProjectedSize(c) < minPixelSize)) {
            continue;
        }

        visibleNodes.push_back(currNode);
        totalPoints += currNode->pointGridMap.size();

        for (int i = 0; i < 8; ++i) {
            uint32_t childIndex = currNode->children[i];
            if (childIndex != UINT32_MAX) {
                queue.push_back({&MNO[childIndex], current.depth + 1});
            }
        }
    }


    //std::cout << "After getting visible nodes total points: " << totalPoints << std::endl;


    // 2. Allocate the final buffer immediately
    const size_t bytesPerPoint = 16; // 3 floats (12 bytes) + 4 uint8 (4 bytes)
    uint32_t payloadBytes = static_cast<uint32_t>(totalPoints * bytesPerPoint);
    uint32_t totalBytes = sizeof(uint32_t) + payloadBytes;
    
    uint8_t* buffer = static_cast<uint8_t*>(std::malloc(totalBytes));
    if (!buffer) return nullptr;

    // Write header
    std::memcpy(buffer, &payloadBytes, sizeof(uint32_t));
    
    // 3. Second Pass: Write data directly to the buffer
    uint8_t* writePtr = buffer + sizeof(uint32_t);

    for (const auto* node : visibleNodes) {
        for (const auto& kv : node->pointGridMap) {
            const PointT& p = kv.second;
            *(reinterpret_cast<float*>(writePtr)) = p.x;
            *(reinterpret_cast<float*>(writePtr + 4)) = p.y;
            *(reinterpret_cast<float*>(writePtr + 8)) = p.z;
            writePtr[12] = p.r;
            writePtr[13] = p.g;
            writePtr[14] = p.b;
            writePtr[15] = p.a;
            writePtr += 16;
        }
    }

    return buffer;
}

// Need to clean this up
template <typename PointT>
uint8_t* ModifiableNestedOctree<PointT>::serializeFullOctreeToPLY() {
    // 1. Calculate total point count across all nodes
    size_t totalPoints = 0;
    for (const auto& node : MNO) {
        totalPoints += node.pointGridMap.size();
    }

    // 2. Generate the PLY Header
    std::stringstream header;
    header << "ply\n";
    header << "format binary_little_endian 1.0\n";
    header << "element vertex " << totalPoints << "\n";
    header << "property float x\n";
    header << "property float y\n";
    header << "property float z\n";
    header << "property uchar red\n";
    header << "property uchar green\n";
    header << "property uchar blue\n";
    header << "property uchar alpha\n";
    header << "end_header\n";
    
    std::string headerStr = header.str();
    
    // 3. Calculate memory requirements
    // Each point: 3 * float (12 bytes) + 4 * uint8 (4 bytes) = 16 bytes
    const size_t bytesPerPoint = 16;
    uint32_t plyDataSize = static_cast<uint32_t>(headerStr.size() + (totalPoints * bytesPerPoint));
    uint32_t totalBufferSize = sizeof(uint32_t) + plyDataSize;

    // 4. Allocate buffer (use malloc so JS can free it if needed, or manage via C++)
    uint8_t* buffer = static_cast<uint8_t*>(std::malloc(totalBufferSize));
    if (!buffer) return nullptr;

    // 5. Write the payload size (the "header" for JS)
    std::memcpy(buffer, &plyDataSize, sizeof(uint32_t));

    // 6. Write the PLY Header string
    uint8_t* writePtr = buffer + sizeof(uint32_t);
    std::memcpy(writePtr, headerStr.data(), headerStr.size());
    writePtr += headerStr.size();

    // 7. Write Binary Point Data
    for (const auto& node : MNO) {
        for (const auto& kv : node.pointGridMap) {
            const PointT& p = kv.second;
            
            // XYZ (12 bytes)
            *(reinterpret_cast<float*>(writePtr)) = p.x;
            *(reinterpret_cast<float*>(writePtr + 4)) = p.y;
            *(reinterpret_cast<float*>(writePtr + 8)) = p.z;
            
            // RGBA (4 bytes)
            writePtr[12] = p.r;
            writePtr[13] = p.g;
            writePtr[14] = p.b;
            writePtr[15] = p.a;
            
            writePtr += bytesPerPoint;
        }
    }

    return buffer;
}

// Print out Information on single Octree Node
template <typename PointT>
void ModifiableNestedOctree<PointT>::printNode() const {
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
template <typename PointT>
void ModifiableNestedOctree<PointT>::printTreeToFile() const {
    std::cout << "Printing Octree" << std::endl;
    std::ofstream out("octree_output.txt");   

    if (!out.is_open()) {
        std::cerr << "Failed to open octree_output.txt\n";
        return;
    }

    printTreeToFileHelper(out, 0);
    out.close();
}

template <typename PointT>
void ModifiableNestedOctree<PointT>::printTreeToFileHelper(std::ofstream& out, int depth) const {
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