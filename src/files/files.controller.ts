import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res, StreamableFile, Header, UploadedFiles } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNalmer, fileFilter } from './helpers';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';
import { fileFilters } from './helpers/fileFilter.helper';
import { filesNalmer } from './helpers/fileNalmer.helper';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService  //env
  ) {}

  @Get('product/:imageName')
  @Header('Content-Type', 'image/jpeg') //para que no haga la descarga y muestre la imagen
  findProductImage(
    @Param('imageName') imageName: string
  ){ 
    const path = this.filesService.getStaticProductImage(imageName)
    const stream = createReadStream(path);
    return new StreamableFile(stream)
  }
  
  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter, //!mandamos la referencia para validaciones
    //limits: { fieldSize: 1000 }
    storage: diskStorage({
      destination: './static/products', //!fisicamente donde se quiere almacenar
      filename: fileNalmer //!le damos un nombre al archivo
    })
  }) )//Intersectores, //*Intersepta la peticion del body
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File,
  ){
    if(!file){
      throw new BadRequestException('No se envio una imagen')
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {
      secureUrl
    }
  }

  @Post('products')
  @UseInterceptors(FilesInterceptor('files', 3, {
    fileFilter: fileFilters,
    limits:{ fieldSize: 100 },
    /*storage: diskStorage({
      destination: './static/uploads',
      filename: filesNalmer
    })*/
  }))
  uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[],
  ){
    if(!files || files.length === 0){
      throw new BadRequestException('No se envio ninguna imagen')
    }
    if( files.length > 3 ){
      throw new BadRequestException(`Límite de carga de imagenes superada ${files.length}`)
    }
    for (const file of files) {
      if(file.size > 100*1024){
       throw new BadRequestException(`La imagen ${file.originalname} ${file.size}, supera el límite de 100KB`)
      }
    }
    this.filesService.getStaticMoveImages(files)
    return "Hola mundo"
  }

}
