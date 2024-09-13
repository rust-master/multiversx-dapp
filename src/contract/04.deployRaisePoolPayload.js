import {
    U32Value,
    U64Value,
    BigUIntValue,
    BooleanValue,
    AddressValue,
    Address,
    BytesValue,
    TokenIdentifierValue,
    VariadicValue,
    BinaryCodec
} from "@multiversx/sdk-core";
import { UserSecretKey } from "@multiversx/sdk-wallet/out";
const codec = new BinaryCodec();

const POOL_ID = "1497021305";
const TIMESTAMP = Math.floor(Date.now() / 1000);

const deployerAddressBech32 = 'erd1445qn0zgvmepmgs3dqc6h2y253r9ep6lf0hd2s0hhzxqrtun5l8sqg9stj'

function getTransactionPayload() {

    const deployerAddress = Address.fromBech32(deployerAddressBech32).pubkey()

    const signerPemDeployer = `-----BEGIN PRIVATE KEY for erd1knqwuf04wrqvdmagvag2wcps3h0fjjag6peqhdnz8qt6v0gvcm8qmy3x8m-----
MTAwYTk4YTcwOTcyMmNjYzlmZGU5ZGUxYTQ0MjAwNjI4OTQxOWVjMTJkZjM2NGZm
ZWU1NjE2NzY1MmQzNTkwZWI0YzBlZTI1ZjU3MGMwYzZlZmE4Njc1MGE3NjAzMDhk
ZGU5OTRiYThkMDcyMGJiNjYyMzgxN2E2M2QwY2M2Y2U=
-----END PRIVATE KEY for erd1knqwuf04wrqvdmagvag2wcps3h0fjjag6peqhdnz8qt6v0gvcm8qmy3x8m-----`;

    const privateKeySigner = UserSecretKey.fromPem(signerPemDeployer);

    const DATA_DEPLOYER = Buffer.concat([
        codec.encodeNested(new U64Value(TIMESTAMP)),
        codec.encodeNested(new U32Value(POOL_ID)),
        deployerAddress,
    ]);

    const DATA_DEPLOYER_SIGNED = privateKeySigner
        .sign(DATA_DEPLOYER)
        .toString("hex");

    const SOFT_CAP = 10000;
    const HARD_CAP = 50000;
    const CURRENCY1 = "USDC-350c4e";
    const CURRENCY2 = "USDT-58d5d0";
    const MIN_DEPOSIT = 100;
    const MAX_DEPOSIT = 5000;
    const DEPOSIT_INCREMENTS = 50;
    const START_DATE = 1726099741;
    const END_DATE = 1818110409;

    const transactionPayload = [
        new U32Value(POOL_ID),
        new U64Value(SOFT_CAP),
        new U64Value(HARD_CAP),
        new U64Value(MIN_DEPOSIT),
        new U64Value(MAX_DEPOSIT),
        new U64Value(DEPOSIT_INCREMENTS),
        new U64Value(START_DATE),
        new U64Value(END_DATE),
        new BooleanValue(true),
        new AddressValue(new Address(deployerAddressBech32)),
        new AddressValue(new Address(deployerAddressBech32)),
        BytesValue.fromHex(DATA_DEPLOYER_SIGNED),
        new U64Value(TIMESTAMP),
        VariadicValue.fromItems(
            new TokenIdentifierValue(CURRENCY1),
            new TokenIdentifierValue(CURRENCY2)
        ),
    ];

    return transactionPayload;
}

export { getTransactionPayload };
