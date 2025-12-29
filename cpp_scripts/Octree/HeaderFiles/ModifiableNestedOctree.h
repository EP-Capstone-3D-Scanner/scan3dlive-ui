#pragma once

#include "Points.h"
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
    /** Static variable Id tracker */
    inline static int NODE_ID = 0;

    /** Resolution of MNO Grid */
    static const int GRID_RESOLUTION = 3;
    static const int GRID_LENGTH = 1<<GRID_RESOLUTION;
    static const int GRID_CELL_COUNT = GRID_LENGTH*GRID_LENGTH*GRID_LENGTH;

    /** Id of MNO object */
    int id;

    /** Bounding box of the MNO node*/
    BoundingBox boundingBox;

    /** Point grid points of the MNO node*/
    std::array<Point3D, GRID_CELL_COUNT> pointGrid;

    /** Point grid occupation array */
    std::array<bool, GRID_CELL_COUNT> pointGridOccupied{};

    /** Children of the MNO node*/
    std::array<std::unique_ptr<ModifiableNestedOctree>, 8> children;

public:
    /**
     * @brief Constructs a MNO node from bounding box range
     */
    ModifiableNestedOctree(const BoundingBox& boundingBox_);

    /**
     * @brief Constructs a MNO node from corners of bounding box range
     */
    ModifiableNestedOctree(
        const Point3D& minCorner_, 
        const Point3D& maxCorner_
    );

    /**
    * Inserts Point3D into a MNO node (grid)
    *
    * @param c Camera view of 3D scene.
    * @note if the MNO grid is full, this function is recursively called on MNO children
    */
    void insertPoint(const Point3D& p);

    /**
    * Deletes a point from the MNO node
    */
    void deletePoint();

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

    /**
    * Compiles MNO node into output buffer (float)
    *
    * @param out Float buffer of MNO points
    * @param currentDepth Current depth into MNO traversal
    * @param maxDepth Max depth to traverse into MNO
    */
    void compileTree(std::vector<float>& out, int currentDepth, int maxDepth) const;

    /**
    * Compiles info on MNO node into text buffer (includes children)
    *
    * @param out Text buffer / file to ouput MNO information
    * @param depth Current depth into MNO traversal
    */
    void printNodeRecursive(std::ofstream& out, int depth) const;


    int getId() const;
    const BoundingBox& getBoundingBox() const;
    ModifiableNestedOctree* getChild(int childIndex) const;
    ModifiableNestedOctree* createChild(int childIndex);

    /**
    * Compiles MNO into binary object and outputs as file
    *
    * @param maxDepth The maximum depth to traverse into MNO node
    * @param fileName Name of the binary file to output
    * @return Binary buffer of Octree information and binary file
    */
    std::vector<uint8_t> serializeForWebSocket(int maxDepth, const std::string& fileName) const;
};