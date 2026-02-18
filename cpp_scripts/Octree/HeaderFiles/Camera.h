#pragma once
#include "MathTypes.h"
#include <array>
#include <iosfwd> 

/** 
 * @struct Camera
 * @brief Camera used for projection world-space geometry  
 * @note There is a glich in R3F that causes camera aspect to not update on re-renders
 * @note I fix this by manually setting the first element of projection matrix based on tan(fov/2)
 * */
struct Camera {
    /** Product of projection matrix and view matrix -> NDC*/
    Matrix4x4 projectionViewMatrix;

    /** Inverse of Camera view matrix (worldToCamera)*/
    Matrix4x4 viewMatrixInverse;

    /** Camera projection matrix */
    Matrix4x4 projection;

    /** Client screen width */
    float screenWidth;

    /** Client screen height */
    float screenHeight;

    /**
     * @brief Constructs a camera object from renderer matrices and screen dimensions
     */
    Camera(
        const Matrix4x4& viewMatrixInverse_,
        const Matrix4x4& projection_,
        float screenWidth_,
        float screenHeight_  
    );

    void setViewMatrixInverse(
        float vmi11, float vmi12, float vmi13, float vmi14, 
        float vmi21, float vmi22, float vmi23, float vmi24, 
        float vmi31, float vmi32, float vmi33, float vmi34,
        float vmi41, float vmi42, float vmi43, float vmi44
    );

    void setProjectionMatrix(
        float pm11, float pm12, float pm13, float pm14, 
        float pm21, float pm22, float pm23, float pm24,  
        float pm31, float pm32, float pm33, float pm34, 
        float pm41, float pm42, float pm43, float pm44, 
        float vppr
    );

    void setProjectionViewMatrix();

};