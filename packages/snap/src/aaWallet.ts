import { BaseProvider } from '@metamask/providers';
import { ethers } from 'ethers';
import config from '../config.json';
import { myWrapProvider } from './myWrapProvider';

const entryPointAddress = config.entryPoint;
const factoryAddress = config.simpleAccountFactory;
const bundlerUrl = config.rpcUrl;

// get config info
const getAAConfig = async (provider: ethers.providers.BaseProvider) => {
  return {
    chainId: await provider.getNetwork().then((net) => net.chainId),
    entryPointAddress,
    bundlerUrl,
  };
};

// get address
export const getAddress = async (): Promise<string> => {
  const provider = new ethers.providers.Web3Provider(
    ethereum as unknown as BaseProvider,
  );

  const accounts = await provider.send('eth_requestAccounts', []);
  console.log('accounts', accounts);
  const aaSigner = provider.getSigner();
  console.log('Signer', aaSigner);
  // get AAWrapProvider
  const aaProvider = await myWrapProvider(
    provider,
    await getAAConfig(provider),
    aaSigner,
    factoryAddress,
  );
  // get walletAddress
  const walletAddress = await aaProvider.getSigner().getAddress();
  return walletAddress;
};

// getBalance
export const getBalance = async (address: string): Promise<string> => {
  // console.log('address', address);
  const provider = new ethers.providers.Web3Provider(
    ethereum as unknown as BaseProvider,
  );
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
};
