CREATE TABLE staff_attendance (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
staff_id BIGINT NOT NULL,
duty_roster_id BIGINT,
attendance_date DATE NOT NULL,
clock_in_time DATETIME NULL,
clock_out_time DATETIME NULL,
attendance_status ENUM(
'PRESENT',
'LATE',
'ABSENT',
'LEFT_EARLY',
'INCOMPLETE'
) DEFAULT 'INCOMPLETE',
lateness_minutes INT DEFAULT 0,
early_leave_minutes INT DEFAULT 0,
clock_in_notes TEXT,
clock_out_notes TEXT,
FOREIGN KEY (staff_id) REFERENCES users(id),
FOREIGN KEY (duty_roster_id) REFERENCES duty_rosters(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
