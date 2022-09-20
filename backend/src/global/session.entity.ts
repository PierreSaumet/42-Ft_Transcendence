import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ISession } from 'connect-typeorm';

@Entity( { name: 'sessions' } )
export class TypeORMSession implements ISession {
  @Index()
  @Column('bigint')
  public expiredAt: number;

  @PrimaryColumn('varchar', { length: 255 })
  public id: string;

  @Column('text')
  public json: string;
}
