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
      'https://casamiento-production-e973.up.railway.app/upload'
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
      getImages()
      
      const form = document.forms.imageForm;
      form.reset();
      const widget = uploadcare.Widget('#imageInput');
      widget.value(null);
    } else {
      updateAlert("Error al subir la foto", "error");
    }
  } catch (error) {
      console.log('Error al subir la foto:', error);
      updateAlert("Seleccione una foto por favor", "error");
  }
}
  function updateAlert(message, alertType) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert ${alertType}`;
    alertDiv.innerHTML = message;

    const container = document.querySelector(".alert-container");
    container.appendChild(alertDiv);

    setTimeout(function() {
      container.removeChild(alertDiv);
    }, 1200);
  }

  function getImages() {
    fetch('https://casamiento-production-e973.up.railway.app/upload', {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const gallery = document.getElementById('gallery');
  
          gallery.innerHTML = '';
  
          data.images.reverse();
  
          data.images.forEach(image => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
  
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.textContent = 'Cargando...';
            imageContainer.appendChild(loadingIndicator);
  
            const imgElement = document.createElement('img');
            imgElement.onload = () => {
              imageContainer.removeChild(loadingIndicator);
            };
            imgElement.src = image.ruta;
  
            imageContainer.appendChild(imgElement);
            gallery.appendChild(imageContainer);
          });
        } else {
          console.log(data.message);
        }
      })
      .catch(error => console.log(error));
  }

  document.addEventListener('DOMContentLoaded', () => {
    getImages();
  });