// Difficulties
const diffcultyEasy = 9;
const diffcultyHard = 16;
const diffcultyExpert = 30;

const diffcultyEasyLandmineCount = 10;
const diffcultyHardLandmineCount = 40;
const diffcultyExpertLandmineCount = 99;
const cellWidth = 78;

// Variables
var landmine_coor = [];
var click_row_number = 0;
var click_column_number = 0;
var minesweeper_table = document.getElementById("minesweeper_table");
var changed_value;
var remain_flags = 0;
var total_time = 0;
var win_percentage = 1;
var tr_cell;
var is_flag_mode = false;
var first_click = true;
var isFlagged = false;
var tr_cells;
var td_cells;
var map = [], flag_map = [], expanded = [];
var landmine_count = diffcultyEasyLandmineCount;
var map_size = diffcultyEasy;
var cell_size,gridWidth;
var phpResponse;


let diffculty = "Easy";
let touchScreenTimeOutId;
let won = undefined;
let win_rate,record_time;
let moves = [];
let dropdown_show = false;
let currentAction;

// Code
console.log("Javascript vesion: 1637");
window.onload = () => {
    document.getElementById("game_head").style.width = minesweeper_table.clientWidth + "px";
    document.getElementById("lose_audio").volume = 0.8;
    if (login) {
        document.getElementById("winRateData").innerHTML = win_rate + "%";
        document.getElementById("bestTimeData").innerHTML = bestTime + "s";
        document.getElementById("serverBestData").innerHTML = serverBestTime + "s";
        if (!dropdown_show) {
            document.getElementById("register").addEventListener("click", function() {
                document.getElementById("dropdown_menu").classList.toggle("dropdown-show");
                dropdown_show = true;
                event.stopPropagation();
            })
            window.addEventListener("click", function(event) {
                const dropdownMenu = document.getElementById("dropdown_menu");
                if (dropdown_show && !dropdownMenu.contains(event.target)) {
                    dropdownMenu.classList.remove("dropdown-show");
                    dropdown_show = false;
                }
            })
        }
    }
}

// generate minesweeper map
function generateMap(onReplay) {
    if (!onReplay) {
        map.length = 0;
    }
    expanded.length = 0;
    flag_map.length = 0;
    const tableBody = document.createElement("tbody");
    tableBody.id = "mapBody";
    minesweeper_table.appendChild(tableBody);
    for (let r = 0; r < map_size; r++) {
        const createTr = document.createElement("tr");
        createTr.id = r;
        document.getElementById("mapBody").appendChild(createTr);
        // Dynamically generated
        if (!onReplay) {
            map.push([]);
        }
        flag_map.push([]);
        expanded.push([]);
        for (let c = 0; c < map_size; c++) {
            const createTd = document.createElement("td");
            document.getElementById(r).appendChild(createTd);
            if (!onReplay) {
                map[r].push(0);
            }
            flag_map[r].push(0);
            expanded[r].push(0);
        };
    };
    td_cells = document.querySelectorAll("td");
    tr_cells = document.querySelectorAll("tr");
    gridWidth = minesweeper_table.rows[0].cells[0].offsetWidth;
};

function addEventListeners() {
    // use EventListener instead of "onclick"
    td_cells.forEach(detect_td_onclick => { // check left click
        if (detect_td_onclick.parentNode.parentNode.parentNode.id != "gameHead") {
            detect_td_onclick.addEventListener("click", function () {
                if (!is_flag_mode) {
                    currentAction = "click_cell";   
                } else {
                    currentAction = "put_flag";
                }
                click(this);
            });
        };
    });

    // hold for 1s to place flag
    td_cells.forEach(hold_right_click => {
        hold_right_click.addEventListener("touchstart", function () {
            touchScreenTimeOutId = setTimeout(function () {
                currentAction = "put_flag";
                click(hold_right_click);
            }, 1000);
        });

        hold_right_click.addEventListener("touchend", function () {
            clearTimeout(touchScreenTimeOutId);
        });
    });

    // right click
    td_cells.forEach(cell => {
        cell.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            currentAction = "put_flag";
            click(cell);
        })
    })
}

