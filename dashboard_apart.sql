-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 13, 2025 at 02:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dashboard_apart`
--

-- --------------------------------------------------------

--
-- Table structure for table `energy`
--

CREATE TABLE `energy` (
  `id_energy` int(11) NOT NULL,
  `id_kamar` int(11) NOT NULL,
  `jumlah` decimal(10,2) NOT NULL,
  `waktu` time NOT NULL,
  `tanggal` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `energy`
--

INSERT INTO `energy` (`id_energy`, `id_kamar`, `jumlah`, `waktu`, `tanggal`) VALUES
(778, 101, 10.00, '23:59:59', '2025-07-08'),
(779, 101, 12.00, '23:59:59', '2025-07-09'),
(780, 101, 15.00, '23:59:59', '2025-07-10');

-- --------------------------------------------------------

--
-- Table structure for table `energy_hourly`
--

CREATE TABLE `energy_hourly` (
  `id` int(11) NOT NULL,
  `id_kamar` int(11) DEFAULT NULL,
  `jumlah_wh` float DEFAULT NULL,
  `waktu` time DEFAULT NULL,
  `tanggal` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `energy_hourly`
--

INSERT INTO `energy_hourly` (`id`, `id_kamar`, `jumlah_wh`, `waktu`, `tanggal`) VALUES
(7, 101, 1.2, '01:00:00', '2025-07-08'),
(8, 101, 1.5, '02:00:00', '2025-07-08'),
(9, 101, 1.1, '03:00:00', '2025-07-08'),
(10, 101, 1.3, '04:00:00', '2025-07-08'),
(11, 101, 1.4, '05:00:00', '2025-07-08'),
(12, 101, 1.6, '06:00:00', '2025-07-08'),
(13, 101, 1.7, '07:00:00', '2025-07-08'),
(14, 101, 1.8, '08:00:00', '2025-07-08'),
(15, 101, 1.9, '09:00:00', '2025-07-08'),
(16, 101, 2, '10:00:00', '2025-07-08'),
(17, 101, 2.1, '11:00:00', '2025-07-08'),
(18, 101, 2.2, '12:00:00', '2025-07-08'),
(19, 101, 2.3, '13:00:00', '2025-07-08'),
(20, 101, 2.4, '14:00:00', '2025-07-08'),
(21, 101, 2.5, '15:00:00', '2025-07-08'),
(22, 101, 2.6, '16:00:00', '2025-07-08'),
(23, 101, 2.7, '17:00:00', '2025-07-08'),
(24, 101, 2.8, '18:00:00', '2025-07-08'),
(25, 101, 2.9, '19:00:00', '2025-07-08'),
(26, 101, 3, '20:00:00', '2025-07-08'),
(27, 101, 3.1, '21:00:00', '2025-07-08'),
(28, 101, 3.2, '22:00:00', '2025-07-08'),
(29, 101, 3.3, '23:00:00', '2025-07-08'),
(30, 101, 3.4, '00:00:00', '2025-07-08'),
(31, 101, 1.3, '01:00:00', '2025-07-09'),
(32, 101, 1.6, '02:00:00', '2025-07-09'),
(33, 101, 1.2, '03:00:00', '2025-07-09'),
(34, 101, 1.4, '04:00:00', '2025-07-09'),
(35, 101, 1.5, '05:00:00', '2025-07-09'),
(36, 101, 1.7, '06:00:00', '2025-07-09'),
(37, 101, 1.8, '07:00:00', '2025-07-09'),
(38, 101, 1.9, '08:00:00', '2025-07-09'),
(39, 101, 2, '09:00:00', '2025-07-09'),
(40, 101, 2.1, '10:00:00', '2025-07-09'),
(41, 101, 2.2, '11:00:00', '2025-07-09'),
(42, 101, 2.3, '12:00:00', '2025-07-09'),
(43, 101, 2.4, '13:00:00', '2025-07-09'),
(44, 101, 2.5, '14:00:00', '2025-07-09'),
(45, 101, 2.6, '15:00:00', '2025-07-09'),
(46, 101, 2.7, '16:00:00', '2025-07-09'),
(47, 101, 2.8, '17:00:00', '2025-07-09'),
(48, 101, 2.9, '18:00:00', '2025-07-09'),
(49, 101, 3, '19:00:00', '2025-07-09'),
(50, 101, 3.1, '20:00:00', '2025-07-09'),
(51, 101, 3.2, '21:00:00', '2025-07-09'),
(52, 101, 3.3, '22:00:00', '2025-07-09'),
(53, 101, 3.4, '23:00:00', '2025-07-09'),
(54, 101, 3.5, '00:00:00', '2025-07-09'),
(55, 101, 1.4, '01:00:00', '2025-07-10'),
(56, 101, 1.7, '02:00:00', '2025-07-10'),
(57, 101, 1.3, '03:00:00', '2025-07-10'),
(58, 101, 1.5, '04:00:00', '2025-07-10'),
(59, 101, 1.6, '05:00:00', '2025-07-10'),
(60, 101, 1.8, '06:00:00', '2025-07-10'),
(61, 101, 1.9, '07:00:00', '2025-07-10'),
(62, 101, 2, '08:00:00', '2025-07-10'),
(63, 101, 2.1, '09:00:00', '2025-07-10'),
(64, 101, 2.2, '10:00:00', '2025-07-10'),
(65, 101, 2.3, '11:00:00', '2025-07-10'),
(66, 101, 2.4, '12:00:00', '2025-07-10'),
(67, 101, 2.5, '13:00:00', '2025-07-10'),
(68, 101, 2.6, '14:00:00', '2025-07-10'),
(69, 101, 2.7, '15:00:00', '2025-07-10'),
(70, 101, 2.8, '16:00:00', '2025-07-10'),
(71, 101, 2.9, '17:00:00', '2025-07-10'),
(72, 101, 3, '18:00:00', '2025-07-10'),
(73, 101, 3.1, '19:00:00', '2025-07-10'),
(74, 101, 3.2, '20:00:00', '2025-07-10'),
(75, 101, 3.3, '21:00:00', '2025-07-10'),
(76, 101, 3.4, '22:00:00', '2025-07-10'),
(77, 101, 3.5, '23:00:00', '2025-07-10'),
(78, 101, 3.6, '00:00:00', '2025-07-10');

-- --------------------------------------------------------

--
-- Table structure for table `kamar`
--

CREATE TABLE `kamar` (
  `id_kamar` int(11) NOT NULL,
  `id_lantai` int(11) NOT NULL,
  `nomer_kamar` int(11) NOT NULL,
  `status_kamar` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kamar`
