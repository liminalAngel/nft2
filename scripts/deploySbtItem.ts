import { Address, toNano } from 'ton-core';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { NftCollection } from '../wrappers/NftCollection';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();

    const nftCollection = provider.open(
        NftCollection.createFromAddress(Address.parse('EQCxxQjTWmvFYceOyRxs1DMTcRC1Zd8K9GT-jsf3DaOSn-WI'))
    );

    await nftCollection.sendMint(provider.sender(), 
        {
            amount: toNano('0.1'),
            itemOwnerAddress: provider.sender().address as Address,
            itemAuthorityAddress: provider.sender().address as Address,
            itemContent: 'https://raw.githubusercontent.com/liminalAngel/nft2/main/scripts/jsons/item.json',
            itemIndex: 0,
        }
    )

    ui.write("SBT deployed!");
}
