INSERT INTO staff_shifts (
shift_name,
start_time,
end_time,
grace_minutes,
shift_status,
notes
) VALUES
('Morning Shift', '08:00:00', '16:00:00', 10, 'ACTIVE', 'Standard morning restaurant shift'),
('Evening Shift', '16:00:00', '23:00:00', 10, 'ACTIVE', 'Standard evening restaurant shift'),
('Full Day Shift', '08:00:00', '23:00:00', 15, 'ACTIVE', 'Long shift for management or special duty');
