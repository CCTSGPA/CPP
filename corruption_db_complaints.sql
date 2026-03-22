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
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_notes` text,
  `category` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text NOT NULL,
  `evidence_url` varchar(255) DEFAULT NULL,
  `incident_date` datetime(6) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `rejection_reason` text,
  `respondent_department` varchar(255) DEFAULT NULL,
  `respondent_designation` varchar(255) DEFAULT NULL,
  `respondent_name` varchar(255) DEFAULT NULL,
  `status` enum('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RESOLVED') NOT NULL,
  `title` varchar(255) NOT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned_officer_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `accuracy` float DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `ai_severity_score` int DEFAULT NULL,
  `ai_summary` text,
  `complainant_email` varchar(255) DEFAULT NULL,
  `complainant_name` varchar(255) DEFAULT NULL,
  `complainant_phone` varchar(255) DEFAULT NULL,
  `is_anonymous` bit(1) DEFAULT NULL,
  `evidence_file_name` varchar(255) DEFAULT NULL,
  `evidence_review_status` varchar(255) DEFAULT NULL,
  `evidence_sha256` varchar(128) DEFAULT NULL,
  `evidence_upload_date` datetime(6) DEFAULT NULL,
  `evidence_used_in_investigation` bit(1) DEFAULT NULL,
  `evidence_verification_status` varchar(255) DEFAULT NULL,
  `progress_percentage` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_h02ikd8ghohi7njaywggaselh` (`tracking_number`),
  KEY `FKiw7jtjbxqww6hgo4g35hhg6yt` (`assigned_officer_id`),
  KEY `FK83j5gqkd7ku4vc908g4rtmglr` (`user_id`),
  CONSTRAINT `FK83j5gqkd7ku4vc908g4rtmglr` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKiw7jtjbxqww6hgo4g35hhg6yt` FOREIGN KEY (`assigned_officer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,NULL,'Bribery','2026-02-26 17:13:09.523221','Created by automated API smoke run',NULL,NULL,'Test City',NULL,NULL,NULL,NULL,'REJECTED','E2E Sync Complaint','CCTS-A9D7300F','2026-03-12 09:43:09.722277',NULL,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,'Bribery','2026-02-28 16:17:52.786104','ueiuwefuyewf\nwefugfuw egfu\nwefiuwfh\'r\nyfuiw',NULL,'2026-02-28 10:47:52.000000','Pinjarwadi, Zopadpatti, Solapur South, Solapur, Maharashtra, 413573, India',NULL,'qwerty','qwerty','wertyu','SUBMITTED','qwerty','CCTS-2BF88B02','2026-02-28 16:17:52.786104',NULL,13,405560,17.7518,76.1277,NULL,NULL,'a@gmail.com','a@12345gmail.com','1234567890',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,'Bribery','2026-02-28 16:18:19.216103','ueiuwefuyewf\nwefugfuw egfu\nwefiuwfh\'r\nyfuiw',NULL,'2026-02-28 10:48:19.000000','Pinjarwadi, Zopadpatti, Solapur South, Solapur, Maharashtra, 413573, India',NULL,'qwerty','qwerty','wertyu','SUBMITTED','qwerty','CCTS-32331625','2026-02-28 16:18:19.216103',NULL,13,405560,17.7518,76.1277,NULL,NULL,'a@gmail.com','a@12345gmail.com','1234567890',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,NULL,'Bribery','2026-02-28 16:19:03.384349','ueiuwefuyewf\nwefugfuw egfu\nwefiuwfh\'r\nyfuiw',NULL,'2026-02-28 10:49:03.000000','Pinjarwadi, Zopadpatti, Solapur South, Solapur, Maharashtra, 413573, India',NULL,'qwerty','qwerty','wertyu','APPROVED','qwerty','CCTS-E2BFDD27','2026-03-12 09:46:40.707617',NULL,13,405560,17.7518,76.1277,NULL,NULL,'a@gmail.com','a@12345gmail.com','1234567890',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,'Fraud','2026-02-28 16:23:36.916438','hi ,\nhello world\ni am Civic what can i do for you',NULL,'2026-02-28 10:53:36.000000','Pinjarwadi, Zopadpatti, Solapur South, Solapur, Maharashtra, 413573, India',NULL,'Computer','Engineer','Rahul','UNDER_REVIEW','Fraud','CCTS-4FA72FF9','2026-02-28 16:25:20.029906',NULL,13,405560,17.7518,76.1277,NULL,NULL,'a@gmail.com','a@12345gmail.com','1234567890',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,NULL,'Extortion','2026-02-28 16:28:50.505981','hi \ni am abcd,\ni have to ex',NULL,'2026-02-28 10:58:50.000000','',NULL,'Co','MANAGER','NANA','SUBMITTED','hello abcd','CCTS-2FF8FEF7','2026-02-28 16:28:50.505981',NULL,13,NULL,NULL,NULL,NULL,NULL,'','','',_binary '',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,NULL,'Extortion','2026-02-28 16:29:12.394074','hi \ni am abcd,\ni have to extorsionn',NULL,'2026-02-28 10:59:12.000000','',NULL,'Co','MANAGER','NANA','SUBMITTED','hello abcd','CCTS-2723CAAA','2026-02-28 16:29:12.394074',NULL,13,NULL,NULL,NULL,NULL,NULL,'','','',_binary '',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,NULL,'Extortion','2026-02-28 16:30:15.198190','hi \ni am abcd,\ni have to extorsionn',NULL,'2026-02-28 11:00:15.000000','',NULL,'Co','MANAGER','NANA','SUBMITTED','hello abcd','CCTS-C3765139','2026-02-28 16:30:15.198190',NULL,13,NULL,NULL,NULL,NULL,NULL,'','','',_binary '',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,NULL,'Bribery','2026-03-02 17:58:32.123274','qwertyuiop\n;lkjhgfdsa\nmnbvcx',NULL,'2026-03-02 12:28:29.000000','Manchar, Ambegaon, Pune, Maharashtra, 410503, India',NULL,'Co','MANAGER','NANA','REJECTED','qwerty','CCTS-59A29CEC','2026-03-02 18:00:52.820345',NULL,14,500,18.983528,73.9636,NULL,NULL,'abcdefgHIJKLMN@gmail.com','abc','+91 70200 57494',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,NULL,'Bribery','2026-03-02 17:59:25.463055','wertyjsdfghjkrtjklwertyuio',NULL,'2026-03-02 12:29:25.000000','',NULL,'','','','RESOLVED','fghjwertyui','CCTS-A4229DDB','2026-03-03 08:33:40.648714',NULL,14,NULL,NULL,NULL,NULL,NULL,'','','',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,NULL,'Fraud','2026-03-03 08:25:02.323456','qweryuop[\ndjkl;\'\nzxcvnm,.\nghjk',NULL,'2026-03-03 02:55:02.000000','Manchar, Ambegaon, Pune, Maharashtra, 410503, India',NULL,'qwerty123','Computer Engineer','Soham','SUBMITTED','Hello world','CCTS-C53C9F82','2026-03-03 08:25:02.323456',NULL,15,149,18.986386,73.962704,NULL,NULL,'abcdefgHIJKLMN@gmail.com','Soham','+91 70200 57494',_binary '\0',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,NULL,'Fraud','2026-03-12 09:38:41.098830','qwetyiop\nasdghjkl\nzxvbm,.\n',NULL,'2026-03-12 04:08:40.000000','Manchar, Ambegaon, Pune, Maharashtra, 410503, India',NULL,'qwerty123','Computer Engineer','Soham','REJECTED','hello world ','CCTS-8800C4AD','2026-03-12 09:43:20.565336',NULL,16,95,18.984054172979086,73.96339190276993,NULL,NULL,'','','',_binary '',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'hello','Bribery','2026-03-15 07:24:59.970269','jheriuheguherg\nheroiheogheg\niheirghoer\ng',NULL,'2026-03-15 01:54:59.000000','',NULL,'kduhigueg','jhrbi','jhebgr','APPROVED','kjebrghiergenkgk','CCTS-5C75A655','2026-03-15 13:38:40.508737',NULL,16,NULL,NULL,NULL,NULL,NULL,'','','',_binary '',NULL,'ACCEPTED',NULL,NULL,_binary '','REJECTED',0),(14,NULL,'Bribery','2026-03-15 13:34:49.055786','ertwqwe\nrewqwerewqwertewqwert',NULL,'2026-03-15 08:04:48.000000','Sejin Building, 67, 창경궁로, 주교동, 을지로동, 중구, 서울특별시, 04345, 대한민국',NULL,'Co','Computer Engineer','Soham','SUBMITTED','qwert','CCTS-A7D96798','2026-03-15 13:34:49.055786',NULL,16,10000,37.5682,126.9977,NULL,NULL,'','','',_binary '',NULL,NULL,NULL,NULL,_binary '\0',NULL,10),(15,'Escalated for immediate review','Fraud','2026-03-15 13:58:52.928044','rtyuiokjnd nc t}];hgsvjdggisdcujnsndlvhoysdvg',NULL,'2026-03-15 08:28:52.000000','Manchar New Bypass Highway, Manchar, Ambegaon, Pune, Maharashtra, 410503, India',NULL,'','','','UNDER_REVIEW','457890-','CCTS-879736F4','2026-03-15 13:59:41.590863',NULL,16,200,19.017148971557617,73.94667053222656,NULL,NULL,'','','',_binary '',NULL,'UNDER_REVIEW',NULL,NULL,_binary '','RECEIVED',35),(16,NULL,'Fraud','2026-03-20 15:27:35.312933','qwertyiop\nsasdfgjkl;\nzxcvbnm,.\nqwertuio\'\n',NULL,'2026-03-20 09:57:35.000000','Nigdi, Pimpri-Chinchwad, Haveli, Pune, Maharashtra, 412114, India',NULL,'Co','Computer Engineer','Soham','SUBMITTED','telephony fraude ','CCTS-F108DE9B','2026-03-20 15:27:35.312933',NULL,16,500,18.672166,73.783844,NULL,NULL,'','','',_binary '',NULL,NULL,NULL,NULL,_binary '\0',NULL,10);
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
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
