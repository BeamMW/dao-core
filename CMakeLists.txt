cmake_minimum_required(VERSION 3.17)
project(beam-dao-core)

set(CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/beam/cmake" ${CMAKE_MODULE_PATH})

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(AddTest)
include(AddShader)

include_directories(beam/bvm)

option(BEAM_SHADER_TESTS_ENABLED "Build shader test" TRUE)

if(NOT BEAM_SHADER_TESTS_ENABLED)

    set(CMAKE_EXECUTABLE_SUFFIX .wasm)

    string (REPLACE ";" " " BEAM_SHADER_CLANG_OPTIONS_STR "${BEAM_SHADER_CLANG_OPTIONS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${BEAM_SHADER_CLANG_OPTIONS_STR}")

    add_subdirectory(shaders)
else()
    #set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
    set(BEAM_BVM_ONLY TRUE)
    set(BEAM_ATOMIC_SWAP_SUPPORT FALSE)
    set(BEAM_WALLET_CLIENT_LIBRARY TRUE)
    set(BEAM_TESTS_ENABLED FALSE)
    add_subdirectory(beam)
    add_subdirectory(unittests)
endif()