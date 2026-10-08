// ============================================================
//  Appointment Scheduler - C++ HTTP Backend Server
//  Compile: g++ -std=c++17 -O2 -o server server.cpp -lpthread -lsqlite3
//  Run:     ./server [port]  (default port: 8080)
// ============================================================
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <cstring>
#include <cstdlib>
#include <ctime>
#include <sstream>
#include <thread>
#include <mutex>
#include <csignal>
#include <fstream>
#include <atomic>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include "database.h"

const int DEFAULT_PORT = 8080;
const int MAX_CONNECTIONS = 100;
const int BUFFER_SIZE = 4096;

Database        g_db;
std::mutex      g_mutex;
std::atomic<bool> g_running{true};
std::map<int, std::string> g_client_buffers;

static std::string httpEscape(const std::string &s) {
    std::string out;
    for (char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            default: out += c; break;
        }
    }
    return out;
}

static std::string httpBuildJson(const std::map<std::string, std::string> &fields) {
    std::ostringstream ss;
    ss << "{";
    bool first = true;
    for (const auto &kv : fields) {
        if (!first) ss << ",";
        first = false;
        ss << "\"" << kv.first << "\":\"" << kv.second << "\"";

// ---------------------------------------------------------------------------
//  Request handlers
// ---------------------------------------------------------------------------

// --- GET / ------------------------------------------------------------
static void handleGetRoot(int client) {
    std::ifstream ifs("public/index.html");
    if (ifs) {
        std::string html((std::istreambuf_iterator<char>(ifs)),
                         std::istreambuf_iterator<char>());
        ifs.close();

// --- GET /api/appointments --------------------------------------------
static void handleGetAppointments(int client, const std::string &query) {
    std::map<std::string, std::string> params = parseForm(query);
    std::string status_filter = getParam(params, "status");
    std::string q = getParam(params, "q");

    std::vector<Appointment> rows;
    if (!status_filter.empty()) {
        g_db.getAppointmentsByStatus(rows, status_filter);
    } else if (!q.empty()) {
        g_db.searchAppointments(rows, q);
    } else {
        g_db.getAllAppointments(rows);
    }

    std::ostringstream body;
    body << "[";
    for (size_t i = 0; i < rows.size(); ++i) {
        if (i > 0) body << ",";
        body << "{\"id\":" << rows[i].id
             << ",\"title\":\"" << htmlEscape(rows[i].title) << "\""
             << ",\"description\":\"" << htmlEscape(rows[i].description) << "\""
             << ",\"start_time\":\"" << rows[i].startTime << "\""
             << ",\"end_time\":\"" << rows[i].endTime << "\""
             << ",\"status\":\"" << rows[i].status << "\""
             << ",\"user_id\":" << rows[i].userId
             << ",\"color\":\"" << rows[i].color << "\""
             << ",\"created_at\":\"" << rows[i].createdAt << "\"}";
    }

// --- POST /api/appointments -------------------------------------------
static void handlePostAppointments(int client, const std::string &body) {
    std::map<std::string, std::string> fields = parseForm(body);
    std::string title = getParam(fields, "title");
    std::string description = getParam(fields, "description");
    std::string start_time = getParam(fields, "start_time");
    std::string end_time = getParam(fields, "end_time");
    std::string user_id = getParam(fields, "user_id", "1");
    std::string color = getParam(fields, "color", "#4f46e5");

    if (title.empty() || start_time.empty() || end_time.empty()) {
        std::map<std::string, std::string> err = {{"error", "title, start_time, end_time required"}};
        std::string response = httpSendJson(client, 400, err);
        send(client, response.c_str(), response.size(), 0);
        return;
    }

    g_db.addAppointment(title, description, start_time, end_time, user_id, color);
    int newId = g_db.getLastId();
    std::map<std::string, std::string> res;
    res["message"] = "Appointment created";
    res["id"] = std::to_string(newId);

// --- PUT /api/appointments/:id ----------------------------------------
static void handlePutAppointments(int client, const std::string &path, const std::string &body) {
    std::vector<std::string> parts = split(path, '/');
    if (parts.size() < 4) {
        std::map<std::string, std::string> err = {{"error", "invalid url"}};
        std::string response = httpSendJson(client, 400, err);
        send(client, response.c_str(), response.size(), 0);
        return;
    }
    int id = std::stoi(parts[3]);

    std::map<std::string, std::string> fields = parseForm(body);
    std::string title = getParam(fields, "title");
    std::string description = getParam(fields, "description");
    std::string start_time = getParam(fields, "start_time");
    std::string end_time = getParam(fields, "end_time");
    std::string user_id = getParam(fields, "user_id", "1");
    std::string color = getParam(fields, "color", "#4f46e5");

    if (title.empty() || start_time.empty() || end_time.empty()) {
        std::map<std::string, std::string> err = {{"error", "title, start_time, end_time required"}};

// --- DELETE /api/appointments/:id -------------------------------------
static void handleDeleteAppointments(int client, const std::string &path) {
    std::vector<std::string> parts = split(path, '/');
    if (parts.size() < 4) {
        std::map<std::string, std::string> err = {{"error", "invalid url"}};
        std::string response = httpSendJson(client, 400, err);
        send(client, response.c_str(), response.size(), 0);
        return;
    }
    int id = std::stoi(parts[3]);

    int affected = g_db.deleteAppointment(id);
    std::map<std::string, std::string> res;
    res["message"] = (affected > 0) ? "Appointment deleted" : "Appointment not found";

// --- GET /api/menu ----------------------------------------------------
static void handleGetMenu(int client) {
    std::vector<std::string> menu = {"Home", "Book Appointment", "Services", "About", "Contact"};
    std::ostringstream body;
    body << "[";
    for (size_t i = 0; i < menu.size(); ++i) {
        if (i > 0) body << ",";
        body << "\"" << menu[i] << "\"";
    }
    body << "]";
    std::map<std::string, std::string> res;
    res["menu"] = body.str();
    std::string response = httpSendJson(client, 200, res);
    send(client, response.c_str(), response.size(), 0);
}

// ---------------------------------------------------------------------------
//  HTTP connection handler (thread-per-client)
// ---------------------------------------------------------------------------
static void handleConnection(int client_fd) {
    char buffer[BUFFER_SIZE];
    std::string full_request;
    bool keep_alive = false;

    while (true) {
        int n = recv(client_fd, buffer, sizeof(buffer), 0);
        if (n <= 0) break;
        full_request.append(buffer, n);
        if (full_request.find("\r\n\r\n") != std::string::npos) break;
    }

    keep_alive = full_request.find("Connection: keep-alive") != std::string::npos;

    // Parse request line: METHOD /path?query HTTP/1.1
    std::istringstream req_start(full_request);
    std::string method, path_with_query, http_ver;
    req_start >> method >> path_with_query >> http_ver;

    std::string path = path_with_query;
    std::string query;
    size_t qpos = path.find('?');
    if (qpos != std::string::npos) {
        query = path.substr(qpos + 1);
        path = path.substr(0, qpos);
    }

    // Read request body (for POST/PUT)
    std::string body;
    size_t body_start = full_request.find("\r\n\r\n");
    if (body_start != std::string::npos) {
        body = full_request.substr(body_start + 4);
        size_t content_length = 0;
        std::istringstream header_lines(full_request.substr(0, body_start));
        std::string line;
        while (std::getline(header_lines, line) && line != "\r") {
            if (line.find("Content-Length:") != std::string::npos) {
                content_length = std::stoul(line.substr(15));
            }
        }
        while (body.size() < content_length) {

int main(int argc, char *argv[]) {
    int port = DEFAULT_PORT;
    if (argc > 1) port = std::atoi(argv[1]);

    // Initialize database
    if (!g_db.init("appointments.db")) {
        std::cerr << "Failed to initialize database!" << std::endl;
        return 1;
    }
    std::cout << "[Server] Database initialized: appointments.db" << std::endl;
    g_db.seedSampleData();

    // Create socket
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        std::cerr << "Failed to create socket!" << std::endl;
        return 1;
    }

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    if (bind(server_fd, (sockaddr*)&address, sizeof(address)) < 0) {
        std::cerr << "Failed to bind to port " << port << ". Try a different port." << std::endl;
        close(server_fd);
        return 1;
    }

    listen(server_fd, MAX_CONNECTIONS);
    std::cout << "[Server] Listening on http://0.0.0.0:" << port << std::endl;
    std::cout << "[Server] Press Ctrl+C to stop." << std::endl;

    // Handle SIGINT for graceful shutdown
    struct sigaction sa;
    sa.sa_handler = [](int) { g_running = false; };
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    sigaction(SIGINT, &sa, nullptr);

    // Accept loop
    while (g_running) {
        sockaddr_in client_addr;
        socklen_t addr_len = sizeof(client_addr);
        int client_fd = accept(server_fd, (sockaddr*)&client_addr, &addr_len);
        if (client_fd < 0) {
            if (!g_running) break;
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            continue;
        }
        // Handle each connection in its own thread
        std::thread(handleConnection, client_fd).detach();
    }

    close(server_fd);
    g_db.close();
    std::cout << "[Server] Shutdown complete." << std::endl;
    return 0;
}

            int n = recv(client_fd, buffer, sizeof(buffer), 0);
            if (n <= 0) break;
            body.append(buffer, n);
        }
    }

    std::lock_guard<std::mutex> lock(g_mutex);

    // --- Route handling ---
    if (method == "OPTIONS") {
        std::ostringstream resp;
        resp << "HTTP/1.1 204 No Content\r\n";
        resp << "Access-Control-Allow-Origin: *\r\n";
        resp << "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n";
        resp << "Access-Control-Allow-Headers: Content-Type\r\n";
        resp << "Content-Length: 0\r\n";
        resp << "Connection: close\r\n\r\n";
        send(client_fd, resp.str().c_str(), resp.str().size(), 0);
    } else if (method == "GET" && path == "/") {
        handleGetRoot(client_fd);
    } else if (method == "GET" && path == "/api/appointments") {
        handleGetAppointments(client_fd, query);
    } else if (method == "POST" && path == "/api/appointments") {
        handlePostAppointments(client_fd, body);
    } else if (method == "PUT" && path.find("/api/appointments/") == 0) {
        handlePutAppointments(client_fd, path, body);
    } else if (method == "DELETE" && path.find("/api/appointments/") == 0) {
        handleDeleteAppointments(client_fd, path);
    } else if (method == "GET" && path == "/api/menu") {
        handleGetMenu(client_fd);
    } else {
        handleNotFound(client_fd);
    }

    if (!keep_alive) close(client_fd);
}


// --- 404 --------------------------------------------------------------
static void handleNotFound(int client) {
    std::map<std::string, std::string> err = {{"error", "Not Found"}};
    std::string response = httpSendJson(client, 404, err);
    send(client, response.c_str(), response.size(), 0);
}

    std::string response = httpSendJson(client, 200, res);
    send(client, response.c_str(), response.size(), 0);
}

        std::string response = httpSendJson(client, 400, err);
        send(client, response.c_str(), response.size(), 0);
        return;
    }

    g_db.updateAppointment(id, title, description, start_time, end_time, user_id, color);
    std::map<std::string, std::string> res = {{"message", "Appointment updated"}};
    std::string response = httpSendJson(client, 200, res);
    send(client, response.c_str(), response.size(), 0);
}

    std::string response = httpSendJson(client, 201, res);
    send(client, response.c_str(), response.size(), 0);
}

    body << "]";

    std::string json = body.str();
    std::ostringstream resp;
    resp << "HTTP/1.1 200 OK\r\n";
    resp << "Content-Type: application/json\r\n";
    resp << "Access-Control-Allow-Origin: *\r\n";
    resp << "Content-Length: " << json.size() << "\r\n";
    resp << "Connection: close\r\n\r\n";
    resp << json;
    send(client, resp.str().c_str(), resp.str().size(), 0);
}

        std::string response = httpSendHtml(html);
        send(client, response.c_str(), response.size(), 0);
    } else {
        std::string response = httpSendText(500, "index.html not found");
        send(client, response.c_str(), response.size(), 0);
    }
}

    }
    ss << "}";
    return ss.str();
}

