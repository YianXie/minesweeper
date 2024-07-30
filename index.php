<?php session_start()?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Minesweeper</title>
        <meta http-equiv="expires" content="0">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="cache-control" content="no-cache">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <link href="./src/index.css" rel="stylesheet" media="screen and (min-width: 700px)" type="text/css">
        <link href="./src/smallscreen.css" rel="stylesheet" media="screen and (max-width: 700px)" type="text/css">
        <link href="./image/Website_Icon.ico" rel="icon" type="image/x-icon">
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' >
    </head>
    <body id="body">
        <header>
            <div class="game-title">
                <img src="./image/Minesweeper_Flag_Icon.png" alt="icon" height="60" width="60">
                <span id="bigtitle" class="title">Minesweeper</span>
            </div>
            <div class="profile">
                <div class="user-info">
                    <i class='bx bxs-cog' onclick="openMenu('setting', 'setting-show')"></i>
                    <div style="font-size: x-large;"><a id="register" href="register.php" class="register">Register</a></div>
                </div>
                <div id="dropdown_menu" class="dropdown">
                    <a href="javascript:openMenu('stats', 'stats-show')" class="stats-text">Stats</a>
                    <hr>
                    <a href="javascript:log_out()" style="color: red;" id="log_out">Log out</a>
                </div>
            </div>
        </header>

        <div class="setting" id="setting">
            <div class="setting-head">
                <div class="setting-text">Setting</div>
                <i class='bx bxs-x-circle' onclick="closeMenu('setting', 'setting-show')"></i>
            </div>
            <div class="diffculty-selection">
                Diffculty
                <select name="diffculty" id="diffculty" class="diffculty">
                    <option value="easy">Easy</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>
            <div class="toturial">
                How to play
                <p style="font-weight: normal;">In minesweeper game, players need to find out the hidden mines by using the numbers that shows how many mines are there within the 8 blocks beside.</p>
            </div>
        </div>
        
        <div id="win_msg" class="win_msg">
            <div class="winHead">
                <span>You won!</span>
                <i class='bx bxs-x-circle' onclick="closeMenu('win_msg', 'openPopup')"></i>
            </div>
            <div style="background-color: white;" class="win_stats">
                <br>
                <p>Time Spent</p>
                <span id="time_spent"></span>
                <p>Landmine Removed</p>
                <span id="landmine_removed"></span>
                <p id="win_rate_p">Win Rate</p>
                <div id="win_rate" style="font-size: 35px;font-weight: bold"></div>
                <button onclick="replay()">Watch Replay</button>
                <button type="button" onclick="init()" class="new_game_btn" id="new_game_btn">New Game</button>
            </div>
        </div>

        <div class="stats" id="stats">
            <div class="title">Your Stats</div>
            <i class='bx bxs-x-circle' onclick="closeMenu('stats', 'stats-show')"></i>
            <div class="win-rate">
                <div class="win-rate-text">Win Rate</div>
                <div class="win-rate-data" id="winRateData"></div>
            </div>
            <div class="best-time">
                <div class="best-time-text">Personal Record</div>
                <div class="best-time-data" id="bestTimeData"></div>
            </div>
            <div class="server-best">
                <div class="server-best-text">Server Record</div>
                <div class="server-best-data" id="serverBestData"></div>
            </div>
        </div>

        <div> 
            <audio id="lose_audio">
                <source src="./audio/bomb_explosion.mp3" type="audio/mpeg">
            </audio>
            <audio id="click_audio">
                <source src="./audio/Minesweeper_Click.mp3" type="audio/mpeg">
            </audio>
            <audio id="gameStart" autoplay>
                <source src="./audio/start.mp3" type="audio/mpeg">
            </audio>
            <audio id="win_audio">
                <source src="./audio/minesweeper_win.mp3" type="audio/mpeg">
            </audio>
            <audio id="put_flag_audio">
                <source src="./audio/put_flag.mp3" type="audio/mpeg">
            </audio>
        </div>
        
        <main>
            <div class="head" id="game_head">
                <div class="leftFlag">
                    <img src="./image/flag_button.png" onclick="switch_flag_mode()" style="cursor: pointer; margin-right: 2px;" id="flag_mode_button">
                    <span id="remaining_flag_number" class="remain-flag"></span>
                </div>
                <div id="total_used_time" style="text-align: right;" class="time"></div>
            </div>
            <table class="minesweeper" id="minesweeper_table"></table>
        </main>

        <?php 
        $username = $_SESSION["username"];
        $loginStatus = $_SESSION["loginStatus"];
        echo '<script>';
        echo 'var jsUsername = "' . $username . '";';
        echo 'let login = "' . $loginStatus . '";';
        echo '</script>';
        if ($loginStatus) {
            mkdir("./userdata/" . $username);
            $timeFileName = "./userdata/" . $username . "/" . $username . "time.txt";
            $file = fopen($timeFileName,"c+");
            while (!feof($file)) {
                $line = fgets($file);
                if ($line != "") {
                    echo '<script>';
                    echo 'var bestTime = ' . $line . ';';
                    echo '</script>';
                }
            }

            $stats = file("./userdata/" . $username . "/" . $username . "win_rate.txt");
            $json_stats = json_encode($stats);
            echo "<script>";
            echo 'var stats = ' . $json_stats . ';';
            echo "</script>";
        }

        $serverBest = fopen("server_best.txt","r");
        while (!feof($serverBest)) {
            $serverBestTime = fgets($serverBest);
            echo "<script>";
            echo 'var serverBestTime = "' . $serverBestTime . '";';
            echo "</script>";
        }
        ?>
        <script>
            if (login) {
                document.getElementById("register").innerHTML = jsUsername;
                document.getElementById("register").href = "#";
            };
        </script>
        <script src="index.js"></script>
    </body>
</html>