-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `corruption_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;

-- Create user with password
CREATE USER IF NOT EXISTS 'ccts_user'@'localhost' IDENTIFIED BY 'ccts_password';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON `corruption_db`.* TO 'ccts_user'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show confirmation
SELECT 'Database and user setup complete!' as Status;
SELECT 'Host: localhost, Database: corruption_db, User: ccts_user' as Connection_Details;
