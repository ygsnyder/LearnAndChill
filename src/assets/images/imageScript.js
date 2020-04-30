function previewFile() {
    const preview = document.querySelectorAll('img')[1];
    const file = document.querySelector('input[type=file]').files[0];
    console.log(file);
    const reader = new FileReader();
  
    reader.addEventListener("load", function () {
      // convert image file to base64 string
      preview.src = reader.result;
    }, false);
  
    if (file) {
      reader.readAsDataURL(file);
    }
  }