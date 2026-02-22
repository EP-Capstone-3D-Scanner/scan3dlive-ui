#pragma once
#include "MathTypes.h"
#include "Camera.h"
#include "Points.h"
#include <array>
#include <iosfwd> 

/** 
 * @struct BoundingBox
 * @brief Axis-aligned bounding box structure for regional representation 
 * */
struct BoundingBox {

    /** The minor/minimal corner of the cube */
    PointXYZ minCorner;

    /** The major/maximal corner of the cube */
    PointXYZ maxCorner;

    /** The major/maximal corner of the cube */
    PointXYZ center;
    
    float width;
    float height;
    float length;

    float inv_width;
    float inv_height;
    float inv_length;


    /**
     * @brief Constructs an Axis-aligned bounding box (AABB) from two points
     */
    BoundingBox();

    /**
     * @brief Constructs an Axis-aligned bounding box (AABB) from two points
     */
    BoundingBox(
        const PointXYZ& minCorner_,
        const PointXYZ& maxCorner_
    );

    /**
    * Tests if a point is inside the bounds of the bounding box
    *
    * @param p Point to test against box bounds
    * @return T/F if point is inside bounding box
    */
    bool containsPoint(const PointXYZ& p) const;

    /**
    * Tests if bounding box intersects with camera view frustum
    *
    * @param p Point to test against box bounds
    * @return T/F if point is inside bounding box
    */
    bool inCameraFrustum(const Camera& c) const;

    /**
    * Returns size of screen-projected bounding box
    *
    * @param c Camera view of 3D scene.
    * @return Size of the screen-projected bounding box
    */
    float getScreenProjectedSize(const Camera& c) const; //Update the use getScreenProjectedSize function

    /**
    * Returns bounding box center point
    *
    * @return Size of the screen-projected bounding box
    */
    PointXYZ getCenter() const;

    /**
    * Returns bounding box center point
    *
    * @return Size of the screen-projected bounding box
    */
    PointXYZ getMinCorner() const;

    /**
    * Returns bounding box center point
    *
    * @return Size of the screen-projected bounding box
    */
    PointXYZ getMaxCorner() const;

    /**
    * Obtains corner of the screen size of the bounding box
    *
    * @param cornerIndex Index of the corner to retrieve (0-7)
    * @return 3D Point of the specified corner
    */
    PointXYZ getCorner(int cornerIndex) const;

    /**
    * Obtains corners of the screen size of the bounding box
    *
    * @param c Camera view of 3D scene.
    * @return 3D Points of the corners of the bounding box
    */
    std::array<PointXYZ, 8> getCorners() const;

    /**
    * Obtains corners of the bounding box in NDC coordinates
    *
    * @param c Camera view of 3D scene.
    * @return NDC coordinate points of the corners of the bounding box
    */
    std::array<PointXYZ, 8> getCornersNDC(const Camera& c) const;

    /**
    * Obtains corners of the bounding box in NDC coordinates
    *
    * @param c Camera view of 3D scene.
    * @return Screen coordinate points of the corners of the bounding box
    */
    std::array<PointXY, 8> getCornersScreenProjected(const Camera& c) const;

    /**
     * Expands the bounding box to include a given point, if necessary.
     * @param p The point to include in the bounding box.
     */
    void expandToInclude(const PointXYZ& p);
};
