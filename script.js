const widget = uploadcare.Widget('[role=uploadcare-uploader]');

async function updateSelectedFile() {
  selectedFile = await widget.value();
  return selectedFile.cdnUrl;
}


async function uploadImage(event) {
  event.preventDefault();
  try {
    const imageUrl = await updateSelectedFile()
    console.log("Imagen a cargar",imageUrl)
    const response = await fetch(
      'https://casamiento-production-ffeb.up.railway.app/upload'
      // 'http://localhost:3000/upload'
    , {
      method: 'POST',
      headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ ruta: imageUrl }),
    });

    if (response.ok) {
      const responseData = await response.json();
      updateAlert("Su foto fue subida con éxito", "success");

      form.reset();
      document.querySelector("#imagePreview").src = "#";
    } else {
      updateAlert("Error al subir la foto", "error");
    }
  } catch (error) {
    console.log('Error al subir la foto:', error);
    updateAlert("Seleccione una foto por favor", "error");
  }
}
    const form = document.forms.imageForm;
  
  
  function updateAlert(message, alertType) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert ${alertType}`;
    alertDiv.innerHTML = message;
  
    const container = document.querySelector(".alert-container");
    container.appendChild(alertDiv);
  
    setTimeout(function() {
      container.removeChild(alertDiv);
      location.reload();
    }, 2000);
  }

  function getImages() {
    fetch(
      'https://casamiento-production-ffeb.up.railway.app/upload'
      // 'http://localhost:3000/upload'
      , { 
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const gallery = document.getElementById('gallery');
        
        data.images.forEach(image => {
          const imageContainer = document.createElement('div');
          imageContainer.className = 'image-container';
  
          const imgElement = document.createElement('img');
          imgElement.src = image.ruta;
          
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'x';
          deleteButton.addEventListener('click', () => deleteImage(image._id, imageContainer));
          
          imageContainer.appendChild(imgElement);
          imageContainer.appendChild(deleteButton);
          
          gallery.appendChild(imageContainer);
        });     
      } else {
        console.log(data.message);
      }
    })
    .catch(error => console.log(error));
  }
    
  getImages();
  
  function deleteImage(imageId, imageContainer) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta imagen?');
    if (confirmDelete) {
      fetch(
        `https://casamiento-production-ffeb.up.railway.app/upload/${imageId}`
        // `http://localhost:3000/upload/${imageId}`
        , {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          if (imageContainer) {
            imageContainer.remove();
          }
        } else {
          console.log(data.message);
        }
      })
      .catch(error => {
        console.log(error)
        // location.reload();
      });
    }
  }