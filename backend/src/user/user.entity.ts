import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import LocalFiles from './localFiles/localFiles.entity';
import { Status } from 'src/global/global.enum';

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid') id: string;
  @CreateDateColumn() created: Date;
  @Column({ nullable: true, select: false }) public refreshToken?: string;
  @Column({ default: 'https://cdn.intra.42.fr/users/medium_default.png'}) avatar42: string;
  @Column({ unique: true, nullable: true }) login42: string;
  @Column({ unique: true, nullable: true }) username: string;
  @JoinColumn({ name: 'avatarId' })
  @OneToOne(
    () => LocalFiles,
    {
      nullable: true
    }
  )
  public avatar?: LocalFiles;

  @Column({ nullable: true }) public avatarId?: string;
  @Column({ nullable: true }) public twoFactorAuthenticationSecret?: string;
  @Column({ default: false }) public isTwoFactorAuthentificationEnabled: boolean;
  @Column({ type: 'int', default: 0 }) wins: number;
  @Column({ type: 'int', default: 0 }) losses: number;
  @Column({ type: 'int', default: 0 }) score: number;
  @Column({ type: 'enum', enum: Status, default: Status.OFFLINE }) status: Status;
  @Column({ type: 'text', array: true, default: [] }) friends_list: string[];
  @Column({ type: 'text', array: true, default: [] }) matchHistory: string[];
  @Column({ type: 'text', default: 0 }) watchGame: string;

  // Fonctions
  addMatch(data: string) {
    this.matchHistory.push(data);
  }

  addFriend(username: string) {
    this.friends_list.push(username);
  }

  isFriend(username: string) {
    const t = this.friends_list.indexOf(username);
    return t
  }

  deleteFriend(username: string) {
    this.friends_list.splice(this.friends_list.indexOf(username), 1);
  }
}