static std::string httpSendJson(int client, int status, const std::map<std::string, std::string> &data) {
    std::ostringstream resp;
    resp << "HTTP/1.1 " << status << " OK\r\n";
    resp << "Content-Type: application/json\r\n";
    resp << "Access-Control-Allow-Origin: *\r\n";
    resp << "Content-Length: " << data.size() << "\r\n";
    resp << "Connection: close\r\n\r\n";
    resp << httpBuildJson(data);
    return resp.str();
}

static std::string httpSendHtml(const std::string &html) {
    std::ostringstream resp;
    resp << "HTTP/1.1 200 OK\r\n";
    resp << "Content-Type: text/html; charset=utf-8\r\n";
    resp << "Content-Length: " << html.size() << "\r\n";
    resp << "Connection: close\r\n\r\n";
    resp << html;
    return resp.str();
}

static std::string httpSendText(int status, const std::string &text) {
    std::ostringstream resp;
    resp << "HTTP/1.1 " << status << " OK\r\n";
    resp << "Content-Type: text/plain\r\n";
    resp << "Content-Length: " << text.size() << "\r\n";
    resp << "Connection: close\r\n\r\n";
    resp << text;
    return resp.str();
}

static std::string trim(const std::string &s) {
    size_t a = s.find_first_not_of(" \t\r\n");
    if (a == std::string::npos) return "";
    size_t b = s.find_last_not_of(" \t\r\n");
    return s.substr(a, b - a + 1);
}

