import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({ name: 'product_images' })
export class ProductImage{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string
    //Relacion entre tablas de muchos a uno
    @ManyToOne(
        () => Product,
        ( product ) => product.images,
        { onDelete: "CASCADE" }  // opcion para eliminar
    )
    product: Product
    
}