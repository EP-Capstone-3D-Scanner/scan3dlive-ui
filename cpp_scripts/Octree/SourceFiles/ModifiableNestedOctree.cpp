#include "Points.h"
#include "ModifiableNestedOctree.h"

#include <iostream>
#include <vector>
#include <string>
#include <cstring>
#include <cmath>

/**
 * @class ModifiableNestedOctree
 * @brief ModifiableNestedOctree Class Defintions
 * */

ModifiableNestedOctree::ModifiableNestedOctree(
    const BoundingBox& boundingBox_
): boundingBox(boundingBox_) {id=NODE_ID++;}

ModifiableNestedOctree::ModifiableNestedOctree(
    const Point3D& minCorner_, 
    const Point3D& maxCorner_
): boundingBox(minCorner_, maxCorner_) {id=NODE_ID++;}

void ModifiableNestedOctree::insertPoint(const Point3D& point) {
    
    if(!boundingBox.containsPoint(point)) {
        std::cerr << "Unable to add point to ModifiableNestedOctree Instance" << std::endl;
        return;
    }

    ModifiableNestedOctree* current = this;
    bool insertedPoint = false;

    while (!insertedPoint) {
        const Point3D center = current->boundingBox.getCenter();
        double relX = (point.x - current->boundingBox.minCorner.x) 
            / (current->boundingBox.maxCorner.x - current->boundingBox.minCorner.x);
        double relY = (point.y - current->boundingBox.minCorner.y) 
            / (current->boundingBox.maxCorner.y - current->boundingBox.minCorner.y);
        double relZ = (point.z - current->boundingBox.minCorner.z) 
            / (current->boundingBox.maxCorner.z - current->boundingBox.minCorner.z);

        // Clamp to [0,1] to prevent out-of-bounds
        relX = std::min(1.0, std::max(0.0, relX));
        relY = std::min(1.0, std::max(0.0, relY));
        relZ = std::min(1.0, std::max(0.0, relZ));

        // Map to grid index [0, GRID_LENGTH-1]
        int gridCoordX = std::min(GRID_LENGTH-1, 
            static_cast<int>(std::floor(relX * GRID_LENGTH)));
        int gridCoordY = std::min(GRID_LENGTH-1, 
            static_cast<int>(std::floor(relY * GRID_LENGTH)));
        int gridCoordZ = std::min(GRID_LENGTH-1, 
            static_cast<int>(std::floor(relZ * GRID_LENGTH)));
        int gridCell = (gridCoordZ<<(GRID_RESOLUTION*2)) 
            | (gridCoordY<<GRID_RESOLUTION) | (gridCoordX);

        if(current->pointGridOccupied[gridCell] == false) {
            //std::cout<<"inserted point" << std::endl;
            insertedPoint = true;
            current->pointGridOccupied[gridCell] = true;
            current->pointGrid[gridCell] = point;
            //current->printNode();
        }
        else {
            int childCoordX = point.x > center.x;
            int childCoordY = point.y > center.y;
            int childCoordZ = point.z > center.z;
            int childIndex = (childCoordZ<<2) | (childCoordY<<1) | (childCoordZ);
            //std::cout<<"move to child(" << childIndex <<")" << std::endl;
            current = current->createChild(childIndex);
        }
    }

}

void ModifiableNestedOctree::deletePoint() {
    
}

ModifiableNestedOctree* ModifiableNestedOctree::createChild(int childIndex) {
    
    if(children[childIndex]) {
        return children[childIndex].get();
    }

    const Point3D center = boundingBox.getCenter();

    Point3D min = boundingBox.minCorner;
    Point3D max = boundingBox.maxCorner;

    if (childIndex & 1) min.x = center.x; else max.x = center.x;
    if (childIndex & 2) min.y = center.y; else max.y = center.y;
    if (childIndex & 4) min.z = center.z; else max.z = center.z;

    children[childIndex] = std::make_unique<ModifiableNestedOctree>(min, max);
    
    return children[childIndex].get();

}

