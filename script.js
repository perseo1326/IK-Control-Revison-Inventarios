

const texto = document.getElementById("file");
console.log(file);


/*
function leerArchivo(e) {
    let archivo = null;
    archivo = e.target.files[0];
    console.log(archivo);
    if (!archivo) {
        alert("Problemas cargando el archivo");
        return;
    }
    var lector = new FileReader();
    lector.onload = function(e) {
        var contenido = e.target.result;
        mostrarContenido(contenido);
    };
    lector.readAsText(archivo);
    alert("Recuerde Esperar hasta que se cargue el archivo");
    console.log("Archivo Cargado");
}

function mostrarContenido(contenido) {
    var elemento = document.getElementById('contenido-archivo');
    elemento.innerHTML = contenido;
    // alert("mostrar cont");
}

document.getElementById('file-input')
    .addEventListener('change', leerArchivo, false);

*/