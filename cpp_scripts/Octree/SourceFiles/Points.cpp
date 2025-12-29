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
    double screenWidth_,
    double screenHeight_
) : viewMatrixInverse(viewMatrixInverse_), projection(projection_),
    screenWidth(screenWidth_), screenHeight(screenHeight_) {
        projection[0][0] = 1.30322537284/(screenWidth_ / screenHeight_);
    }

/**
 * @struct Point3D
 * @brief Point3D Struct Definitions
 * */

Point3D::Point3D(
    double x_, 
    double y_, 
    double z_
): x(x_), y(y_), z(z_) {}

double& Point3D::operator[](int i) {
    
    return i == 0 ? x : (i == 1 ? y : z);

}

const double& Point3D::operator[](int i) const {
    
    return i == 0 ? x : (i == 1 ? y : z);

}

Point3D& Point3D::operator/=(double d) {
    
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
    double w = 1.0 / (
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
    double denominator
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
    double x_, 
    double y_, 
    double z_, 
    double w_
): Point3D(x_, y_, z_), w(w_) {}

Point4D::Point4D(
    const Point3D& p, 
    double w_
): Point3D(p), w(w_) {}

double& Point4D::operator[](int i) {
    
    return i == 0 ? x : (i == 1 ? y : (i == 2 ? z : w));

}

const double& Point4D::operator[](int i) const {
    
    return i == 0 ? x : (i == 1 ? y : (i == 2 ? z : w));

}

std::ostream& operator<<(
    std::ostream& os, 
    const Point4D& p
) {
    
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ", " << p.w << ")";

}

Point4D& Point4D::homogenize() {
    
    x /= w;
    y /= w;
    z /= w;
    w = 1;
    
    return *this;

}

void Point4D::toScreenCoordinates(const Camera& c) {
    
    double screenX = (x + 1.0) * 0.5 * c.screenWidth;
    double screenY = (1.0 - y) * 0.5 * c.screenHeight;
    
    std::cout << "(screenX,screenY) = (" << screenX << ", " << screenY << ")\n";

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

Point4D NDC(
    const Point3D& p,
    const Camera& c
) {
    
    Point4D cameraSpaceCoords = static_cast<Point4D>(c.viewMatrixInverse * p);
    //std::cout << "View (after MatrixWorldInverse): " << cameraSpaceCoords << '\n';

    Point4D clipSpace = c.projection * cameraSpaceCoords;
    //std::cout << "View (after ProjectionMatrix): " << clipSpace << '\n';

    clipSpace.homogenize();
    std::cout << "View (after ProjectionMatrix, Homegenized): " << clipSpace << '\n';

    return clipSpace;

}

/**
 * @struct BoundingBox
 * @brief BoundingBox Struct Definitions
 * */

BoundingBox::BoundingBox(
    const Point3D& minCorner_, 
    const Point3D& maxCorner_
) : minCorner(minCorner_), maxCorner(maxCorner_) {}

bool BoundingBox::containsPoint(const Point3D& p) const {

    return (p.x>=minCorner.x & p.x<=maxCorner.x) 
        && (p.y>=minCorner.y & p.y<=maxCorner.y)
        && (p.z>=minCorner.z & p.z<=maxCorner.z);

}

bool BoundingBox::inCameraFrustum(const Camera& c) const { /*INCOMPLETE FUNCTION - NEED TO UPDATE*/
    std::array<Point4D, 8> cornersNDC = getCornersNDC(c);

    for (Point4D& p : cornersNDC) {
        if(p.x>=-1 && p.x<=1 && p.y>=-1 && p.y<=1 && p.z>=-1 && p.z<=1) return true;
    }

    return false;

}

double BoundingBox::getScreenProjectedSize(const Camera& c) const {

    std::array<Point4D, 8> cornersNDC = getCornersNDC(c);
    double minX = cornersNDC[0].x, minY = cornersNDC[0].y;
    double maxX = cornersNDC[0].x, maxY = cornersNDC[0].y;
    
    for (Point4D& p : cornersNDC) {
        if (p.x>maxX) maxX = p.x;
        if (p.x<minX) minX = p.x;
        if (p.y>maxY) maxY = p.y;
        if (p.y<minY) minY = p.y;
    }
    
    return (maxX-minX)*(maxY-minY)*c.screenWidth*c.screenHeight;

}

Point3D BoundingBox::getCenter() const {
    
    return (minCorner+maxCorner)/2;

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

std::array<Point4D, 8> BoundingBox::getCornersNDC(const Camera& c) const {
    
    std::array<Point4D, 8> cornersNDC;
    std::array<Point3D, 8> corners = getCorners();

    for (int i = 0; i<8; ++i) {
        cornersNDC[i] = ::NDC(corners[i], c);
    }

    return cornersNDC;

}