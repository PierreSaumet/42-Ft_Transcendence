// test connection db session
import { TypeORMSession } from './session.entity'
import { User } from '../user/user.entity'

const entities = [ User, TypeORMSession];

export { User, TypeORMSession };

export default entities;