ModifiableNestedOctree* ModifiableNestedOctree::getChild(int childIndex) const {
    
    if(childIndex > 7 && childIndex < 0 && children[childIndex]) {
        return children[childIndex].get();
    }

    std::cerr << "Unable to access Modifiable Nested Octree child " << childIndex;

    return nullptr;

} 

void ModifiableNestedOctree::compileTree(
    std::vector<float>& out,
    int currentDepth,
    int maxDepth
) const {

    if (currentDepth > maxDepth) return;

    // Add points from this node's grid
    for (int i = 0; i < pointGrid.size(); ++i) {
        if (pointGridOccupied[i]) {
            const Point3D& p = pointGrid[i];
            out.push_back(static_cast<float>(p.x));
            out.push_back(static_cast<float>(p.y));
            out.push_back(static_cast<float>(p.z));
        }
    }

    // Recurse into children
    for (int i = 0; i < 8; ++i) {
        if (children[i]) {
            children[i]->compileTree(out, currentDepth + 1, maxDepth);
        }
    }

}

std::vector<uint8_t> ModifiableNestedOctree::serializeForWebSocket(
    int maxDepth,
    const std::string& fileName = "octree_bin.bin"
) const {
    
    std::vector<float> positions;
    positions.reserve(1024); // avoids reallocs

    compileTree(positions, 0, maxDepth);

    uint32_t pointCount = static_cast<uint32_t>(positions.size() / 3);

    // Header
    struct Header {
        uint32_t pointCount;
        uint32_t maxDepth;
    } header{ pointCount, static_cast<uint32_t>(maxDepth) };

    // Allocate final byte buffer
    std::vector<uint8_t> buffer(
        sizeof(Header) + positions.size() * sizeof(float)
    );

    // Copy header
    std::memcpy(buffer.data(), &header, sizeof(Header));

    // Copy payload
    std::memcpy(
        buffer.data() + sizeof(Header),
        positions.data(),
        positions.size() * sizeof(float)
    );

    // Write buffer to file
    std::ofstream out(fileName, std::ios::binary);
    
    if (out) {
        out.write(
            reinterpret_cast<const char*>(buffer.data()),
            buffer.size()
        );
    }
    
    return buffer;

}

// Print out Information on single Octree Node
void ModifiableNestedOctree::printNode() const {
    
    std::cout << "ID:" << id << std::endl;
    std::cout << "MinCorner:" << boundingBox.minCorner << std::endl;
    std::cout << "MaxCorner:" << boundingBox.maxCorner << std::endl;
    
    for (int i = 0; i<pointGrid.size(); ++i) {
        if(pointGridOccupied[i]) {
            std::cout << "\tPoint (" << i <<"):" << pointGrid[i] << std::endl;
        }
    }

}

// Recursive helper function
void ModifiableNestedOctree::printNodeRecursive(std::ofstream& out, int depth = 0) const {
    
    std::string indent(depth * 2, ' ');

    // Print node bounding box
    out << indent << "Node Depth " << depth << ":\n";
    out << indent << "  MinCorner: " << boundingBox.minCorner << "\n";
    out << indent << "  MaxCorner: " << boundingBox.maxCorner << "\n";

    // Print points in the node's grid
    for (int i = 0; i < pointGrid.size(); ++i) {
        if (pointGridOccupied[i]) {
            out << indent << "    Point(" << i << "): " << pointGrid[i] << "\n";
        }
    }

    // Recurse into children
    for (int i = 0; i < 8; ++i) {
        if (children[i]) {
            children[i]->printNodeRecursive(out, depth + 1);
        }
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

    printNodeRecursive(out, 0);

    out.close();

}

int ModifiableNestedOctree::getId() const {
    
    return id;

}

const BoundingBox& ModifiableNestedOctree::getBoundingBox() const {
    
    return boundingBox;

}