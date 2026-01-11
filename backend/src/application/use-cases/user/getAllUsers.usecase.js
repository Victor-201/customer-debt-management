export default class GetAllUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute() {
    const users = await this.userRepository.findAll();
    return users.map(user => this.#toResponse(user));
  }

  #toResponse(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
