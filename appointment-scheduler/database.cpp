
bool Database::init(const std::string &dbName) {
    int rc = sqlite3_open(dbName.c_str(), &db_);
    if (rc != SQLITE_OK) {
        std::cerr << "Cannot open database: " << sqlite3_errmsg(db_) << std::endl;
        db_ = nullptr;
        return false;
    }

    // Enable foreign keys
    sqlite3_exec(db_, "PRAGMA foreign_keys = ON;", nullptr, nullptr, nullptr);

    // Create appointments table
    const char *sql =
        "CREATE TABLE IF NOT EXISTS appointments (" \
        "id INTEGER PRIMARY KEY AUTOINCREMENT," \
        "title TEXT NOT NULL," \
        "description TEXT DEFAULT ''," \
        "start_time TEXT NOT NULL," \
        "end_time TEXT NOT NULL," \
        "user_id TEXT DEFAULT '1'," \
        "color TEXT DEFAULT '#4f46e5'," \
        "status TEXT DEFAULT 'pending'," \
        "created_at TEXT DEFAULT (datetime('now'))" \
        ");";

    if (!exec(sql)) {
        sqlite3_close(db_);
        db_ = nullptr;
        return false;
    }

    std::cout << "[DB] Table 'appointments' ready." << std::endl;
    return true;
}

bool Database::exec(const std::string &sql) {
    char *errMsg = nullptr;
    int rc = sqlite3_exec(db_, sql.c_str(), nullptr, nullptr, &errMsg);
    if (rc != SQLITE_OK) {
        std::cerr << "SQL error: " << errMsg << std::endl;
        sqlite3_free(errMsg);
        return false;
    }
    return true;
}


bool Database::addAppointment(const std::string &title,
                              const std::string &description,
                              const std::string &start_time,
                              const std::string &end_time,
                              const std::string &user_id,
                              const std::string &color) {
    const char *sql =
        "INSERT INTO appointments (title, description, start_time, end_time, user_id, color, status) "
        "VALUES (?, ?, ?, ?, ?, ?, 'pending');";

    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return false;
    }

    bindText(stmt, 1, title);
    bindText(stmt, 2, description);
    bindText(stmt, 3, start_time);
    bindText(stmt, 4, end_time);
    bindText(stmt, 5, user_id);
    bindText(stmt, 6, color);

bool Database::updateAppointment(int id,
                                 const std::string &title,
                                 const std::string &description,
                                 const std::string &start_time,
                                 const std::string &end_time,
                                 const std::string &user_id,
                                 const std::string &color) {
    const char *sql =
        "UPDATE appointments SET "
        "title = ?, description = ?, start_time = ?, end_time = ?, "
        "user_id = ?, color = ? "
        "WHERE id = ?;";

    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return false;
    }

    bindText(stmt, 1, title);

int Database::deleteAppointment(int id) {
    const char *sql = "DELETE FROM appointments WHERE id = ?;";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return 0;
    }

    sqlite3_bind_int(stmt, 1, id);
    rc = sqlite3_step(stmt);
    if (rc != SQLITE_DONE) {
        std::cerr << "Failed to delete appointment: " << sqlite3_errmsg(db_) << std::endl;
        sqlite3_finalize(stmt);

void Database::getAllAppointments(std::vector<Appointment> &rows) const {
    const char *sql = "SELECT id, title, description, start_time, end_time, user_id, color, status, created_at FROM appointments ORDER BY start_time ASC;";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return;
    }

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Appointment a;
        a.id = sqlite3_column_int(stmt, 0);
        a.title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        a.description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        a.startTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        a.endTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        a.userId = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        a.color = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
        a.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        a.createdAt = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
        rows.push_back(a);
    }

    sqlite3_finalize(stmt);

void Database::searchAppointments(std::vector<Appointment> &rows, const std::string &q) const {
    std::string sql = "SELECT id, title, description, start_time, end_time, user_id, color, status, created_at FROM appointments WHERE title LIKE ? OR description LIKE ? ORDER BY start_time ASC;";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, sql.c_str(), -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return;
    }

    std::string like = "%" + q + "%";
    sqlite3_bind_text(stmt, 1, like.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, like.c_str(), -1, SQLITE_TRANSIENT);

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Appointment a;
        a.id = sqlite3_column_int(stmt, 0);

