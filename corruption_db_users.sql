CREATE DATABASE  IF NOT EXISTS `corruption_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `corruption_db`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: corruption_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `enabled` bit(1) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('USER','OFFICER','ADMIN') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `apple_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `microsoft_id` varchar(255) DEFAULT NULL,
  `oauth_provider` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-02-13 12:31:14.818477','IT','System Admin','admin@ccts.gov',_binary '','System Administrator','$2a$10$5iwzRHJDrsKcnxyOM.En7enFMzAsoHr.gsDkH4uRLGumxP35s4iaa','1234567890','ADMIN','2026-02-13 12:31:14.818477',NULL,NULL,NULL,NULL,NULL,NULL),(2,'2026-02-13 12:31:15.007222','Anti-Corruption','Officer','officer@ccts.gov',_binary '','Complaint Officer','$2a$10$kHAoWb32sx2eoB5FLJoFz.05EhEXB5Sbm8T4AiKJYhsO/w.ZACvGO','9876543210','OFFICER','2026-02-13 12:31:15.007222',NULL,NULL,NULL,NULL,NULL,NULL),(3,'2026-02-25 18:01:00.075210','Administration','System Admin','adminccts2026@gmail.com',_binary '','CCTS Admin','$2a$10$WiDC7ahcaMFiqY58KYq6geYp2NjCCorzG9WxeOGRoVQtAbtUKyUP2','9999999999','ADMIN','2026-03-21 14:04:46.701725',NULL,NULL,NULL,'2026-03-21 14:04:46.701725',NULL,NULL),(4,'2026-02-26 17:12:43.652740',NULL,NULL,'e2e_user_56241@civicwatch.local',_binary '','E2E User','$2a$10$yp.5bFpcogcVQhxKihB4teMrxEU/pGQJ6RDc4MnSO4WEydq47eL.a','9999999999','USER','2026-02-26 17:12:43.652740',NULL,NULL,NULL,'2026-02-26 17:12:43.559064',NULL,'local'),(5,'2026-02-26 17:20:33.090774',NULL,NULL,'e2e_admin_56241@civicwatch.local',_binary '','E2E Admin','$2a$10$dsxncvp8.x7UdUyqrTOriOlKeBYv6wzUge3I7hOKzYHvBD8xULxfO','8888888888','ADMIN','2026-02-26 17:20:33.090774',NULL,NULL,NULL,'2026-02-26 17:20:33.090775',NULL,'local'),(6,'2026-02-26 18:22:29.255375',NULL,NULL,'test@example.com',_binary '','Test User','$2a$10$tnMnM0/eNcJt696CzHJW4e/XHxFva1fzLuBq3Dk1m/NQxCLznC4L6','9876543210','USER','2026-02-26 18:22:29.256377',NULL,NULL,NULL,'2026-02-26 18:22:29.104749',NULL,'local'),(7,'2026-02-26 18:27:27.848674',NULL,NULL,'testuser_new@example.com',_binary '','Test User','$2a$10$PcPxBeu5EGtO37zSycDN1uj7vM8OIniIn/sMq.509BalY1g49ZQHS','9876543210','USER','2026-02-26 18:27:27.848674',NULL,NULL,NULL,'2026-02-26 18:27:27.847692',NULL,'local'),(8,'2026-02-26 18:28:29.732805',NULL,NULL,'testuser_new2@example.com',_binary '','Test User','$2a$10$RZyaiOJJjske4P/kUjSC4OLOZzCyoGx9ac7Np2Z37HVzDXC1KpItO','9876543210','USER','2026-02-26 18:28:29.732805',NULL,NULL,NULL,'2026-02-26 18:28:29.732806',NULL,'local'),(9,'2026-02-26 18:33:03.663776',NULL,NULL,'test12345678@example.com',_binary '','Test User','$2a$10$xnT4QTH/e6ES0uxy9/4j1ergLeDvQQRb3gIpmA0OimmRIEfbqLTWC','9876543210','USER','2026-02-26 18:33:03.663776',NULL,NULL,NULL,'2026-02-26 18:33:03.663776',NULL,'local'),(10,'2026-02-28 15:46:58.956841',NULL,NULL,'test2@example.com',_binary '','Test User','$2a$10$T3ZjmSkwUdPJURVN61bg4OhxkqPqrrM1fTulbwr6NSh/c3HQ79qKm','1234567890','USER','2026-02-28 15:46:58.956841',NULL,NULL,NULL,'2026-02-28 15:46:58.956842',NULL,'local'),(11,'2026-02-28 15:54:09.239839',NULL,NULL,'test3@test.com',_binary '','New User','$2a$10$uhPgG5JqvP/HFN2T0Y07BOWAxVszSHsisqSR/qBtJZaTtQZk3Wi.O',NULL,'USER','2026-02-28 15:54:09.239839',NULL,NULL,NULL,'2026-02-28 15:54:09.172060',NULL,'local'),(12,'2026-02-28 15:54:25.031256',NULL,NULL,'test5@test.com',_binary '','New User5','$2a$10$fxE0JlqR4RuK0lIpRZINDOPYvoEjae89m26a1nLy49Cs2UWq6SH4a',NULL,'USER','2026-02-28 15:54:32.769319',NULL,NULL,NULL,'2026-02-28 15:54:32.761141',NULL,'local'),(13,'2026-02-28 16:17:01.574582',NULL,NULL,'a@gmail.com',_binary '','Dhruv','$2a$10$g6oToZ8fXCQPv2pP72Vej.CZawaG1ZIVvwWiwpsv5U3iaPYrDWgve',NULL,'USER','2026-02-28 16:17:01.574582',NULL,NULL,NULL,'2026-02-28 16:17:01.565912',NULL,'local'),(14,'2026-03-02 17:56:52.590849',NULL,NULL,'a123456789@gmail.com',_binary '','Dhruv','$2a$10$Rn2WQtQYjMfVU4z8xE4ezeo4qJYxmA.JTPod90qBtKdp3X90pHwL6',NULL,'USER','2026-03-02 17:56:52.590849',NULL,NULL,NULL,'2026-03-02 17:56:52.479922',NULL,'local'),(15,'2026-03-03 08:23:13.803453',NULL,NULL,'a98765321@gmail.com',_binary '','Dhruv','$2a$10$rKhxv51LTuhgB9edzKzayuUz.q5/dAfZre377CmlJGUvWPOVfRmJe',NULL,'USER','2026-03-03 08:23:13.803453',NULL,NULL,NULL,'2026-03-03 08:23:13.744784',NULL,'local'),(16,'2026-03-12 09:37:18.733171',NULL,NULL,'Soham123@gmail.com',_binary '','Soham Hande ','$2a$10$YnZNWl/.8ZpmlSCH1MkT..YLybB5b54f/jADIQrotdlAYAk./Pski',NULL,'USER','2026-03-21 14:04:32.902916',NULL,NULL,NULL,'2026-03-21 14:04:32.902916',NULL,'local'),(17,'2026-03-15 07:21:21.694157',NULL,NULL,'Soham1y23@gmail.com',_binary '','Soham Hande ','$2a$10$c1Wfim3Vbi2IMFfqxEhs6eJdcK7PkcoCf9bBtcyBDQSb.a5not3/i',NULL,'USER','2026-03-15 07:21:21.694157',NULL,NULL,NULL,'2026-03-15 07:21:21.579827',NULL,'local');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-22 12:26:44
