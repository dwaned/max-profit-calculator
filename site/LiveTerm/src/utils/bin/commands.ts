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

export const test = async (): Promise<String> => {
  return axios
    .get("http://app:9095")
    .then((response) => {
      return JSON.stringify(response.data);
    })
    .catch((error) => {
      if (error.response) {
        const er1 = error.response.status.toString();
        return er1;    
     } else if (error.request) {
        return "here" + error.request;
     } else {
       return "this" + error.message;
     }
    });
}

export const calculate = async (args?: string[]): Promise<string> => {
  var mapper = new ObjectMapper();

  // const currentPrices = mapper.parse(args[1], typeRef);
  // const futurePrices = mapper.parse(args[2], typeRef);


  const options = {
    method: 'POST',
    url: 'http://app:9095/api/calculate',
    headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
    data: {
      "savingsAmount": 6,
      "currentPrices": [1, 2, 5],
      "futurePrices": [2, 3, 20],
    }
  };
  
  return axios
      .request(options)
      .then((response) => {
        return JSON.stringify(response.data);
      })
      .catch((error) => {
        if (error.response) {
          const er1 = error.response.status.toString();
          return er1;    
       } else if (error.request) {
          return "here" + error.request;
       } else {
         return "this" + error.message;
       }
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
