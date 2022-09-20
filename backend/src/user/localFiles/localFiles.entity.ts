import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class LocalFiles {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    filename: string;

    @Column()
    path: string;

    @Column()
    mimetype: string;

}

export default LocalFiles;
