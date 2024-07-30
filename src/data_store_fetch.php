<?php
session_start();
$username = $_SESSION["username"];
$filename =  "./userdata/" . $username  . "/" . $username . ".txt";

if ( isset($_POST["action"]) && isset($_POST["data"]) ) {
    // store data
    if ( $_POST["action"] == "store" ) {
        $data = htmlspecialchars($_POST["data"]);

        $file = fopen($filename,"w") or die("unable to open file");
        if ($file) {
            fwrite($file,$data);
            fwrite($file,"\r\n");
            fclose($file);
        } else {
            echo "Failed to open file for writing.";
        }
    } 
}
?>
