<?php
$servername = "localhost";      // o el host de tu servidor
$username   = "u157683007_Torres";           // tu usuario MySQL (puede ser distinto en hosting)
$password   = "Torres2025";               // tu contraseña MySQL
$database   = "u157683007_serendipia";     // el nombre de tu base de datos

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