// Initialize the game, including remove the existing data.
function init(onReplay) {
    // document.getElementById("head").style.width = document.getElementById("minesweeper").style.width;
    if (login) {
        win_rate = Math.round(100 / parseFloat(stats[1]) * parseFloat(stats[0]));
    }
    // Remove existing data.
    if (document.getElementById("mapBody")) {
        document.getElementById("mapBody").remove(); // reset minesweeper map
    } 
    remain_flags = landmine_count;
    total_time = 0;
    update_time();
    first_click = true;
    if (!onReplay) {
        map.length = 0;
    }

    // Create a new one
    if (onReplay) {
        generateMap(true); // recreate map
    } else {
        generateMap(false);
    }
    addEventListeners();
    document.getElementById("remaining_flag_number").innerHTML = remain_flags;
    try {
        clearInterval(record_time);
    }
    catch(err) {

    }
    record_time = setInterval(update_time, 1000);
}

function switch_flag_mode() {
    if (is_flag_mode) {
        is_flag_mode = false;
        minesweeper_table.style.cursor = "auto";
        document.getElementById("flag_mode_button").src = "flag_button.png";
    } else {
        minesweeper_table.style.cursor = "url('Website_Icon.ico'),auto";
        is_flag_mode = true;
        document.getElementById("flag_mode_button").src = "pressed_flag_button.png";
    }
}

function update_time() {
    document.getElementById("total_used_time").innerHTML = total_time;
    total_time += 1;
};

function generateLandmine(click_row_number, click_column_number) {
    landmine_coor.length = 0;
    for (let i = 0; i < landmine_count; i++) {
        // Get the landmine coords
        let random_row = Math.floor(Math.random() * map_size); // Random row
        let random_column = Math.floor(Math.random() * map_size); // Random col
        random_row = random_row.toString();
        random_column = random_column.toString();
        let added_value = random_row + random_column;
        // Prevent same number from appearing
        if (landmine_coor.includes(added_value) || added_value == (click_row_number.toString() + click_column_number.toString())) {
            i -= 1;
            continue;
        } else {
            landmine_coor.push(added_value);
            map[random_row][random_column] = 9;
        };
    };

    for (let r = 0; r < map_size; r++) {
        for (let c = 0; c < map_size; c++) {
            var landmine_beside = 0;
            if (map[r][c] != 9) {
                if (r - 1 >= 0 && c - 1 >= 0) {
                    if (map[r - 1][c - 1] == 9) {
                        landmine_beside += 1
                    };
                }
                if (r - 1 >= 0) {
                    if (map[r - 1][c] == 9) {
                        landmine_beside += 1
                    };
                }
                if (r - 1 >= 0 && c + 1 <= map_size - 1) {
                    if (map[r - 1][c + 1] == 9) {
                        landmine_beside += 1
                    };
                }
                if (c - 1 >= 0) {
                    if (map[r][c - 1] == 9) {
                        landmine_beside += 1
                    };
                }
                if (c + 1 <= map_size - 1) {
                    if (map[r][c + 1] == 9) {
                        landmine_beside += 1
                    };
                }
                if (r + 1 <= map_size - 1 && c - 1 >= 0) {
                    if (map[r + 1][c - 1] == 9) {
                        landmine_beside += 1
                    };
                }
                if (r + 1 <= map_size - 1) {
                    if (map[r + 1][c] == 9) {
                        landmine_beside += 1
                    };
                }
                if (r + 1 <= map_size - 1 && c + 1 <= map_size - 1) {
                    if (map[r + 1][c + 1] == 9) {
                        landmine_beside += 1
                    };
                }
                map[r][c] = landmine_beside;
            }
        }
    }
}

