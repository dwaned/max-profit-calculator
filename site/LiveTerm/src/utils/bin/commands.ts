// List of commands that do not require API calls

import * as bin from './index';
import config from '../../../config.json';
import axios from 'axios';
import { ObjectMapper } from 'jackson-js';


// Help
export const help = async (args: string[]): Promise<string> => {
  const commands = Object.keys(bin).sort().join(', ');
  var c = '';
  for (let i = 1; i <= Object.keys(bin).sort().length; i++) {
    if (i % 7 === 0) {
      c += Object.keys(bin).sort()[i - 1] + '\n';
    } else {
      c += Object.keys(bin).sort()[i - 1] + ' ';
    }
  }
  return `Welcome! Here are all the available commands:
\n${c}\n
[tab]: trigger completion.
[ctrl+l]/clear: clear terminal.\n
`;
};

// Date
export const date = async (args: string[]): Promise<string> => {
  return new Date().toString();
};

export const calculate = async (args?: string[]): Promise<string> => {
  if (!args || args.length === 0) {
    return `Please provide the savings amount as the first argument.`;
  } else if (args.length === 1) {
    return `You entered savings amount: ${args[0]}
      Please provide the current prices (example: [12, 16]) as the second argument.`;
  } else if (args.length === 2) {
    return `You entered savings amount: ${args[0]}
      You entered current prices: ${args[1]}
      Please provide the future prices (example: [10,13]) as the third argument.`;
  }

  try {
    const currentPrices = JSON.parse(args[1]);
    const futurePrices = JSON.parse(args[2]);

    const response = await axios.request({
      method: 'POST',
      url: 'http://localhost:9095/api/calculate',
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      data: {
        savingsAmount: args[0],
        currentPrices,
        futurePrices
      }
    });
    const { maxProfit, indices } = response.data;
    if (maxProfit === 0) {
      return 'No possible profit can be done or invalid input. Ensure that the sizes of the current and future prices are the same.';
    }
    return `The max profit possible is ${maxProfit} with choosing stocks with index ${indices}`;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return 'Invalid JSON format in prices data. Please check your input.';
    }
    return 'An error occurred while calculating. Please check your input and try again.';
  }
};

// Banner
export const banner = (args?: string[]): string => {
  return `
░▒█▀▄▀█░█▀▀▄░█░█░░░░▒█▀▀█░█▀▀▄░▄▀▀▄░█▀▀░░▀░░▀█▀░░░░▒█▀▀▄░█▀▀▄░█░░█▀▄░█░▒█░█░░█▀▀▄░▀█▀░▄▀▀▄░█▀▀▄
░▒█▒█▒█░█▄▄█░▄▀▄░▀▀░▒█▄▄█░█▄▄▀░█░░█░█▀░░░█▀░░█░░▀▀░▒█░░░░█▄▄█░█░░█░░░█░▒█░█░░█▄▄█░░█░░█░░█░█▄▄▀
░▒█░░▒█░▀░░▀░▀░▀░░░░▒█░░░░▀░▀▀░░▀▀░░▀░░░▀▀▀░░▀░░░░░▒█▄▄▀░▀░░▀░▀▀░▀▀▀░░▀▀▀░▀▀░▀░░▀░░▀░░░▀▀░░▀░▀▀


Type 'help' to see the list of available commands.
Type 'repo' or click <u><a class="text-light-blue dark:text-dark-blue underline" href="${config.repo}" target="_blank">here</a></u> for the Github repository.
`;
};
