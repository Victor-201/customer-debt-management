export default class RestoreUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.restore(userId);
    return {
      message: 'User restored successfully',
      id: user.id,
    };
  }
}
