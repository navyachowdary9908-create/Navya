cmake_minimum_required(VERSION 3.16)
project(AppointmentScheduler CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find SQLite3
find_package(SQLite3 REQUIRED)

add_executable(appointment-scheduler
    server.cpp
    database.cpp
)

target_include_directories(appointment-scheduler PRIVATE ${SQLite3_INCLUDE_DIRS})
target_link_libraries(appointment-scheduler PRIVATE ${SQLite3_LIBRARIES} pthread)