static std::string urlDecode(const std::string &s) {
    std::string out;
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '%' && i + 2 < s.size()) {
            int h = std::stoi(s.substr(i+1,2), nullptr, 16);
            out += static_cast<char>(h);
            i += 2;
        } else if (s[i] == '+') {
            out += ' ';
        } else {
            out += s[i];
        }
    }
    return out;
}

static std::map<std::string, std::string> parseForm(const std::string &body) {
    std::map<std::string, std::string> params;
    std::istringstream ss(body);
    std::string pair;
    while (std::getline(ss, pair, '&')) {
        size_t eq = pair.find('=');
        if (eq != std::string::npos) {
            params[trim(urlDecode(pair.substr(0, eq)))] = urlDecode(pair.substr(eq+1));
        } else {\n            params[trim(pair)] = "";\n        }\n    }\n    return params;\n}\n\nstatic std::vector<std::string> split(const std::string &s, char delim) {\n    std::vector<std::string> tokens;\n    std::string token;\n    std::istringstream ss(s);\n    while (std::getline(ss, token, delim)) tokens.push_back(token);\n    return tokens;\n}\n\nstatic std::string getParam(const std::map<std::string, std::string> &fields, const std::string &key, const std::string &def = "") {\n    auto it = fields.find(key);\n    if (it != fields.end()) return it->second;\n    return def;\n}\n\nstatic std::string htmlEscape(const std::string &s) {\n    std::string out;\n    for (char c : s) {\n        switch (c) {\n            case '&': out += "&amp;"; break;\n            case '<': out += "&lt;"; break;\n            case '>': out += "&gt;"; break;\n            case '\"': out += "&quot;"; break;\n            default: out += c; break;\n        }\n    }\n    return out;\n}\n\nstatic std::string statusBadgeClass(const std::string &status) {\n    if (status == \"confirmed\") return \"badge-confirmed\";\n    if (status == \"pending\") return \"badge-pending\";\n    if (status == \"cancelled\") return \"badge-cancelled\";\n    if (status == \"completed\") return \"badge-completed\";\n    return \"badge-other\";\n}\n\nstatic std::string formatTime(const std::string &iso) {\n    if (iso.size() < 16) return iso;\n    return iso.substr(0, 16);  // YYYY-MM-DD HH:MM\n}\n