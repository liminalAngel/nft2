import { Address, toNano } from 'ton-core';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { NftCollection } from '../wrappers/NftCollection';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();

    const nftCollection = provider.open(
        NftCollection.createFromAddress(Address.parse('EQCvvleli-ANUGQyW8HwDScoogBjq3P7xNCpNGg5ks5uQJ4W'))
    );

    await nftCollection.sendBatchMint(provider.sender(), {
        sbts: [
            {
                amount: toNano('0.1'),
                ownerAddress: provider.sender().address as Address,
                authorityAddress: provider.sender().address as Address,
                content: 'https://raw.githubusercontent.com/liminalAngel/nft2/main/scripts/item.json',
                index: 1,
            },
            {
                amount: toNano('0.1'),
                ownerAddress: provider.sender().address as Address,
                authorityAddress: provider.sender().address as Address,
                content: 'https://raw.githubusercontent.com/liminalAngel/nft2/main/scripts/item.json',
                index: 2,
            },
        ]
    })

    ui.write("SBTs deployed!");
}