void Database::seedSampleData() {
    // Check if there are any appointments already
    const char *countSql = "SELECT COUNT(*) FROM appointments;";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, countSql, -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare count statement" << std::endl;
        return;
    }

    int count = 0;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        count = sqlite3_column_int(stmt, 0);
    }
    sqlite3_finalize(stmt);

    if (count > 0) {
        std::cout << "[DB] Skipping sample data (already have " << count << " appointments)" << std::endl;
        return;
    }

    // Add sample appointments
    const char *samples[][7] = {
        {"Team Standup", "Weekly team synchronisation", "2026-10-08 09:00:00", "2026-10-08 09:30:00", "1", "#3b82f6"},
        {"Design Review", "Review new UI mockups", "2026-10-08 14:00:00", "2026-10-08 15:00:00", "1", "#10b981"},
        {"Client Call", "Discuss new project requirements", "2026-10-09 11:00:00", "2026-10-09 12:00:00", "1", "#f59e0b"},
        {"Project Planning", "Plan Q4 roadmap", "2026-10-10 10:00:00", "2026-10-10 12:00:00", "1", "#8b5cf6"},
        {"Code Review", "Review pull request #42", "2026-10-11 15:00:00", "2026-10-11 16:00:00", "1", "#ef4444"},
    };

    for (const auto &s : samples) {
        addAppointment(s[0], s[1], s[2], s[3], s[4], s[5]);
    }
    std::cout << "[DB] Added " << sizeof(samples)/sizeof(samples[0]) << " sample appointments" << std::endl;
}

void Database::close() {
    if (db_) {
        sqlite3_close(db_);
        db_ = nullptr;
    }
}

        a.title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        a.description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        a.startTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        a.endTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        a.userId = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        a.color = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
        a.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        a.createdAt = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
        rows.push_back(a);
    }

    sqlite3_finalize(stmt);
}

}

void Database::getAppointmentsByStatus(std::vector<Appointment> &rows,
                                       const std::string &status) const {
    std::string sql = "SELECT id, title, description, start_time, end_time, user_id, color, status, created_at FROM appointments WHERE status = ? ORDER BY start_time ASC;";
    sqlite3_stmt *stmt;
    int rc = sqlite3_prepare_v2(db_, sql.c_str(), -1, &stmt, nullptr);
    if (rc != SQLITE_OK) {
        std::cerr << "Failed to prepare statement: " << sqlite3_errmsg(db_) << std::endl;
        return;
    }

    sqlite3_bind_text(stmt, 1, status.c_str(), -1, SQLITE_TRANSIENT);

    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Appointment a;
        a.id = sqlite3_column_int(stmt, 0);
        a.title = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        a.description = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        a.startTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        a.endTime = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        a.userId = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
        a.color = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
        a.status = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
        a.createdAt = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
        rows.push_back(a);
    }

    sqlite3_finalize(stmt);
}

        return 0;
    }

    int changes = sqlite3_changes(db_);
    sqlite3_finalize(stmt);
    std::cout << "[DB] Deleted appointment " << id << " (" << changes << " row(s))" << std::endl;
    return changes;
}

    bindText(stmt, 2, description);
    bindText(stmt, 3, start_time);
    bindText(stmt, 4, end_time);
    bindText(stmt, 5, user_id);
    bindText(stmt, 6, color);
    sqlite3_bind_int(stmt, 7, id);

    rc = sqlite3_step(stmt);
    if (rc != SQLITE_DONE) {
        std::cerr << "Failed to update appointment: " << sqlite3_errmsg(db_) << std::endl;
        sqlite3_finalize(stmt);
        return false;
    }

    int changes = sqlite3_changes(db_);
    sqlite3_finalize(stmt);
    if (changes == 0) {
        std::cout << "[DB] No appointment found with id " << id << std::endl;
    } else {
        std::cout << "[DB] Updated appointment " << id << " (" << changes << " row(s))" << std::endl;
    }
    return true;
}


    rc = sqlite3_step(stmt);
    if (rc != SQLITE_DONE) {
        std::cerr << "Failed to insert appointment: " << sqlite3_errmsg(db_) << std::endl;
        sqlite3_finalize(stmt);
        return false;
    }

    lastId_ = static_cast<int>(sqlite3_last_insert_rowid(db_));
    sqlite3_finalize(stmt);
    std::cout << "[DB] Inserted appointment ID " << lastId_ << std::endl;
    return true;
}

void Database::bindText(sqlite3_stmt *stmt, int idx, const std::string &val) {
    sqlite3_bind_text(stmt, idx, val.c_str(), -1, SQLITE_TRANSIENT);
}

