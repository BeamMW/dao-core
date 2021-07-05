cmake_minimum_required(VERSION 3.18)
project(beam-dao-core)

set(CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/beam/cmake" ${CMAKE_MODULE_PATH})

include_directories(beam/bvm)

if(NOT BEAM_TESTS_ENABLED)

    set(CMAKE_EXECUTABLE_SUFFIX .wasm)

    set(BEAM_CLANG_OPTIONS
        -O3 
        -std=c++17 
        -flto
        -fno-rtti 
        -fno-exceptions
        -nostdlib 
        -Wl,--export-dynamic,--no-entry,--allow-undefined)

    string (REPLACE ";" " " BEAM_CLANG_OPTIONS_STR "${BEAM_CLANG_OPTIONS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${BEAM_CLANG_OPTIONS_STR}")

    add_subdirectory(shaders)
else()
    add_subdirectory(unittests)
endif()