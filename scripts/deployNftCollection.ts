import { Address, toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftCollection = provider.open(NftCollection.createFromConfig({
        ownerAddress: provider.sender().address as Address,
        nextItemIndex: 0,
        collectionContent: 'tonstorage://29FA5116613260DEAD3A4C01E87D26D33762F4A04EF9F4BB43181F2081DEE62C',
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
