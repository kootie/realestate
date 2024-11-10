import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {

  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [homes, setHomes] = useState([]); // Initialize homes as an empty array
  const [home, setHome] = useState([]); // Initialize homes as an empty array
  const [toggle, setToggle] = useState(false); // Initialize homes as an empty array
  const [account, setAccount] = useState(null);

  const loadBlockchainData = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  setProvider(provider);

  const network = await provider.getNetwork();
  console.log("Connected to network:", network);

  const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider);
  const totalSupply = await realEstate.totalSupply();
  //console.log("Total supply of homes:", totalSupply.toString());

  const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
  setEscrow(escrow)

  const homes = []

  for (let i = 1; i <= totalSupply; i++) {
    const uri = await realEstate.tokenURI(i);
    const response = await fetch(uri);
    const metadata = await response.json();

    homes.push(metadata); // Push metadata to homes array
  }

  setHomes(homes)
  console.log(homes)

    // When button clicked, show the linked account
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true)
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <Search />

      <div className='cards__section'>
        <h3>Welcome to Dwelify</h3>
        <hr />

        <div className='cards'>
        {homes.map((home, index) => (

          <div className='card' key={index} OnClick={() => toggleProp(home)}>
            <div className='card__image'>
              <img src="{home.image}" alt="Home" />
            </div>
            <div className="card__info">
              <h4>{home.attributes[0].value} ETH</h4>
              <p>
                <strong>{home.attributes[2].value}</strong> bds | <strong>{home.attributes[3].value}</strong> baths | <strong>{home.attributes[4].value}</strong> sqft
              </p>
              <p>{home.address}</p>
            </div>
          </div>

        ))}
          <div className='card'>
            <div className='card__image'>
              <img src="" alt="Home" />
            </div>
            <div className="card__info">
              <h4>1 ETH</h4>
              <p>
                <strong>1</strong> bds | <strong>2</strong> baths | <strong>3</strong> sqft
              </p>
              <p>1234 Nairobi, Kikuyu</p>
            </div>
          </div>
        </div>
      </div>
      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;