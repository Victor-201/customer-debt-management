class DeleteUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, deletedBy) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.name = "BusinessRuleError";
      throw error;
    }

    if (user.id === deletedBy) {
      const error = new Error("You cannot delete yourself");
      error.name = "BusinessRuleError";
      throw error;
    }

    await this.userRepository.delete(userId);

    return {
      message: "User deleted successfully",
    };
  }
}

export default DeleteUserUseCase;
