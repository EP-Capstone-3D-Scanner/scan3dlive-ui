#include "MathTypes.h"
#include "Points.h"
#include <iostream>
#include <iomanip>

/**
 * @struct Camera
 * @brief Camera Struct Definitions
 * */

Camera::Camera( 
    const Matrix4x4& viewMatrixInverse_,
    const Matrix4x4& projection_,
    float screenWidth_,
    float screenHeight_
) : viewMatrixInverse(viewMatrixInverse_), projection(projection_),
    screenWidth(screenWidth_), screenHeight(screenHeight_) {
        projection[0][0] = 1.30322537284/(screenWidth_ / screenHeight_); // currently assume fov is 75 degrees
    }


void Camera::setViewMatrixInverse(
    float vmi11, float vmi12, float vmi13, float vmi14, 
    float vmi21, float vmi22, float vmi23, float vmi24, 
    float vmi31, float vmi32, float vmi33, float vmi34,
    float vmi41, float vmi42, float vmi43, float vmi44
) {
    viewMatrixInverse[0][0] = vmi11;
    viewMatrixInverse[0][1] = vmi12;
    viewMatrixInverse[0][2] = vmi13;
    viewMatrixInverse[0][3] = vmi14;
    viewMatrixInverse[1][0] = vmi21;
    viewMatrixInverse[1][1] = vmi22;
    viewMatrixInverse[1][2] = vmi23;
    viewMatrixInverse[1][3] = vmi24;
    viewMatrixInverse[2][0] = vmi31;
    viewMatrixInverse[2][1] = vmi32;
    viewMatrixInverse[2][2] = vmi33;
    viewMatrixInverse[2][3] = vmi34;
    viewMatrixInverse[3][0] = vmi41;
    viewMatrixInverse[3][1] = vmi42;
    viewMatrixInverse[3][2] = vmi43;
    viewMatrixInverse[3][3] = vmi44;
}

void Camera::setProjectionMatrix(
    float pm11, float pm12, float pm13, float pm14, 
    float pm21, float pm22, float pm23, float pm24,  
    float pm31, float pm32, float pm33, float pm34, 
    float pm41, float pm42, float pm43, float pm44, 
    float vppr
) {
    projection[0][0] = pm11;
    projection[0][1] = pm12;
    projection[0][2] = pm13;
    projection[0][3] = pm14;
    projection[1][0] = pm21;
    projection[1][1] = pm22;
    projection[1][2] = pm23;
    projection[1][3] = pm24;
    projection[2][0] = pm31;
    projection[2][1] = pm32;
    projection[2][2] = pm33;
    projection[2][3] = pm34;
    projection[3][0] = pm41;
    projection[3][1] = pm42;
    projection[3][2] = pm43;
    projection[3][3] = pm44;
    projection[0][0] = 1.30322537284/vppr; //correct Three.js glitch
}

void Camera::setProjectionViewMatrix() {

    projectionViewMatrix = projection * viewMatrixInverse;
    
}


/**
 * @struct Point2D
 * @brief Point2D Struct Definitions
 * */

Point2D::Point2D(
    float x_, 
    float y_ 
): x(x_), y(y_) {}

float& Point2D::operator[](int i) {
    
    return i == 0 ? x : y;

}

const float& Point2D::operator[](int i) const {
    
    return i == 0 ? x : y;

}

Point2D& Point2D::operator/=(float d) {
    
    x /= d;
    y /= d;
    
    return *this;
}

Point2D operator+(
    const Point2D& p1, 
    const Point2D& p2
) {
    
    return Point2D{p1.x + p2.x, p1.y + p2.y};

}

Point2D operator/(
    Point2D p, 
    float denominator
) {
    
    return p /= denominator;

}

std::ostream& operator<<(
    std::ostream& os, 
    const Point2D& p
) {
    
    return os << "(" << p.x << ", " << p.y << ")";

}

/**
 * @struct Point3D
 * @brief Point3D Struct Definitions
 * */

Point3D::Point3D(
    float x_, 
    float y_, 
    float z_
): x(x_), y(y_), z(z_) {}

Point3D& Point3D::toNDC(const Camera& c) {
    
    *this = c.projectionViewMatrix*(*this);
    
    return *this;

}

Point3D Point3D::getNDC(const Camera& c) const {
    
    Point3D p = *this;
    
    return p.toNDC(c);

}

Point2D Point3D::getScreenCoordinates(const Camera& c) const {
    Point3D pNDC = this->getNDC(c);
    float screenX = (pNDC.x + 1.0) * 0.5 * c.screenWidth;
    float screenY = (1.0 - pNDC.y) * 0.5 * c.screenHeight;
    
    return Point2D{screenX, screenY};

}

float& Point3D::operator[](int i) {
    
    return i == 0 ? x : (i == 1 ? y : z);

}

const float& Point3D::operator[](int i) const {
    
    return i == 0 ? x : (i == 1 ? y : z);

}

Point3D& Point3D::operator/=(float d) {
    
    x /= d;
    y /= d;
    z /= d;
    
    return *this;
}

Point3D operator*(
    const Matrix4x4& m, 
    const Point3D& p
) {
    
    Point3D result;
    float w = 1.0 / (
        m[3][0]*p[0] + m[3][1]*p[1] + m[3][2]*p[2] + m[3][3]
    );

    for (int row = 0; row < 3; ++row) {
        result[row] =
            (m[row][0] * p[0] +
             m[row][1] * p[1] +
             m[row][2] * p[2] +
             m[row][3]) * w;
    }
    
    return result;

}

