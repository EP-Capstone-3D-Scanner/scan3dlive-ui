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

/** 
 * @struct Point2D
 * @brief Point structure for representing (2D) points  
 * */
struct Point2D {

    /** Point x-coordinate */
    float x = 0;

    /** Point y-coordinate */
    float y = 0;


    /**
     * @brief Constructs a Point3D object from point coordinates
     */
    Point2D(
        float x_ = 0, 
        float y_ = 0 
    );
    
    /**
    * Indexed access to coordinates.
    *
    * @param i Index in [0, 1].
    */
    float& operator[](int i);
    const float& operator[](int i) const;

    Point2D&  operator/=(float d);
};

Point2D operator+(
    const Point2D&  p1, 
    const Point2D&  p2
);

Point2D operator/(
    Point2D p, 
    float denominator
);

std::ostream& operator<<(
    std::ostream& os, 
    const Point2D&  p
);

/** 
 * @struct Point3D
 * @brief Point structure for representing (3D) points  
 * */
struct Point3D {

    /** Point x-coordinate */
    float x = 0;

    /** Point y-coordinate */
    float y = 0;

    /** Point z-coordinate */
    float z = 0;

    /**
     * @brief Constructs a Point3D object from point coordinates
     */
    Point3D(
        float x_ = 0, 
        float y_ = 0, 
        float z_ = 0
    );
    
    /**
    * Returns coordinates of Point3D object.
    *
    * @param c Camera view of 3D scene.
    * @return NDC Coordinates of Point3D
    */
    Point3D& toNDC(const Camera& c);
    Point3D getNDC(const Camera& c) const; 

    /**
    * Gets screen coodindates of 3D Point.
    *
    * @param c Camera view of 3D scene.
    * @return Screen coordinates of Point3D
    */
    Point2D getScreenCoordinates(const Camera& c) const; //Update to return reference

    /**
    * Indexed access to coordinates.
    *
    * @param i Index in [0, 2].
    */
    float& operator[](int i);
    const float& operator[](int i) const;

    Point3D&  operator/=(float d);
};

Point3D operator*(
    const Matrix4x4& m, 
    const Point3D&  p
);

Point3D operator+(
    const Point3D&  p1, 
    const Point3D&  p2
);

Point3D operator/(
    Point3D p, 
    float denominator
);

std::ostream& operator<<(
    std::ostream& os, 
    const Point3D&  p
);

/** 
 * @struct Point4D
 * @brief Point structure for representing (3D) points  
 * */
struct Point4D : Point3D {

    /** Point w-coordinate */
    float w = 1;

    /**
     * @brief Constructs a default Point4D object
     */
    Point4D(
        float x_ = 0, 
        float y_ = 0, 
        float z_ = 0, 
        float w_ = 1
    );

    /**
     * @brief Constructs a Point4D object from corresponding Point3D
     */
    Point4D(
        const Point3D& p, 
        float w_ = 1
    );

    /**
    * Converts Point4D (NDC) object to screen coordinates.
    *
    * @param c Camera view of 3D scene.
    * @return Screen coordinates of Point4D (NDC)
    */
    /*Point2D getScreenCoordinates(const Camera& c);*/

    /**
    * Converts Point4D object to Normalized Device Coordinates (NDC) equivalent
    *
    * @param c Camera view of 3D scene.
    * @return NDC coordinates of point
    */
    Point4D& homogenize();
    Point4D homogenized() const;
    
    float& operator[](int i);
    const float& operator[](int i) const;
    
};

Point4D operator*(
    const Matrix4x4& m, 
    const Point4D& p
);

std::ostream& operator<<(
    std::ostream& os, 
    const Point4D& p
);

/** 
 * @struct BoundingBox
 * @brief Axis-aligned bounding box structure for regional representation 
 * */
struct BoundingBox {

    /** The minor/minimal corner of the cube */
    Point3D minCorner;

    /** The major/maximal corner of the cube */
    Point3D maxCorner;

    /** The major/maximal corner of the cube */
    Point3D center;

    /**
     * @brief Constructs an Axis-aligned bounding box (AABB) from two points
     */
    BoundingBox(
        const Point3D& minCorner_,
        const Point3D& maxCorner_
    );

    /**
    * Tests if a point is inside the bounds of the bounding box
    *
    * @param p Point to test against box bounds
    * @return T/F if point is inside bounding box
    */
    bool containsPoint(const Point3D& p) const;

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
    Point3D getCenter() const;

    /**
    * Obtains corners of the screen size of the bounding box
    *
    * @param c Camera view of 3D scene.
    * @return 3D Points of the corners of the bounding box
    */
    std::array<Point3D, 8> getCorners() const;

    /**
    * Obtains corners of the bounding box in NDC coordinates
    *
    * @param c Camera view of 3D scene.
    * @return NDC coordinate points of the corners of the bounding box
    */
    std::array<Point3D, 8> getCornersNDC(const Camera& c) const;

    /**
    * Obtains corners of the bounding box in NDC coordinates
    *
    * @param c Camera view of 3D scene.
    * @return Screen coordinate points of the corners of the bounding box
    */
    std::array<Point2D, 8> getCornersScreenProjected(const Camera& c) const;
};









