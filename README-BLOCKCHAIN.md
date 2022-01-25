In order to run a local block chain follow the steps bellow:
1. run the local hardhat server using `npx hardhat node` (make sure you have latest version of node)
2. grab the RPC url printed in the output: `http://127.0.0.1:8545/` (also there are multiple wallets printed out, keep an eye on these so we can import them later)

3. create the following script:
```
const getNetworkInfo = async function(){
    const networkName = hre.network.name
    const chainId = hre.network.config.chainId

    console.log("Network name=", networkName);
    console.log("Network chain id=", chainId);
}

getNetworkInfo();
```
4. run the above script using `npx hardhat run NetworkInfo.js`
5. use the outputted chainId and RPC url to add the chain to your MetaMask
6. now you can add wallets that hardhat created to your metamask

