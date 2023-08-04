import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  //Para los logs de la consola
  private readonly logger = new Logger('ProductsService')


  //patron repositorio para utilizar nuestro entity
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //Para utilizar con Query Runner, dataSource sabe la cadena de conexion que se esta utilizando, sabe que usuario y todo lo demas tiene la misma configuracion que nuestro repositorio
    private readonly dataSource:DataSource

  ) { }

  async create(createProductDto: CreateProductDto) {

    try { 

      const { images = [], ...productDetails} = createProductDto;

      //crear la instancia del producto 
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( (image) => this.productImageRepository.create( { url: image } ))
      });

      //guardar en la base de datos
      await this.productRepository.save(product);
      
      return { ...product, images }
    
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }
  //realizar
  async findAll( paginationDto:PaginationDto ) {

    const { limit = 10, offset = 0 } = paginationDto
    
    const products = await this.productRepository.find({
      take: limit, //toma los primeros 10 de limit
      skip: offset,  //saltate
      relations: {  //relacion entre tablas
        images: true
      }
    })

    return  products.map( (product) => ({
      ...product,
      images: product.images.map( img => img.url)
    }))
  }
  //retornar por el id
  async findOne(term: string) {

    let product: Product;

    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term })
    }else{
      //Buscaremos por el title o slug solo uno
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //le damos un alias de "prod" para la relacion 
      product = await queryBuilder
        .where( `UPPER(title) =:title or slug =:slug `, {
          title: term.toUpperCase().trim(),
          slug: term.toLowerCase().trim()
        })
        .leftJoinAndSelect('prop.images', 'prodImages' ) //por la documentacion para query builder utilizar leftjoin, primero prop.images de nuestra tabla prop, y segundo le damos el nombre si es que hace otro join, pero es obligatorio darle nombre 
        .getOne()
    }

    if(!product)
      throw new NotFoundException("No se encontro el producto")

    return product
  }
//Se aumento para las relaciones
  async findOnePlain(term: string){
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map( image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto //se implemento por la relacion

    const product = await this.productRepository.preload({ id, ...toUpdate })
    if(!product) throw new NotFoundException("Producto no encontrado para editar");
    
    //Si hay imagenes tenemos que borrarlas
    //Create Query runner, "Transacciones, commit y rollback"
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //borrar las imagenes si vienen las imagenes
      if(images){
        await queryRunner.manager.delete( ProductImage, { product: { id } } ) //barrar todas las imagenes del product con el "id"
        product.images = images.map( image => this.productImageRepository.create({ url:image }) )
      }

      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction()
      await queryRunner.release()
      //Antes de la relacion
      //await this.productRepository.save( product );
      return this.findOnePlain(id)
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release()

      this.handleDBExceptions(error)
    }

  }

  async remove(id: string) {
    //Para la eliminacion revizar la tabla ProductImage se configuro para la eliminacion en cascada
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  
  
  }

  private handleDBExceptions(error: any) {
    if (error.code == '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error');
  }

  //Para trabajar con la semilla no utilizar en produccion
  async deleteAllProduct(){
    const query = this.productRepository.createQueryBuilder('product')

    try {
      return await query.
        delete()
        .where({})
        .execute()
        
    } catch (error) {
      this.handleDBExceptions(error)
    } 

  }

}
