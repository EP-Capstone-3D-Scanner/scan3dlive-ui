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

 BoundingBox::BoundingBox() : minCorner(PointXYZ{0,0,0}), maxCorner(PointXYZ{0,0,0}) {

    center = (minCorner+maxCorner)/2;

}

BoundingBox::BoundingBox(
    const PointXYZ& minCorner_, 
    const PointXYZ& maxCorner_
) : minCorner(minCorner_), maxCorner(maxCorner_) {

    center = (minCorner_+maxCorner_)/2;

}

bool BoundingBox::containsPoint(const PointXYZ& p) const {

    return (p.x>=minCorner.x && p.x<=maxCorner.x) 
        && (p.y>=minCorner.y && p.y<=maxCorner.y)
        && (p.z>=minCorner.z && p.z<=maxCorner.z);

}

bool BoundingBox::inCameraFrustum(const Camera& c) const {
    std::array<PointXYZ, 8> cornersNDC = getCornersNDC(c);

    // If all points are less than -1 or greater than +1 in all dims then we don't
    // intersect view frustum
    for (int axis = 0; axis < 3; ++axis) {
        float minVal = cornersNDC[0][axis];
        float maxVal = cornersNDC[0][axis];
        for (int i = 1; i < 8; ++i) {
            minVal = std::min(minVal, cornersNDC[i][axis]);
            maxVal = std::max(maxVal, cornersNDC[i][axis]);
        }
        if (maxVal < -1.0f || minVal > 1.0f) return false;
    }
    return true;
}

/** 
 * INCOMPLETE FUNCTION, NEED TO UPDATE
 * 

bool BoundingBox::inCameraFrustum(const Camera& c) const { 
    std::array<PointXYZ, 8> cornersNDC = getCornersNDC(c);

    for (PointXYZ& p : cornersNDC) {
        if(p.x>=-1 && p.x<=1 && p.y>=-1 && p.y<=1 && p.z>=-1 && p.z<=1) return true;
    }

    return false;

}*/

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
    PointXYZ p1 = PointXYZ{maxCorner[0], minCorner[1], minCorner[2]};
    PointXYZ p2 = PointXYZ{minCorner[0], maxCorner[1], minCorner[2]};
    PointXYZ p3 = PointXYZ{maxCorner[0], maxCorner[1], minCorner[2]};
    PointXYZ p4 = PointXYZ{minCorner[0], minCorner[1], maxCorner[2]};
    PointXYZ p5 = PointXYZ{maxCorner[0], minCorner[1], maxCorner[2]};
    PointXYZ p6 = PointXYZ{minCorner[0], maxCorner[1], maxCorner[2]};
    PointXYZ p7 = maxCorner;

    std::array<PointXYZ, 8> corners = {p0, p1, p2, p3, p4, p5, p6, p7};

    return corners;

};

std::array<PointXYZ, 8> BoundingBox::getCornersNDC(const Camera& c) const {
    
    std::array<PointXYZ, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        corners[i].toNDC(c);
    }

    return corners;

}

std::array<PointXY, 8> BoundingBox::getCornersScreenProjected(const Camera& c) const {
    
    std::array<PointXY, 8> cornersScreenProjected;
    const std::array<PointXYZ, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        cornersScreenProjected[i] = corners[i].getScreenCoordinates(c);
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

    center = (minCorner + maxCorner) / 2;
}