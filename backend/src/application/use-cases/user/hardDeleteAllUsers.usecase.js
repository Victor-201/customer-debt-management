export default class HardDeleteAllDeletedUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute() {
    const ids = await this.userRepository.hardDeleteAllDeleted();
    return {
      message: 'All deleted users removed permanently',
      deletedCount: ids.length,
    };
  }
}
