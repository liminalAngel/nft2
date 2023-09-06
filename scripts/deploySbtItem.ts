import { Address, toNano } from 'ton-core';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { NftCollection } from '../wrappers/NftCollection';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();

    const nftCollection = provider.open(
        NftCollection.createFromAddress(Address.parse('EQCvvleli-ANUGQyW8HwDScoogBjq3P7xNCpNGg5ks5uQJ4W'))
    );

    await nftCollection.sendMint(provider.sender(), 
        {
            amount: toNano('0.1'),
            itemOwnerAddress: provider.sender().address as Address,
            itemAuthorityAddress: provider.sender().address as Address,
            itemContent: 'https://raw.githubusercontent.com/liminalAngel/nft2/main/scripts/item.json',
            itemIndex: 0,
        }
    )

    ui.write("SBT deployed!");
}
