const fs = require('fs');
const path = require('path');
const params = process.argv
const directoryFromCommandIndex = params.indexOf("-d")
const outputCommandIndex = params.indexOf("-o")

// Directorio donde se encuentran los archivos de la GoPro
const directorio = params[directoryFromCommandIndex + 1] || "./";
let outputDir = directorio
if (outputCommandIndex) {
  const auxOutputDir = params[outputCommandIndex + 1]
  if (fs.existsSync(auxOutputDir)) {
    outputDir = auxOutputDir.endsWith("/") || auxOutputDir.endsWith("\\") ? auxOutputDir : auxOutputDir + "\\"
  }
}
if (fs.existsSync(directorio)) {
  console.log('El directorio existe.');
} else {
  console.log('El directorio no existe.');
  process.exit(1);
}
// Obtener lista de archivos en el directorio
fs.readdir(directorio, (err, files) => {
  if (err) {
    console.error('Error al leer el directorio:', err);
    return;
  }

  // Filtrar archivos de video y fotos
  const videoFiles = files.filter(file => file.startsWith('GH') && (file.endsWith('.mp4') || file.endsWith('.MP4'))).sort((a, b) => a.slice(2, 4) < b.slice(2, 4) ? -11 : a.slice(2, 4) === b.slice(2, 4) && a.slice(5, 7) < b.slice(5, 7) ? -1 : 1);
  // const fotoFiles = files.filter(file => file.startsWith('GH') && file.endsWith('.JPG'));

  // Función para convertir los nombres de archivo
  const convertirNombres = (fileList, prefix) => {
    fileList.forEach((file, index) => {
      const nuevoNombre = `${prefix}${(index + 1).toString().padStart(3, '0')}${path.extname(file)}`;
      fs.renameSync(path.join(directorio, file), path.join(outputDir, nuevoNombre), err => {
        if (err) {
          console.error('Error al convertir el nombre de archivo:', err);
        } else {
          console.log(`${file} ==> ${nuevoNombre}`);
        }
      });
    });
    console.log("Total files: ", fileList.length)
  };

  // Convertir nombres de archivos de video y fotos
  convertirNombres(videoFiles, 'GH');
  // convertirNombres(fotoFiles, 'foto');
});