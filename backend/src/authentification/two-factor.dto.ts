import { IsNotEmpty, IsString } from "class-validator"

export class TwoFaAuthDto {
    @IsString()
    @IsNotEmpty()
    code: string
}

export class Genereate2FactorIDDTO {
    @IsString()
    @IsNotEmpty()
    id: string;
}