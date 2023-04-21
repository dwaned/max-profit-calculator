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

// Calculate
export const calculate = async (args?: string[]): Promise<string> => {
  if (args === undefined || args.length < 3) {
    throw new Error('Insufficient arguments');
  }

  const currentPrices = JSON.parse(args[1]);
  const futurePrices = JSON.parse(args[2]);

  const options = {
    method: 'POST',
    url: 'http://localhost:9095/api/calculate',
    headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
    data: {
      "savingsAmount": args[0],
      "currentPrices": currentPrices,
      "futurePrices": futurePrices,
    }
  };
  
  return axios
      .request(options)
      .then((response) => {
        return JSON.stringify(response.data);
      })
      .catch((error) => {
        return JSON.stringify(error + "Args were: " + args[0] + " " + args[1] + " " + args[2])
       });
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
