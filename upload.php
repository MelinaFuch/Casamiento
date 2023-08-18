<?php
header('Content-Type: application/json');

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $mysqli = new mysqli('localhost', 'root', '', 'casamiento');

  if ($mysqli->connect_errno) {
    $response['success'] = false;
    $response['message'] = 'Hubo un error al conectar a la base de datos.';
  } else {
    $query = "SELECT * FROM imagenes";
    $result = $mysqli->query($query);

    if ($result) {
      $images = array();
      while ($row = $result->fetch_assoc()) {
        $images[] = $row;
      }

      $response['success'] = true;
      $response['images'] = $images;
    } else {
      $response['success'] = false;
      $response['message'] = 'Hubo un error al obtener las imágenes de la base de datos.';
    }
  }

  echo json_encode($response);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  parse_str(file_get_contents("php://input"), $data);
  $imageId = intval($data['imageId']);

  $mysqli = new mysqli('localhost', 'root', '', 'casamiento');

  if ($mysqli->connect_errno) {
    $response['success'] = false;
    $response['message'] = 'Hubo un error al conectar a la base de datos.';
  } else {
    // Obtener la ruta de la imagen desde la base de datos
    $query = "SELECT ruta FROM imagenes WHERE id = $imageId";
    $result = $mysqli->query($query);

    if ($result && $result->num_rows === 1) {
      $row = $result->fetch_assoc();
      $imagePath = $row['ruta'];

      // Eliminar la imagen de la base de datos
      $deleteQuery = "DELETE FROM imagenes WHERE id = $imageId";
      if ($mysqli->query($deleteQuery)) {
        // Eliminar el archivo de la carpeta uploads
        if (unlink($imagePath)) {
          $response['success'] = true;
          $response['message'] = 'La imagen se ha eliminado correctamente.';
        } else {
          $response['success'] = false;
          $response['message'] = 'Hubo un error al eliminar la imagen del servidor.';
        }
      } else {
        $response['success'] = false;
        $response['message'] = 'Hubo un error al eliminar la imagen de la base de datos.';
      }
    } else {
      $response['success'] = false;
      $response['message'] = 'No se encontró la imagen en la base de datos.';
    }
  }

  echo json_encode($response);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (isset($_FILES['image'])) {
    $imageFile = $_FILES['image'];

    if (getimagesize($imageFile['tmp_name']) === false) {
      $response['success'] = false;
      $response['message'] = 'Hubo un error al subir la imagen. Formato de archivo no válido.';
    } else {
      $uploadDirectory = "uploads/";
      if (!file_exists($uploadDirectory)) {
        mkdir($uploadDirectory, 0777, true);
      }

      $uploadFile = $uploadDirectory . basename($imageFile['name']);

      // Verificar si el archivo ya existe en la carpeta "uploads"
      if (file_exists($uploadFile)) {
        $response['success'] = false;
        $response['message'] = 'La imagen ya existe.';
      } else {
        // Mover el archivo solo si no existe ya en la carpeta
        if (move_uploaded_file($imageFile['tmp_name'], $uploadFile)) {
          $mysqli = new mysqli('localhost', 'root', '', 'casamiento');

          if ($mysqli->connect_errno) {
            $response['success'] = false;
            $response['message'] = 'Hubo un error al conectar a la base de datos.';
          } else {
            $path = mysqli_real_escape_string($mysqli, $uploadFile);
            $query = "INSERT INTO imagenes (ruta) VALUES ('$path')";
            $mysqli->query($query);

            $response['success'] = true;
            $response['message'] = 'La imagen se ha subido y guardado correctamente.';
          }
        } else {
          $response['success'] = false;
          $response['message'] = 'Hubo un error al subir la imagen.';
        }
      }
    }
  } else {
    $response['success'] = false;
    $response['message'] = 'No se ha seleccionado ninguna imagen.';
  }
} else {
  $response['success'] = false;
  $response['message'] = 'Método de solicitud no válido.';
}

echo json_encode($response);
?>