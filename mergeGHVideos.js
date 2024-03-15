const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const rdl = require("readline");
const internal = require('stream');
const params = process.argv
const directoryFromCommandIndex = params.indexOf("-d")
const outputCommandIndex = params.indexOf("-o")
const customFileNameCommandIndex = params.indexOf("--filename")
class Spinner {
  constructor() {

    this.interval;
  }
  spin() {
    process.stdout.write("\x1B[?25l");

    const spinner = ["-", '\\', "|", "/"];

    let index = 0;

    this.interval = setInterval(() => {
      let line = spinner[index]
      if (line === undefined) {
        index = 0
        line = spinner[index]
      }
      process.stdout.write(line)
      rdl.cursorTo(process.stdout, 0)

      index = index >= spinner.length ? 0 : index + 1;

    }, 100)
  }
  stopSpinner() {
    clearInterval(this.interval)
  }
}
// Directorio donde se encuentran los archivos de video
// TODO: Custom filename
const spinner = new Spinner()
if (directoryFromCommandIndex < 0) {
  console.error("Directory is needed, use -d <dir-path>")
  return;
}

const directorio = params[directoryFromCommandIndex + 1] || "./";
let outputDir = directorio
let outputFileName = `mergedOutput.mp4`; // Nombre del archivo de salida combinado
if (customFileNameCommandIndex > 0 && typeof params[customFileNameCommandIndex + 1] === "string") {
  outputFileName = `${params[customFileNameCommandIndex + 1]}.mp4`
}

if (outputCommandIndex > 0) {
  const auxOutputDir = params[outputCommandIndex + 1]
  if (!fs.existsSync(auxOutputDir)) fs.mkdirSync(auxOutputDir)
  if (fs.existsSync(auxOutputDir)) {
    outputDir = auxOutputDir.endsWith("/") || auxOutputDir.endsWith("\\") ? auxOutputDir : (auxOutputDir + "/")
  }
}

if (fs.existsSync(directorio)) {
  console.error('El directorio existe.');

} else {
  console.log('El directorio no existe.');
  process.exit(1);
}

if (fs.existsSync("./videos.txt")) {
  fs.unlinkSync("./videos.txt");
  console.log('Archivo videos borrado');
}

if (fs.existsSync(`${outputDir}${outputFileName}`)) {
  fs.unlinkSync(`${outputDir}${outputFileName}`);
  console.log('Output anterior borrado');
}
console.log("FROM: ", directorio)
console.log("TO: ", outputDir + outputFileName)

// Obtener lista de archivos de video en el directorio
fs.readdir(directorio, (err, files) => {
  console.time('Merge: ')
  spinner.spin()
  if (err) {
    console.error('Error al leer el directorio:', err);
    return;
  }

  const videoFiles = files.filter(file => file.endsWith('.mp4') || file.endsWith('.MP4'));

  // Combinar archivos de video usando ffmpeg
  videoFiles.map(filename => `file '${directorio}/${filename}'`).forEach(file => {
    exec(`echo ${file} >> videos.txt`)
  })

  const comando = `ffmpeg -f concat -safe 0 -i videos.txt -c copy -fflags +genpts ${outputDir}${outputFileName}`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al combinar archivos de video: ${error}`);
      spinner.stopSpinner()
      return;
    }
    if (stderr) {
      console.error(`Error de ffmpeg: ${stderr}`);
      spinner.stopSpinner()
      return;
    }
    spinner.stopSpinner()
    console.log('Archivos de video combinados con éxito.');
    console.timeEnd('Merge: ')
  });
});


