#pragma once

#include <array>
#include <iostream>
#include <iomanip>

/** 
 * @typedef Matrix4x4
 * @brief Matrix object typedef with 4x4 size  
 * */
using Matrix4x4 = std::array<std::array<double, 4>, 4>;

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