Point3D operator+(
    const Point3D& p1, 
    const Point3D& p2
) {
    
    return Point3D{p1.x + p2.x, p1.y + p2.y, p1.z + p2.z};

}

Point3D operator/(
    Point3D p, 
    float denominator
) {
    
    return p /= denominator;

}

std::ostream& operator<<(
    std::ostream& os, 
    const Point3D& p
) {
    
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ")";

}

/**
 * @struct Point4D
 * @brief Point4D Struct Definitions
 * */

Point4D::Point4D(
    float x_, 
    float y_, 
    float z_, 
    float w_
): Point3D(x_, y_, z_), w(w_) {}

Point4D::Point4D(
    const Point3D& p, 
    float w_
): Point3D(p), w(w_) {}

/*
Point2D Point4D::getScreenCoordinates(const Camera& c) {
    
    float screenX = (x + 1.0) * 0.5 * c.screenWidth;
    float screenY = (1.0 - y) * 0.5 * c.screenHeight;
    
    return Point2D{screenX, screenY};

}
*/

Point4D& Point4D::homogenize() {
    
    x /= w;
    y /= w;
    z /= w;
    w = 1;
    
    return *this;

}

Point4D Point4D::homogenized() const {
    
    Point4D p = *this;
    
    return p.homogenize();

}

float& Point4D::operator[](int i) {
    
    return i == 0 ? x : (i == 1 ? y : (i == 2 ? z : w));

}

const float& Point4D::operator[](int i) const {
    
    return i == 0 ? x : (i == 1 ? y : (i == 2 ? z : w));

}

Point4D operator*(
    const Matrix4x4& m, 
    const Point4D& p
) {
    
    Point4D result;
    
    for (int row = 0; row < 4; ++row) {
        result[row] =
            m[row][0] * p[0] +
            m[row][1] * p[1] +
            m[row][2] * p[2] +
            m[row][3] * p[3];
    }
    
    return result;

}

std::ostream& operator<<(
    std::ostream& os, 
    const Point4D& p
) {
    
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ", " << p.w << ")";

}

/**
 * @struct BoundingBox
 * @brief BoundingBox Struct Definitions
 * */

BoundingBox::BoundingBox(
    const Point3D& minCorner_, 
    const Point3D& maxCorner_
) : minCorner(minCorner_), maxCorner(maxCorner_) {

    center = (minCorner_+maxCorner_)/2;

}

bool BoundingBox::containsPoint(const Point3D& p) const {

    return (p.x>=minCorner.x && p.x<=maxCorner.x) 
        && (p.y>=minCorner.y && p.y<=maxCorner.y)
        && (p.z>=minCorner.z && p.z<=maxCorner.z);

}

bool BoundingBox::inCameraFrustum(const Camera& c) const {
    std::array<Point3D, 8> cornersNDC = getCornersNDC(c);

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
    std::array<Point3D, 8> cornersNDC = getCornersNDC(c);

    for (Point3D& p : cornersNDC) {
        if(p.x>=-1 && p.x<=1 && p.y>=-1 && p.y<=1 && p.z>=-1 && p.z<=1) return true;
    }

    return false;

}*/

float BoundingBox::getScreenProjectedSize(const Camera& c) const {

    std::array<Point2D, 8> cornersNDC = getCornersScreenProjected(c);
    float minX = cornersNDC[0].x, minY = cornersNDC[0].y;
    float maxX = cornersNDC[0].x, maxY = cornersNDC[0].y;
    
    for (Point2D& p : cornersNDC) {
        if (p.x>maxX) maxX = p.x;
        if (p.x<minX) minX = p.x;
        if (p.y>maxY) maxY = p.y;
        if (p.y<minY) minY = p.y;
    }

    return (maxX-minX)*(maxY-minY);

}

Point3D BoundingBox::getCenter() const {
    
    return center;

}

std::array<Point3D, 8> BoundingBox::getCorners() const {

    Point3D p0 = minCorner;
    Point3D p1 = Point3D{maxCorner[0], minCorner[1], minCorner[2]};
    Point3D p2 = Point3D{minCorner[0], maxCorner[1], minCorner[2]};
    Point3D p3 = Point3D{maxCorner[0], maxCorner[1], minCorner[2]};
    Point3D p4 = Point3D{minCorner[0], minCorner[1], maxCorner[2]};
    Point3D p5 = Point3D{maxCorner[0], minCorner[1], maxCorner[2]};
    Point3D p6 = Point3D{minCorner[0], maxCorner[1], maxCorner[2]};
    Point3D p7 = maxCorner;

    std::array<Point3D, 8> corners = {p0, p1, p2, p3, p4, p5, p6, p7};

    return corners;

};

std::array<Point3D, 8> BoundingBox::getCornersNDC(const Camera& c) const {
    
    std::array<Point3D, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        corners[i].toNDC(c);
    }

    return corners;

}

std::array<Point2D, 8> BoundingBox::getCornersScreenProjected(const Camera& c) const {
    
    std::array<Point2D, 8> cornersScreenProjected;
    const std::array<Point3D, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        cornersScreenProjected[i] = corners[i].getScreenCoordinates(c);
    }

    return cornersScreenProjected;

}
