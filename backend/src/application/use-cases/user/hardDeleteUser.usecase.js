export default class HardDeleteUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    await this.userRepository.hardDelete(userId);
    return { message: "User permanently deleted" };
  }
}
