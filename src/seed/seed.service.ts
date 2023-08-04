import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {


  constructor( 
    private readonly productsService: ProductsService
   ){}

  async runSeed(){
    await this.insertNewProducts();
    
    //Utilizaremos el metodo create del ProductService
    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product  => {
      insertPromises.push(this.productsService.create(product))
    })

    await Promise.all( insertPromises ) //ejecutamos la promesa
    
    return 'Seed Executed'
  }

  private async insertNewProducts(){
    this.productsService.deleteAllProduct()
    return true
  }

}
