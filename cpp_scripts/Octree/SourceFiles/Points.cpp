#include "MathTypes.h"
#include "Points.h"
#include <iostream>
#include <iomanip>

/**
 * @struct PointXY
 * @brief PointXY Struct Definitions
 * */

PointXY::PointXY(
    float x_, 
    float y_ 
): x(x_), y(y_) {}

float& PointXY::operator[](int i) {
    
    return i == 0 ? x : y;

}

const float& PointXY::operator[](int i) const {
    
    return i == 0 ? x : y;

}

PointXY& PointXY::operator/=(float d) {
    
    x /= d;
    y /= d;
    
    return *this;
}

PointXY operator+(
    const PointXY& p1, 
    const PointXY& p2
) {
    
    return PointXY{p1.x + p2.x, p1.y + p2.y};

}

PointXY operator/(
    PointXY p, 
    float denominator
) {
    
    return p /= denominator;

}

std::ostream& operator<<(
    std::ostream& os, 
    const PointXY& p
) {
    
    return os << "(" << p.x << ", " << p.y << ")";

}

/**
 * @struct PointXYZ
 * @brief PointXYZ Struct Definitions
 * */

PointXYZ::PointXYZ(
    float x_, 
    float y_, 
    float z_
): x(x_), y(y_), z(z_) {}

PointXYZ& PointXYZ::toNDC(const Camera& c) {
    
    *this = c.projectionViewMatrix*(*this);
    
    return *this;

}

PointXYZ PointXYZ::getNDC(const Camera& c) const {
    
    PointXYZ p = *this;
    
    return p.toNDC(c);

}

PointXY PointXYZ::getScreenCoordinates(const Camera& c) const {
    PointXYZ pNDC = this->getNDC(c);
    float screenX = (pNDC.x + 1.0) * 0.5 * c.screenWidth;
    float screenY = (1.0 - pNDC.y) * 0.5 * c.screenHeight;
    
    return PointXY{screenX, screenY};

}

float& PointXYZ::operator[](int i) {
    
    return i == 0 ? x : (i == 1 ? y : z);

}

const float& PointXYZ::operator[](int i) const {
    
    return i == 0 ? x : (i == 1 ? y : z);

}

PointXYZ& PointXYZ::operator/=(float d) {
    
    x /= d;
    y /= d;
    z /= d;
    
    return *this;
}

PointXYZ operator*(
    const Matrix4x4& m, 
    const PointXYZ& p
) {
    
    PointXYZ result;
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

PointXYZ operator+(
    const PointXYZ& p1, 
    const PointXYZ& p2
) {
    
    return PointXYZ{p1.x + p2.x, p1.y + p2.y, p1.z + p2.z};

}

PointXYZ operator-(
    const PointXYZ& p1, 
    const PointXYZ& p2
) {
    
    return PointXYZ{p1.x - p2.x, p1.y - p2.y, p1.z - p2.z};

}

PointXYZ operator/(
    PointXYZ p, 
    float denominator
) {
    
    return p /= denominator;

}

std::ostream& operator<<(
    std::ostream& os, 
    const PointXYZ& p
) {
    
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ")";

}

/**
 * @struct PointXYZW
 * @brief PointXYZW Struct Definitions
 * */

PointXYZW::PointXYZW(
    float x_, 
    float y_, 
    float z_, 
    float w_
): PointXYZ(x_, y_, z_), w(w_) {}

PointXYZW::PointXYZW(
    const PointXYZ& p, 
    float w_
): PointXYZ(p), w(w_) {}

/*
PointXY PointXYZW::getScreenCoordinates(const Camera& c) {
    
    float screenX = (x + 1.0) * 0.5 * c.screenWidth;
    float screenY = (1.0 - y) * 0.5 * c.screenHeight;
    
    return PointXY{screenX, screenY};

}
*/

PointXYZW& PointXYZW::homogenize() {
    
    x /= w;
    y /= w;
    z /= w;
    w = 1;
    
    return *this;

}

PointXYZW PointXYZW::homogenized() const {
    
    PointXYZW p = *this;
    
    return p.homogenize();

}

float& PointXYZW::operator[](int i) {
    
    return i == 0 ? x : (i == 1 ? y : (i == 2 ? z : w));

}

const float& PointXYZW::operator[](int i) const {
    
    return i == 0 ? x : (i == 1 ? y : (i == 2 ? z : w));

}

PointXYZW operator*(
    const Matrix4x4& m, 
    const PointXYZW& p
) {
    
    PointXYZW result;
    
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
    const PointXYZW& p
) {
    
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ", " << p.w << ")";

}


