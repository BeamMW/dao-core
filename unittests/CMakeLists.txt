cmake_minimum_required(VERSION 3.17)

add_test_snippet(shader_test bvm beam)
target_include_directories(shader_test PUBLIC ${PROJECT_SOURCE_DIR}/shaders)


add_shader(contract ${PROJECT_SOURCE_DIR}/shaders)
add_shader(app ${PROJECT_SOURCE_DIR}/shaders)


add_custom_target(make_header
    ALL
    COMMAND generate-sid ${PROJECT_SOURCE_DIR}/shaders/contract.wasm > ${PROJECT_SOURCE_DIR}/shaders/contract_sid.i
    COMMENT "Generating SID ..."
    DEPENDS generate-sid contract_target
)

add_dependencies(shader_test make_header)
add_dependencies(app_target make_header)
