#pragma once

#include <array>
#include <iostream>
#include <iomanip>

/** 
 * @typedef Matrix4x4
 * @brief Matrix object typedef with 4x4 size  
 * */
using Matrix4x4 = std::array<std::array<float, 4>, 4>;

/**
 * Prints a matrix to the console.
 *
 * @param M  The 4x4 matrix to be printed
 */
inline void printMatrix4x4(const Matrix4x4& M) {
    
    std::cout << std::fixed << std::setprecision(4);
    
    for (int i = 0; i < 4; ++i) {
        std::cout << "[ ";
        for (int j = 0; j < 4; ++j) {
            std::cout << std::setw(10) << M[i][j] << " ";
        }
        std::cout << "]\n";
    }

}

/**
 * Multiplies two 4x4 matrices.
 *
 * @param M1  The first 4x4 matrix to be multiplied
 * @param M2  The second 4x4 matrix to be multiplied
 */

inline Matrix4x4 operator*(const Matrix4x4& M1, const Matrix4x4& M2) {
    Matrix4x4 M3;
    for (int i = 0; i < 4; ++i) {
        for (int j = 0; j < 4; ++j) {
            float rowColSum = 0;
            for (int k = 0; k < 4; ++k) {
                rowColSum += M1[i][k]*M2[k][j];
            }
            M3[i][j] = rowColSum;
        }
    }
    return M3;
}