function expand_cell(row, col) {
    expanded[row][col] = 1;
    minesweeper_table.rows[row].cells[col].style.border = "1px solid";
    if (map[row][col] != 9) {
        if (row - 1 >= 0 && col - 1 >= 0) {
            if (map[row-1][col-1] != 9) {
                check_landmine(row - 1, col - 1);
                if (map[row - 1][col - 1] == 0 && expanded[row - 1][col - 1] == 0) {
                    expand_cell(row - 1, col - 1);
                };
            };
        };
        if (row - 1 >= 0) {
            if (map[row-1][col] != 9) {
                check_landmine(row - 1, col);
                if (map[row - 1][col] == 0 && expanded[row - 1][col] == 0) {
                    expand_cell(row - 1, col);
                };
            }
        }
        if (row - 1 >= 0 && col + 1 <= map_size - 1) {
            if (map[row-1][col+1] != 9) {
                check_landmine(row - 1, col + 1);
                if (map[row - 1][col + 1] == 0 && expanded[row - 1][col + 1] == 0) {
                    expand_cell(row - 1, col + 1);
                };
            }
        }
        if (col - 1 >= 0) {
            if (map[row][col-1] != 9) {
                check_landmine(row, col - 1);
                if (map[row][col - 1] == 0 && expanded[row][col - 1] == 0) {
                    expand_cell(row, col - 1);
                };
            }
        }
        if (col + 1 <= map_size - 1) {
            if (map[row][col+1] != 9) {
                check_landmine(row, col + 1);
                if (map[row][col + 1] == 0 && expanded[row][col + 1] == 0) {
                    expand_cell(row, col + 1);
                };
            }
        }
        if (row + 1 <= map_size - 1 && col - 1 >= 0) {
            if (map[row+1][col-1] != 9) {
                check_landmine(row + 1, col - 1);
                if (map[row + 1][col - 1] == 0 && expanded[row + 1][col - 1] == 0) {
                    expand_cell(row + 1, col - 1);
                };
            }
        }
        if (row + 1 <= map_size - 1) {
            if (map[row+1][col] != 9) {
                check_landmine(row + 1, col);
                if (map[row + 1][col] == 0 && expanded[row + 1][col] == 0) {
                    expand_cell(row + 1, col);
                };
            }
        }
        if (row + 1 <= map_size - 1 && col + 1 <= map_size - 1) {
            if (map[row+1][col+1] != 9) {
                check_landmine(row + 1, col + 1);
                if (map[row + 1][col + 1] == 0 && expanded[row + 1][col + 1] == 0) {
                    expand_cell(row + 1, col + 1);
                };
            }
        };
    }
};

function check_landmine(click_row_number, click_column_number) {
    changed_value = minesweeper_table.rows[click_row_number].cells[click_column_number];
    changed_value.style.backgroundSize = gridWidth * 0.8 + 'px' + " " + gridWidth * 0.8 + 'px';
    if (minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundImage.includes("./image/Minesweeper_Flag_Icon.png")) {
        remain_flags += 1;
        document.getElementById("remaining_flag_number").innerHTML = remain_flags;
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundColor = "rgb(189,189,189)";
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundImage = "none";
        flag_map[click_row_number][click_column_number] = 0;
    } else if (map[click_row_number][click_column_number] == 9 && flag_map[click_row_number][click_column_number] != 1) {
        // If the player click on the landmine...
        won = false;
        changed_value.style.backgroundImage = "url('./image/Minesweeper_Icon_Bomb.png')";
        changed_value.style.backgroundColor = "red";
        for (let r = 0;r < map_size;r++) {
            for (let c = 0;c < map_size;c++) {
                if (map[r][c] == 9 && flag_map[r][c] != 1) {
                    minesweeper_table.rows[r].cells[c].style.backgroundImage = "url('./image/Minesweeper_Icon_Bomb.png')";
                    minesweeper_table.rows[r].cells[c].style.backgroundSize = gridWidth * 0.8 + 'px' + " " + gridWidth * 0.8 + 'px';
                } else if (map[r][c] == 9 && flag_map[r][c] == 1) {
                    minesweeper_table.rows[r].cells[c].style.backgroundImage = "url('./image/flagged_landmine.png')";
                    minesweeper_table.rows[r].cells[c].style.backgroundSize = gridWidth * 0.8 + 'px' + " " + gridWidth * 0.8 + 'px';
                } else if (map[r][c] != 9 && flag_map[r][c] == 1) {
                    minesweeper_table.rows[r].cells[c].style.backgroundImage = "url('./image/wrong_flag.png')";
                    minesweeper_table.rows[r].cells[c].style.backgroundSize = gridWidth * 0.8 + 'px' + " " + gridWidth * 0.8 + 'px';
                };
            };
        };
        document.getElementById("lose_audio").play();
        clearInterval(record_time);
        if (login) {
            store_data("lose","./src/win_rate.php");
        };
        return;
    } else {
        if (!document.getElementById("click_audio").paused) {
            document.getElementById("click_audio").currentTime = 0;
            document.getElementById("click_audio").play();
        } else {
            document.getElementById("click_audio").play();
        };
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.border = "1px solid black";
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.width = gridWidth-4 + "px";
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.height = gridWidth-4 + "px";
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.fontSize = gridWidth * 0.6 + "px";
        minesweeper_table.rows[click_row_number].cells[click_column_number].classList.add("clicked");
        if (map[click_row_number][click_column_number] != 0) {
            minesweeper_table.rows[click_row_number].cells[click_column_number].innerHTML = map[click_row_number][click_column_number];
            minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundColor = "white";
        } else {
            minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundColor = "white";
        }
    };

    // Change the color of the number depend on the value
    const number_on_the_cell = minesweeper_table.rows[click_row_number].cells[click_column_number].innerHTML;
    if (number_on_the_cell == 1) {
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.color = "blue";
    } else if (number_on_the_cell == 2) {
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.color = "green";
    } else if (number_on_the_cell == 3) {
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.color = "red";
    } else if (number_on_the_cell == 4) {
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.color = "purple";
    } else if (number_on_the_cell >= 5) {
        minesweeper_table.rows[click_row_number].cells[click_column_number].style.color = "black";
    };
};

