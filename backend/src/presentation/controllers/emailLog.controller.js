export default class EmailLogController {
    constructor({ getAllEmailLogsUseCase }) {
        this.getAllEmailLogsUseCase = getAllEmailLogsUseCase;
    }

    async getAllLogs(req, res, next) {
        try {
            const logs = await this.getAllEmailLogsUseCase.execute();
            res.json(logs);
        } catch (error) {
            next(error);
        }
    }
}
