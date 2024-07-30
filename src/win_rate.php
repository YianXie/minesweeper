<?php 
session_start();
$login = $_SESSION["loginStatus"];
if ($login) {
    $username = $_SESSION["username"];
    $fileName = "./userdata/" . $username . "/" . $username . "win_rate.txt";

    $win = $_POST["data"]; 
    if ($win == "win") {
        $win = true;
    } else if ($win == "lose") {
        $win = false;
    }

    if (is_bool($win)) {
        echo "is bool";
        if ($win) {
            echo "win" . "\r\n";
            $new_file = fopen($fileName,"c");
            fclose($new_file);
            $original_data = file($fileName);
            print_r($original_data);
            if (!in_array("",$original_data)) {
                $win_number = $original_data[0];
                $total_number = $original_data[1];
                $win_number += 1;
                $total_number += 1;
                $file = fopen($fileName,"w");
                fwrite($file,$win_number);
                fwrite($file,"\r\n");
                fwrite($file,$total_number);
            } else {
                $win_number = 1;
                $total_number = 1;
                $file = fopen($fileName,"w");
                fwrite($file,$win_number);
                fwrite($file,"\r\n");
                fwrite($file,$total_number);
            }
        } else if (!$win) {
            $add_win_rate = fopen($fileName,"c") or die("unable to open file");
            fseek($add_win_rate,0);
            fclose($add_win_rate);
            $original_data = file($fileName);
            print_r($original_data);
            if (!in_array("",$original_data)) {
                $total_number = $original_data[1];
                $total_number += 1;
                $file = fopen($fileName,"w");
                fwrite($file,$original_data[0]);
                fwrite($file,$total_number);
            } else {
                $total_number = 1;
                $file = fopen($fileName,"w");
                fwrite($file,0);
                fwrite($file,"\r\n");
                fwrite($file,$total_number);
            }
        }
        fclose($file);
    } else {
        echo "not bool";
    }
}
?>