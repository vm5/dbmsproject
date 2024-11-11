-- Table structure for table `auth`
--
-- Creating users
CREATE USER 'block_admin'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'employee'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'owner'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'tenant'@'localhost' IDENTIFIED BY 'password';

-- Granting privileges
GRANT ALL PRIVILEGES ON dbmsmini.* TO 'block_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON dbmsmini.* TO 'employee'@'localhost';
GRANT SELECT ON dbmsmini.* TO 'owner'@'localhost';
GRANT SELECT ON dbmsmini.rental TO 'tenant'@'localhost';  

DELIMITER //

CREATE TRIGGER before_insert_auth
BEFORE INSERT ON auth
FOR EACH ROW
BEGIN
    -- Check if user_id already exists in the table to enforce uniqueness
    IF EXISTS (SELECT 1 FROM auth WHERE user_id = NEW.user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User ID already exists.';
    END IF;

    -- Check if the password length is at least 8 characters (example business rule)
    IF LENGTH(NEW.password) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Password must be at least 8 characters long.';
    END IF;

    -- Log the insertion into a log table (without timestamp and without handling the created_at)
    INSERT INTO auth_log (user_id, action)
    VALUES (NEW.user_id, 'INSERT');
END//

DELIMITER ;



-- Dropping and creating the auth table with a created_at column
DROP TABLE IF EXISTS `auth`;
CREATE TABLE `auth` (
  `user_id` varchar(10) NOT NULL,
  `password` varchar(20) NOT NULL DEFAULT '12345678',
  `id` int NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Added created_at column
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `auth`
LOCK TABLES `auth` WRITE;
INSERT INTO `auth` VALUES 
('a-123','12345678',101, NOW()), 
('a-124','12345678',102, NOW()), 
('a-909','12345678',103, NOW()),
('e-123','12345678',701, NOW()), 
('e-456','12345678',702, NOW()), 
('e-909','12345678',703, NOW()), 
('o-123','12345678',501, NOW()), 
('o-124','12345678',502, NOW()), 
('o-456','12345678',503, NOW()), 
('o-909','12345678',504, NOW()), 
('t-123','12345678',601, NOW()), 
('t-124','12345678',602, NOW()), 
('t-145','12345678',603, NOW()), 
('t-190','12345678',604, NOW()), 
('t-345','12345678',605, NOW());
('t-346','12345678',606, NOW());
('a-125','12345678',104, NOW()), 
('a-126','12345678',105, NOW()), 
('a-127','12345678',106, NOW()), 
('e-124','12345678',704, NOW()), 
('e-457','12345678',705, NOW()), 
('e-458','12345678',706, NOW()), 
('o-125','12345678',505, NOW()), 
('o-126','12345678',506, NOW()), 
('o-457','12345678',507, NOW()), 
('o-910','12345678',508, NOW()), 
('t-125','12345678',607, NOW()), 
('t-126','12345678',608, NOW()), 
('t-347','12345678',609, NOW()), 
('t-348','12345678',610, NOW()), 
('t-349','12345678',611, NOW());
UNLOCK TABLES;

DELIMITER //
CREATE PROCEDURE GetUserCount()
BEGIN
    SELECT COUNT(*) AS user_count FROM auth;
END//
DELIMITER ;

--
-- Temporary view structure for view `avt`
--

DROP TABLE IF EXISTS `avt`;
/*!50001 DROP VIEW IF EXISTS `avt`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `avt` AS SELECT 
 1 AS `tenant_id`,
 1 AS `room_no`,
 1 AS `dob`,
 1 AS `name`,
 1 AS `age`*/;
SET character_set_client = @saved_cs_client;
CREATE TABLE `room` (
    `room_no` int NOT NULL,
    -- Add other columns as needed for your room table
    PRIMARY KEY (`room_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `block`
--
DELIMITER $$

-- Create a trigger to update complaint_count in the 'room' table after a new complaint is added
CREATE TRIGGER UpdateComplaintCountAfterInsert
AFTER INSERT ON `block`
FOR EACH ROW
BEGIN
    -- Update the room's complaint count
    UPDATE `room`
    SET complaint_count = complaint_count + 1
    WHERE room_no = NEW.room_no;
END $$

-- Create a trigger to update complaint_count when an existing complaint is updated
CREATE TRIGGER UpdateComplaintCountAfterUpdate
AFTER UPDATE ON `block`
FOR EACH ROW
BEGIN
    -- Check if complaints have changed
    IF OLD.complaints != NEW.complaints THEN
        -- Update the room's complaint count (simplified, assuming we only care about the complaint presence)
        UPDATE `room`
        SET complaint_count = complaint_count + 1
        WHERE room_no = NEW.room_no;
    END IF;
END $$

DELIMITER ;

DROP TABLE IF EXISTS `block`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `block` (
  `block_no` int NOT NULL,
  `block_name` varchar(10) DEFAULT NULL,
  `complaints` varchar(100) DEFAULT NULL,
  `room_no` int DEFAULT NULL,
  PRIMARY KEY (`block_no`),
  KEY `fk_r` (`room_no`),
  CONSTRAINT `fk_r` FOREIGN KEY (`room_no`) REFERENCES `room` (`room_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DELIMITER $$

-- Create a stored function to count the number of blocks with complaints of a given type
CREATE FUNCTION CountComplaintsByType(issue VARCHAR(100)) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE complaint_count INT;
    
    -- Count the number of blocks that have a specific complaint issue
    SELECT COUNT(*) INTO complaint_count
    FROM `block`
    WHERE complaints LIKE CONCAT('%', issue, '%');
    
    RETURN complaint_count;
END $$

DELIMITER ;
DELIMITER $$

-- Create a trigger to delete the complaint record from the `block` table once it's resolved
CREATE TRIGGER DeleteComplaintAfterResolution
AFTER UPDATE ON `block`
FOR EACH ROW
BEGIN
    -- Check if the complaint has been marked as resolved
    IF NEW.complaints IS NULL OR NEW.complaints = '' THEN
        -- Delete the record once the complaint is resolved (complaints field is empty)
        DELETE FROM `block`
        WHERE block_no = NEW.block_no;
    END IF;
END $$

DELIMITER ;


/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `block`
--

LOCK TABLES `block` WRITE;
/*!40000 ALTER TABLE `block` DISABLE KEYS */;
INSERT INTO `block` VALUES (1,'kaveri','Water problem',11),(2,'Narmadha','Plumbing work',12),(3,'yamuna','tenant issue',13),(4,'jamuna',NULL,21);
/*!40000 ALTER TABLE `block` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `block_admin`
--
DELIMITER $$

-- Trigger to update the admin count in the block table after an admin is added
CREATE TRIGGER UpdateAdminCountAfterInsert
AFTER INSERT ON `block_admin`
FOR EACH ROW
BEGIN
    -- Update the block's admin count when a new admin is assigned to a block
    IF NEW.block_no IS NOT NULL THEN
        UPDATE `block`
        SET complaints = CONCAT(IFNULL(complaints, ''), ' - Admin Assigned') -- Example modification to complaints
        WHERE block_no = NEW.block_no;
    END IF;
END $$

DELIMITER ;

DELIMITER $$

-- Trigger to handle admin updates in the block_admin table
CREATE TRIGGER UpdateAdminCountAfterUpdate
AFTER UPDATE ON `block_admin`
FOR EACH ROW
BEGIN
    -- If the block assignment has changed, update the corresponding block's data
    IF OLD.block_no != NEW.block_no THEN
        -- Decrement the old block's admin count
        IF OLD.block_no IS NOT NULL THEN
            UPDATE `block`
            SET complaints = REPLACE(complaints, ' - Admin Assigned', '') -- Example modification
            WHERE block_no = OLD.block_no;
        END IF;
        
        -- Increment the new block's admin count
        IF NEW.block_no IS NOT NULL THEN
            UPDATE `block`
            SET complaints = CONCAT(IFNULL(complaints, ''), ' - Admin Assigned')
            WHERE block_no = NEW.block_no;
        END IF;
    END IF;
END $$

DELIMITER ;

DROP TABLE IF EXISTS `block_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `block_admin` (
  `admin_id` int NOT NULL,
  `admin_name` varchar(20) DEFAULT NULL,
  `block_no` int DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  KEY `block_no` (`block_no`),
  CONSTRAINT `block_admin_ibfk_1` FOREIGN KEY (`block_no`) REFERENCES `block` (`block_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DELIMITER $$

-- Create a stored function to count the number of admins assigned to blocks
CREATE FUNCTION CountAdminsByBlock(blockNum INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE admin_count INT;
    
    -- Count the number of admins assigned to a specific block
    SELECT COUNT(*) INTO admin_count
    FROM `block_admin`
    WHERE block_no = blockNum;
    
    RETURN admin_count;
END $$

DELIMITER ;
-- Nested query to fetch admin names along with their assigned block names
SELECT admin_name, 
       (SELECT block_name FROM block WHERE block.block_no = block_admin.block_no) AS block_name
FROM block_admin;


/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `block_admin`
--

LOCK TABLES `block_admin` WRITE;
/*!40000 ALTER TABLE `block_admin` DISABLE KEYS */;
INSERT INTO `block_admin` VALUES (101,'shiva',1),(102,'rajaa',NULL);
/*!40000 ALTER TABLE `block_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--
DELIMITER $$

CREATE TRIGGER employee_salary_check
BEFORE INSERT ON employee
FOR EACH ROW
BEGIN
    IF NEW.salary > 15000 THEN
        SET NEW.emp_type = 'Senior';
    ELSE
        SET NEW.emp_type = 'Junior';
    END IF;
END $$

DELIMITER ;

DROP TABLE IF EXISTS `employee`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `emp_id` int NOT NULL,
  `emp_name` varchar(30) DEFAULT NULL,
  `salary` int DEFAULT NULL,
  `emp_type` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `block_no` int DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,  -- Allow NULL values for top-level employees
  PRIMARY KEY (`emp_id`),
  KEY `block_no` (`block_no`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`block_no`) REFERENCES `block` (`block_no`),
  CONSTRAINT `fk_supervisor_employee` FOREIGN KEY (`supervisor_id`) REFERENCES `employee` (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `employee`
--

-- Step 1: Lock the table to perform the insertions
LOCK TABLES `employee` WRITE;

-- Step 2: Disable keys to speed up the insertion
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;

-- Step 3: Insert records (matching the current column structure)
INSERT INTO `employee` (emp_id, emp_name, salary, emp_type, age, block_no)
VALUES
    (701, 'Muthu', 20000, 'Plumber', 20, 4),
    (702, 'Krishanan', 5000, 'Gardener', 30, 3),
    (703, 'Raman Surya', 4000, 'Electrician', 21, NULL);
    (704, 'Arun Kumar', 25000, 'Carpenter', 28, 5),
(705, 'Shiva Reddy', 15000, 'Painter', 25, 2),
(706, 'Mani Selvam', 18000, 'Welder', 29, 4),
(707, 'Suresh Babu', 22000, 'Mechanic', 32, 6),
(708, 'Vimal Kumar', 12000, 'Driver', 26, 3),
(709, 'Gopal Krishna', 30000, 'Electrician', 35, 10),
(710, 'Rajesh Pillai', 10000, 'Gardener', 27, 3),
(711, 'Ravi Shankar', 17000, 'Plumber', 24, 3),
(712, 'Vijay Anand', 14000, 'Painter', 22, 2),
(713, 'Mukesh Bhatt', 19000, 'Welder', 31, 5),
(714, 'Hari Krishnan', 13000, 'Driver', 23, 3),
(715, 'Sathish Rao', 16000, 'Mechanic', 28, 4),
(716, 'Ganesh Patil', 26000, 'Carpenter', 30, 7),
(717, 'Bharath Shetty', 5000, 'Gardener', 40, 1),
(718, 'Prakash Kumar', 20000, 'Plumber', 27, 4),
(719, 'Manoj Desai', 11000, 'Painter', 22, 2),
(720, 'Ramesh Iyer', 15000, 'Welder', 29, 3),
(721, 'Kiran Joshi', 24000, 'Mechanic', 33, 6),
(722, 'Sandeep Mehta', 30000, 'Electrician', 36, 8),
(723, 'Deepak Singh', 8000, 'Gardener', 26, 2;

/*!40000 ALTER TABLE `employee` ENABLE KEYS */;

-- Step 4: Unlock the table
UNLOCK TABLES;

-- Step 5: Add the `supervisor_id` column
-- Step 1: Add the `supervisor_id` column
ALTER TABLE `employee`
ADD COLUMN supervisor_id INT;

-- Step 2: Update the `supervisor_id` values for employees
UPDATE `employee`
SET supervisor_id = 701
WHERE emp_id IN (702, 703);

-- Step 3: Add the foreign key constraint to `supervisor_id`
ALTER TABLE `employee`
ADD CONSTRAINT fk_supervisor_employee
    FOREIGN KEY (supervisor_id)
    REFERENCES `employee`(emp_id)
    ON DELETE SET NULL;  -- Optional: to handle the case when a supervisor is deleted


DELIMITER $$

CREATE FUNCTION avg_salary_by_block(block_no_input INT) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE avg_salary DECIMAL(10,2);
    SELECT AVG(salary) INTO avg_salary
    FROM employee
    WHERE block_no = block_no_input;
    
    RETURN IFNULL(avg_salary, 0); -- Return 0 if no employees in the block
END $$

DELIMITER ;
SELECT 
    e.emp_id,
    e.emp_name AS employee_name,
    e.salary,
    e.emp_type,
    s.emp_name AS supervisor_name
FROM 
    employee e
LEFT JOIN 
    employee s ON e.supervisor_id = s.emp_id;

--
-- Table structure for table `identity`
--

DROP TABLE IF EXISTS `identity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `identity` (
  `proof` varchar(15) DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  UNIQUE KEY `proof` (`proof`),
  KEY `owner_id` (`owner_id`),
  KEY `fk_t` (`tenant_id`),
  CONSTRAINT `fk_t` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`),
  CONSTRAINT `identity_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identity`
--

LOCK TABLES `identity` WRITE;
/*!40000 ALTER TABLE `identity` DISABLE KEYS */;
INSERT INTO `identity` VALUES ('1234567890',501,NULL),('987654321',502,NULL),('2764724628',503,NULL),('9876543456',504,NULL),('6789876987',NULL,601),('4567898769',NULL,602),('9876567888',NULL,603),('2345676543',NULL,604),('7657876788',NULL,605);
/*!40000 ALTER TABLE `identity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `o`
--

DROP TABLE IF EXISTS `o`;
/*!50001 DROP VIEW IF EXISTS `o`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `o` AS SELECT 
 1 AS `complaints`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `oo`
--

DROP TABLE IF EXISTS `oo`;
/*!50001 DROP VIEW IF EXISTS `oo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `oo` AS SELECT 
 1 AS `complaints`,
 1 AS `room_no`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `owner`
--
DELIMITER $$

CREATE TRIGGER check_agreement_status
BEFORE INSERT ON owner
FOR EACH ROW
BEGIN
  IF NEW.age < 18 THEN
    SET NEW.aggrement_status = 'no';
  END IF;
END $$

DELIMITER ;

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `owner_id` int NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `aggrement_status` varchar(20) NOT NULL,
  `room_no` int DEFAULT NULL,
  `dob` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`owner_id`),
  KEY `FK_rrno` (`room_no`),
  CONSTRAINT `FK_rrno` FOREIGN KEY (`room_no`) REFERENCES `room` (`room_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DELIMITER $$

CREATE FUNCTION count_active_owners() 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE active_owners INT;
    SELECT COUNT(*) INTO active_owners
    FROM owner
    WHERE aggrement_status = 'yes';

    RETURN active_owners;
END $$

DELIMITER ;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
INSERT INTO `owner` VALUES (501,'yuvarraj S',19,'yes',11,'17-aug-2002'),(502,'Tharun',19,'yes',13,'21-may-2002'),(503,'Surya DK',20,'no',21,'23-sep-2001'),(504,'Shivanesh',21,'no',31,'24-jan-2002');
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rental`
--

DROP TABLE IF EXISTS `rental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rental` (
  `doj` varchar(20) DEFAULT NULL,
  `monthly_rent` int DEFAULT NULL,
  `room_no` int DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  KEY `tenant_id` (`tenant_id`),
  KEY `FK_rno` (`room_no`),
  CONSTRAINT `FK_rno` FOREIGN KEY (`room_no`) REFERENCES `room` (`room_no`),
  CONSTRAINT `rental_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental`
--

LOCK TABLES `rental` WRITE;
/*!40000 ALTER TABLE `rental` DISABLE KEYS */;
INSERT INTO `rental` VALUES ('02-jan-2021',25000,11,601),('03-jan-2021',25000,12,602),('03-jan-2021',35000,13,603),('06-jan-2021',15000,21,604),('07-jan-2021',15000,31,605);
/*!40000 ALTER TABLE `rental` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `room_no` int NOT NULL,
  `type` varchar(10) DEFAULT NULL,
  `floor` int DEFAULT NULL,
  `parking_slot` varchar(10) DEFAULT NULL,
  `reg_no` int DEFAULT NULL,
  `block_no` int DEFAULT NULL,
  PRIMARY KEY (`room_no`),
  UNIQUE KEY `parking_slot` (`parking_slot`),
  UNIQUE KEY `reg_no` (`reg_no`),
  KEY `block_no` (`block_no`),
  CONSTRAINT `room_ibfk_1` FOREIGN KEY (`block_no`) REFERENCES `block` (`block_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (11,'3bhk',2,'B-123',1234,1),(12,'2bhk',2,'B-124',12345,2),(13,'3bhk',2,'B-125',123,1),(21,'1bhk',3,'B-234',456,4),(31,'4bhk',4,'B-789',2345,4),(67,'1bhk',7,'B-890',654,3);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

ALTER TABLE room ADD COLUMN parking_slot VARCHAR(255);


--
-- Temporary view structure for view `tav`
--

DROP TABLE IF EXISTS `tav`;
/*!50001 DROP VIEW IF EXISTS `tav`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `tav` AS SELECT 
 1 AS `tenant_id`,
 1 AS `room_no`,
 1 AS `dob`,
 1 AS `name`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tenant`
--

DROP TABLE IF EXISTS `tenant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant` (
  `tenant_id` int NOT NULL,
  `name` varchar(30) DEFAULT NULL,
  `dob` varchar(10) DEFAULT NULL,
  `stat` varchar(10) DEFAULT NULL,
  `room_no` int DEFAULT NULL,
  `age` int DEFAULT NULL,
  PRIMARY KEY (`tenant_id`),
  KEY `fk_rn` (`room_no`),
  CONSTRAINT `fk_rn` FOREIGN KEY (`room_no`) REFERENCES `room` (`room_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant`
--

-- Temporarily disable foreign key checks to avoid constraint violations
SET foreign_key_checks = 0;

-- Lock the `tenant` table to prevent other operations during insertion
LOCK TABLES `tenant` WRITE;

-- Disable indexes temporarily
/*!40000 ALTER TABLE `tenant` DISABLE KEYS */;

-- Insert data into `tenant` table
INSERT INTO `tenant` VALUES
    (601, 'nithin', '01-apr-02', 'no', 11, 19),
    (602, 'rohith', '23-aug-02', 'not paid', 12, 23),
    (603, 'mothi', '12-jun-02', 'not paid', 13, 41),
    (604, 'abu danish', '23-apr-02', 'not paid', 21, 35),
    (605, 'Hari', '30-sep-02', 'not paid', 31, 56),
    (606, 'Rakesh', '15-mar-02', 'not paid', 14, 28),
(607, 'Deepak', '07-jul-02', 'paid', 15, 33),
(608, 'Karthik', '05-feb-02', 'not paid', 16, 48),
(609, 'Vishal', '21-dec-02', 'no', 17, 22),
(610, 'Sunil', '19-may-02', 'paid', 18, 44),
(611, 'Sanjay', '02-aug-02', 'not paid', 19, 39),
(612, 'Ajay', '11-oct-02', 'no', 11, 50),
(613, 'Ganesh', '09-nov-02', 'not paid', 22, 47),
(614, 'Kiran', '20-mar-02', 'paid', 13, 36),
(615, 'Vikram', '13-apr-02', 'no', 12, 42),
(616, 'Pranav', '29-may-02', 'not paid', 14, 51),
(617, 'Yash', '16-jun-02', 'paid', 10, 29),
(618, 'Rajesh', '10-jan-02', 'not paid', 15, 33),
(619, 'Ravi', '08-dec-02', 'no', 16, 45),
(620, 'Harish', '25-sep-02', 'paid', 17, 55),
(621, 'Suresh', '18-feb-02', 'not paid', 18, 30),
(622, 'Rohan', '27-aug-02', 'no', 19, 32),
(623, 'Vignesh', '14-apr-02', 'not paid', 20, 60),
(624, 'Dinesh', '31-mar-02', 'paid', 21, 46),
(625, 'Mohan', '22-jul-02', 'not paid', 23, 40);

-- Re-enable indexes after insertion
/*!40000 ALTER TABLE `tenant` ENABLE KEYS */;

-- Unlock the table after the operation
UNLOCK TABLES;

-- Re-enable foreign key checks to enforce the constraint
SET foreign_key_checks = 1;


