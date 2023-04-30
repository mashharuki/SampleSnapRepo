import { OnRpcRequestHandler, OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { Buffer } from 'buffer';
import { getAddress, getBalance } from './aaWallet';

// @ts-ignore
window.Buffer = Buffer;

/**
 * ガス代を取得するためのメソッド
 *
 * @returns text
 */

const getFees: any = async () => {
  const response = await fetch('https://beaconcha.in/api/v1/execution/gasnow');
  return response.text();
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    case 'hello2':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: text(`This is ${JSON.stringify(request)}!!`),
        },
      });
    case 'getGasFee':
      return getFees().then((fees: any) => {
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Hello, **${origin}**!`),
              text(`Current gas fee estimates: ${fees}`),
            ]),
          },
        });
      });
    case 'getAddress':
      return await getAddress().then((address: any) => {
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Hello!!`),
              text(`AA Wallet Address: ${address}`),
            ]),
          },
        });
      });
    case 'getBalance':
      return await getBalance(await getAddress()).then((balance: any) => {
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Hello!!`),
              text(`AA Wallet Balance: ${balance}`),
            ]),
          },
        });
      });
    default:
      throw new Error('Method not found.');
  }
};

/**
 * Handle incoming JSON-RPC transactions, sent through `wallet_invokeSnap`.
 *
 * @param param0 transaction
 * @returns panel
 */

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {

  // Use the window.ethereum global provider to fetch the gas price.
  const currentGasPrice = await window.ethereum.request({
    method: 'eth_gasPrice',
  });

  // Get fields from the transaction object.
  const transactionGas = parseInt(transaction.gas as string, 16);
  const currentGasPriceInWei = parseInt(currentGasPrice ?? '', 16);
  const maxFeePerGasInWei = parseInt(transaction.maxFeePerGas as string, 16);
  const maxPriorityFeePerGasInWei = parseInt(
    transaction.maxPriorityFeePerGas as string,
    16,
  );

  // Calculate gas fees the user would pay.
  const gasFees = Math.min(
    maxFeePerGasInWei * transactionGas,
    (currentGasPriceInWei + maxPriorityFeePerGasInWei) * transactionGas,
  );

  // Calculate gas fees as percentage of transaction.
  const transactionValueInWei = parseInt(transaction.value as string, 16);
  const gasFeesPercentage = (gasFees / (gasFees + transactionValueInWei)) * 100;

  // Display percentage of gas fees in the transaction insights UI.
  return {
    content: panel([
      heading('Transaction insights snap'),
      text(
        `As set up, you are paying **${gasFeesPercentage.toFixed(
          2,
        )}%** in gas fees for this transaction.`,
      ),
    ]),
  };
};
