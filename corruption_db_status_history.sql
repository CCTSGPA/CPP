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
-- Table structure for table `status_history`
--

DROP TABLE IF EXISTS `status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` varchar(255) DEFAULT NULL,
  `new_status` enum('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RESOLVED') NOT NULL,
  `old_status` enum('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RESOLVED') DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `changed_by` bigint NOT NULL,
  `complaint_id` bigint NOT NULL,
  `activity_type` varchar(255) DEFAULT NULL,
  `evidence_file_name` varchar(255) DEFAULT NULL,
  `evidence_review_status` varchar(255) DEFAULT NULL,
  `evidence_verification_status` varchar(255) DEFAULT NULL,
  `notification_channels` varchar(255) DEFAULT NULL,
  `progress_percentage` int DEFAULT NULL,
  `public_summary` text,
  `title` varchar(255) DEFAULT NULL,
  `used_in_investigation` bit(1) DEFAULT NULL,
  `visible_to_user` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKivukhmmfvoqyn9rt7mvtkfbgn` (`changed_by`),
  KEY `FKqc871iqq2rvojomq8e2ba8hi4` (`complaint_id`),
  CONSTRAINT `FKivukhmmfvoqyn9rt7mvtkfbgn` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqc871iqq2rvojomq8e2ba8hi4` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_history`
--

LOCK TABLES `status_history` WRITE;
/*!40000 ALTER TABLE `status_history` DISABLE KEYS */;
INSERT INTO `status_history` VALUES (1,NULL,'UNDER_REVIEW','SUBMITTED','2026-02-28 15:46:15.116650',3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,'UNDER_REVIEW','UNDER_REVIEW','2026-02-28 15:46:29.199285',3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,'UNDER_REVIEW','UNDER_REVIEW','2026-02-28 15:46:30.928018',3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,NULL,'UNDER_REVIEW','SUBMITTED','2026-02-28 16:25:19.928402',3,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,'APPROVED','SUBMITTED','2026-03-02 18:00:31.928391',3,9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,NULL,'UNDER_REVIEW','APPROVED','2026-03-02 18:00:45.313957',3,9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,NULL,'REJECTED','UNDER_REVIEW','2026-03-02 18:00:51.907474',3,9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,NULL,'RESOLVED','SUBMITTED','2026-03-03 08:33:38.010826',3,10,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,NULL,'REJECTED','UNDER_REVIEW','2026-03-12 09:43:01.251888',3,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,NULL,'REJECTED','SUBMITTED','2026-03-12 09:43:16.398804',3,12,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,NULL,'REJECTED','REJECTED','2026-03-12 09:43:20.630234',3,12,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,NULL,'APPROVED','SUBMITTED','2026-03-12 09:46:39.323322',3,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'Complaint submitted','SUBMITTED',NULL,'2026-03-15 13:34:49.177352',16,14,'COMPLAINT_SUBMITTED',NULL,NULL,NULL,'EMAIL',10,'Complaint has been received by the system.','Complaint Submitted',_binary '\0',_binary ''),(16,'hello','APPROVED','SUBMITTED','2026-03-15 13:38:36.127949',3,13,'DECISION_PENDING_COMPLETED',NULL,'ACCEPTED','REJECTED','EMAIL',0,'no any','Decision Made (Approved)',_binary '',_binary ''),(19,'hello','APPROVED','APPROVED','2026-03-15 13:38:45.775879',3,13,'DECISION_PENDING_COMPLETED',NULL,'ACCEPTED','REJECTED','EMAIL',0,'no any','Decision Made (Approved)',_binary '',_binary ''),(20,'Complaint submitted','SUBMITTED',NULL,'2026-03-15 13:58:53.023178',16,15,'COMPLAINT_SUBMITTED',NULL,NULL,NULL,'EMAIL',10,'Complaint has been received by the system.','Complaint Submitted',_binary '\0',_binary ''),(21,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:24.223358',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '\0',_binary ''),(22,'Escalated for immediate review','UNDER_REVIEW','SUBMITTED','2026-03-15 13:59:27.839291',3,15,'UNDER_REVIEW',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',35,'Complaint under review','Under Review',_binary '\0',_binary ''),(27,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:29.960963',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(33,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:32.341726',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(34,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:32.388589',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(35,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:32.388589',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(36,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:32.392361',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(37,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:32.396905',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(38,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:32.401684',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(39,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:33.782174',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(40,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:33.782174',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(41,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:33.783751',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(42,'eryui;\'\n','SUBMITTED','SUBMITTED','2026-03-15 13:59:33.782174',3,15,'COMPLAINT_RECEIVED',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',10,'qwertyuiopjhgf','Complaint Submitted',_binary '',_binary ''),(43,'Escalated for immediate review','UNDER_REVIEW','SUBMITTED','2026-03-15 13:59:37.698621',3,15,'UNDER_REVIEW',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',35,'Complaint under review','Under Review',_binary '',_binary ''),(48,'Escalated for immediate review','UNDER_REVIEW','SUBMITTED','2026-03-15 13:59:39.042036',3,15,'UNDER_REVIEW',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',35,'Complaint under review','Under Review',_binary '',_binary ''),(49,'Escalated for immediate review','UNDER_REVIEW','UNDER_REVIEW','2026-03-15 13:59:40.262711',3,15,'UNDER_REVIEW',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',35,'Complaint under review','Under Review',_binary '',_binary ''),(50,'Escalated for immediate review','UNDER_REVIEW','UNDER_REVIEW','2026-03-15 13:59:40.264637',3,15,'UNDER_REVIEW',NULL,'UNDER_REVIEW','RECEIVED','EMAIL',35,'Complaint under review','Under Review',_binary '',_binary ''),(51,'Complaint submitted','SUBMITTED',NULL,'2026-03-20 15:27:35.446974',16,16,'COMPLAINT_SUBMITTED',NULL,NULL,NULL,'EMAIL',10,'Complaint has been received by the system.','Complaint Submitted',_binary '\0',_binary '');
/*!40000 ALTER TABLE `status_history` ENABLE KEYS */;
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
