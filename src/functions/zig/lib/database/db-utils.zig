const std = @import("std");
const pg = @import("pg");

// Define some custom errors for clarity.
const Error = error{
    ConnectionFailed,
    QueryFailed,
};

export fn establish_db_connection() void {}
