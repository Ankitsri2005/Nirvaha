/**
 * blockchain.js - Ethers/MetaMask plumbing for phase 6. Declared now so the UI
 * contract (address, ABI, verify call) is settled; nothing calls it in phase 1.
 *
 * The address below is the deterministic first account of the local Hardhat
 * network. It is a placeholder, not a deployment.
 */
export const CHAIN = {
  local: { chainId: 31337, name: 'hardhat', currency: 'ETH' },
  sepolia: { chainId: 11155111, name: 'sepolia', currency: 'SepoliaETH' },
}

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

export const ABI = [
  { type: 'function', name: 'anchor', stateMutability: 'nonpayable',
    inputs: [{ name: 'batchId', type: 'string' }, { name: 'checkpointType', type: 'string' }, { name: 'payloadHash', type: 'bytes32' }, { name: 'timestamp', type: 'uint256' }],
    outputs: [] },
  { type: 'function', name: 'verify', stateMutability: 'view',
    inputs: [{ name: 'batchId', type: 'string' }, { name: 'index', type: 'uint256' }],
    outputs: [{ name: 'stored', type: 'bytes32' }, { name: 'exists', type: 'bool' }] },
  { type: 'function', name: 'entryCount', stateMutability: 'view',
    inputs: [{ name: 'batchId', type: 'string' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'event', name: 'CheckpointAnchored', inputs: [
    { name: 'batchId', type: 'string', indexed: true },
    { name: 'index', type: 'uint256', indexed: true },
    { name: 'checkpointType', type: 'string' },
    { name: 'payloadHash', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'anchoredBy', type: 'address' } ] },
]

export const isMetaMaskInstalled = () => typeof window !== 'undefined' && Boolean(window.ethereum)

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask is not installed')
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  if (!accounts?.length) throw new Error('No account authorised')
  const chainId = await window.ethereum.request({ method: 'eth_chainId' })
  return { account: accounts[0], chainId: Number(chainId) }
}

export const switchTo = async (network = 'local') => {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask is not installed')
  const target = CHAIN[network]
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${target.chainId.toString(16)}` }],
    })
  } catch (err) {
    if (err.code !== 4902) throw err
    // unknown chain: add it first (Hardhat's default RPC)
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${target.chainId.toString(16)}`,
        chainName: target.name,
        rpcUrls: ['http://127.0.0.1:8545'],
        nativeCurrency: { name: target.currency, symbol: 'ETH', decimals: 18 },
      }],
    })
  }
  return target
}
