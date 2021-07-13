cmake_minimum_required(VERSION 3.18)

set(BEAM_SIDGEN_BUILD_TYPE Release)


add_custom_target (generate_sid_target
	COMMAND ${CMAKE_COMMAND} 
								-DCMAKE_BUILD_TYPE=Release
								-DBEAM_SHADER_TESTS_ENABLED=TRUE
								${PROJECT_SOURCE_DIR}
	COMMAND ${CMAKE_COMMAND} --build . --parallel --target generate-sid --config ${BEAM_SIDGEN_BUILD_TYPE}
)

add_executable(contract contract.cpp)

add_custom_target(make_header
	COMMAND beam/bvm/sid_generator/${BEAM_SIDGEN_BUILD_TYPE}/generate-sid contract.wasm > ${PROJECT_SOURCE_DIR}/shaders/contract_sid.i
	COMMAND ${CMAKE_COMMAND} -E copy contract.wasm ${PROJECT_SOURCE_DIR}/shaders/contract.wasm
	COMMENT "Generating SID ..."
	DEPENDS contract generate_sid_target
)

add_executable(app app.cpp)

add_dependencies(app make_header)
add_custom_command (OUTPUT ${PROJECT_SOURCE_DIR}/shaders/app.wasm
	COMMAND ${CMAKE_COMMAND} -E copy app.wasm ${PROJECT_SOURCE_DIR}/shaders/app.wasm
	DEPENDS app
)