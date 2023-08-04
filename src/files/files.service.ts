import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'fs';
import path, { dirname, join } from 'path';

@Injectable()
export class FilesService {

  //devulve el path de la imagen
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);
    if (!existsSync(path)) {
      throw new BadRequestException('No se encontro el archivo ');
    }
    return path;
  }

  //Mueve las imagenes
  getStaticMoveImages( images:Express.Multer.File[]){

    //console.log(images)
    const destionoFolder = join(__dirname, '../../static/uploads')
    console.log(destionoFolder)
    
    if( !existsSync(destionoFolder) ){
      mkdirSync(destionoFolder, { recursive: true }) //crea el directorio si no existe
    }
    
    for( const image of images ){
      console.log(image)
      const path = join(destionoFolder, image.originalname)
      try {
        writeFileSync( path, image.buffer )
        console.log(`Imagen ${image.originalname} movido correctamente`)
      } catch (error) {
        console.log(`Error al mover la imagen ${image.originalname}`)
      }
    }

  }

}
