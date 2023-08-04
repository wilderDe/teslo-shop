import { BadRequestException } from "@nestjs/common";

function arrayToString(arr: any ){
    return arr.join(', ')
}


//Interceptor
export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {
    
    if(!file) return callback(new Error('File is empty'), false);
    const fileExptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg','jpeg','png','gif']

    if(validExtensions.includes( fileExptension )){
        return callback(null, true)
    }else{
        return callback( new BadRequestException(`No es el formato permitido, solo: ${arrayToString(validExtensions)} `), false )
    }
}

//!Funciones para un array de imagenes
export const fileFilters = (req:Express.Request, files: Express.Multer.File, callback: Function ) => {
    /*
    {
        fieldname: 'files',
        originalname: 'metropolitana_page.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg'
    }
    */
  
    if(!files) return callback(new Error('No se encontro ninguna imagen'), false);
    // Verificar el tipo de archivo
    if (!files.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        // Rechazar el archivo si no es una imagen
        return callback(new Error('Solo se permiten archivos de imagenes'), false);
    }
    // Si el archivo es válido, aceptarlo
    callback(null, true);

}



