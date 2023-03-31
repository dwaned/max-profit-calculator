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

export const date = async (args: string[]): Promise<string> => {
  return new Date().toString();
};

export const calculate = async (args?: string[]): Promise<string> => {
  var mapper = new ObjectMapper();

  // const currentPrices = mapper.parse(args[1], typeRef);
  // const futurePrices = mapper.parse(args[2], typeRef);

  return axios
      .post('http://app:9095/api/calculate', "test")
      .then((response) => {
        return JSON.stringify(response.data);
      })
      .catch((error) => {
        return error;
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
