#include "MathTypes.h"
#include "Camera.h"
#include "Points.h"
#include <array>
#include <iosfwd> 
#include "BoundingBox.h"

/**
 * @struct BoundingBox
 * @brief BoundingBox Struct Definitions
 * */

 BoundingBox::BoundingBox() : minCorner(PointXYZ(0,0,0)), maxCorner(PointXYZ(0,0,0)) {

    center = (minCorner+maxCorner)/2;
    height = 0;
    width = 0;
    length = 0;
    inv_height = 0;
    inv_width = 0;
    inv_length = 0;

}

BoundingBox::BoundingBox(
    const PointXYZ& minCorner_, 
    const PointXYZ& maxCorner_
) : minCorner(minCorner_), maxCorner(maxCorner_) {

    center = (minCorner_+maxCorner_)/2;
    length = (maxCorner.x - minCorner.x);
    width = (maxCorner.y - minCorner.y);
    height = (maxCorner.z - minCorner.z);
    inv_length = 1/(maxCorner.x - minCorner.x);
    inv_width = 1/(maxCorner.y - minCorner.y);
    inv_height = 1/(maxCorner.z - minCorner.z);

}

bool BoundingBox::containsPoint(const PointXYZ& p) const {

    return (p.x>=minCorner.x && p.x<=maxCorner.x) 
        && (p.y>=minCorner.y && p.y<=maxCorner.y)
        && (p.z>=minCorner.z && p.z<=maxCorner.z);

}

bool BoundingBox::inCameraFrustum(const Camera& c) const {

    // Test the bounding box against each plane
    for (int i = 0; i < 6; ++i) {
        // Find the "p-vertex" - the corner of the AABB furthest along the plane's normal direction
        float px = (c.planes[i][0] > 0.0f) ? maxCorner.x : minCorner.x;
        float py = (c.planes[i][1] > 0.0f) ? maxCorner.y : minCorner.y;
        float pz = (c.planes[i][2] > 0.0f) ? maxCorner.z : minCorner.z;

        // Calculate the distance from the p-vertex to the plane
        float distance = c.planes[i][0] * px + c.planes[i][1] * py + c.planes[i][2] * pz + c.planes[i][3];

        // If the p-vertex is on the negative side of the plane, 
        // the entire bounding box is outside the frustum.
        if (distance < 0.0f) {
            return false;
        }
    }

    return true; // Intersects or is fully inside the frustum
}

float BoundingBox::getScreenProjectedSize(const Camera& c) const {
    std::array<PointXY, 8> cornersNDC = getCornersScreenProjected(c);
    float minX = cornersNDC[0].x, minY = cornersNDC[0].y;
    float maxX = cornersNDC[0].x, maxY = cornersNDC[0].y;
    
    for (PointXY& p : cornersNDC) {
        if (p.x>maxX) maxX = p.x;
        if (p.x<minX) minX = p.x;
        if (p.y>maxY) maxY = p.y;
        if (p.y<minY) minY = p.y;
    }

    return (maxX-minX)*(maxY-minY);
}

PointXYZ BoundingBox::getCenter() const {

    return center;

}

PointXYZ BoundingBox::getMinCorner() const {
    
    return minCorner;

}

PointXYZ BoundingBox::getMaxCorner() const {
    
    return maxCorner;

}

PointXYZ BoundingBox::getCorner(int cornerIndex) const {
    if (cornerIndex < 0 || cornerIndex > 7) {
        throw std::out_of_range("Corner index must be in the range [0, 7]");
    }
    return PointXYZ{
        (cornerIndex & 1) ? maxCorner.x : minCorner.x,
        (cornerIndex & 2) ? maxCorner.y : minCorner.y,
        (cornerIndex & 4) ? maxCorner.z : minCorner.z
    };
}

std::array<PointXYZ, 8> BoundingBox::getCorners() const {

    PointXYZ p0 = minCorner;
    PointXYZ p1 = PointXYZ{maxCorner.x, minCorner.y, minCorner.z};
    PointXYZ p2 = PointXYZ{minCorner.x, maxCorner.y, minCorner.z};
    PointXYZ p3 = PointXYZ{maxCorner.x, maxCorner.y, minCorner.z};
    PointXYZ p4 = PointXYZ{minCorner.x, minCorner.y, maxCorner.z};
    PointXYZ p5 = PointXYZ{maxCorner.x, minCorner.y, maxCorner.z};
    PointXYZ p6 = PointXYZ{minCorner.x, maxCorner.y, maxCorner.z};
    PointXYZ p7 = maxCorner;

    std::array<PointXYZ, 8> corners = {p0, p1, p2, p3, p4, p5, p6, p7};
    return corners;

};

std::array<PointXYZ, 8> BoundingBox::getCornersNDC(const Camera& c) const {
    std::array<PointXYZ, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        corners[i] = c.projectionViewMatrix*corners[i];
    }

    return corners;
}

std::array<PointXY, 8> BoundingBox::getCornersScreenProjected(const Camera& c) const {
    std::array<PointXY, 8> cornersScreenProjected;
    const std::array<PointXYZ, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        cornersScreenProjected[i] = getScreenCoordinates(corners[i], c);
    }

    return cornersScreenProjected;
}

void BoundingBox::expandToInclude(const PointXYZ& p) {
    if (p.x < minCorner.x) minCorner.x = p.x;
    if (p.y < minCorner.y) minCorner.y = p.y;
    if (p.z < minCorner.z) minCorner.z = p.z;
    if (p.x > maxCorner.x) maxCorner.x = p.x;
    if (p.y > maxCorner.y) maxCorner.y = p.y;
    if (p.z > maxCorner.z) maxCorner.z = p.z;

    length = (maxCorner.x - minCorner.x);
    width = (maxCorner.y - minCorner.y);
    height = (maxCorner.z - minCorner.z);
    center = (minCorner+maxCorner)/2;
    inv_length = 1/(maxCorner.x - minCorner.x);
    inv_width = 1/(maxCorner.y - minCorner.y);
    inv_height = 1/(maxCorner.z - minCorner.z);
}