project(ApiJsClient NONE) # NONE - don't enable and search for a C++ compiler - works faster

# Add targets
add_custom_target( WebApi ) # target is excluded from usual build (ALL removed)

add_custom_command(
	TARGET WebApi
	PRE_BUILD
	COMMAND npm run build
	WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

# this line is required to build WebApi on INSTALL step invocation only (to avoid double building)
install(CODE "execute_process(COMMAND \"${CMAKE_COMMAND}\" --build \"${CMAKE_CURRENT_BINARY_DIR}\" --target WebApi)")
