export default class GetAllUsersUseCase {
  constructor({userRepository}) {
    this.userRepository = userRepository;
  }
  async execute({ isActive } = {}) {
    const users = await this.userRepository.findAll({ isActive });
    return users.map(this.#toResponse);
  }

  #toResponse(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
