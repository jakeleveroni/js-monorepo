const std = @import("std");
const c = @cImport(@cInclude("curl/curl.h"));

const url = "https://api.github.com/search/repositories?q=stars:>10000&sort=updated&per_page=100";

pub fn main() !void {
    // var gpa = std.heap.GeneralPurposeAllocator(.{});
    // const allocator = gpa.allocator();

    if (c.curl_global_init(c.CURL_GLOBAL_ALL) != 0) {
        std.debug.print("Failed to initialize libcurl\n", .{});
        return error.CurlInitFailed;
    }

    const curl = c.curl_easy_init();
    if (curl == null) {
        std.debug.print("Failed to create curl handle\n", .{});
        c.curl_global_cleanup();
        return error.CurlHandleInitFailed;
    }

    _ = c.curl_easy_setopt(curl, c.CURLOPT_URL, url);

    const res = c.curl_easy_perform(curl);
    if (res != c.CURLE_OK) {
        std.debug.print("Curl request failed {s}\n", .{c.curl_easy_strerror(res)});
    }

    c.curl_easy_cleanup();
    c.curl_global_cleanup();
}
