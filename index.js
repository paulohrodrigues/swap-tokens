const web3js = new Web3(window.web3.currentProvider);
class Store {
    constructor(contract, contractToken, contractNFT) {
        this.contractString = contract;
        this.contractTokenString = contractToken;
        this.contractNFTString = contractNFT;

        ethereum.on('chainChanged', (chainId) => {
            console.log(chainId);
        });
    }

    DOMChangBTN(idBTN, block, text) {
        if(block) {
            document.getElementById(idBTN).setAttribute("disabled", null);
        }else{
            document.getElementById(idBTN).removeAttribute("disabled");
        }
        document.getElementById(idBTN).innerHTML = `${text}`;
    }

    async allow() {
        await ethereum.request({ method: 'eth_requestAccounts' });
        this.web3js = new Web3(window.web3.currentProvider);
        this.contract = new web3js.eth.Contract(contractABI, this.contractString, {from: window.ethereum.selectedAddress} );
        this.contractToken = new web3js.eth.Contract(contractTokenABI, this.contractTokenString, {from: window.ethereum.selectedAddress} );
        this.contractNFT = new web3js.eth.Contract(contractNFTABI, this.contractNFTString, {from: window.ethereum.selectedAddress} );
    }

    async approveNFT(tokenId) {
        try {
            if((await this.contractNFT.methods.ownerOf(tokenId).call()).toLowerCase() != window.ethereum.selectedAddress.toLowerCase()) {
                alert('Voce não tem essa NFT');
                return;
            }
            this.DOMChangBTN('approve-sell', true, '<span class="spinner-grow spinner-grow-sm"></span> Loading...');
            await this.contractNFT.methods.approve(this.contractString, tokenId).send({from: window.ethereum.selectedAddress});
            this.DOMChangBTN('approve-sell', true, 'Aprovar');
            this.DOMChangBTN('sell-sell', false, 'Publicar');
        } catch(err) {
            alert('Erro inesperado. Verifique se voce tem essa NFT');
            this.DOMChangBTN('approve-sell', false, 'Aprovar');
        }
    }

    async approveToken(amount, tokenId) {
        try {
            this.DOMChangBTN(('approve-'+tokenId), true, '<span class="spinner-grow spinner-grow-sm"></span> Loading...');
            await this.contractToken.methods.approve(this.contractString, web3js.utils.toWei(String(amount).toString(), 'nano')).send({from: window.ethereum.selectedAddress});
            this.DOMChangBTN(('approve-'+tokenId), true, 'Aprovar');
            this.DOMChangBTN(('buy-'+tokenId), false, 'Comprar');
        } catch(err) {
            console.log(err);
            alert('Erro inesperado. Verifique se tem saldo suficiente');
            this.DOMChangBTN(('approve-'+tokenId), false, 'Aprovar');
        }
    }

    async publish(price, tokenId) {
        try {
            if((await this.contractNFT.methods.ownerOf(tokenId).call()).toLowerCase() != window.ethereum.selectedAddress.toLowerCase()) {
                alert('Voce não tem essa NFT');
                return;
            }
            this.DOMChangBTN('sell-sell', true, '<span class="spinner-grow spinner-grow-sm"></span> Loading...');
            await this.contract.methods.addSalesList(tokenId, web3js.utils.toWei(String(price).toString(), 'nano')).send({from: window.ethereum.selectedAddress});
            this.DOMChangBTN('approve-sell', false, 'Aprovar');
            this.DOMChangBTN('sell-sell', true, 'Publicar');
            return;
        } catch(err) {
            alert('Erro inesperado. Verifique se voce tem essa NFT');
            this.DOMChangBTN('sell-sell', false, 'Publicar');
            return;
        }
    }

    async selectNetwork() {
        return await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x38',
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18 
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'] 
            }]
        });
    }

    async list() {
        await this.allow();
        return await this.contract.methods.getAllNFTs().call();
    }

    async buy(tokenId) {
        try {
            this.DOMChangBTN(('buy-'+tokenId), true, '<span class="spinner-grow spinner-grow-sm"></span> Loading...');
            await this.contract.methods.buy(tokenId).send({from: window.ethereum.selectedAddress});
            this.DOMChangBTN(('buy-'+tokenId), true, 'Comprar');
            return;
        } catch(err) {
            alert('Erro inesperado. Verifique se voce tem saldo suficiente');
            this.DOMChangBTN(('buy-'+tokenId), false, 'Comprar');
            return;
        }
    }

    async getByTokenId(tokenId) {
        return await this.contract.methods.getByTokenId(tokenId).call();
    }

    async removeOfListSales(tokenId) {
        await this.contract.methods.removeListSaller(tokenId).call();
    }

}