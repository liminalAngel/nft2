import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode,
    toNano,
} from 'ton-core';
import { loadFullContent, storeOffchainContent, OffchainContent } from '../utils/content';
import { CollectionMint, MintValue } from '../utils/collectionHelpers';

export type RoyaltyParams = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

export type NftCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number | bigint;
    collectionContent: string;
    commonContent: string;
    nftItemCode: Cell;
    royaltyParams: RoyaltyParams;
};

export async function buildNftCollectionContentCell(commonContent: string, collectionContent: string): Promise<Cell> {
    let contentData: OffchainContent = {
        type: 'offchain',
        uri: collectionContent,
    };
    let contentCell = beginCell();
    let commonContentCell = beginCell();
    commonContentCell.storeBuffer(Buffer.from(commonContent));

    contentCell.store(storeOffchainContent(contentData));
    contentCell.storeRef(commonContentCell.asCell());

    return contentCell.endCell();
}

export async function nftCollectionConfigToCell(config: NftCollectionConfig): Promise<Cell> {
    return beginCell()
        .storeAddress(config.ownerAddress)
        .storeUint(config.nextItemIndex, 64)
        .storeRef(await buildNftCollectionContentCell(config.collectionContent, config.commonContent))
        .storeRef(config.nftItemCode)
        .storeRef(
            beginCell()
                .storeUint(config.royaltyParams.royaltyFactor, 16)
                .storeUint(config.royaltyParams.royaltyBase, 16)
                .storeAddress(config.royaltyParams.royaltyAddress)
        )
        .endCell();
}

export class NftCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftCollection(address);
    }

    static async createFromConfig(config: NftCollectionConfig, code: Cell, workchain = 0) {
        const data = await nftCollectionConfigToCell(config);
        const init = { code, data };
        return new NftCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(
        provider: ContractProvider,
        via: Sender,
        opts: {
            itemIndex: number;
            itemOwnerAddress: Address;
            itemAuthorityAddress: Address;
            itemContent: string;
            amount: bigint;
        }
    ) {
        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftMessage = beginCell();

        nftMessage.storeAddress(opts.itemOwnerAddress);
        nftMessage.storeRef(nftContent);
        nftMessage.storeAddress(opts.itemAuthorityAddress);

        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(0, 64)
                .storeUint(opts.itemIndex, 64)
                .storeCoins(opts.amount)
                .storeRef(nftMessage)
                .endCell(),
        });
    }

    async sendBatchMint(
        provider: ContractProvider,
        via: Sender,
        opts: {
            nfts: CollectionMint[];
        }
    ) {
        if (opts.nfts.length > 250) {
            throw new Error('More than 250 items');
        }

        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintValue);
        for (const nft of opts.nfts) {
            dict.set(nft.index, nft);
        }

        await provider.internal(via, {
            value: toNano('0.05') * BigInt(dict.size),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(0, 64).storeDict(dict).endCell(),
        });
    }

    async getAddress(provider: ContractProvider, index: bigint): Promise<Address> {
        const result = await provider.get('get_nft_address_by_index', [{ type: 'int', value: index }]);
        // console.log(result.stack.readAddress());
        return result.stack.readAddress();
    }

    async getCollectionData(provider: ContractProvider): Promise<any> {
        const result = await provider.get('get_collection_data', []);
        console.log(result.stack.readNumber());
        const contentCell = result.stack.readCell();
        console.log(contentCell);
        console.log(loadFullContent(contentCell.beginParse()));
        console.log(result.stack.readAddress());
        // return result.stack.readNumber();
    }
}
