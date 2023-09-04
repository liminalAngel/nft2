import { Address, toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftCollection = provider.open(NftCollection.createFromConfig({
        ownerAddress: provider.sender().address as Address,
        nextItemIndex: 0,
        collectionContent: 'https://raw.githubusercontent.com/liminalAngel/nft2/main/scripts/collection_data.json',
        commonContent: "",
        nftItemCode: await compile('SbtItem'),
        royaltyParams: {
            royaltyFactor: 12,
            royaltyBase: 100,
            royaltyAddress: provider.sender().address as Address,
        }
    }, await compile('NftCollection')));

    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftCollection.address);

    // run methods on `nftCollection`
}
