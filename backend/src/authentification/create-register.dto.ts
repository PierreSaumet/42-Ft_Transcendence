import { IsString, IsNotEmpty} from "class-validator";


export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  login42: string;

  @IsString()
  @IsNotEmpty()
  avatar42: string;

}



export class RegisterAsGuestDTO {
  @IsString()
  @IsNotEmpty()
  login42: string;

  @IsString()
  @IsNotEmpty()
  avatar42: string;
}
