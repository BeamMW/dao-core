cmake_minimum_required(VERSION 3.18)

add_executable(generate-sid generate_sid.cpp)
target_link_libraries(generate-sid PRIVATE bvm utility beam)

add_test_snippet(shader_test bvm beam)
target_include_directories(shader_test PUBLIC ${CMAKE_CURRENT_BINARY_DIR})

add_shader(shader_test contract)

add_custom_target(make_header
	COMMAND generate-sid contract.wasm > contract_sid.i
	COMMENT "Generating SID ..."
	DEPENDS generate-sid contract_target
)

add_dependencies(shader_test make_header)