--

INSERT INTO `kamar` (`id_kamar`, `id_lantai`, `nomer_kamar`, `status_kamar`) VALUES
(101, 1, 101, 1);

-- --------------------------------------------------------

--
-- Table structure for table `lantai`
--

CREATE TABLE `lantai` (
  `id_lantai` int(11) NOT NULL,
  `nomer_lantai` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lantai`
--

INSERT INTO `lantai` (`id_lantai`, `nomer_lantai`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `energy`
--
ALTER TABLE `energy`
  ADD PRIMARY KEY (`id_energy`),
  ADD KEY `id_kamar` (`id_kamar`);

--
-- Indexes for table `energy_hourly`
--
ALTER TABLE `energy_hourly`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kamar`
--
ALTER TABLE `kamar`
  ADD PRIMARY KEY (`id_kamar`),
  ADD KEY `id_lantai` (`id_lantai`);

--
-- Indexes for table `lantai`
--
ALTER TABLE `lantai`
  ADD PRIMARY KEY (`id_lantai`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `energy`
--
ALTER TABLE `energy`
  MODIFY `id_energy` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=781;

--
-- AUTO_INCREMENT for table `energy_hourly`
--
ALTER TABLE `energy_hourly`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `kamar`
--
ALTER TABLE `kamar`
  MODIFY `id_kamar` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `lantai`
--
ALTER TABLE `lantai`
  MODIFY `id_lantai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `energy`
--
ALTER TABLE `energy`
  ADD CONSTRAINT `energy_ibfk_1` FOREIGN KEY (`id_kamar`) REFERENCES `kamar` (`id_kamar`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kamar`
--
ALTER TABLE `kamar`
  ADD CONSTRAINT `kamar_ibfk_1` FOREIGN KEY (`id_lantai`) REFERENCES `lantai` (`id_lantai`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
