cmake_minimum_required(VERSION 3.18)

add_test_snippet(shader_test bvm beam)
target_include_directories(shader_test PUBLIC ${PROJECT_SOURCE_DIR}/shaders)


add_shader(shader_test contract )
add_shader(shader_test app)

add_dependencies(app_target contract_target)

add_custom_target(make_header
	COMMAND generate-sid ${PROJECT_SOURCE_DIR}/shaders/contract.wasm > ${PROJECT_SOURCE_DIR}/shaders/contract_sid.i
	COMMENT "Generating SID ..."
	DEPENDS generate-sid contract_target
)

add_dependencies(shader_test make_header)

