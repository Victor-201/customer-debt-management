/**
 * @interface UserRepositoryInterface
 */
export default class UserRepositoryInterface {
  /** @returns {Promise<User|null>} */
  findById(id) {}

  /** @returns {Promise<User|null>} */
  findByEmail(email) {}

  /** @returns {Promise<User[]>} */
  findAll(filters) {}

  /** @returns {Promise<User[]>} */
  findAllDeleted() {}

  /** @returns {Promise<User>} */
  create(user) {}

  /** @returns {Promise<User|null>} */
  update(id, payload) {}

  /** @returns {Promise<User|null>} */
  lock(id) {}

  /** @returns {Promise<User|null>} */
  unlock(id) {}

  /** @returns {Promise<User|null>} */
  softDelete(id) {}

  /** @returns {Promise<User|null>} */
  restore(id) {}

  /** @returns {Promise<void>} */
  hardDelete(id) {}

  /** @returns {Promise<string[]>} */
  hardDeleteAllDeleted() {}
}