function click(cell, onReplay=false) {
    switch (currentAction) {
        case "click_cell":
            // left click 
            if (!is_flag_mode) {
                click_row_number = cell.parentNode.rowIndex;
                click_column_number = cell.cellIndex;
                if (first_click && !onReplay) {
                    generateLandmine(click_row_number,click_column_number);
                };
                check_landmine(click_row_number, click_column_number);
                if (map[click_row_number][click_column_number] == 0) {
                    expand_cell(click_row_number, click_column_number);
                };
                first_click = false;
                // const dataList = [
                //     document.getElementById("total_used_time").innerHTML,
                //     "\r\n",
                //     remain_flags,
                //     "\r\n",
                //     map,
                //     "\r\n",
                //     flag_map,
                //     "\r\n",
                //     expanded,
                // ];
                if (!onReplay) {
                    addToMoves(click_row_number,click_column_number,false);
                }
            } if (onReplay) {
                minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundColor = "rgba(232,157,51,0.5)";
                setTimeout(function() {minesweeper_table.rows[click_row_number].cells[click_column_number].style.backgroundColor = "rgb(255,255,255)"},500);
            } else if (is_flag_mode) {

            }
            break;

        case "put_flag":
            // right click, hold, and flag mode
            var right_click_row = cell.parentNode.rowIndex;
            if (remain_flags > 0 && !first_click && minesweeper_table.rows[right_click_row].cells[cell.cellIndex].innerHTML == "" && flag_map[right_click_row][cell.cellIndex] != 1 && expanded[right_click_row][cell.cellIndex] != 1 && cell.parentNode.parentNode.parentNode.id != "gameHead") {
                if (!onReplay) {
                    addToMoves(right_click_row,cell.cellIndex,true);
                }
                remain_flags -= 1;
                cell.style.backgroundImage = "url('./image/Minesweeper_Flag_Icon.png')";
                cell.style.backgroundSize = gridWidth * 0.8 + 'px' + " " + gridWidth * 0.8 + 'px';
                document.getElementById("remaining_flag_number").innerHTML = remain_flags;
                flag_map[right_click_row][cell.cellIndex] = 1;
                if (!document.getElementById("put_flag_audio").paused) {
                    document.getElementById("put_flag_audio").currentTime = 0;
                }
                document.getElementById("put_flag_audio").play();
                window.navigator.vibrate([500]);

                won = true;
                for (let r = 0; r < map_size; r++) {
                    for (let c = 0; c < map_size; c++) {
                        if (map[r][c] == 9 && flag_map[r][c] !== 1) {
                            won = false;
                            break;
                        }
                    }
                    if (!won) {
                        break;
                    }
                }

                if (won) {;
                    clearInterval(record_time);
                    if (login) {
                        document.getElementById("time_spent").innerHTML = document.getElementById("total_used_time").innerHTML + "s";
                        if (diffculty == "Easy") {
                            document.getElementById("landmine_removed").innerHTML = 10;
                        } else if (diffculty == "Hard") {
                            document.getElementById("landmine_removed").innerHTML = 40;
                        } else if (diffculty == "Expert") {
                            document.getElementById("landmine_removed").innerHTML = 99;
                        }
                        document.getElementById("win_rate").innerHTML = win_rate + "%";
                        openMenu("win_msg", "openPopup");
                        store_data(document.getElementById("total_used_time").innerHTML,"./src/shortest_time.php");
                        store_data("win","./src/win_rate.php");
                    } else {
                        document.getElementById("time_spent").innerHTML = document.getElementById("total_used_time").innerHTML + "s";
                        if (diffculty == "Easy") {
                            document.getElementById("landmine_removed").innerHTML = 10;
                        } else if (diffculty == "Hard") {
                            document.getElementById("landmine_removed").innerHTML = 40;
                        } else if (diffculty == "Expert") {
                            document.getElementById("landmine_removed").innerHTML = 99;
                        };
                        document.getElementById("win_rate_p").innerHTML = "<a href='login.php'>login</a> to record your win rate";
                        openMenu("win_msg", "openPopup");
                    }
                    document.getElementById("win_audio").play();
                };
            } else if (remain_flags < 0) {
                return;
            } else if (first_click) {
                return;
            }
            break;
    }
};

