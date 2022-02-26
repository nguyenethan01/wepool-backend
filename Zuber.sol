pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Zubux is ERC20{
    constructor(uint256 initialSupply) ERC20("Zubux", "ZUB") public {
        address alec = 0xd505437167D8F6Cae1A3b76f32fAE7E2676cE803;
        _mint(msg.sender, initialSupply);
    }
}