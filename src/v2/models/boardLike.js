/*
[Schema]
CREATE TABLE IF NOT EXISTS BOARD_LIKE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    boardId INT NOT NULL,
    likerId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (boardId) REFERENCES BOARD(id) ON DELETE CASCADE,
    FOREIGN KEY (likerId) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 */

class BoardLike {

}

module.exports = BoardLike;