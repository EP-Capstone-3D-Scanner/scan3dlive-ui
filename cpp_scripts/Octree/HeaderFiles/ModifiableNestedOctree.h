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


/** 
 * @class ModifiableNestedOctree
 * @brief MNO object to handle point cloud octrees
 * */
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
    robin_hood::unordered_flat_map<uint16_t, PointXYZ> pointGridMap = {};

    /** Children of the MNO node*/
    std::array<uint32_t, 8> children = {UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX, UINT32_MAX};

    /** Parent of the MNO node*/
    uint32_t parent = 0;



public:
    inline static std::vector<ModifiableNestedOctree> MNO;
    static void expandRoot(const BoundingBox& box);
    inline static uint32_t ROOT_ID = 0;

    /** Point Count Tracker */
    inline static int POINT_COUNT = 0;

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
    void insertPoint(const PointXYZ& p);
    uint16_t insertPointInGrid(const PointXYZ& p);
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
    void* serializeForR3F(const Camera& c, int maxDepth, float minPixelSize) const;

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
    uint8_t getPointOctant(const PointXYZ& p) const;
    uint16_t getPointGridCell(const PointXYZ& p) const;
    const BoundingBox& getBoundingBox() const;
    BoundingBox getGridCellBoundingBox(const uint16_t gridCellIndex) const;

    uint32_t getChildId(const uint8_t childIndex) const;
    uint32_t createChild(const uint8_t childIndex); 
    void setChildId(const uint8_t childIndex, const uint32_t childId);
};
