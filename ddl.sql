DELIMITER //

CREATE PROCEDURE reset_gym_data()
BEGIN
  -- Drop tables in reverse order of dependencies
  DROP TABLE IF EXISTS class_attendance;
  DROP TABLE IF EXISTS gym_attendance;
  DROP TABLE IF EXISTS membership;
  DROP TABLE IF EXISTS classes;
  DROP TABLE IF EXISTS members;
  DROP TABLE IF EXISTS trainers;

  -- Create tables
  CREATE TABLE trainers (
    trainer_ID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    specialization VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    availability VARCHAR(20)
  );

  CREATE TABLE members (
    member_ID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
  );

  CREATE TABLE classes (
    class_ID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    schedule DATETIME,
    trainer_ID INT,
    capacity INT,
    FOREIGN KEY (trainer_ID) REFERENCES trainers(trainer_ID)
  );

  CREATE TABLE membership (
    membership_ID INT AUTO_INCREMENT PRIMARY KEY,
    member_ID INT,
    trainer_ID INT,
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (member_ID) REFERENCES members(member_ID),
    FOREIGN KEY (trainer_ID) REFERENCES trainers(trainer_ID)
  );

  CREATE TABLE class_attendance (
    class_ID INT,
    member_ID INT,
    date DATETIME,
    PRIMARY KEY (class_ID, member_ID, date),
    FOREIGN KEY (class_ID) REFERENCES classes(class_ID),
    FOREIGN KEY (member_ID) REFERENCES members(member_ID)
  );

  CREATE TABLE gym_attendance (
    gym_attendance_ID INT AUTO_INCREMENT PRIMARY KEY,
    member_ID INT,
    date DATETIME,
    FOREIGN KEY (member_ID) REFERENCES members(member_ID)
  );

  -- Insert sample data
  INSERT INTO trainers (name, specialization, email, phone, availability) VALUES
    ('Mike Trainer', 'Cardio', 'mike@gym.com', '555-1111', 'Available'),
    ('Sarah Coach', 'Strength', 'sarah@gym.com', '555-2222', 'Available'),
    ('Dodd Fitness', 'Yoga', 'dodd@gym.com', '555-3333', 'Unavailable');

  INSERT INTO members (name, email, phone) VALUES
    ('John Teterson', 'john@example.com', '555-1234'),
    ('Jane Dough', 'jane@example.com', '555-5678'),
    ('Bob Robert', 'bob@example.com', '555-9012');

  INSERT INTO classes (name, description, schedule, trainer_ID, capacity) VALUES
    ('Spin', 'Intense cardio workout', '2025-01-05 08:00:00', 1, 20),
    ('Crossfit', 'Weight training session', '2025-01-05 10:00:00', 2, 15),
    ('Yoga', 'Relaxing yoga session', '2025-01-06 18:00:00', 3, 25);

  INSERT INTO membership (member_ID, trainer_ID, type, start_date, end_date) VALUES
    (1, 1, 'Monthly', '2025-01-01', '2025-02-01'),
    (2, 2, 'Quarterly', '2025-01-15', '2025-04-15'),
    (3, 3, 'Yearly', '2024-12-01', '2025-12-01');

  INSERT INTO class_attendance (class_ID, member_ID, date) VALUES
    (1, 1, '2025-01-05 08:00:00'),
    (2, 2, '2025-01-05 10:00:00'),
    (3, 3, '2025-01-06 18:00:00');

  INSERT INTO gym_attendance (member_ID, date) VALUES
    (1, '2025-01-05 07:45:00'),
    (2, '2025-01-05 09:30:00'),
    (3, '2025-01-06 17:30:00');
END //

DELIMITER ;
