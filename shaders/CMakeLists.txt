cmake_minimum_required(VERSION 3.18)

file(TOUCH ${CMAKE_CURRENT_BINARY_DIR}/contract_sid.i )

add_executable(contract contract.cpp)
target_include_directories(contract PUBLIC ${CMAKE_CURRENT_BINARY_DIR})

add_custom_target(make_header
	COMMAND generate-sid contract.wasm > contract_sid.i
	COMMENT "Generating SID ..."
	DEPENDS contract
)

add_executable(app app.cpp)
target_include_directories(app PUBLIC ${CMAKE_CURRENT_BINARY_DIR})

add_dependencies(app make_header)