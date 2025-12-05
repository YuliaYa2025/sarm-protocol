// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {SARMHook} from "../src/hooks/SARMHook.sol";
import {SSAOracleAdapter} from "../src/oracles/SSAOracleAdapter.sol";
import {MockVerifier} from "../src/mocks/MockVerifier.sol";

/**
 * @title DeploySARM
 * @notice Deployment script for SARM Protocol (SSAOracleAdapter + SARMHook)
 * @dev Deploys:
 *      1. MockVerifier (for testnet - replace with real DataLink verifier on mainnet)
 *      2. SSAOracleAdapter
 *      3. SARMHook (with proper CREATE2 address for Uniswap v4 hook requirements)
 * 
 * Usage:
 *   forge script script/DeploySARM.s.sol:DeploySARM --rpc-url <RPC_URL> --broadcast --verify
 * 
 * Environment Variables:
 *   PRIVATE_KEY - Deployer private key
 *   POOL_MANAGER - Uniswap v4 PoolManager address (required)
 *   VERIFIER_ADDRESS - DataLink verifier address (optional, uses MockVerifier if not set)
 */
contract DeploySARM is Script {
    
    // Uniswap v4 hook flags
    uint160 constant BEFORE_INITIALIZE_FLAG = uint160(1 << 13);
    uint160 constant BEFORE_SWAP_FLAG = uint160(1 << 7);
    uint160 constant HOOK_FLAGS = BEFORE_INITIALIZE_FLAG | BEFORE_SWAP_FLAG;
    
    function run() public {
        // Get deployer from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("=== SARM Protocol Deployment ===");
        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);
        console2.log("");
        
        // Get PoolManager address (required)
        address poolManagerAddress = vm.envAddress("POOL_MANAGER");
        console2.log("PoolManager:", poolManagerAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy or use existing DataLink verifier
        address verifierAddress;
        try vm.envAddress("VERIFIER_ADDRESS") returns (address addr) {
            verifierAddress = addr;
            console2.log("Using existing verifier:", verifierAddress);
        } catch {
            console2.log("Deploying MockVerifier (testnet only)...");
            MockVerifier mockVerifier = new MockVerifier();
            verifierAddress = address(mockVerifier);
            console2.log("MockVerifier deployed:", verifierAddress);
        }
        console2.log("");
        
        // Step 2: Deploy SSAOracleAdapter
        console2.log("Deploying SSAOracleAdapter...");
        SSAOracleAdapter oracle = new SSAOracleAdapter(verifierAddress);
        console2.log("SSAOracleAdapter deployed:", address(oracle));
        console2.log("");
        
        // Step 3: Deploy SARMHook with proper CREATE2 address
        console2.log("Deploying SARMHook...");
        console2.log("Required hook flags:", HOOK_FLAGS);
        
        // Calculate the target address with correct flags
        address targetHookAddress = address(HOOK_FLAGS);
        console2.log("Target hook address:", targetHookAddress);
        
        // Deploy hook using CREATE2 to get the correct address
        // Note: This requires finding the right salt
        bytes memory creationCode = abi.encodePacked(
            type(SARMHook).creationCode,
            abi.encode(IPoolManager(poolManagerAddress), oracle)
        );
        
        bytes32 salt = _findSalt(creationCode, targetHookAddress, deployer);
        
        SARMHook hook;
        assembly {
            hook := create2(0, add(creationCode, 0x20), mload(creationCode), salt)
        }
        
        require(address(hook) != address(0), "Hook deployment failed");
        require(address(hook) == targetHookAddress, "Hook address mismatch");
        
        console2.log("SARMHook deployed:", address(hook));
        console2.log("Hook permissions verified:", _verifyHookPermissions(address(hook)));
        console2.log("");
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console2.log("=== Deployment Summary ===");
        console2.log("Verifier:", verifierAddress);
        console2.log("SSAOracleAdapter:", address(oracle));
        console2.log("SARMHook:", address(hook));
        console2.log("");
        console2.log("=== Next Steps ===");
        console2.log("1. Set feed IDs for tokens:");
        console2.log("   oracle.setFeedId(tokenAddress, feedId)");
        console2.log("");
        console2.log("2. Set initial ratings (for testing):");
        console2.log("   oracle.setRatingManual(tokenAddress, rating)");
        console2.log("");
        console2.log("3. Update Mimic .env with:");
        console2.log("   SSA_ORACLE_ADDRESS=", address(oracle));
        console2.log("   SARM_HOOK_ADDRESS=", address(hook));
        console2.log("");
        console2.log("4. Deploy Mimic task:");
        console2.log("   cd mimic && npm run deploy");
    }
    
    /**
     * @dev Find the salt needed to deploy to the target address using CREATE2
     * @param creationCode The contract creation code
     * @param targetAddress The desired deployment address
     * @param deployer The deployer address
     * @return The salt that produces the target address
     */
    function _findSalt(
        bytes memory creationCode,
        address targetAddress,
        address deployer
    ) internal pure returns (bytes32) {
        bytes32 creationCodeHash = keccak256(creationCode);
        
        // Brute force search for the right salt
        // In production, you'd want to pre-compute this off-chain
        for (uint256 i = 0; i < 1000000; i++) {
            bytes32 salt = bytes32(i);
            address predicted = address(uint160(uint256(keccak256(abi.encodePacked(
                bytes1(0xff),
                deployer,
                salt,
                creationCodeHash
            )))));
            
            if (predicted == targetAddress) {
                return salt;
            }
        }
        
        revert("Could not find valid salt for hook address");
    }
    
    /**
     * @dev Verify that the hook address has the correct permissions
     * @param hookAddress The hook address to verify
     * @return True if the address has the correct flags
     */
    function _verifyHookPermissions(address hookAddress) internal pure returns (bool) {
        uint160 addr = uint160(hookAddress);
        return (addr & HOOK_FLAGS) == HOOK_FLAGS;
    }
}

