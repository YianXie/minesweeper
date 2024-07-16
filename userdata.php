<?php 
session_start();

$file_name = "username_password.txt";
$loggedIn = false;

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $username = htmlspecialchars($_GET["username"]);
    $password = htmlspecialchars($_GET["password"]);
    $username = (string)$username;
    $password = (string)$password;

    $file = fopen($file_name,"a") or die("unable to open file");
// if there is no username or passoword, the file will not close.
    if ($username !== "" && $password !== "") {
        fwrite($file,$username);
        fwrite($file,":");
        fwrite($file,$password);
        fwrite($file,"\r\n");
        fclose($file);
    }
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $file = fopen($file_name, "r") or die("unable to open file");

    // $login_username = htmlspecialchars($_POST["username"]);
    // $login_password = htmlspecialchars($_POST["password"]);
    // echo $login_username;
    // echo "<br>";
    // echo $login_password;

    $login_username = $_POST["username"];
    $login_password = $_POST["password"];


    if ($file) {
        while ($line = fgets($file)) {
            $line = trim($line);
            $data_string = explode(":", $line);
            if ( strtolower($login_username) == strtolower($data_string[0]) && $login_password == $data_string[1]) {
                $loggedIn = true;
                $_SESSION["username"] = $data_string[0];
                $_SESSION["loginStatus"] = $loggedIn;
                fclose($file);
                header("Location: index.php");
                exit;
            } 
        }
    }
    fclose($file);

    // 如果登录失败，返回相应的消息
    if (!$loggedIn) {
        header("Location: login.php?error=true");
        exit;
    }
}
?>
