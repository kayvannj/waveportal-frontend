import logo from './logo.svg';
import './App.css';
import 'bulma/css/bulma.min.css'
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ContractConfig from './utils/WavePortal.json';

function App() {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState("");
  const [input, setInput] = useState('');
  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);

  /** 
   * Create a variable here that holds the contract address after you deploy!
   */
  const localhost = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const rinkiby = "0xdAaD92f2eeC25C164e6F9d4Eb21b3e6C4d04C53A"
  const contractAddress = localhost;
  const contractABI = ContractConfig.abi;

  const getContract = async function (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    return wavePortalContract;
  }

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async function(){
    try {
      const { ethereum } = window;
      if (ethereum) {
        const contract = await getContract(ethereum);
        /*
        * Call the getAllWaves method from your Smart Contract
        */
        const waves = await contract.getAllWaves();

        /*
        * We only need address, timestamp, and message in our UI so let's
        * pick those out
        */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
          * Store our data in React State
          */
        setAllWaves(wavesCleaned);

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const ethereum = window.ethereum;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        const wavePortalContract = await getContract(ethereum);

        let waveCount = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", waveCount.toNumber());
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
    
    await getAllWaves();
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      setIsConnecting("is-loading");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setIsConnecting("");

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const ethereum = window.ethereum;
      if (ethereum) {

        const wavePortalContract = await getContract(ethereum);

        const waveTxn = await wavePortalContract.wave(input, { gasLimit: 300000 });
        console.log("Mining", waveTxn.hash);
        setIsConnecting("is-loading");

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let waveCount = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", waveCount.toNumber());
        setIsConnecting("");

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    console.log()
    checkIfWalletIsConnected();
  }, [])

  return (
    <div>
      <section className="hero is-info">
        <div className="hero-head">
          <nav className="navbar">
            <div className="container">
              <div id="navbarMenuHeroB" className="navbar-menu">
                <div className="navbar-end">
                  <span className="navbar-item">
                    <a className="button is-info is-inverted">
                      <span className="icon">
                        <i className="fab fa-github"></i>
                      </span>
                      <span>Source</span>
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="hero-body">
          <div className="container has-text-centered">
            <p className="title">
              Wave Portal
            </p>
            <p className="subtitle">
              A simple Web3 project
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container is-fluid">

          {/*
            * If there is no currentAccount render this button
            */
          }
          {!currentAccount && (
            <div className="box">
              <a className={"button is-info is-outlined is-fullwidth " + isConnecting} onClick={connectWallet}>Connect Wallet</a>
            </div>
          )}

          {currentAccount && (
            <div className="columns">
              <div className="column is-two-thirds">
                <input className="input is-full " type="text" placeholder="Text input" onInput={e => setInput(e.target.value)} />
              </div>
              <div className="column">
                <button className={"button is-success is-fullwidth " + isConnecting} onClick={wave}>
                  Wave at Me
                </button>
              </div>
            </div>
          )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className='box'>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

        </div>

      </section>
    </div>
  );
}

export default App;