function changeSize() {
    diffculty = document.getElementById("sizeSelection").value;
    if (diffculty == "Easy") {
        map_size = diffcultyEasy;
        landmine_count = diffcultyEasyLandmineCount;
    } else if (diffculty == "Hard") {
        map_size = diffcultyHard;
        landmine_count = diffcultyHardLandmineCount;
    } else if (diffculty == "Expert") {
        map_size = diffcultyExpert;
        landmine_count = diffcultyExpertLandmineCount;
    };
    init();
};

function log_out() {
    // log out
    store_data("logout","./src/log_out.php");
    location.reload();
}

function store_data(data,phpName) {
    fetch(phpName, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=store&data=${data}`,
    })
        .then(response => response.text()) // 将响应转换为文本
        .then(responseData => {
            phpResponse = responseData;
            if (login) {
                if (phpResponse == "server_best") {
                    alert("Congratulation! You are the fastest player in the whole server!");
                    document.getElementById("serverBestDiv").innerHTML = "Server best record: " + total_time + " seconds";
                } else if (phpResponse == "first_one_in_the_server") {
                    alert("You are the first one who won in the whole server!");
                };
            };
        })
        .catch(error => {
            console.error("Error:", error);
        });
};

function openMenu(target, className) {
    document.getElementById(target).classList.add(className);
    minesweeper_table.classList.toggle("background_blur");
}

function closeMenu(target, className) {
    document.getElementById(target).classList.remove(className);
    minesweeper_table.classList.remove("background_blur");
}

function addToMoves(row,col,flag,time) {
    const aMove = { // create data to move
        row,
        col,
        flag
    };

    moves.push(aMove); // move data to moves
}

function replay() {
    td_cells.forEach(detect_td_onclick => {
        detect_td_onclick.removeEventListener("click", click);
    });
    
    closeMenu("win_msg", "openPopup");
    init(true);
    let currentIndex = 0;

    function startReplay() {
        if (currentIndex < moves.length) {
            if (!moves[currentIndex].flag) {
                currentAction = "click_cell";
                click(minesweeper_table.rows[moves[currentIndex].row].cells[moves[currentIndex].col], true);
            } else if (moves[currentIndex].flag) {
                currentAction = "put_flag";
                click(minesweeper_table.rows[moves[currentIndex].row].cells[moves[currentIndex].col], true);
            }
            currentIndex++;
            setTimeout(startReplay,1000);
        }
    }
    setTimeout(startReplay,500);
}

document.getElementById("new_game_btn").addEventListener("click",function() {
    closeMenu("win_msg", "openPopup");
}) 

init(false);
