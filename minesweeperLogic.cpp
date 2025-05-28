#include <iostream>
#include <vector>
#include <chrono>
#include <random>
#include <thread>
using namespace std;

class MinesweeperBoard {
public:
    int width, height, totalMines;
    std::vector<std::vector<bool>> mines; // true if mine
    std::vector<std::vector<bool>> revealed;
    std::vector<std::vector<int>> proximity; // Number of mines in proximity

    MinesweeperBoard(int w, int h, int minesCount)
        : width(w), height(h), totalMines(minesCount) {
        mines.resize(height, std::vector<bool>(width, false));
        revealed.resize(height, std::vector<bool>(width, false));
        proximity.resize(height, std::vector<int>(width, 0));

        // Prints out the minefield
        /*for (int l = 0; l < height; ++l) {
            for (int j = 0; j < width; ++j) {
                cout << mines[l][j] << " ";
            }
            cout << endl;
        }

        cout << "\n\n";


        // Prints out the proximity map
        for (int l = 0; l < height; ++l) {
            for (int j = 0; j < width; ++j) {
                cout << proximity[l][j] << " ";
            }
            cout << endl;
        }*/

    }

    void computeProximity() {
        for (int l = 0; l < height; ++l) {
            for (int j = 0; j < width; ++j) {
                if (mines[l][j] == true) {
                    proximity[l][j] = 9;
                } else {
                    int nearbyMines = 0;
                    for (int heightCheck = -1; heightCheck <= 1; ++heightCheck) {
                        for (int widthCheck = -1; widthCheck <= 1; ++widthCheck) {
                            if (heightCheck == 0 && widthCheck == 0) continue;
                            int neighborHeight = l + heightCheck;
                            int neighborWidth = j + widthCheck;
                            if (neighborHeight >= 0 && neighborHeight < height && neighborWidth >= 0 && neighborWidth < width) {
                                if (mines[neighborHeight][neighborWidth]) {
                                    nearbyMines++;
                                }
                            }
                        }
                    }
                    proximity[l][j] = nearbyMines;
                }
            }
        }
    }

    void copyFrom(const MinesweeperBoard& other) {
        width = other.width;
        height = other.height;
        totalMines = other.totalMines;
        mines = other.mines;
        proximity = other.proximity;
        revealed = std::vector<std::vector<bool>>(height, std::vector<bool>(width, false)); // fresh
    }


    bool revealCell(int x, int y) {
        if (revealed[y][x]) return false;

        revealed[y][x] = true;

        if(mines[y][x]) {
            return true;
        }

        // Floods around cells if they have no mines around them
        if (proximity[y][x] == 0) {
            for (int heightCheck = -1; heightCheck <= 1; ++heightCheck) {
                for (int widthCheck = -1; widthCheck <= 1; ++widthCheck) {
                    if (heightCheck == 0 && widthCheck == 0) continue;
                    int neighborHeight = y + heightCheck;
                    int neighborWidth = x + widthCheck;
                    if (neighborHeight >= 0 && neighborHeight < height && neighborWidth >= 0 && neighborWidth < width) {
                        revealCell(neighborWidth, neighborHeight);
                    }
                }
            }
        }

        return false;
    }

    void printVisibleBoard() const {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (revealed[y][x]) {
                    if (mines[y][x]) cout << "* ";
                    else cout << proximity[y][x] << " ";
                } else {
                    cout << ". ";
                }
            }
            cout << endl;
        }
    }

    int countSafeCells() const {
        int count = 0;
        for (int y = 0; y < height; y++)
            for (int x = 0; x < width; x++)
                if (!mines[y][x]) count++;
        return count;
    }

    int countRevealedSafeCells() const {
        int count = 0;
        for (int y = 0; y < height; y++)
            for (int x = 0; x < width; x++)
                if (revealed[y][x] && !mines[y][x]) count++;
        return count;
    }

    bool isComplete() const {
        return countRevealedSafeCells() == countSafeCells();
    }
};

void placeMines(std::vector<std::vector<bool>>& mines, int width, int height, int totalMines, std::mt19937& gen) {
    uniform_int_distribution<> distWidth(0, width-1);
    uniform_int_distribution<> distHeight(0, height-1);
    int i = 0;

    while (i < totalMines) {

        int randomWidth = distWidth(gen);
        int randomHeight = distHeight(gen);
        if (!mines[randomHeight][randomWidth]) {
            mines[randomHeight][randomWidth] = true;
            i++;
        }
    }
}


class Player {
public:
    int score = 0;
    MinesweeperBoard board;
    std::chrono::steady_clock::time_point startTime;
    std::chrono::steady_clock::time_point endTime;

    Player(int w, int h, int mines) : board(w, h, mines) {}

    void startRound() {
        startTime = std::chrono::steady_clock::now();
    }

    void endRound() {
        endTime = std::chrono::steady_clock::now();
    }

    double getTimeTakenSeconds() const {
        return std::chrono::duration<double>(endTime - startTime).count();
    }

    void calculateScore(bool completed, double maxTimeAllowed) {
        int safeCells = board.countSafeCells();
        int revealedSafe = board.countRevealedSafeCells();
        double percentage = (double)revealedSafe / safeCells;

        double timeTaken = getTimeTakenSeconds();
        if (completed) {
            score += 1000;  // fixed completion bonus
        } else {
            if (percentage < 0.10) {
                // No speed bonus if less than 10% solved
                score += static_cast<int>(percentage * 500);
            } else {
                double timeFactor = std::min(maxTimeAllowed / timeTaken, 2.0); // clamp max speed bonus
                score += static_cast<int>(percentage * 500 * timeFactor);
            }
        }
    }
};

void simulateRound(Player& player) {
    player.startRound();
    while (!player.board.isComplete()) {
        int x, y;
        cout << "Enter cell to reveal (x y): ";
        cin >> x >> y;

        if (x < 0 || x >= player.board.width || y < 0 || y >= player.board.height) {
            cout << "Invalid input. Try again.\n";
            continue;
        }

        if (player.board.revealed[y][x]) {
            cout << "Cell already revealed. Try again.\n";
            continue;
        }

        bool hitMine = player.board.revealCell(x, y);
        player.board.printVisibleBoard();

        if (hitMine) {
            cout << "BOOM! You hit a mine. Round over.\n";
            break;
        }
    }
    player.endRound();
}

/*struct GameRound {
    MinesweeperBoard baseBoard;
    vector<Player> players;

    GameRound(int w, int h, int mines, int numPlayers) : baseBoard(w, h, mines) {
        for (int i = 0; i < numPlayers; ++i) {
            players.emplace_back(w, h, mines);
            players[i].board.copyFrom(baseBoard); // Copy base board
        }
    }
};*/


int main() {
    int rounds = 5;
    int width = 10, height = 10, mines = 10;
    double maxTimeAllowed = 180.0;

    std::random_device rd;
    std::mt19937 gen(rd());

    Player player1(width, height, mines);

    for (int r = 1; r <= rounds; ++r) {
        cout << "Round " << r << "\n";

        // Generate shared minefield
        vector<vector<bool>> mineGrid(height, vector<bool>(width, false));
        placeMines(mineGrid, width, height, mines, gen);

        MinesweeperBoard roundBoard(width, height, mines);
        roundBoard.mines = mineGrid;
        roundBoard.computeProximity();  // make a new function to generate proximity from `mines`

        player1.board.copyFrom(roundBoard);
        simulateRound(player1);
        player1.calculateScore(player1.board.isComplete(), maxTimeAllowed);
        cout << "Score after Round " << r << ": " << player1.score << "\n\n";
    }

    return 0;
}

