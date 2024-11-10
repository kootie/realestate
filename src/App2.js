import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState([]); // Initialize homes as an empty array
  const [loading, setLoading] = useState(true); // Add a loading state

  const loadBlockchainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();
      console.log("Connected to network:", network);

      const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider);
      const totalSupply = await realEstate.totalSupply();
      console.log("Total supply of homes:", totalSupply.toString());

      // List homes on the page
      const homesArray = [];
      for (let i = 1; i <= totalSupply; i++) {
        const uri = await realEstate.tokenURI(i);
        console.log(`Token URI for home ${i}:`, uri);

        const response = await fetch(uri);
        const metadata = await response.json();
        console.log(`Metadata for home ${i}:`, metadata); // Log the fetched metadata

        homesArray.push(metadata); // Push metadata to homes array
      }

      setHomes(homesArray);
      console.log("Homes loaded:", homesArray);
    } catch (error) {
      console.error("Error loading blockchain data:", error); // Catch and log any errors
    } finally {
      setLoading(false); // Stop loading once the process is complete
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <Search />

      <div className='cards__section'>
        <h3>Welcome to Dwelify</h3>
        <hr />

        <div className='cards'>
          {loading ? (
            <p>Loading homes...</p>
          ) : homes.length > 0 ? (
            homes.map((home, index) => (
              <div className='card' key={index}>
                <div className='card__image'>
                  {/* Ensure home.image exists and is valid */}
                  {home.image ? (
                    <img src={home.image} alt={`Home ${index + 1}`} />
                  ) : (
                    <p>No image available</p>
                  )}
                </div>
                <div className="card__info">
                  {/* Check for attributes to avoid errors */}
                  {home.attributes && home.attributes.length > 0 ? (
                    <>
                      <h4>{home.attributes[0].value} ETH</h4> {/* Assuming price is the first attribute */}
                      <p>
                        <strong>{home.attributes[2]?.value || 'N/A'}</strong> bds | <strong>{home.attributes[3]?.value || 'N/A'}</strong> baths | <strong>{home.attributes[4]?.value || 'N/A'}</strong> sqft
                      </p>
                    </>
                  ) : (
                    <p>Details not available</p>
                  )}
                  <p>{home.address ? home.address : "Address not available"}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No homes available to display.</p> // Fallback if homes array is empty after loading
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
