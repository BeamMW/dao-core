cmake_minimum_required(VERSION 3.18)
project(beam-dao-core)

set(CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/beam/cmake" ${CMAKE_MODULE_PATH})

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(AddTest)
include_directories(beam/bvm)

set(BEAM_CLANG_OPTIONS
        -O3 
        -Os
        -std=c++17 
        -flto
        -fno-rtti 
        -fno-exceptions
        -nostdlib 
        -Wl,--export-dynamic,--no-entry,--allow-undefined)

function (add_shader target_name kind)
    
    set(WASM_FILE_PATH ${PROJECT_SOURCE_DIR}/shaders/${kind}.wasm)

    set(SHADER_ADDITIONAL_DEP )
    if(${kind} STREQUAL "contract")
        set(SHADER_ADDITIONAL_DEP ${PROJECT_SOURCE_DIR}/shaders/${kind}.h)
    endif()

    add_custom_command(
        OUTPUT ${WASM_FILE_PATH}
        COMMAND clang 
                --target=wasm32
                -I ${PROJECT_SOURCE_DIR}/beam/bvm 
                ${BEAM_CLANG_OPTIONS} 
                ${PROJECT_SOURCE_DIR}/shaders/${kind}.cpp 
                --output ${WASM_FILE_PATH}
        COMMAND ${CMAKE_COMMAND} -E copy ${WASM_FILE_PATH} ${kind}.wasm
        COMMENT "Building shader..."
        DEPENDS ${PROJECT_SOURCE_DIR}/shaders/${kind}.cpp ${SHADER_ADDITIONAL_DEP}
        VERBATIM
    )
    add_custom_target(
        ${kind}_target 
        ALL
        DEPENDS ${WASM_FILE_PATH}
    )
    add_dependencies(
        ${target_name}
        ${kind}_target
    )

endfunction()

if(NOT BEAM_SHADER_TESTS_ENABLED)

    set(CMAKE_EXECUTABLE_SUFFIX .wasm)

    string (REPLACE ";" " " BEAM_CLANG_OPTIONS_STR "${BEAM_CLANG_OPTIONS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${BEAM_CLANG_OPTIONS_STR}")

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