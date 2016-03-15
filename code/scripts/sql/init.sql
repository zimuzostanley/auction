/*
* Initialization script for auction database.
* Creates the database and schemas.
* Prerequisite: create a user with permissions on the 'auction' database or
* whatever you name your database (<db_name>). E.g:
* 1. CREATE USER '<user>'@'localhost' IDENTIFIED BY 'password'; // Create user
* 2. GRANT ALL PRIVILEGES ON '<db_name>'.* TO '<user>'@'localhost'; // Grant privileges
* 3. FLUSH PRIVILEGES // Save privileges;
*/


/* Create database */
DROP DATABASE IF EXISTS auction;
CREATE DATABASE auction;
USE auction;

/* Create tables */
-- Inventory
CREATE TABLE Inventory (
       id INT PRIMARY KEY AUTO_INCREMENT,
       bread INT DEFAULT 30, -- quantity of bread
       carrot INT DEFAULT 18, -- quantity of carrot
       diamond INT DEFAULT 1 -- quantity of diamond
);

-- Player
CREATE TABLE Player (
       id INT PRIMARY KEY AUTO_INCREMENT,
       email VARCHAR(255) UNIQUE,
       inventory_id INT NOT NULL,
       coins INT DEFAULT 1000,
       date DATETIME DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (inventory_id) REFERENCES Inventory(id)
);

-- Auction
CREATE TABLE Auction (
       id INT PRIMARY KEY AUTO_INCREMENT,
       bread INT DEFAULT 0, -- quantity of bread
       carrot INT DEFAULT 0, -- quantity of carrot
       diamond INT DEFAULT 0, -- quantity of diamond
       player_id INT NOT NULL, -- owner of auction
       cur_state ENUM ('done', 'queued', 'running') NOT NULL DEFAULT 'queued', -- state of auction
       cur_bid_player_id INT, -- Player with current bid
       cur_bid_amount INT DEFAULT 0, -- Amount of current bid
       FOREIGN KEY (player_id) REFERENCES Player(id), 
       FOREIGN KEY (cur_bid_player_id) REFERENCES Player(id)
);









