import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Module({
  imports: [

    ConfigModule.forRoot(), //Variables de entorno

    TypeOrmModule.forRoot({ //typeOrm conexion a la base de datos
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      //propiedades para las entidades
      autoLoadEntities: true, 
      synchronize: true, //sincronizacion si borras una columna o agregas una columna
    }), 
    ProductsModule, CommonModule, SeedModule, FilesModule,
    
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    })

  
  ],
})
export class AppModule {}
