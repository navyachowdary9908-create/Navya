// ============================================================
//  Appointment Scheduler - Database Layer (SQL/SQLite)
// ============================================================
#ifndef DATABASE_H
#define DATABASE_H

#include <string>
#include <vector>
#include <sqlite3.h>

// ---------------------------------------------------------------------------
//  Appointment record structure
// ---------------------------------------------------------------------------
struct Appointment {
    int id;
    std::string title;
    std::string description;
    std::string startTime;   // ISO date-time (YYYY-MM-DD HH:MM:SS)
    std::string endTime;     // ISO date-time (YYYY-MM-DD HH:MM:SS)
    std::string userId;      // User ID (defaults to "1" = default demo user)
    std::string color;       // Color label for visual grouping
    std::string status;      // confirmed | pending | cancelled | completed
    std::string createdAt;   // ISO date-time (YYYY-MM-DD HH:MM:SS)
};

class Database {
public:
    Database() : db_(nullptr) {}
    ~Database() { close(); }

    // Initialize database, create table if not exists
    bool init(const std::string &dbName);

    // CRUD operations
    bool addAppointment(const std::string &title,
                        const std::string &description,
                        const std::string &start_time,
                        const std::string &end_time,
                        const std::string &user_id,
                        const std::string &color);

    bool updateAppointment(int id,
                           const std::string &title,
                           const std::string &description,
                           const std::string &start_time,
                           const std::string &end_time,
                           const std::string &user_id,
                           const std::string &color);

    int deleteAppointment(int id);

    // Query operations
    void getAllAppointments(std::vector<Appointment> &rows) const;
    void getAppointmentsByStatus(std::vector<Appointment> &rows,
                                 const std::string &status) const;
    void searchAppointments(std::vector<Appointment> &rows, const std::string &q) const;

    int getLastId() const { return lastId_; }

    // Utility
    void seedSampleData();

    void close();
    bool isOpen() const { return db_ != nullptr; }

private:
    sqlite3 *db_;
    int lastId_;

    bool exec(const std::string &sql);
    void bindText(sqlite3_stmt *stmt, int idx, const std::string &val);
};

#endif // DATABASE_H
