export default class UserRepositoryInterface {
  findById(id) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
  findByEmail(email) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  findAll() {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
  findAllDeleted() {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  create(user) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
  update(id, payload) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  softDelete(id) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
  restore(id) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }

  hardDelete(id) {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
  hardDeleteAllDeleted() {
    throw new Error("METHOD_NOT_IMPLEMENTED");
  }
}
