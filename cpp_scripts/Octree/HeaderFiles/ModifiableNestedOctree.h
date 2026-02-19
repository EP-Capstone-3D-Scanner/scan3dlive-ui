#pragma once

#include "Points.h"
#include "BoundingBox.h"
#include "Camera.h"
#include <array>
#include <memory>
#include <vector>
#include <fstream>
#include <string>
//#include <unordered_map>
#include "robin_hood.h"
//#include "tsl/robin_map.h"

/** 
 * @class ModifiableNestedOctree
 * @brief MNO object to handle point cloud octrees
 * */
class ModifiableNestedOctree {
private:

    /** Resolution of MNO Grid */
    static const int GRID_RESOLUTION = 3;
    static const int GRID_LENGTH = 1 << GRID_RESOLUTION;
    static const int GRID_CELL_COUNT = GRID_LENGTH*GRID_LENGTH*GRID_LENGTH;

    /** Id of MNO object */
    int id;

    /** Bounding box of the MNO node*/
    BoundingBox boundingBox;

    /** Point grid occupation array */
    robin_hood::unordered_flat_map<int, PointXYZ> pointGridMap = {};


    /** Children of the MNO node*/
    std::array<std::unique_ptr<ModifiableNestedOctree>, 8> children;

public:

    /** Static variable Id tracker */
    inline static int NODE_ID = 0;

    /** Point Count Tracker */
    inline static int POINT_COUNT = 0;

    /**
     * @brief MNO constructor functions
     */
    ModifiableNestedOctree(const BoundingBox& boundingBox_);
    ModifiableNestedOctree(const PointXYZ& minCorner_, const PointXYZ& maxCorner_);

    /**
    * Inserts PointXYZ into a MNO node (grid)
    *
    * @param p Point to be inserted
    * @note if the MNO grid is full, this function is recursively called on MNO children
    */
    void insertPoint(const PointXYZ& p);
    int insertPointInGrid(const PointXYZ& p);
    void repairLOD(ModifiableNestedOctree* originalRoot);

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
    int getId() const;
    int getPointOctant(const PointXYZ& p) const;
    int getPointGridCell(const PointXYZ& p) const;
    const BoundingBox& getBoundingBox() const;
    BoundingBox getGridCellBoundingBox(int gridCellIndex) const;

    ModifiableNestedOctree* getChild(int childIndex) const;
    ModifiableNestedOctree* createChild(int childIndex);
    void setChild(int childIndex, std::unique_ptr<ModifiableNestedOctree> child);
};

/**
 * @brief Iteratively expands root node to fit all points in the input vector
 * 
 * @param points The vector of points to be included in the expanded root node
 */
void expandRoot(std::unique_ptr<ModifiableNestedOctree>& root, const BoundingBox& box);