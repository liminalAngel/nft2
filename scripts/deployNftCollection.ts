import { Address, toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftCollection = provider.open(
        await NftCollection.createFromConfig(
            {
                ownerAddress: provider.sender().address as Address,
                nextItemIndex: 0,
                collectionContent:
                    'https://raw.githubusercontent.com/mitagmio/nft2/main/scripts/collection_madata.json',
                commonContent: '',
                nftItemCode: await compile('SbtItem'),
                royaltyParams: {
                    royaltyFactor: 5,
                    royaltyBase: 100,
                    royaltyAddress: provider.sender().address as Address,
                },
            },
            await compile('NftCollection')
        )
    );
    // const nftCollection = provider.open(
    //     NftCollection.createFromAddress(Address.parse('EQCxxQjTWmvFYceOyRxs1DMTcRC1Zd8K9GT-jsf3DaOSn-WI'))
    // );
    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftCollection.address);

    // run methods on `nftCollection`
    //'b5ee9c7201010101000300000201';
    // await nftCollection.getCollectionData();
}
