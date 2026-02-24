#include "MathTypes.h"
#include "Camera.h"
#include <array>
#include <iosfwd> 

/**
 * @struct Camera
 * @brief Camera Struct Definitions
 * */

Camera::Camera(
    float x_, float y_, float z_, 
    const Matrix4x4& viewMatrixInverse_,
    const Matrix4x4& projection_,
    float screenWidth_,
    float screenHeight_
) : x(x_), y(y_), z(z_), viewMatrixInverse(viewMatrixInverse_), projection(projection_),
    screenWidth(screenWidth_), screenHeight(screenHeight_) {
        projection[0][0] = 1.30322537284/(screenWidth_ / screenHeight_); // currently assume fov is 75 degrees
    }

void Camera::setPosition(float cx, float cy, float cz) {   
    x = cx;
    y = cy;
    z = cz;
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
    const auto& m = projectionViewMatrix;

    // Extract the 6 frustum planes from the View-Projection matrix.
    // Each plane equation is in the form: Ax + By + Cz + D = 0
    float planes[6][4] = {
        { m[3][0] + m[0][0], m[3][1] + m[0][1], m[3][2] + m[0][2], m[3][3] + m[0][3] }, // Left
        { m[3][0] - m[0][0], m[3][1] - m[0][1], m[3][2] - m[0][2], m[3][3] - m[0][3] }, // Right
        { m[3][0] + m[1][0], m[3][1] + m[1][1], m[3][2] + m[1][2], m[3][3] + m[1][3] }, // Bottom
        { m[3][0] - m[1][0], m[3][1] - m[1][1], m[3][2] - m[1][2], m[3][3] - m[1][3] }, // Top
        { m[3][0] + m[2][0], m[3][1] + m[2][1], m[3][2] + m[2][2], m[3][3] + m[2][3] }, // Near
        { m[3][0] - m[2][0], m[3][1] - m[2][1], m[3][2] - m[2][2], m[3][3] - m[2][3] }  // Far
    };
    
}

