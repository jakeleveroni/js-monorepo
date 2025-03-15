const std = @import("std");
const spin = @import("spin");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("content-type: text/plain\n\n", .{});
    try stdout.print("Hello, World!2\n", .{});
}
