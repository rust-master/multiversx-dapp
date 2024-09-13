import { SmartContract, AbiRegistry, Address } from "@multiversx/sdk-core";

export class ContractLoader {
  constructor(abiJson) {
    this.abiJson = abiJson;
    this.contract = undefined;
  }

  async load(contractAddress) {
    try {
      const abiRegistry = AbiRegistry.create(this.abiJson);

      return new SmartContract({
        address: new Address(contractAddress),
        abi: abiRegistry,
      });
    } catch (error) {
      throw new Error("Error when creating contract from ABI");
    }
  }

  async getContract(contractAddress) {
    if (!this.contract) {
      this.contract = await this.load(contractAddress);
    }
    return this.contract;
  }
}
