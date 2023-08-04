import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    // Transformar
    @Type( () => Number ) //enableImplicitConversion: true lo mismo que en pokemon
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number ) //enableImplicitConversion: true lo mismo que en pokemon
    offset?: number

}