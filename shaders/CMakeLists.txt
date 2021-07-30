cmake_minimum_required(VERSION 3.17)

include(GenerateSID)

add_executable(contract contract.cpp)
copy_shader(contract)
generate_sid_header(contract)

add_executable(app app.cpp)

add_dependencies(app contract_header)
copy_shader(app)