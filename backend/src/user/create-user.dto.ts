import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsNumber } from "class-validator";
import { UserRole } from 'src/global/global.enum';

// Minimum for creating a user
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;
    // id: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    password: string;


    // OPTIONNAl
    @IsString()
    @IsOptional()
    biography: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @IsEnum(UserRole)
    @IsOptional()
    role: UserRole;

    // Adding password
}

export class ChangeUsernameDTO {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    username: string;
}

export class CodeDTO {
    @IsString()
    @IsNotEmpty()
    code: string;
}

export class AddorRemoveFriendDTO {
    @IsString()
    @IsNotEmpty()
    username: string;
}


export class MatchHistoryDTO {
    @IsString()
    @IsNotEmpty()
    id_p1: string;


    @IsNumber()
    @IsNotEmpty()
    score_p1: number;


    @IsString()
    @IsNotEmpty()
    id_p2: string;


    @IsNumber()
    @IsNotEmpty()
    score_p2: number;

    @IsString()
    @IsNotEmpty()
    winner: string;

    @IsNumber()
    @IsNotEmpty()
    id_game: number;
}