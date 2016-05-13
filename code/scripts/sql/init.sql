 /*
* Initialization script for auction database.
* Creates the database and schemas.
* Prerequisite: create a user with permissions on the 'auction' database or
* whatever you name your database (<db_name>). E.g:
* 1. CREATE USER '<user>'@'localhost' IDENTIFIED BY 'password'; // Create user
* 2. GRANT ALL PRIVILEGES ON <db_name>.* TO '<user>'@'localhost'; // Grant privileges
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
       bread INT DEFAULT 30 NOT NULL, -- quantity of bread
       carrot INT DEFAULT 18 NOT NULL, -- quantity of carrot
       diamond INT DEFAULT 1 NOT NULL -- quantity of diamond
);

-- Player
CREATE TABLE Player (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255) UNIQUE NOT NULL,
       inventory_id INT NOT NULL,
       coins INT DEFAULT 1000 NOT NULL,
       date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
       FOREIGN KEY (inventory_id) REFERENCES Inventory(id)
);

-- Auction
CREATE TABLE Auction (
       id INT PRIMARY KEY AUTO_INCREMENT,
       item ENUM ('Bread', 'Carrot', 'Diamond') NOT NULL,
       time_remaining INT DEFAULT 90 NOT NULL, -- time left before it enters the 10 second 'extra time'
       quantity INT DEFAULT 0 NOT NULL, -- quantity of bread
       player_id INT NOT NULL, -- owner of auction
       cur_state ENUM ('done', 'queued') NOT NULL DEFAULT 'queued', -- state of auction
       cur_bid_player_id INT, -- Player with current bid
       cur_bid_amount INT DEFAULT 0 NOT NULL, -- Amount of current bid
       date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,	
       FOREIGN KEY (player_id) REFERENCES Player(id), 
       FOREIGN KEY (cur_bid_player_id) REFERENCES Player(id)
);









