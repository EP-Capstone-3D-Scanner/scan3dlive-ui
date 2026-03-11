#include "MathTypes.h"
#include "ModifiableNestedOctree.h"
#include "Points.h"
#include "Camera.h"
#include "BoundingBox.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include "robin_hood.h"
#include "tinyply.h"

void loadPointsFromCSV(std::vector<std::unique_ptr<PointXYZ>>& points, const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Failed to open " << filename << "\n";
    }

    std::string line;

    while (std::getline(file, line)) {
        if (line.empty()) continue;

        std::stringstream ss(line);
        std::string token;

        std::getline(ss, token, ',');
        float x = (float) std::stod(token);

        std::getline(ss, token, ',');
        float y = (float) std::stod(token);

        std::getline(ss, token, ',');
        float z = (float) std::stod(token);

        points.push_back(std::make_unique<PointXYZ>(x, y, z));
    }

    file.close();
    std::cout << "Loaded " << points.size() << " points\n";
}
void loadPointsXYZFromBinaryPLY(std::vector<std::unique_ptr<PointXYZRGBA>>& points, const std::string& filename) {
    std::ifstream file(filename, std::ios::binary);
    if (!file.is_open()) {
        std::cerr << "Failed to open " << filename << "\n";
    }
    std::string line;
    size_t vertexCount = 0;
    // Read header
    while (std::getline(file, line)) {
        if (line.substr(0, 14) == "element vertex") {
            vertexCount = std::stoul(line.substr(15));
        }
        if (line == "end_header") {
            break;
        }
    }
    // Read vertex data
    for (size_t i = 0; i < vertexCount; ++i) {
        float x, y, z;
        uint8_t r, g, b, a = 0;
        file.read(reinterpret_cast<char*>(&x), sizeof(float));
        file.read(reinterpret_cast<char*>(&y), sizeof(float));
        file.read(reinterpret_cast<char*>(&z), sizeof(float));
        file.read(reinterpret_cast<char*>(&r), sizeof(uint8_t));
        file.read(reinterpret_cast<char*>(&g), sizeof(uint8_t));
        file.read(reinterpret_cast<char*>(&b), sizeof(uint8_t));
        points.emplace_back(std::make_unique<PointXYZRGBA>(x, y, z, r, g, b, a));
    }
    file.close();
    std::cout << "Loaded " << points.size() << " points from binary PLY"<< std::endl;
}
int load_ply(std::vector<PointXYZRGBA>& points, const std::string& path) {
    std::ifstream file_stream(path, std::ios::binary);
    if (!file_stream) throw std::runtime_error("Could not open file: " + path);

    tinyply::PlyFile ply_file;
    ply_file.parse_header(file_stream);

    bool has_x = false, has_y = false, has_z = false;
    bool has_r = false, has_g = false, has_b = false, has_a = false;
    for (auto& e : ply_file.get_elements()) {
        if (e.name == "vertex") {
            for (auto& p : e.properties) {
                if (p.name == "x") has_x = true;
                if (p.name == "y") has_y = true;
                if (p.name == "z") has_z = true;
                if (p.name == "red")   has_r = true;
                if (p.name == "green") has_g = true;
                if (p.name == "blue")  has_b = true;
                if (p.name == "alpha") has_a = true;
            }
            break;
        }
    }

    std::shared_ptr<tinyply::PlyData> xyz, rgba;
    if (has_x && has_y && has_z) {
        xyz = ply_file.request_properties_from_element("vertex", { "x", "y", "z" });
    }

    std::vector<std::string> color_props;
    if (has_r && has_g && has_b) {
        color_props = { "red", "green", "blue" };
        if (has_a) color_props.push_back("alpha");
        rgba = ply_file.request_properties_from_element("vertex", color_props);
    }

    ply_file.read(file_stream);

    if (xyz) {
        points.reserve(xyz->count);

        const size_t pos_stride = tinyply::PropertyTable[xyz->t].stride;
        const uint8_t* pos_buf = xyz->buffer.get();

        const size_t col_stride = rgba ? tinyply::PropertyTable[rgba->t].stride : 0;
        const uint8_t* col_buf = rgba ? rgba->buffer.get() : nullptr;
        const size_t col_channels = color_props.size();

        for (size_t i = 0; i < xyz->count; ++i) {
            float x, y, z;
            uint8_t r = 0, g = 0, b = 0, a = 255;
            x = tinyply::convert_value<float>(pos_buf + (i * 3 + 0) * pos_stride, xyz->t);
            y = tinyply::convert_value<float>(pos_buf + (i * 3 + 1) * pos_stride, xyz->t);
            z = tinyply::convert_value<float>(pos_buf + (i * 3 + 2) * pos_stride, xyz->t);

            // Extract Colors (with defaults)
            if (rgba) {
                r = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 0) * col_stride, rgba->t);
                g = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 1) * col_stride, rgba->t);
                b = tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 2) * col_stride, rgba->t);
                a = has_a ? tinyply::convert_value<uint8_t>(col_buf + (i * col_channels + 3) * col_stride, rgba->t) : 255;
            }
            points.emplace_back(x, y, z, r, g, b, a);
        }

        return xyz->count;
    }
    return 0;
}

int main() {
    BoundingBox bb = BoundingBox(PointXYZ(-6, -11, 2), PointXYZ(4, 12, 3));
    Matrix4x4 worldToCamera = {{
        {{1, 0, 0, 0}}, 
        {{0, 0.9922778767136676, -0.12403473458920855, -2.220446049250313e-16}}, 
        {{0, 0.12403473458920855, 0.9922778767136676, -12.093386622447824}}, 
        {{0, 0, 0, 1}}
    }};
    Matrix4x4 projection = {{
        {{0.858501852196042, 0, 0, 0}}, 
        {{0, 1.3032253728412058, 0, 0}}, 
        {{0, 0, -1.0000002000000199, -0.00020000002000000202}}, 
        {{0, 0, -1, 1}}
    }};
    Camera c = {0, 1.5, 12, worldToCamera, projection, 1280, 161.0500030517578};
    
    std::vector<PointXYZRGBA> points;
    load_ply(points, "../assets/pcl1.ply");

    //Get bounding box of all points
    PointXYZ minPoint = points[0];
    PointXYZ maxPoint = points[0];

    for (const auto& p : points) {
        if (p.x < minPoint.x) minPoint.x = p.x;
        if (p.y < minPoint.y) minPoint.y = p.y;
        if (p.z < minPoint.z) minPoint.z = p.z;
        if (p.x > maxPoint.x) maxPoint.x = p.x;
        if (p.y > maxPoint.y) maxPoint.y = p.y;
        if (p.z > maxPoint.z) maxPoint.z = p.z;
    }

    std::cout << "Min Point: " << minPoint << std::endl;
    std::cout << "Max Point: " << maxPoint << std::endl;
    
    uint16_t originalRootId = ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID;
    ModifiableNestedOctree<PointXYZRGBA>::expandRoot(BoundingBox(minPoint, maxPoint));
    //ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].printNode();
    uint64_t checksum = 0;

    for (const auto& p : points) {
        ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].insertPoint(p);
        checksum+=1;
    }
    ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].repairLOD(originalRootId);
    //ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].printNode();
    std::cout <<"Done"<<std::endl;
    
    for(int i = 0; i < 1000; i++) {
        //ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].serializeForR3F(c, 100, 0);
    }
    std::cout << "Result: " << checksum << std::endl;
    
    //ModifiableNestedOctree<PointXYZRGBA>::MNO[ModifiableNestedOctree<PointXYZRGBA>::ROOT_ID].printNode();

    return 0;
}