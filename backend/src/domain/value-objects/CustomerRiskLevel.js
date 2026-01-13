class CustomerRiskLevel {
    static ALLOWED = ["NORMAL", "WARNING", "HIGH_RISK"];

    constructor(value) {
        if (!CustomerRiskLevel.ALLOWED.includes(value)) {
            throw new Error(`Invalid risk level: ${value}`);
        }
        this.value = value;
    }

    static NORMAL = new CustomerRiskLevel("NORMAL");
    static WARNING = new CustomerRiskLevel("WARNING");
    static HIGH_RISK = new CustomerRiskLevel("HIGH_RISK");

    static fromString(value) {
        return new CustomerRiskLevel(value);
    }

    equals(other) {
        return other instanceof CustomerRiskLevel && this.value === other.value;
    }

    toString() {
        return this.value;
    }
}

export default CustomerRiskLevel;
