// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.17;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // Corrected import
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol"; // Add this line

contract RealEstate is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;   // Using Counters to manage token IDs

    constructor() ERC721("Dwelify", "DWEL") {}

    function mint(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();  // Automatically increment token ID
        uint256 newItemId = _tokenIds.current();  // Get the current token ID
        _mint(msg.sender, newItemId);  // Mint the new NFT
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}