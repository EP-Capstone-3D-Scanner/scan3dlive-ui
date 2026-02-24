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

/**
 * @struct PointXYZ
 * @brief PointXYZ Struct Definitions
 * */

PointXYZ::PointXYZ(
    float x_, 
    float y_, 
    float z_
): x(x_), y(y_), z(z_) {}

/**
 * @struct PointXYZRGBA
 * @brief PointXYZRGBA Struct Definitions
 * */

PointXYZRGBA::PointXYZRGBA(
    float x_, 
    float y_, 
    float z_, 
    uint8_t r_,
    uint8_t g_,
    uint8_t b_,
    uint8_t a_
): PointXYZ(x_, y_, z_), r(r_), g(g_), b(b_), a(a_) {}

PointXYZRGBA::PointXYZRGBA(
    const PointXYZ& p, 
    uint8_t r_,
    uint8_t g_,
    uint8_t b_,
    uint8_t a_
): PointXYZ(p), r(r_), g(g_), b(b_), a(a_) {}


std::ostream& operator<<(std::ostream& os, const PointXY& p) { 
    return os << "(" << p.x << ", " << p.y << ")";
}

std::ostream& operator<<(std::ostream& os, const PointXYZ& p) {
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ")";
}

std::ostream& operator<<(std::ostream& os, const PointXYZRGBA& p) {
    return os << "(" << p.x << ", " << p.y << ", " << p.z << ") :: (" << (+p.r) << ", " << (+p.g) << ", " << (+p.b) << ", " << (+p.a) << ")";
}