/*

MAIN CODE:
    float M[4][4] = {{1, 0, 0, 1}, {1, 0, 0, 2}, {1, 0, 0, 3}, {4, 0, 0, 0}};
    float p[4] = {1, 1, 1, 1};
    projectPoint(p[0], p[1], p[2], 0, 1.5, 12, 0.9980676020975903,-0.06213744155632883,0,0);
    std::cout<<p[0]<<","<<p[1]<<","<<p[2]<<","<<p[3]<<std::endl;

HEADER FILE CODE:
inline void printMatrix4x4(const float M[4][4]) {
    for (int i = 0; i < 4; ++i) {
        for (int j = 0; j < 4; ++j) {
            std::cout << M[i][j] << " ";
        }
        std::cout << std::endl;
    }
}


inline void quaternionToRotationMatrix(const float q[4], float M[4][4]) {
    float w = q[0], x = q[1], y = q[2], z = q[3];
    std::cout<<"Quaternion:"<<w<<"+"<<x<<"i+"<<y<<"j+"<<z<<"k" <<std::endl;


    float xx = x * x, yy = y * y, zz = z * z;
    float xy = x * y, xz = x * z, yz = y * z;
    float wx = w * x, wy = w * y, wz = w * z;

    M[0][0] = 1 - 2 * (yy + zz);
    M[0][1] = 2 * (xy - wz);
    M[0][2] = 2 * (xz + wy);
    M[0][3] = 0;

    M[1][0] = 2 * (xy + wz);
    M[1][1] = 1 - 2 * (xx + zz);
    M[1][2] = 2 * (yz - wx);
    M[1][3] = 0;

    M[2][0] = 2 * (xz - wy);
    M[2][1] = 2 * (yz + wx);
    M[2][2] = 1 - 2 * (xx + yy);
    M[2][3] = 0;

    M[3][0] = 0;
    M[3][1] = 0;
    M[3][2] = 0;
    M[3][3] = 1;
}

inline void transpose3x3(float M[4][4]) {
    float temp = M[0][1];
    M[0][1] = M[1][0];
    M[1][0] = temp;
    temp = M[0][2];
    M[0][2] = M[2][0];
    M[2][0] = temp;
    temp = M[1][2];
    M[1][2] = M[2][1];
    M[2][1] = temp;
}

inline void cameraToWorldMatrix(const float p[3], const float q[4], float M[4][4]) {
    quaternionToRotationMatrix(q, M);
    M[0][3] = p[0];
    M[1][3] = p[1];
    M[2][3] = p[2];
}

inline void worldToCameraMatrix(const float p[3], const float q[4], float M[4][4]) {
    quaternionToRotationMatrix(q, M);
    std::cout<<"quatToRot" <<std::endl;
    printMatrix4x4(M);
    transpose3x3(M);
    std::cout<<"quatToRotTrans" <<std::endl;
    printMatrix4x4(M);
    float tx = -(M[0][0] * p[0] + M[0][1] * p[1] + M[0][2] * p[2]);
    float ty = -(M[1][0] * p[0] + M[1][1] * p[1] + M[1][2] * p[2]);
    float tz = -(M[2][0] * p[0] + M[2][1] * p[1] + M[2][2] * p[2]);
    M[0][3] = tx;
    M[1][3] = ty;
    M[2][3] = tz;
    std::cout<<"final" <<std::endl;
    printMatrix4x4(M);
}

inline void multiplyMatrix(const float M[4][4], float v[4]) {
    const float temp[] = {v[0], v[1], v[2], v[3]};
    v[0] = M[0][0]*temp[0] + M[0][1]*temp[1] + M[0][2]*temp[2] + M[0][3]*temp[3];
    v[1] = M[1][0]*temp[0] + M[1][1]*temp[1] + M[1][2]*temp[2] + M[1][3]*temp[3];
    v[2] = M[2][0]*temp[0] + M[2][1]*temp[1] + M[2][2]*temp[2] + M[2][3]*temp[3];
    v[3] = M[3][0]*temp[0] + M[3][1]*temp[1] + M[3][2]*temp[2] + M[3][3]*temp[3];
}

inline void perspectiveMatrix(float fovDegrees, float aspect, float near, float far, float P[4][4]) {
    float fovRad = fovDegrees * 3.14159265 / 180.0;
    float f = 1.0 / tan(fovRad / 2.0);

    P[0][0] = f / aspect;
    P[0][1] = 0;
    P[0][2] = 0;
    P[0][3] = 0;

    P[1][0] = 0;
    P[1][1] = f;
    P[1][2] = 0;
    P[1][3] = 0;

    P[2][0] = 0;
    P[2][1] = 0;
    P[2][2] = (far + near) / (near - far);
    P[2][3] = (2 * far * near) / (near - far);

    P[3][0] = 0;
    P[3][1] = 0;
    P[3][2] = -1;
    P[3][3] = 0;
}

inline void projectPoint(float x, float y, float z, float cpx, float cpy, float cpz, float cqr, float cqi, float cqj, float cqk) {
    float worldPos[] = {x, y, z, 1.0};
    float p[] = {cpx, cpy, cpz};
    float q[] = {cqr, cqi, cqj, cqk};
    float viewMatrix[4][4];
    float projectionMatrix[4][4];

    // world → camera
    worldToCameraMatrix(p, q, viewMatrix);
    std::cout<<"worldToCamera" <<std::endl;
    printMatrix4x4(viewMatrix);
    multiplyMatrix(viewMatrix, worldPos);

    // camera → clip
    perspectiveMatrix(75, 5.490812849770126, 0.1, 1000, projectionMatrix);
    std::cout<<"Projection" <<std::endl;
    printMatrix4x4(projectionMatrix);
    multiplyMatrix(projectionMatrix, worldPos);

    // perspective divide → NDC
    float ndcX = worldPos[0] / worldPos[3];
    float ndcY = worldPos[1] / worldPos[3];

    float screenX = (ndcX + 1.0) * 0.5 * 1280;
    float screenY = (1.0 - ndcY) * 0.5 * 233;
    std::cout << "(x,y)=(" <<screenX<<", "<<screenY<<")" <<std::endl;
}
*/
