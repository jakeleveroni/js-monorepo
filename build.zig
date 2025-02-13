const std = @import("std");

pub fn build(b: *std.Build) !void {
    try buildFetch(b);
    // buildWasm(b);
}

fn buildFetch(b: *std.Build) !void {
    const exe = b.addExecutable(.{
        .name = "fetch-git-repos", // Output file name
        .root_source_file = b.path("src/zig/fetch-git-function.zig"), // Main function file
        .target = b.standardTargetOptions(.{
            .default_target = .{ .cpu_arch = .wasm32, .os_tag = .wasi }, // Compile for WebAssembly WASI
        }),
        .optimize = b.standardOptimizeOption(.{}),
    });

    exe.addSystemIncludePath(b.path("/usr/include"));
    exe.linkSystemLibrary("curl");
    exe.linkLibC();

    // output from `pkg-config --cflags libcurl`
    // exe.addCFlags("-DWITH_GZFILEOP");

    // Install the compiled WASM module
    b.installArtifact(exe);
}

fn buildWasm(b: *std.Build) !void {
    const src_dir = "src/zig";
    // const out_dir_path = "zerger/functions";

    var dir = try std.fs.cwd().openDir(src_dir, .{ .iterate = true });
    defer dir.close();

    var it = dir.iterate();

    while (it.next() catch null) |entry| {
        if (entry.kind == .file and std.mem.endsWith(u8, entry.name, ".zig")) {
            // Manually construct the file path
            var full_path_buf: [std.fs.MAX_PATH_BYTES]u8 = undefined;
            const src_path = std.fmt.bufPrint(&full_path_buf, "{s}/{s}", .{ src_dir, entry.name }) catch |err| {
                std.debug.print("Failed to construct path: {}\n", .{err});
                return;
            };

            std.log.debug("Building {s}", .{src_path});

            // Create a build step for the WASM module
            const exe_name = entry.name[0 .. entry.name.len - 4];
            const exe = b.addExecutable(.{
                .name = exe_name, // Output file name
                .root_source_file = b.path(src_path), // Main function file
                .target = b.standardTargetOptions(.{
                    .default_target = .{ .cpu_arch = .wasm32, .os_tag = .wasi }, // Compile for WebAssembly WASI
                }),
                .optimize = b.standardOptimizeOption(.{}),
            });

            // Install the compiled WASM module
            b.installArtifact(exe);
        }
    }
}
