
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MatchHistoryDTO, CodeDTO } from './create-user.dto';
import LocalFilesService from './localFiles/localFiles.service';
import * as bcrypt from 'bcrypt';

import { Status } from 'src/global/global.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private localFilesService: LocalFilesService,
    
  ) {}

    async getAvatarId(id: string): Promise<string> {
      const user = await this.userRepository.findOne({ where: {id: id}});
      if (user) { 
        return user.avatarId;
      }
      else
        throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
    }

    async removeRefreshToken(userId: string) {
      return this.userRepository.update(userId, {
        refreshToken: null
      });
    }

    async setCurrentRefreshToken(token: string, userId: string) {
      const refreshToken = await bcrypt.hash(token, 10);
      await this.userRepository.update(userId, { refreshToken });
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
      const user = await this.getById(userId);
      const isRefreshTokenMatching = await bcrypt.compare( refreshToken, user.refreshToken );
      if (isRefreshTokenMatching) {
        return user;
      }
    }    

  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    return this.userRepository.update( userId, {twoFactorAuthenticationSecret: secret});
  }

  async turnOnTwoFactor(userId: string) {
    const user = await this.getById(userId);
    if (user) {
      if (user.isTwoFactorAuthentificationEnabled == true) {
        return this.userRepository.update(userId, {isTwoFactorAuthentificationEnabled: false});
      }
      else {
        return this.userRepository.update(userId, {isTwoFactorAuthentificationEnabled: true});
      }
    }
    throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
    
  }

  async getLogin42(login42: string) {
    const user = await this.userRepository.findOne({ where: {login42}})
    return user;
  }

  async findUserByLogin(login42: string) {
    const user = await this.userRepository.findOne({ where: {login42}})
    if (user)
      return user;
    throw new HttpException('Cannot get the firstname with this id.', HttpStatus.NOT_FOUND);
  }
  
  async getById(id: string) {
    const user = await this.userRepository.findOne({ where: {id}});
    if (user) {
      return user;
    }
    throw new HttpException('User doesnt exist with this id', HttpStatus.NOT_FOUND);
  }

  async create42(body: Partial<User>) {
    const newUser = await this.userRepository.create(body);
    await this.userRepository.save(newUser);
    return newUser;
  }


  async addAvatar(userId: string, fileData: LocalFilesDto) {
    const avatar = await this.localFilesService.saveLocalFileData(fileData);
    await this.userRepository.update(userId, {
      avatarId: avatar.id
    })
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id }});
    if (user)
      await this.userRepository.delete(id);
    else
      throw new HttpException('User not found, try again ;-)', HttpStatus.NOT_FOUND);
  }

  async getStatusUsername(username: string) {
    const user = await this.userRepository.findOne({ where: {username: username}});
    if (user) {
      return user.status;
    }
    else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async getUserStatus(id: string) {
    const user = await this.userRepository.findOne({ where: {id: id}});
    if (user) {
      return user.status
    } else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async putVictory(id: string) {
    const user = await this.userRepository.findOne({ where: {id: id}});
    if (user) {
      let value = user.wins;
      value += 1;
      await this.userRepository.update(id, {wins: value});
      const ret = await this.putScore(id);
      if (ret.sucess == true) {
        return {
          sucess: true,
          message: 'Victory updated.'
        };
      } else {
        return {
          sucess: false,
          message: 'Victory NOT updated.'
        };
      }
    }
    else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async putLoose(id: string) {
    const user = await this.userRepository.findOne({ where: {id: id}});
    if (user) {
      let value = user.losses;
      value += 1;
      await this.userRepository.update(id, {losses: value});
      const ret = await this.putScore(id);
      if (ret.sucess == true) {
        return {
          sucess: true,
          message: 'Loose updated.'
        };
      } else {
        return {
          sucess: false,
          message: 'Loose NOT updated.'
        };
      }
    }
    else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async putScore(id: string) {
    const user = await this.userRepository.findOne({ where: {id: id}});
    if (user) {
      let total_value = user.wins - user.losses;
      await this.userRepository.update(id, {score: total_value});
      return {
        sucess: true,
        message: 'Score updated.'
      };
    }
    else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async putOnline(id: string) {
    const user = await this.userRepository.findOne({ where: {id}});
    if (user) {
      try {
        await this.userRepository.update(id, {status: Status.ONLINE})
        return {
          sucess: true,
          message: 'Status updated online'
        };
      } catch (err) {
      }
    }
  }
  
  async putIngame(id: string) {
    const user = await this.userRepository.findOne({ where: {id: id}});
    if (user ) {
        await this.userRepository.update(id, {status: Status.INGAME})
          return {
            sucess: true,
            message: 'Status updated ingame'
          };
    } else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async isInGame(username: string) {

    const user = await this.userRepository.findOne({ where: {username: username}});
    if (user && user.status == Status.INGAME) {
      return true;
    }
    return false;
  }

  async socketOffline(login42: string) {

    const user = await this.userRepository.findOne({ where: {login42: login42}});
    if (user) {
      try {

        await this.userRepository.update(user.id, {status: Status.OFFLINE})
        return {
          sucess: true,
          message: 'Status updated offlibe'
        };
      } catch (err) {
      }
    } else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async putOffline(id: string) {
    const user = await this.userRepository.findOne({ where: {id: id}});
    if (user) {
      try {
        await this.userRepository.update(id, {status: Status.OFFLINE})
        return {
          sucess: true,
          message: 'Status updated offlibe'
        };
      } catch (err) {
      }
    } else {
      return {
        sucess: false,
        message: "This user doesn't exist."
      };
    }
  }

  async changeUsername(id: string, name: string) {
    const user_already_exist = await this.userRepository.findOne({ where: {username: name}})
    if (!user_already_exist) {
      const user = await this.userRepository.findOne({ where: {id}})
      if (!user)
        throw new HttpException('Changement de username', HttpStatus.NOT_FOUND);
      else {
        try {
          await this.userRepository.update(id, {username: name});
          return {
            sucess: true,
            message: 'Username updated'
          };
        } catch (err) {
        }
      }
    }
    return {
      sucess: false,
      message: 'Username NOT updated'
    };
  }

  isGameInHistory(id_game: string, user: User): boolean {

    for (const item in user.matchHistory) {
      let relou = item.split(' ')[0] 
      if (relou == id_game)
        return true;
    }
    return false
  }

  async updateHistory(id: string, body: MatchHistoryDTO) {

    if (body.id_p1 === '' || body.id_p2 === '') {
      return {
            sucess: false,
            message: "This user doesn't exist."
          };
    }
    const user_p1 = await this.userRepository.findOne({where: {id: body.id_p1}});
    const user_p2 = await this.userRepository.findOne({where: {id: body.id_p2}});
    if (!user_p1 || !user_p2) {
      return {
            sucess: false,
            message: "This user doesn't exist."
          };
    }
    let isingame_p1 = this.isGameInHistory(String(body.id_game), user_p1);
    let isingame_p2 = this.isGameInHistory(String(body.id_game), user_p2);
    let result = ''
    if (body.winner == body.id_p1) {
      result = body.id_game + " " + user_p1.username + " " + body.score_p1 + " VS " + body.score_p2 + " " + user_p2.username
    }
    else {
      result = body.id_game + " " + user_p2.username + " " + body.score_p2 + " VS " + body.score_p1 + " " + user_p1.username
    }
    if (isingame_p1 == false) {
      user_p1.addMatch(result);
      await this.userRepository.save(user_p1);
      if (body.winner == body.id_p1) {
        this.putVictory(body.id_p1);
      } else {
        this.putLoose(body.id_p1);
      }
    }
    if (isingame_p2 == false) {
      user_p2.addMatch(result);
      await this.userRepository.save(user_p2);
      if (body.winner == body.id_p2) {
        this.putVictory(body.id_p2);
      } else {
        this.putLoose(body.id_p2);
      }
    }
  }

    async addFriend(id: string, username: string) {

      const friend = await this.userRepository.findOne({ where: {username: username}})
      if (friend) {
        const user = await this.userRepository.findOne({ where: {id}})
        if (user.id == friend.id) {
          return {
            sucess: false,
            message: "Cannot add yourself."
          };
        }
        if (user.isFriend(friend.id) === -1) {
          const test = {username: friend.id, status: friend.status};
          user.addFriend(friend.id);
          await this.userRepository.save(user);
          return {
            sucess: true,
            message: "This friend is saved."
          };
        }
        else {
          return {
            sucess: false,
            message: "Already friend."
          };
        }
      }
      else {
        return {
          sucess: false,
          message: "This user doesn't exist."
        };
      }
    }

    async deleteFriend(id: string, username: string ) {

      const friend = await this.userRepository.findOne({ where: {username: username}})
      if (friend) {
        const user = await this.userRepository.findOne({ where: {id}})
        if (user.id == friend.id) {
          return {
            sucess: false,
            message: "Cannot delete yourself."
          };
        }
        if (user.isFriend(friend.id) != -1) {
          user.deleteFriend(friend.username);
          await this.userRepository.save(user);
          return {
            sucess: true,
            message: "This friend is not your friend longer."
          };
        }
        else {
          return {
            sucess: false,
            message: "You are not friend."
          };
        }
      }
      else {
        return {
          sucess: false,
          message: "This user doesn't exist."
        };
      }
    }
}