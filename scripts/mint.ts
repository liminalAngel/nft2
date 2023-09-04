import { NftCollection } from '../wrappers/NftCollection';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));

    const nftCollection = provider.open(NftCollection.createFromAddress(address));

    await nftCollection.sendMint(provider.sender(), {
        itemOwnerAddress: provider.sender().address as Address,
        itemAuthorityAddress: provider.sender().address as Address,
        itemContent: '',
        itemIndex: 0,
        amount: toNano('0.05'),
    });

    ui.write("Item deployed!");
}