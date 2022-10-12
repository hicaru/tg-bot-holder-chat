require('dotenv').config();

const fetch = require('cross-fetch');
const { fromBech32Address } = require('@zilliqa-js/crypto');
const sequelize = require('../models');


const NODE = 'https://api.zilliqa.com';
const CONTRACT = fromBech32Address(process.env.CONTRACT);

async function snapshot() {
  const body = {
    method: 'GetSmartContractSubState',
    params: [CONTRACT.toLowerCase().replace('0x', ''), 'balances', []],
    id: 1,
    jsonrpc: `2.0`
  };
  const res = await fetch(NODE, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

(async function(){
  const { models } = sequelize.sequelize;
  const state = await snapshot();

  console.log(state);

  await models.State.drop();
  await models.State.sync();
}());
